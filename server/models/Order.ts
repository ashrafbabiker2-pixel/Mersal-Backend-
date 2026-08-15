/**
 * MERSAL BACKEND - Order Model (Central Entity Schema)
 * Unifies all Mersal services & Field Execution:
 * - Customer & Service Ref
 * - Lifecycle Statuses: pending -> accepted -> assigned -> in_progress -> completed -> archived / cancelled
 * - Field Execution Components: Visits, Tasks, Notes, Media (Photos/Videos), Reports, Invoices, Expenses, Timeline
 */

export const OrderSchemaDefinition = {
  orderNumber: {
    type: 'String',
    required: true,
    unique: true,
    index: true,
  },
  customer: {
    type: 'Schema.Types.ObjectId',
    ref: 'User',
    required: [true, 'العميل صاحب الطلب مطلوب'],
    index: true,
  },
  service: {
    type: 'Schema.Types.ObjectId',
    ref: 'Service',
    required: [true, 'نوع الخدمة مطلوب'],
    index: true,
  },
  serviceCode: {
    type: 'String',
    required: true,
    index: true,
  },
  status: {
    type: 'String',
    enum: [
      'pending',
      'accepted',
      'assigned',
      'in_progress',
      'completed',
      'cancelled',
      'archived',
    ],
    default: 'pending',
    index: true,
  },
  priority: {
    type: 'String',
    enum: ['normal', 'high', 'urgent'],
    default: 'normal',
  },
  assignedEmployee: {
    type: 'Schema.Types.ObjectId',
    ref: 'User',
    index: true,
  },
  supervisor: {
    type: 'Schema.Types.ObjectId',
    ref: 'User',
  },

  // Logistics / Delivery Points
  sender: {
    name: { type: 'String' },
    phone: { type: 'String' },
    city: { type: 'String' },
    district: { type: 'String' },
    addressDetails: { type: 'String' },
    coordinates: { lat: 'Number', lng: 'Number' },
  },
  receiver: {
    name: { type: 'String' },
    phone: { type: 'String' },
    city: { type: 'String' },
    district: { type: 'String' },
    addressDetails: { type: 'String' },
    coordinates: { lat: 'Number', lng: 'Number' },
  },

  // Real Estate / Property Inspection Points
  propertyDetails: {
    propertyType: {
      type: 'String',
      enum: ['apartment', 'villa', 'building', 'commercial'],
    },
    unitNumber: { type: 'String' },
    city: { type: 'String' },
    district: { type: 'String' },
    addressDetails: { type: 'String' },
    accessKeyInstructions: { type: 'String' },
  },

  serviceDetails: {
    type: 'Schema.Types.Mixed',
    default: {},
  },

  // Field Execution Sub-documents (الوحدة 3 الميدانية)
  visits: [
    {
      visitDate: { type: 'Date', required: true },
      technicianName: { type: 'String', required: true },
      technicianId: { type: 'Schema.Types.ObjectId', ref: 'User' },
      purpose: { type: 'String', required: true },
      status: {
        type: 'String',
        enum: ['scheduled', 'arrived', 'completed', 'cancelled'],
        default: 'scheduled',
      },
      notes: { type: 'String' },
      checkInTime: { type: 'Date' },
      checkOutTime: { type: 'Date' },
      location: { type: 'String' },
    },
  ],

  tasks: [
    {
      title: { type: 'String', required: true },
      description: { type: 'String' },
      assignedTo: { type: 'Schema.Types.ObjectId', ref: 'User' },
      isCompleted: { type: 'Boolean', default: false },
      completedAt: { type: 'Date' },
      priority: {
        type: 'String',
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
      },
    },
  ],

  media: [
    {
      type: {
        type: 'String',
        enum: ['photo', 'video', 'document'],
        required: true,
      },
      url: { type: 'String', required: true },
      title: { type: 'String', required: true },
      caption: { type: 'String' },
      uploadedBy: { type: 'Schema.Types.ObjectId', ref: 'User' },
      uploadedAt: { type: 'Date', default: 'Date.now' },
      category: {
        type: 'String',
        enum: ['before', 'after', 'during', 'invoice_receipt', 'damage_report'],
      },
    },
  ],

  reports: [
    {
      title: { type: 'String', required: true },
      summary: { type: 'String', required: true },
      details: { type: 'String', required: true },
      preparedBy: { type: 'Schema.Types.ObjectId', ref: 'User' },
      authorRole: { type: 'String', default: 'employee' },
      recommendations: { type: 'String' },
      createdAt: { type: 'Date', default: 'Date.now' },
    },
  ],

  invoices: [
    {
      invoiceNumber: { type: 'String', required: true },
      subtotal: { type: 'Number', required: true },
      taxAmount: { type: 'Number', required: true },
      totalAmount: { type: 'Number', required: true },
      items: [
        {
          description: { type: 'String', required: true },
          quantity: { type: 'Number', default: 1 },
          unitPrice: { type: 'Number', required: true },
          total: { type: 'Number', required: true },
        },
      ],
      isPaid: { type: 'Boolean', default: false },
      paymentMethod: {
        type: 'String',
        enum: ['online', 'cash_on_delivery', 'bank_transfer'],
        default: 'online',
      },
      paidAt: { type: 'Date' },
      createdAt: { type: 'Date', default: 'Date.now' },
    },
  ],

  expenses: [
    {
      title: { type: 'String', required: true },
      amount: { type: 'Number', required: true },
      receiptUrl: { type: 'String' },
      category: {
        type: 'String',
        enum: ['spare_parts', 'fuel', 'purchases', 'fees', 'other'],
      },
      recordedBy: { type: 'Schema.Types.ObjectId', ref: 'User' },
      recordedAt: { type: 'Date', default: 'Date.now' },
      approvedBy: { type: 'Schema.Types.ObjectId', ref: 'User' },
    },
  ],

  notes: [
    {
      author: { type: 'String', required: true },
      authorRole: { type: 'String', required: true },
      content: { type: 'String', required: true },
      isInternalOnly: { type: 'Boolean', default: false },
      createdAt: { type: 'Date', default: 'Date.now' },
    },
  ],

  pricing: {
    basePrice: { type: 'Number', required: true },
    additionalFees: { type: 'Number', default: 0 },
    expensesTotal: { type: 'Number', default: 0 },
    subtotal: { type: 'Number', required: true },
    tax: { type: 'Number', required: true },
    totalAmount: { type: 'Number', required: true },
  },

  paymentStatus: {
    type: 'String',
    enum: ['pending', 'partially_paid', 'paid', 'refunded'],
    default: 'pending',
  },

  timeline: [
    {
      status: { type: 'String', required: true },
      title: { type: 'String', required: true },
      description: { type: 'String', required: true },
      timestamp: { type: 'Date', default: 'Date.now' },
      updatedBy: {
        id: { type: 'String' },
        name: { type: 'String' },
        role: { type: 'String' },
      },
      location: { type: 'String' },
    },
  ],

  scheduledDate: { type: 'Date' },
  completedAt: { type: 'Date' },
  cancelledAt: { type: 'Date' },
  cancellationReason: { type: 'String' },
  timestamps: true,
};
