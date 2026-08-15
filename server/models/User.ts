/**
 * MERSAL BACKEND - User Model (Mongoose Schema & Types)
 * Supports: Customer, Employee, Supervisor, Manager, Admin
 */

export const UserSchemaDefinition = {
  name: {
    type: 'String',
    required: [true, 'الاسم الكامل مطلوب'],
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  email: {
    type: 'String',
    required: [true, 'البريد الإلكتروني مطلوب'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'صيغة البريد الإلكتروني غير صحيحة'],
  },
  phone: {
    type: 'String',
    required: [true, 'رقم الجوال مطلوب'],
    unique: true,
    trim: true,
  },
  password: {
    type: 'String',
    required: [true, 'كلمة المرور مطلوبة'],
    minlength: 6,
    select: false, // Don't return password by default in queries
  },
  role: {
    type: 'String',
    enum: ['customer', 'employee', 'supervisor', 'manager', 'admin'],
    default: 'customer',
    index: true,
  },
  avatar: {
    type: 'String',
    default: '',
  },
  status: {
    type: 'String',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    index: true,
  },
  addresses: [
    {
      title: { type: 'String', required: true },
      city: { type: 'String', required: true },
      district: { type: 'String', required: true },
      street: { type: 'String' },
      buildingNo: { type: 'String' },
      coordinates: {
        lat: { type: 'Number' },
        lng: { type: 'Number' },
      },
      isDefault: { type: 'Boolean', default: false },
    },
  ],
  employeeProfile: {
    employeeCode: { type: 'String', sparse: true },
    department: {
      type: 'String',
      enum: ['delivery', 'maintenance', 'property_inspection', 'general'],
    },
    supervisorId: { type: 'Schema.Types.ObjectId', ref: 'User' },
    vehicleType: {
      type: 'String',
      enum: ['motorcycle', 'sedan', 'van', 'truck'],
    },
    vehiclePlate: { type: 'String' },
    nationalId: { type: 'String' },
    rating: { type: 'Number', default: 5.0, min: 1, max: 5 },
    completedOrdersCount: { type: 'Number', default: 0 },
    isAvailable: { type: 'Boolean', default: true },
    currentLocation: {
      lat: { type: 'Number' },
      lng: { type: 'Number' },
      updatedAt: { type: 'Date' },
    },
  },
  permissions: [{ type: 'String' }],
  lastLoginAt: { type: 'Date' },
  timestamps: true,
};

export const UserIndexes = [
  { fields: { email: 1 }, options: { unique: true } },
  { fields: { phone: 1 }, options: { unique: true } },
  { fields: { role: 1, status: 1 } },
  { fields: { 'employeeProfile.department': 1, status: 1 } },
];
