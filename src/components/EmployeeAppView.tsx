import React, { useState, useEffect } from 'react';
import {
  Truck,
  Package,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Phone,
  Navigation,
  FileCheck,
  AlertTriangle,
  RefreshCw,
  Eye,
  Camera,
  Signature,
  DollarSign,
} from 'lucide-react';
import { api } from '../api/client';
import { IOrder, IUser } from '../types';
import { OrderDetailsModal } from './OrderDetailsModal';

interface EmployeeAppViewProps {
  currentUser: IUser | null;
  onRefreshGlobal: () => void;
}

export const EmployeeAppView: React.FC<EmployeeAppViewProps> = ({
  currentUser,
  onRefreshGlobal,
}) => {
  const [tasks, setTasks] = useState<IOrder[]>([]);
  const [availableOrders, setAvailableOrders] = useState<IOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'assigned' | 'available'>('assigned');
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // POD Modal state
  const [showPODModal, setShowPODModal] = useState(false);
  const [podOrderId, setPodOrderId] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [podNotes, setPodNotes] = useState('');
  const [signatureDone, setSignatureDone] = useState(true);

  // Status update note modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTargetOrderId, setStatusTargetOrderId] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>('picked_up');
  const [statusNote, setStatusNote] = useState('');
  const [statusLocation, setStatusLocation] = useState('الرياض، حي السليمانية');

  const loadEmployeeData = async () => {
    setIsLoading(true);
    try {
      const [tasksRes, availRes] = await Promise.all([
        api.getEmployeeTasks(),
        api.getAvailableOrders(),
      ]);

      if (tasksRes.success && tasksRes.tasks) setTasks(tasksRes.tasks);
      if (availRes.success && availRes.orders) setAvailableOrders(availRes.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployeeData();
  }, [currentUser]);

  const handleClaimOrder = async (orderId: string) => {
    setIsLoading(true);
    const res = await api.claimOrder(orderId);
    if (res.success) {
      setSuccessMsg(res.message || 'تم استلام وتعيين الشحنة بنجاح لحسابك');
      loadEmployeeData();
      onRefreshGlobal();
      setActiveTab('assigned');
    } else {
      alert(res.message);
    }
    setIsLoading(false);
  };

  const handleOpenStatusModal = (orderId: string, status: string, defaultNote: string) => {
    setStatusTargetOrderId(orderId);
    setTargetStatus(status);
    setStatusNote(defaultNote);
    setShowStatusModal(true);
  };

  const handleConfirmStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusTargetOrderId) return;

    setIsLoading(true);
    const res = await api.updateTaskStatus(
      statusTargetOrderId,
      targetStatus,
      statusNote,
      statusLocation
    );

    if (res.success) {
      setShowStatusModal(false);
      setSuccessMsg(res.message || 'تم تحديث حالة الشحنة بنجاح في قاعدة البيانات');
      loadEmployeeData();
      onRefreshGlobal();
    } else {
      alert(res.message);
    }
    setIsLoading(false);
  };

  const handleOpenPODModal = (order: IOrder) => {
    setPodOrderId(order._id);
    setRecipientName(order.receiver.name);
    setPodNotes('تم فحص وتأكيد سلامة الطرد واستلامه شخصياً');
    setShowPODModal(true);
  };

  const handleConfirmPOD = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!podOrderId) return;

    setIsLoading(true);
    const res = await api.completeDeliveryWithPOD(podOrderId, {
      recipientName,
      notes: podNotes,
      signatureReceived: signatureDone,
    });

    if (res.success) {
      setShowPODModal(false);
      setSuccessMsg(res.message || 'تم إتمام التسليم وتوثيق POD بنجاح وإغلاق الشحنة!');
      loadEmployeeData();
      onRefreshGlobal();
    } else {
      alert(res.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Driver Simulator Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-900/50 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              محاكي تطبيق المناديب والموظفين (Mersal Employee App)
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                Driver Client
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              المندوب المسجل: <strong className="text-slate-200">{currentUser?.name}</strong> • المركبة: <span className="font-mono text-amber-300">{currentUser?.vehicleType || 'دراجة نارية'}</span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeTab === 'assigned'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            مهامي المكلف بها ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeTab === 'available'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            الشحنات المتاحة للاستلام ({availableOrders.length})
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 1. ASSIGNED TASKS TAB */}
      {activeTab === 'assigned' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>المهام والشحنات المسندة إليك رسمياً:</span>
            <button
              onClick={loadEmployeeData}
              className="flex items-center gap-1 hover:text-white transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              تحديث
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 space-y-3">
                <Truck className="w-8 h-8 mx-auto text-slate-600" />
                <p>ليس لديك أي مهام نشطة حالياً. تفقد الشحنات المتاحة لاستلام مهام جديدة.</p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                >
                  استعراض الشحنات المتاحة
                </button>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task._id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-white text-base">
                        {task.trackingNumber}
                      </div>
                      <div className="text-xs text-slate-400">
                        {task.package.title} • {task.package.weightKg} كجم
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                        task.status === 'delivered'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : task.status === 'in_transit'
                          ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                          : task.status === 'picked_up'
                          ? 'bg-indigo-950 text-indigo-400 border-indigo-800'
                          : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  {/* Pickup / Delivery Points */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5 text-xs">
                    <div className="flex items-start gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-slate-400 text-[11px]">الاستلام (Pickup):</div>
                        <strong className="text-white">{task.sender.name}</strong> ({task.sender.phone})
                        <div className="text-slate-400 text-[11px]">
                          {task.sender.city} - حي {task.sender.district} - {task.sender.addressDetails}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-2 flex items-start gap-2 text-slate-300">
                      <Navigation className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-slate-400 text-[11px]">التسليم (Destination):</div>
                        <strong className="text-white">{task.receiver.name}</strong> ({task.receiver.phone})
                        <div className="text-slate-400 text-[11px]">
                          {task.receiver.city} - حي {task.receiver.district} - {task.receiver.addressDetails}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Driver Actions Bar */}
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedOrder(task)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>التفاصيل</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {task.status === 'assigned' && (
                        <button
                          onClick={() =>
                            handleOpenStatusModal(
                              task._id,
                              'picked_up',
                              'تم استلام الشحنة من مقر المرسل بنجاح'
                            )
                          }
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
                        >
                          تأكيد الاستلام (Picked Up)
                        </button>
                      )}

                      {task.status === 'picked_up' && (
                        <button
                          onClick={() =>
                            handleOpenStatusModal(
                              task._id,
                              'in_transit',
                              'في الطريق إلى موقع المستلم'
                            )
                          }
                          className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition"
                        >
                          في الطريق (In Transit)
                        </button>
                      )}

                      {task.status === 'in_transit' && (
                        <button
                          onClick={() => handleOpenPODModal(task)}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
                        >
                          <FileCheck className="w-4 h-4" />
                          <span>إتمام التسليم وإثبات POD</span>
                        </button>
                      )}

                      {task.status === 'delivered' && (
                        <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> تم التسليم
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. AVAILABLE ORDERS POOL TAB */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            شحنات مؤكدة تنتظر مندوباً لاستلامها (GET /api/employees/tasks/available):
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableOrders.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
                لا توجد شحنات تنتظر التكليف حالياً.
              </div>
            ) : (
              availableOrders.map((order) => (
                <div
                  key={order._id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-white text-sm">
                        {order.trackingNumber}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">
                        {order.pricing.totalAmount} ر.س
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-200">{order.package.title}</div>
                    <div className="text-[11px] text-slate-400">
                      الوزن: {order.package.weightKg} كجم • الفئة: {order.package.category}
                    </div>

                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950 text-[11px] space-y-1 text-slate-300">
                      <div>من: {order.sender.city} ({order.sender.district})</div>
                      <div>إلى: {order.receiver.city} ({order.receiver.district})</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      معاينة
                    </button>
                    <button
                      onClick={() => handleClaimOrder(order._id)}
                      disabled={isLoading}
                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition"
                    >
                      استلام المهمة (Claim)
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Proof of Delivery (POD) Modal */}
      {showPODModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">
                  توثيق إثبات التسليم الرقمي (Submit POD)
                </h3>
                <p className="text-xs text-slate-400">
                  إرسال POST /api/employees/tasks/:id/complete
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmPOD} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-bold">اسم المستلم الفعلي</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-bold">ملاحظات التسليم والتأكيد</label>
                <textarea
                  rows={2}
                  value={podNotes}
                  onChange={(e) => setPodNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  placeholder="تم فحص الشحنة واستلامها بالكامل بدون تلفيات"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Signature className="w-4 h-4 text-emerald-400" />
                  <span>التوقيع الرقمي للمستلم</span>
                </div>
                <div className="h-16 rounded bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 font-mono text-[11px]">
                  [ Digital Signature Capture Simulation: Verified ]
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-[11px] pt-1">
                  <input
                    type="checkbox"
                    checked={signatureDone}
                    onChange={(e) => setSignatureDone(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-0"
                  />
                  <span>تم التوقيع الإلكتروني وتأكيد كود الأمان</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPODModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg shadow-emerald-600/30"
                >
                  {isLoading ? 'جاري الاعتماد...' : 'اعتماد التسليم وتوليد POD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-white text-base">
              تحديث مسار وحالة الشحنة (PATCH /status)
            </h3>
            <form onSubmit={handleConfirmStatusUpdate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">الحالة الجديدة</label>
                <div className="font-mono font-bold text-white p-2 rounded bg-slate-950 border border-slate-800">
                  {targetStatus}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">الموقع الحالي</label>
                <input
                  type="text"
                  value={statusLocation}
                  onChange={(e) => setStatusLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">ملاحظات التحديث</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  تأكيد التحديث
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};
