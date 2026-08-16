const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'اسم الخدمة مطلوب'],
      trim: true,
      maxlength: 150
    },

    code: {
      type: String,
      required: [true, 'رمز الخدمة مطلوب'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },

    type: {
      type: String,
      enum: [
        'property_management',
        'buying_delivery',
        'maintenance_finishing'
      ],
      required: [true, 'نوع الخدمة مطلوب'],
      index: true
    },

    description: {
      type: String,
      default: '',
      maxlength: 2000
    },

    basePrice: {
      type: Number,
      default: 0,
      min: 0
    },

    currency: {
      type: String,
      default: 'SDG',
      uppercase: true
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    sortOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

serviceSchema.index({ type: 1, isActive: 1 });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
