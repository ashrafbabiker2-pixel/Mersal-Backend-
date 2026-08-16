const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'العميل مطلوب'],
      index: true
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'الخدمة مطلوبة'],
      index: true
    },

    serviceType: {
      type: String,
      enum: [
        'property_management',
        'buying_delivery',
        'maintenance_finishing'
      ],
      required: [true, 'نوع الخدمة مطلوب'],
      index: true
    },

    pickupAddress: {
      type: String,
      trim: true,
      default: ''
    },

    deliveryAddress: {
      type: String,
      trim: true,
      default: ''
    },

    details: {
      type: String,
      trim: true,
      default: '',
      maxlength: 5000
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0
    },

    commission: {
      type: Number,
      default: 0,
      min: 0
    },

    serviceFee: {
      type: Number,
      default: 0,
      min: 0
    },

    totalCost: {
      type: Number,
      default: 0,
      min: 0
    },

    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'rejected',
        'assigned',
        'in_progress',
        'on_the_way',
        'completed',
        'cancelled',
        'archived'
      ],
      default: 'pending',
      index: true
    },

    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    acceptedAt: {
      type: Date,
      default: null
    },

    startedAt: {
      type: Date,
      default: null
    },

    completedAt: {
      type: Date,
      default: null
    },

    cancelledAt: {
      type: Date,
      default: null
    },

    cancellationReason: {
      type: String,
      default: '',
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

/*
|--------------------------------------------------------------------------
| Order Number
|--------------------------------------------------------------------------
*/

orderSchema.pre('save', async function (next) {
  if (!this.isNew || this.orderNumber) {
    return next();
  }

  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  this.orderNumber = `MRS-${timestamp}-${random}`;

  next();
});

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

orderSchema.index({
  customer: 1,
  createdAt: -1
});

orderSchema.index({
  assignedEmployee: 1,
  status: 1
});

orderSchema.index({
  status: 1,
  createdAt: -1
});

orderSchema.index({
  serviceType: 1,
  status: 1
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
