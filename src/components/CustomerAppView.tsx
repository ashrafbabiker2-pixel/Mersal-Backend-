import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  PlusCircle,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  Search,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Truck,
  CreditCard,
  RefreshCw,
  Eye,
  DollarSign,
  XCircle,
} from 'lucide-react';
import { api } from '../api/client';
import { IOrder, IService, IUser } from '../types';
import { OrderDetailsModal } from './OrderDetailsModal';

interface CustomerAppViewProps {
  currentUser: IUser | null;
  onRefreshGlobal: () => void;
}

export const CustomerAppView: React.FC<CustomerAppViewProps> = ({
  currentUser,
  onRefreshGlobal,
}) => {
  const [services, setServices] = useState<IService[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [activeScreen, setActiveScreen] = useState<'my_orders' | 'new_order' | 'track_search'>('my_orders');
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [trackedOrderResult, setTrackedOrderResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New Order Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>('srv_express');
  const [senderName, setSenderName] = useState('سلطان بن عبدالعزيز');
  const [senderPhone, setSenderPhone] = useState('+966555123456');
  const [senderCity, setSenderCity] = useState('الرياض');
  const [senderDistrict, setSenderDistrict] = useState('الملقا');
  const [senderAddress, setSenderAddress] = useState('شارع أنس بن مالك، برج النور');

  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverCity, setReceiverCity] = useState('الرياض');
  const [receiverDistrict, setReceiverDistrict] = useState('العليا');
  const [receiverAddress, setReceiverAddress] = useState('');

  const [packageTitle, setPackageTitle] = useState('');
  const [packageCategory, setPackageCategory] = useState('عام');
  const [packageWeight, setPackageWeight] = useState<number>(1);
  const [isFragile, setIsFragile] = useState(false);
  const [requiresCooling, setRequiresCooling] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'online'>('online');
  const [estimatedDistance, setEstimatedDistance] = useState<number>(12);

  const loadCustomerData = async () => {
    setIsLoading(true);
    try {
      const [srvRes, ordersRes] = await Promise.all([
        api.getServices(),
        api.getMyOrders(),
      ]);
      if (srvRes.success && srvRes.services) setServices(srvRes.services);
      if (ordersRes.success && ordersRes.orders) setOrders(ordersRes.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, [currentUser]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.createOrder({
        serviceId: selectedServiceId,
        sender: {
          name: senderName,
          phone: senderPhone,
          city: senderCity,
          district: senderDistrict,
          addressDetails: senderAddress,
        },
        receiver: {
          name: receiverName,
          phone: receiverPhone,
          city: receiverCity,
          district: receiverDistrict,
          addressDetails: receiverAddress,
        },
        package: {
          title: packageTitle || 'طرد مرسال',
          category: packageCategory,
          weightKg: packageWeight,
          isFragile,
          requiresCooling,
        },
        paymentMethod,
        estimatedDistanceKm: estimatedDistance,
      });

      if (res.success && res.order) {
        setStatusMessage(`تم إنشاء الطلب بنجاح برقم تتبع [${res.order.trackingNumber}]`);
        setSelectedOrder(res.order);
        setActiveScreen('my_orders');
        loadCustomerData();
        onRefreshGlobal();

        // Reset form
        setReceiverName('');
        setReceiverPhone('');
        setReceiverAddress('');
        setPackageTitle('');
      } else {
        setStatusMessage(`خطأ: ${res.message}`);
      }
    } catch (err: any) {
      setStatusMessage(`فشل: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSearch = async () => {
    if (!trackingNumberInput.trim()) return;
    setIsLoading(true);
    setTrackedOrderResult(null);

    const res = await api.trackOrder(trackingNumberInput.trim());
    if (res.success && res.tracking) {
      setTrackedOrderResult(res.tracking);
    } else {
      setStatusMessage(res.message || 'لم يتم العثور على الشحنة');
    }
    setIsLoading(false);
  };

  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt('يرجى ذكر سبب إلغاء الشحنة:');
    if (!reason) return;

    const res = await api.cancelOrder(orderId, reason);
    if (res.success) {
      setStatusMessage(res.message || 'تم إلغاء الطلب بنجاح');
      loadCustomerData();
      onRefreshGlobal();
    } else {
      alert(res.message);
    }
  };

  const selectedService = services.find((s) => s._id === selectedServiceId) || services[0];
  const calculatedBase = selectedService?.basePrice || 25;
  const calculatedDistancePrice = Math.round(estimatedDistance * (selectedService?.pricePerKm || 1.5) * 10) / 10;
  const fragileFee = isFragile ? 10 : 0;
  const subtotal = calculatedBase + calculatedDistancePrice + fragileFee;
  const tax = Math.round(subtotal * 0.15 * 100) / 100;
  const totalEstimated = Math.round((subtotal + tax) * 100) / 100;

  return (
    <div className="space-y-6">
      {/* Mobile Simulator Frame Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-900/50 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              محاكي تطبيق العملاء (Mersal Customer Mobile App)
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                Flutter Client
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              المستخدم المصادق حالياً: <strong className="text-slate-200">{currentUser?.name}</strong> • يتم استخراج الهوية حصرياً من توكن JWT
            </p>
          </div>
        </div>

        {/* Screen Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveScreen('my_orders')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeScreen === 'my_orders'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            شحناتي ({orders.length})
          </button>
          <button
            onClick={() => setActiveScreen('new_order')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeScreen === 'new_order'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            + إنشاء طلب شحنة
          </button>
          <button
            onClick={() => setActiveScreen('track_search')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeScreen === 'track_search'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تتبع شحنة
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-200 text-xs font-semibold flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 1. SCREEN: MY ORDERS */}
      {activeScreen === 'my_orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>سجل الطلبات الخاصة بك (مسترجعة من GET /api/orders/my-orders):</span>
            <button
              onClick={loadCustomerData}
              className="flex items-center gap-1 hover:text-white transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              تحديث
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 space-y-3">
                <Package className="w-8 h-8 mx-auto text-slate-600" />
                <p>لا توجد لديك شحنات مسجلة حتى الآن.</p>
                <button
                  onClick={() => setActiveScreen('new_order')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  إنشاء أول طلب شحنة
                </button>
              </div>
            ) : (
              orders.map((order) => {
                const srv = typeof order.service === 'object' ? order.service : null;
                return (
                  <div
                    key={order._id}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 relative hover:border-blue-500/50 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-white text-sm">
                          {order.trackingNumber}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            order.status === 'delivered'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : order.status === 'pending'
                              ? 'bg-amber-950 text-amber-400 border-amber-800'
                              : 'bg-blue-950 text-blue-400 border-blue-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-200">{order.package.title}</div>
                      <div className="text-[11px] text-slate-400">{srv?.name || 'خدمة مرسال'}</div>

                      {/* Locations preview */}
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] space-y-1.5">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                          <span>من: {order.sender.city} ({order.sender.district})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span>إلى: {order.receiver.name} - {order.receiver.city}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="font-mono font-bold text-emerald-400">
                        {order.pricing.totalAmount} ر.س
                      </div>
                      <div className="flex items-center gap-1.5">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 transition"
                            title="إلغاء الطلب"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-bold transition flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>تتبع والتفاصيل</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 2. SCREEN: NEW ORDER CREATION */}
      {activeScreen === 'new_order' && (
        <form onSubmit={handleCreateOrder} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="font-extrabold text-white text-base">إنشاء شحنة جديدة (POST /api/orders)</h4>
            <p className="text-xs text-slate-400">
              سيقوم الخادم بربط الشحنة بحسابك المسجل تلقائياً عبر رمز الـ JWT.
            </p>
          </div>

          {/* Service Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">اختر نوع الخدمة:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {services.map((srv) => (
                <div
                  key={srv._id}
                  onClick={() => setSelectedServiceId(srv._id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    selectedServiceId === srv._id
                      ? 'bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-white text-xs">{srv.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{srv.description}</div>
                  <div className="mt-2 text-xs font-mono font-bold text-emerald-400">
                    تبدأ من {srv.basePrice} ر.س
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sender & Receiver Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Sender */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="font-bold text-blue-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> بيانات المرسل (موقع الاستلام)
              </div>
              <div>
                <label className="text-slate-400 block mb-1">اسم المرسل</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">رقم الجوال</label>
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">المدينة والحي</label>
                  <input
                    type="text"
                    value={`${senderCity} - ${senderDistrict}`}
                    onChange={(e) => {
                      const [c, d] = e.target.value.split('-');
                      setSenderCity(c?.trim() || 'الرياض');
                      setSenderDistrict(d?.trim() || 'الملقا');
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">تفاصيل العنوان</label>
                <input
                  type="text"
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Receiver */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> بيانات المستلم (وجهة التسليم)
              </div>
              <div>
                <label className="text-slate-400 block mb-1">اسم المستلم</label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="مثال: تركي بن فهد"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">رقم جوال المستلم</label>
                  <input
                    type="tel"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    placeholder="+966501112233"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">المدينة والحي</label>
                  <input
                    type="text"
                    value={`${receiverCity} - ${receiverDistrict}`}
                    onChange={(e) => {
                      const [c, d] = e.target.value.split('-');
                      setReceiverCity(c?.trim() || 'الرياض');
                      setReceiverDistrict(d?.trim() || 'العليا');
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">تفاصيل العنوان</label>
                <input
                  type="text"
                  value={receiverAddress}
                  onChange={(e) => setReceiverAddress(e.target.value)}
                  placeholder="الشارع، رقم المبنى، المعلم القريب"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-teal-400" /> تفاصيل ومحتوى الطرد
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">وصف الطرد</label>
                <input
                  type="text"
                  value={packageTitle}
                  onChange={(e) => setPackageTitle(e.target.value)}
                  placeholder="مثال: عقود رسمية، عطر، هاتف محمول"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">الوزن التقديري (كجم)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={packageWeight}
                  onChange={(e) => setPackageWeight(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">المسافة التقديرية (كم)</label>
                <input
                  type="number"
                  min="1"
                  value={estimatedDistance}
                  onChange={(e) => setEstimatedDistance(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={isFragile}
                  onChange={(e) => setIsFragile(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>طرد قابل للكسر / حساس (+10 ر.س)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={requiresCooling}
                  onChange={(e) => setRequiresCooling(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>يتطلب تبريد</span>
              </label>
            </div>
          </div>

          {/* Pricing & Submit */}
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs space-y-0.5">
              <div className="text-slate-400">التكلفة الإجمالية التقديرية (شاملة ضريبة القيمة المضافة 15%):</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {totalEstimated} ر.س
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveScreen('my_orders')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer"
              >
                {isLoading ? 'جاري إرسال الطلب...' : 'تأكيد وإرسال الطلب للخادم'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 3. SCREEN: PUBLIC TRACKING SEARCH */}
      {activeScreen === 'track_search' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          <div className="max-w-xl mx-auto space-y-3 text-center">
            <h4 className="font-extrabold text-white text-lg">تتبع أي شحنة برقم التتبع العام</h4>
            <p className="text-xs text-slate-400">
              واجهة استعلام عامة (GET /api/orders/track/:trackingNumber) لا تشترط تسجيل الدخول
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="أدخل رقم التتبع مثل: MRS-2026-8941"
                value={trackingNumberInput}
                onChange={(e) => setTrackingNumberInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleTrackSearch}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer"
              >
                {isLoading ? 'جاري البحث...' : 'تتبع الآن'}
              </button>
            </div>
          </div>

          {/* Track Result Display */}
          {trackedOrderResult && (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 max-w-2xl mx-auto text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="font-bold text-white text-sm">{trackedOrderResult.trackingNumber}</div>
                  <div className="text-slate-400">{trackedOrderResult.service?.name}</div>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-950 text-blue-300 font-bold border border-blue-800">
                  الحالة: {trackedOrderResult.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>من: {trackedOrderResult.sender?.city} ({trackedOrderResult.sender?.district})</div>
                <div>إلى: {trackedOrderResult.receiver?.name} - {trackedOrderResult.receiver?.city}</div>
              </div>

              {/* Timeline */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="font-bold text-slate-300">المحطات المسجلة:</div>
                <div className="space-y-2 pr-2 border-r border-slate-700">
                  {trackedOrderResult.timeline?.map((ev: any, i: number) => (
                    <div key={i} className="text-slate-400">
                      <strong className="text-slate-200">{ev.title}</strong> -{' '}
                      {new Date(ev.timestamp).toLocaleTimeString('ar-SA')}
                      <p className="text-[11px] text-slate-500">{ev.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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
