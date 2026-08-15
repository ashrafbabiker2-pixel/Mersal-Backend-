/**
 * MERSAL BACKEND - Service Model (Mongoose Schema & Types)
 * Covers:
 * 1. إدارة الأملاك والعقارات (Property Management)
 * 2. الشراء والتوصيل (Purchase & Delivery)
 * 3. متابعة الصيانة والتشطيب (Maintenance & Finishing Supervision)
 */

export const ServiceSchemaDefinition = {
  code: {
    type: 'String',
    required: true,
    unique: true,
    enum: ['property_management', 'purchase_delivery', 'maintenance_finishing', 'express_delivery'],
  },
  name: {
    type: 'String',
    required: [true, 'اسم الخدمة بالعربية مطلوب'],
    trim: true,
  },
  nameEn: {
    type: 'String',
    required: true,
    trim: true,
  },
  category: {
    type: 'String',
    required: true,
    enum: ['real_estate', 'logistics', 'technical_services'],
  },
  description: {
    type: 'String',
    required: true,
  },
  icon: {
    type: 'String',
    default: 'Package',
  },
  basePrice: {
    type: 'Number',
    required: true,
    min: 0,
  },
  pricePerKm: {
    type: 'Number',
    default: 0,
    min: 0,
  },
  estimatedDurationHours: {
    type: 'Number',
    default: 24,
  },
  isActive: {
    type: 'Boolean',
    default: true,
    index: true,
  },
  requiredFields: [
    {
      key: { type: 'String', required: true },
      label: { type: 'String', required: true },
      type: {
        type: 'String',
        enum: ['text', 'number', 'date', 'file', 'select', 'boolean'],
        default: 'text',
      },
      required: { type: 'Boolean', default: true },
      options: [{ type: 'String' }],
    },
  ],
  slaHours: {
    type: 'Number',
    default: 24,
  },
  timestamps: true,
};

export const InitialMersalServices = [
  {
    _id: 'srv_property_mgmt',
    code: 'property_management',
    name: 'إدارة الأملاك والعقارات',
    nameEn: 'Property & Real Estate Management',
    category: 'real_estate',
    description: 'معاينة العقار، إدارة عقود الإيجار، تقارير الفحص الدوري بالفيديو والصور، وتحصيل الإيجارات.',
    icon: 'Building2',
    basePrice: 250,
    pricePerKm: 0,
    estimatedDurationHours: 48,
    isActive: true,
    slaHours: 24,
    requiredFields: [
      { key: 'propertyType', label: 'نوع العقار', type: 'select', required: true, options: ['شقة', 'فيلا', 'عمارة', 'مكتب تجاري'] },
      { key: 'inspectionType', label: 'نوع المعاينة', type: 'select', required: true, options: ['فحص دوري', 'تسليم مستأجر جديد', 'استلام من مستأجر', 'تقرير صيانة شامل'] },
      { key: 'unitNumber', label: 'رقم الوحدة/العقار', type: 'text', required: false },
    ],
  },
  {
    _id: 'srv_purchase_delivery',
    code: 'purchase_delivery',
    name: 'الشراء والتوصيل اللوجستي',
    nameEn: 'Purchase & Delivery Services',
    category: 'logistics',
    description: 'شراء المستلزمات والمشتريات من المتاجر ونقل الشحنات والطرود السريعة والمبردة.',
    icon: 'Truck',
    basePrice: 35,
    pricePerKm: 1.8,
    estimatedDurationHours: 2,
    isActive: true,
    slaHours: 4,
    requiredFields: [
      { key: 'itemsList', label: 'قائمة المشتريات / محتوى الشحنة', type: 'text', required: true },
      { key: 'isFragile', label: 'قابل للكسر', type: 'boolean', required: false },
      { key: 'requiresCooling', label: 'يتطلب تبريد', type: 'boolean', required: false },
    ],
  },
  {
    _id: 'srv_maintenance_finishing',
    code: 'maintenance_finishing',
    name: 'متابعة الصيانة والتشطيب',
    nameEn: 'Maintenance & Finishing Supervision',
    category: 'technical_services',
    description: 'إشراف هندسي وميداني على أعمال الكهرباء، السباكة، الدهانات، التشطيبات، والتوثيق بالفواتير وتقارير الإنجاز.',
    icon: 'Wrench',
    basePrice: 150,
    pricePerKm: 0,
    estimatedDurationHours: 72,
    isActive: true,
    slaHours: 12,
    requiredFields: [
      { key: 'workType', label: 'نوع الأعمال', type: 'select', required: true, options: ['سباكة', 'كهرباء', 'تكييف', 'دهانات وتشطيب', 'ترميم شامل'] },
      { key: 'urgencyLevel', label: 'درجة الأهمية', type: 'select', required: true, options: ['عادي', 'عاجل', 'طارئ جداً'] },
    ],
  },
];
