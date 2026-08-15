import React from 'react';
import {
  X,
  Package,
  MapPin,
  Clock,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  DollarSign,
  FileText,
  CreditCard,
  QrCode,
  Calendar,
} from 'lucide-react';
import { IOrder, OrderStatus } from '../types';

interface OrderDetailsModalProps {
  order: IOrder | null;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
}) => {
  if (!order) return null;

  const statusConfig: Record<
    OrderStatus,
    { label: string; bg: string; text: string; border: string }
  > = {
    pending: { label: 'بانتظار المراجعة', bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-500/30' },
    accepted: { label: 'تم القبول', bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-500/30' },
    confirmed: { label: 'تم التأكيد', bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-500/30' },
    assigned: { label: 'تم تعيين فني/مندوب', bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-500/30' },
    picked_up: { label: 'تم استلام الشحنة', bg: 'bg-indigo-950/40', text: 'text-indigo-400', border: 'border-indigo-500/30' },
    in_transit: { label: 'في الطريق للتسليم', bg: 'bg-cyan-950/40', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    in_progress: { label: 'جاري التنفيذ الميداني', bg: 'bg-indigo-950/40', text: 'text-indigo-400', border: 'border-indigo-500/30' },
    delivered: { label: 'تم التسليم بنجاح', bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    completed: { label: 'مكتمل بنجاح', bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    cancelled: { label: 'ملغي', bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-500/30' },
    archived: { label: 'مؤرشف', bg: 'bg-slate-950/40', text: 'text-slate-400', border: 'border-slate-500/30' },
  };

  const currentStatus = statusConfig[order.status] || statusConfig.pending;
  const customerName = typeof order.customer === 'object' ? order.customer.name : 'عميل مرسال';
  const customerPhone = typeof order.customer === 'object' ? order.customer.phone : '';
  const assignedName = typeof order.assignedEmployee === 'object' ? order.assignedEmployee.name : 'غير محدد';
  const assignedPhone = typeof order.assignedEmployee === 'object' ? order.assignedEmployee.phone : '';
  const serviceName = typeof order.service === 'object' ? order.service.name : 'خدمة مرسال';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">
                  تفاصيل الشحنة: {order.trackingNumber}
                </h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}
                >
                  {currentStatus.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Service: {serviceName} • Created:{' '}
                {new Date(order.createdAt).toLocaleDateString('ar-SA')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Sender & Receiver Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sender */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <MapPin className="w-3.5 h-3.5" /> بيانات المرسل (Pickup)
                </span>
              </div>
              <div className="font-bold text-white text-sm">{order.sender.name}</div>
              <div className="text-xs text-slate-300 flex items-center gap-1.5 font-mono">
                <Phone className="w-3 h-3 text-slate-400" /> {order.sender.phone}
              </div>
              <div className="text-xs text-slate-300">
                {order.sender.city} - حي {order.sender.district}
              </div>
              {order.sender.addressDetails && (
                <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800">
                  {order.sender.addressDetails}
                </div>
              )}
            </div>

            {/* Receiver */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <MapPin className="w-3.5 h-3.5" /> بيانات المستلم (Delivery)
                </span>
              </div>
              <div className="font-bold text-white text-sm">{order.receiver.name}</div>
              <div className="text-xs text-slate-300 flex items-center gap-1.5 font-mono">
                <Phone className="w-3 h-3 text-slate-400" /> {order.receiver.phone}
              </div>
              <div className="text-xs text-slate-300">
                {order.receiver.city} - حي {order.receiver.district}
              </div>
              {order.receiver.addressDetails && (
                <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800">
                  {order.receiver.addressDetails}
                </div>
              )}
            </div>
          </div>

          {/* Package & Payment Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="text-slate-400 text-xs">محتوى الطرد والوزن</div>
              <div className="font-bold text-white text-sm">{order.package.title}</div>
              <div className="text-xs text-slate-300 font-mono">
                {order.package.weightKg} كجم • {order.package.category}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="text-slate-400 text-xs">المندوب المسند</div>
              <div className="font-bold text-white text-sm flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-teal-400" />
                {assignedName}
              </div>
              {assignedPhone && (
                <div className="text-xs text-slate-300 font-mono">{assignedPhone}</div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="text-slate-400 text-xs">إجمالي الرسوم والدفع</div>
              <div className="font-bold text-emerald-400 text-sm font-mono">
                {order.pricing.totalAmount} ر.س
              </div>
              <div className="text-[11px] text-slate-400">
                {order.paymentMethod === 'cash_on_delivery' ? 'دفع عند الاستلام' : 'دفع إلكتروني مسبق'}
                {' • '}
                <span className={order.paymentStatus === 'paid' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {order.paymentStatus === 'paid' ? 'مدفوع' : 'بانتظار التحصيل'}
                </span>
              </div>
            </div>
          </div>

          {/* Proof of Delivery (if delivered) */}
          {order.proofOfDelivery && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>إثبات التسليم الرقمي المعتمد (Proof of Delivery - POD)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                <div>
                  <span className="text-slate-400">اسم المستلم:</span>{' '}
                  <strong className="text-white">{order.proofOfDelivery.recipientName}</strong>
                </div>
                <div>
                  <span className="text-slate-400">كود الإثبات:</span>{' '}
                  <strong className="text-emerald-300 font-mono">
                    {order.proofOfDelivery.confirmationCode}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">وقت التسليم:</span>{' '}
                  <span className="font-mono">
                    {new Date(order.proofOfDelivery.deliveredAt).toLocaleTimeString('ar-SA')}
                  </span>
                </div>
              </div>
              {order.proofOfDelivery.notes && (
                <div className="text-xs text-slate-400 italic">
                  ملاحظات التسليم: &ldquo;{order.proofOfDelivery.notes}&rdquo;
                </div>
              )}
            </div>
          )}

          {/* Order Timeline Events */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>سجل التتبع والخط الزمني للعمليات (Timeline Log)</span>
            </h4>

            <div className="relative pl-2 pr-4 border-r-2 border-slate-700 space-y-4">
              {order.timeline.map((event, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -right-[23px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-slate-900"></div>
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{event.title}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(event.timestamp).toLocaleTimeString('ar-SA')} -{' '}
                        {new Date(event.timestamp).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{event.description}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/50">
                      <span>المنفذ: {event.updatedBy.name} ({event.updatedBy.role})</span>
                      {event.location && <span>الموقع: {event.location}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
