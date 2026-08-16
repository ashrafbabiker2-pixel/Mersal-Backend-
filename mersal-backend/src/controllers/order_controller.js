const Order = require('../models/order_model');
const Service = require('../models/service_model');
const User = require('../models/user_model');

/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/

const createOrder = async (req, res, next) => {
  try {
    const {
      serviceId,
      pickupAddress,
      deliveryAddress,
      details,
      deliveryFee,
      commission,
      serviceFee,
      totalCost
    } = req.body;

    const service = await Service.findOne({
      _id: serviceId,
      isActive: true
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'الخدمة غير موجودة أو غير متاحة'
      });
    }

    const order = await Order.create({
      customer: req.user._id,

      service: service._id,

      serviceType: service.type,

      pickupAddress: pickupAddress || '',

      deliveryAddress: deliveryAddress || '',

      details: details || '',

      deliveryFee: deliveryFee || 0,

      commission: commission || 0,

      serviceFee:
        serviceFee !== undefined
          ? serviceFee
          : service.basePrice,

      totalCost:
        totalCost !== undefined
          ? totalCost
          : (
              (deliveryFee || 0) +
              (commission || 0) +
              (serviceFee !== undefined
                ? serviceFee
                : service.basePrice)
            ),

      status: 'pending'
    });

    const populatedOrder = await Order.findById(
      order._id
    )
      .populate('customer', 'name phone email')
      .populate('service', 'name code type basePrice');

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الطلب بنجاح',
      data: populatedOrder
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Customer Orders
|--------------------------------------------------------------------------
*/

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      customer: req.user._id,
      status: {
        $ne: 'archived'
      }
    })
      .populate('service', 'name code type')
      .populate(
        'assignedEmployee',
        'name phone'
      )
      .sort({
        createdAt: -1
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get All Orders
|--------------------------------------------------------------------------
*/

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      status: {
        $ne: 'archived'
      }
    })
      .populate(
        'customer',
        'name phone email'
      )
      .populate(
        'service',
        'name code type'
      )
      .populate(
        'assignedEmployee',
        'name phone'
      )
      .sort({
        createdAt: -1
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Single Order
|--------------------------------------------------------------------------
*/

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(
      req.params.orderId
    )
      .populate(
        'customer',
        'name phone email'
      )
      .populate(
        'service',
        'name code type'
      )
      .populate(
        'assignedEmployee',
        'name phone'
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Customer Ownership
    |--------------------------------------------------------------------------
    */

    if (
      req.user.role === 'customer' &&
      order.customer._id.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية الوصول لهذا الطلب'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Assign Employee
|--------------------------------------------------------------------------
*/

const assignEmployee = async (req, res, next) => {
  try {
    const {
      employeeId
    } = req.body;

    const employee = await User.findOne({
      _id: employeeId,
      role: {
        $in: [
          'employee',
          'supervisor'
        ]
      },
      isActive: true
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'الموظف غير موجود أو غير متاح'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        assignedEmployee: employee._id,
        assignedBy: req.user._id,
        status: 'assigned'
      },
      {
        new: true
      }
    )
      .populate(
        'customer',
        'name phone'
      )
      .populate(
        'assignedEmployee',
        'name phone role'
      )
      .populate(
        'service',
        'name code type'
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم إسناد الطلب للموظف بنجاح',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Update Order Status
|--------------------------------------------------------------------------
*/

const updateOrderStatus = async (req, res, next) => {
  try {
    const {
      status,
      cancellationReason
    } = req.body;

    const allowedStatuses = [
      'accepted',
      'rejected',
      'in_progress',
      'on_the_way',
      'completed',
      'cancelled'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'حالة الطلب غير صالحة'
      });
    }

    const order = await Order.findById(
      req.params.orderId
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    order.status = status;

    if (status === 'accepted') {
      order.acceptedAt = new Date();
    }

    if (status === 'in_progress') {
      order.startedAt = new Date();
    }

    if (status === 'completed') {
      order.completedAt = new Date();
    }

    if (status === 'cancelled') {
      order.cancelledAt = new Date();
      order.cancellationReason =
        cancellationReason || '';
    }

    await order.save();

    const updatedOrder = await Order.findById(
      order._id
    )
      .populate(
        'customer',
        'name phone email'
      )
      .populate(
        'service',
        'name code type'
      )
      .populate(
        'assignedEmployee',
        'name phone role'
      );

    res.status(200).json({
      success: true,
      message: 'تم تحديث حالة الطلب بنجاح',
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrders,
  getOrderById,
  assignEmployee,
  updateOrderStatus
};
