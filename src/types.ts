export interface IAddress {
  _id?: string;
  title: string;
  city: string;
  district: string;
  street?: string;
  buildingNo?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isDefault?: boolean;
}

export type UserRole =
  | 'customer'
  | 'employee'
  | 'supervisor'
  | 'manager'
  | 'admin';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  city?: string;
  address?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  nationalId?: string;
  addresses?: IAddress[];
  employeeProfile?: {
    employeeCode: string;
    department: 'delivery' | 'maintenance' | 'property_inspection' | 'general';
    supervisorId?: string;
    vehicleType?: 'motorcycle' | 'sedan' | 'van' | 'truck';
    vehiclePlate?: string;
    nationalId?: string;
    rating?: number;
    completedOrdersCount?: number;
    isAvailable?: boolean;
    currentLocation?: {
      lat: number;
      lng: number;
      updatedAt: string;
    };
  };
  permissions?: string[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IService {
  _id: string;
  code?: 'property_management' | 'purchase_delivery' | 'maintenance_finishing' | 'express_delivery' | string;
  name: string;
  nameEn: string;
  category: 'real_estate' | 'logistics' | 'technical_services' | string;
  description: string;
  icon: string;
  basePrice: number;
  pricePerKm?: number;
  estimatedDurationHours?: number;
  estimatedDeliveryHours?: number;
  isActive?: boolean;
  active?: boolean;
  features?: string[];
  requiredFields?: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'file' | 'select' | 'boolean';
    required: boolean;
    options?: string[];
  }>;
  slaHours?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'confirmed'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'in_progress'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'archived';

export interface ILocationInfo {
  name: string;
  phone: string;
  city: string;
  district: string;
  addressDetails: string;
  coordinates?: { lat: number; lng: number };
  notes?: string;
}

export interface IPackageDetails {
  title: string;
  category?: string;
  weightKg?: number;
  isFragile?: boolean;
  requiresCooling?: boolean;
  declaredValue?: number;
  instructions?: string;
  description?: string;
  dimensions?: { length: number; width: number; height: number };
}

export interface IProofOfDelivery {
  deliveredAt: string;
  recipientName: string;
  recipientPhone?: string;
  confirmationCode: string;
  notes?: string;
  signatureReceived: boolean;
  photoUrl?: string;
}

export interface ITimelineEvent {
  status: OrderStatus | string;
  title: string;
  description: string;
  timestamp: string;
  updatedBy: {
    id?: string;
    userId?: string;
    name: string;
    role: string;
  };
  location?: string;
}

export type IOrderTimelineEvent = ITimelineEvent;

export interface IOrderVisit {
  _id: string;
  visitDate: string;
  technicianName: string;
  technicianId?: string;
  purpose: string;
  status: 'scheduled' | 'arrived' | 'completed' | 'cancelled';
  notes?: string;
  checkInTime?: string;
  checkOutTime?: string;
  location?: string;
}

export interface IOrderTask {
  _id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  isCompleted: boolean;
  completedAt?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface IOrderMedia {
  _id: string;
  type: 'photo' | 'video' | 'document';
  url: string;
  title: string;
  caption?: string;
  uploadedBy: string;
  uploadedAt: string;
  category: 'before' | 'after' | 'during' | 'invoice_receipt' | 'damage_report';
}

export interface IOrderReport {
  _id: string;
  title: string;
  summary: string;
  details: string;
  preparedBy: string;
  authorRole: string;
  recommendations?: string;
  createdAt: string;
}

export interface IOrderInvoice {
  _id: string;
  invoiceNumber: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  isPaid: boolean;
  paymentMethod: 'online' | 'cash_on_delivery' | 'bank_transfer';
  paidAt?: string;
  createdAt: string;
}

export interface IOrderExpense {
  _id: string;
  title: string;
  amount: number;
  receiptUrl?: string;
  category: 'spare_parts' | 'fuel' | 'purchases' | 'fees' | 'other';
  recordedBy: string;
  recordedAt: string;
  approvedBy?: string;
}

export interface IOrder {
  _id: string;
  orderNumber?: string;
  trackingNumber?: string;
  customer: string | IUser | any;
  service: string | IService | any;
  serviceCode?: string;
  status: OrderStatus;
  priority?: 'normal' | 'high' | 'urgent';
  assignedEmployee?: string | IUser | any;
  supervisor?: string | IUser | any;

  sender?: ILocationInfo;
  receiver?: ILocationInfo;
  package?: IPackageDetails;
  propertyDetails?: {
    propertyType: 'apartment' | 'villa' | 'building' | 'commercial';
    unitNumber?: string;
    city: string;
    district: string;
    addressDetails: string;
    accessKeyInstructions?: string;
  };

  serviceDetails?: Record<string, any>;

  visits?: IOrderVisit[];
  tasks?: IOrderTask[];
  media?: IOrderMedia[];
  reports?: IOrderReport[];
  invoices?: IOrderInvoice[];
  expenses?: IOrderExpense[];
  notes?: Array<{
    _id?: string;
    author: string;
    authorRole: string;
    content: string;
    isInternalOnly?: boolean;
    createdAt?: string;
  }>;

  pricing?: {
    basePrice: number;
    distancePrice?: number;
    extraWeightPrice?: number;
    fragileFee?: number;
    additionalFees?: number;
    expensesTotal?: number;
    estimatedDistanceKm?: number;
    discount?: number;
    subtotal: number;
    tax: number;
    totalAmount: number;
  };
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'partially_paid' | 'paid' | 'refunded';
  codAmount?: number;
  proofOfDelivery?: IProofOfDelivery;

  timeline?: ITimelineEvent[];
  scheduledDate?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IDashboardStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalEmployees: number;
}

export interface IApiLog {
  _id: string;
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  userId?: string;
  userRole?: string;
  user?: {
    id: string;
    name?: string;
    role: string;
    email?: string;
  };
  ip: string;
  userAgent?: string;
  requestBodyPreview?: any;
}
