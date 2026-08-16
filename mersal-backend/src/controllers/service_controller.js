const Service = require('../models/service_model');

/*
|--------------------------------------------------------------------------
| Get All Services
|--------------------------------------------------------------------------
*/

const getServices = async (req, res, next) => {
  try {
    const services = await Service.find({
      isActive: true
    }).sort({
      sortOrder: 1,
      createdAt: 1
    });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Service By ID
|--------------------------------------------------------------------------
*/

const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findOne({
      _id: req.params.serviceId,
      isActive: true
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'الخدمة غير موجودة'
      });
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Create Service
|--------------------------------------------------------------------------
*/

const createService = async (req, res, next) => {
  try {
    const {
      name,
      code,
      type,
      description,
      basePrice,
      currency,
      sortOrder
    } = req.body;

    const existingService = await Service.findOne({
      $or: [
        { code: code.toUpperCase() },
        { name: name.trim() }
      ]
    });

    if (existingService) {
      return res.status(409).json({
        success: false,
        message: 'الخدمة أو رمز الخدمة موجود مسبقاً'
      });
    }

    const service = await Service.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      type,
      description: description || '',
      basePrice: basePrice || 0,
      currency: currency || 'SDG',
      sortOrder: sortOrder || 0,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الخدمة بنجاح',
      data: service
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Update Service
|--------------------------------------------------------------------------
*/

const updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(
      req.params.serviceId
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'الخدمة غير موجودة'
      });
    }

    const allowedFields = [
      'name',
      'description',
      'basePrice',
      'currency',
      'sortOrder',
      'isActive'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        service[field] = req.body[field];
      }
    }

    await service.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث الخدمة بنجاح',
      data: service
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Deactivate Service
|--------------------------------------------------------------------------
*/

const deactivateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.serviceId,
      {
        isActive: false
      },
      {
        new: true
      }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'الخدمة غير موجودة'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم إيقاف الخدمة بنجاح',
      data: service
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deactivateService
};
