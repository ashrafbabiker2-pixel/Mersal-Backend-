export type UserRole = 'customer' | 'employee' | 'admin';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  vehicleType?: 'motorcycle' | 'sedan' | 'van' | 'truck' | 'none';
  vehiclePlate?: string;
  nationalId?: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  city?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IService {
  _id: string;
  name: string;
  nameEn: string;
  description: string;
  category: 'express' | 'documents' | 'ecommerce' | 'cold_storage' | 'freight' | 'custom';
  basePrice: number;
  pricePerKm: number;
  estimatedDeliveryHours: number;
  icon: string;
  features: string[];
  active: boolean;
  createdAt: string;
}

export interface ILocationInfo {
  name: string;
  phone: string;
  city: string;
  district: string;
  addressDetails: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface IPackageDetails {
  title: string;
  category: string;
  weightKg: number;
  isFragile: boolean;
  requiresCooling: boolean;
  declaredValue?: number;
  instructions?: string;
}

export interface ITimelineEvent {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  updatedBy: {
    userId: string;
    name: string;
    role: UserRole;
  };
  location?: string;
}

export interface IProofOfDelivery {
  recipientName: string;
  recipientPhone?: string;
  deliveredAt: string;
  notes?: string;
  confirmationCode?: string;
  signatureReceived: boolean;
}

export interface IOrder {
  _id: string;
  trackingNumber: string;
  customer: string | IUser;
  service: string | IService;
  status: OrderStatus;
  sender: ILocationInfo;
  receiver: ILocationInfo;
  package: IPackageDetails;
  assignedEmployee?: string | IUser;
  paymentMethod: 'cash_on_delivery' | 'online' | 'wallet' | 'card_on_delivery';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  codAmount?: number;
  pricing: {
    basePrice: number;
    distancePrice: number;
    extraWeightPrice: number;
    fragileFee: number;
    tax: number;
    discount: number;
    totalAmount: number;
    estimatedDistanceKm: number;
  };
  timeline: ITimelineEvent[];
  proofOfDelivery?: IProofOfDelivery;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IApiLog {
  _id: string;
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  ip: string;
  userAgent?: string;
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
  requestBodyPreview?: any;
}

export interface IDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  activeDeliveries: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  activeEmployees: number;
  activeCustomers: number;
  totalServices: number;
  statusBreakdown: Record<OrderStatus, number>;
}
