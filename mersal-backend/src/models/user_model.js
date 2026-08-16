const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'الاسم مطلوب'],
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 150
    },

    phone: {
      type: String,
      required: [true, 'رقم الهاتف مطلوب'],
      unique: true,
      trim: true,
      maxlength: 30
    },

    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: 6,
      select: false
    },

    role: {
      type: String,
      enum: [
        'customer',
        'employee',
        'supervisor',
        'manager',
        'admin'
      ],
      default: 'customer',
      index: true
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    profileImage: {
      type: String,
      default: null
    },

    lastLoginAt: {
      type: Date,
      default: null
    },

    passwordResetToken: {
      type: String,
      default: null
    },

    passwordResetExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1, isActive: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
