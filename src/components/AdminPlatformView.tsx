import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  TrendingUp,
  DollarSign,
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserPlus,
  RefreshCw,
  Eye,
  Shield,
  Phone,
  MapPin,
  FileText,
} from 'lucide-react';
import { api } from '../api/client';
import { IOrder, IUser, IDashboardStats, OrderStatus, IService } from '../types';
import { OrderDetailsModal } from './OrderDetailsModal';

interface AdminPlatformViewProps {
  onRefreshGlobal: () => void;
}

export const AdminPlatformView: React.FC<AdminPlatformViewProps> = ({
  onRefreshGlobal,
}) => {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'users' | 'services'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // New Employee Modal state
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [empForm, setEmpForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    vehicleType: 'motorcycle',
    vehiclePlate: '',
    city: 'الرياض',
  });

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, ordersRes, usersRes, servicesRes] = await Promise.all([
        api.getAdminStats(),
        api.getAllOrders({ status: statusFilter !== 'all' ? statusFilter : undefined, search: searchQuery || undefined }),
        api.getAllUsers(),
        api.getServices(),
      ]);

      if (statsRes.success && statsRes.stats) setStats(statsRes.stats);
      if (ordersRes.success && ordersRes.orders) setOrders(ordersRes.orders);
      if (usersRes.success && usersRes.users) setUsers(usersRes.users);
      if (servicesRes.success && servicesRes.services) setServices(servicesRes.services);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [statusFilter, searchQuery]);

  const handleAssignDriver = async (orderId: string, employeeId: string) => {
    if (!employeeId) return;
    const res = await api.assignEmployeeToOrder(orderId, employeeId);
    if (res.success) {
      setActionSuccessMsg(res.message || 'تم تعيين المندوب بنجاح');
      setTimeout(() => setActionSuccessMsg(null), 3500);
      loadAdminData();
      onRefreshGlobal();
    }
  };

  const handleOverrideStatus = async (orderId: string, newStatus: string) => {
    const res = await api.overrideOrderStatus(orderId, newStatus, 'تحديث يدوي من لوحة الإدارة');
    if (res.success) {
      setActionSuccessMsg(res.message || 'تم تعديل حالة الطلب بنجاح');
      setTimeout(() => setActionSuccessMsg(null), 3500);
      loadAdminData();
      onRefreshGlobal();
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.createEmployee(empForm);
    if (res.success) {
      setShowAddEmpModal(false);
      setEmpForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        vehicleType: 'motorcycle',
        vehiclePlate: '',
        city: 'الرياض',
      });
      setActionSuccessMsg(res.message || 'تمت إضافة الموظف بنجاح');
      setTimeout(() => setActionSuccessMsg(null), 3500);
      loadAdminData();
      onRefreshGlobal();
    }
  };

  const handleToggleUser = async (userId: string) => {
    const res = await api.toggleUserStatus(userId);
    if (res.success) {
      setActionSuccessMsg(res.message || 'تم تعديل حالة المستخدم');
      setTimeout(() => setActionSuccessMsg(null), 3500);
      loadAdminData();
    }
  };

  const driversList = users.filter((u) => u.role === 'employee' && u.status === 'active');

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">200 OK</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>إجمالي الشحنات</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats?.totalOrders ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-amber-400 font-bold font-mono">{stats?.pendingOrders ?? 0}</span> قيد الانتظار
          </div>
        </div>

        {/* Active Deliveries */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>شحنات جارية (Active)</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {stats?.activeDeliveries ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span>في الطريق ومع المناديب</span>
          </div>
        </div>

        {/* Delivered / Completed */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>تم التسليم بنجاح</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {stats?.deliveredOrders ?? 0}
          </div>
          <div className="text-[11px] text-slate-400">
            مع إثبات تسليم POD معتمد
          </div>
        </div>

        {/* Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>إجمالي الإيرادات</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-400 font-mono">
            {stats?.totalRevenue ?? 0} <span className="text-xs font-normal text-slate-300">ر.س</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {stats?.activeEmployees ?? 0} مناديب نشطين
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            إدارة الشحنات والطلبات ({orders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'users'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            المستخدمين والمناديب ({users.length})
          </button>
          <button
            onClick={() => setActiveSubTab('services')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'services'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            باقات وخدمات مرسال ({services.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'users' && (
            <button
              onClick={() => setShowAddEmpModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة مندوب جديد</span>
            </button>
          )}

          <button
            onClick={loadAdminData}
            title="تحديث البيانات"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. ORDERS TAB */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="بحث برقم التتبع، المرسل، أو المستلم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 whitespace-nowrap">تصفية حسب الحالة:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">بانتظار التأكيد (Pending)</option>
                <option value="confirmed">تم التأكيد (Confirmed)</option>
                <option value="assigned">تم تعيين مندوب (Assigned)</option>
                <option value="picked_up">تم الاستلام (Picked Up)</option>
                <option value="in_transit">في الطريق (In Transit)</option>
                <option value="delivered">تم التسليم (Delivered)</option>
                <option value="cancelled">ملغي (Cancelled)</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">رقم التتبع</th>
                  <th className="p-3.5">العميل والخدمة</th>
                  <th className="p-3.5">المرسل ← المستلم</th>
                  <th className="p-3.5">الحالة الحالية</th>
                  <th className="p-3.5">المندوب المسند</th>
                  <th className="p-3.5">المبلغ</th>
                  <th className="p-3.5 text-center">إجراءات الإدارة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      لا توجد شحنات مطابقة للشروط الحالية
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const custName = typeof order.customer === 'object' ? order.customer.name : 'عميل';
                    const srvName = typeof order.service === 'object' ? order.service.name : 'خدمة';
                    const assignedEmp = typeof order.assignedEmployee === 'object' ? order.assignedEmployee : null;

                    return (
                      <tr key={order._id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-mono font-bold text-white">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="hover:text-purple-400 hover:underline transition cursor-pointer"
                          >
                            {order.trackingNumber}
                          </button>
                          <div className="text-[10px] text-slate-500 font-normal">
                            {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-slate-200">{custName}</div>
                          <div className="text-[11px] text-slate-400">{srvName}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="text-slate-200">
                            {order.sender.city} ({order.sender.district})
                          </div>
                          <div className="text-[11px] text-emerald-400">
                            ↓ {order.receiver.city} ({order.receiver.district})
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block border ${
                              order.status === 'delivered'
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                : order.status === 'pending'
                                ? 'bg-amber-950 text-amber-400 border-amber-800'
                                : order.status === 'in_transit' || order.status === 'picked_up'
                                ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                                : order.status === 'assigned'
                                ? 'bg-purple-950 text-purple-400 border-purple-800'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td className="p-3.5">
                          {assignedEmp ? (
                            <div className="flex items-center gap-1.5 font-medium text-slate-200">
                              <Truck className="w-3.5 h-3.5 text-teal-400" />
                              <span>{assignedEmp.name}</span>
                            </div>
                          ) : (
                            <select
                              onChange={(e) => handleAssignDriver(order._id, e.target.value)}
                              defaultValue=""
                              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-purple-500"
                            >
                              <option value="" disabled>
                                + تعيين مندوب
                              </option>
                              {driversList.map((d) => (
                                <option key={d._id} value={d._id}>
                                  {d.name} ({d.vehicleType})
                                </option>
                              ))}
                            </select>
                          )}
                        </td>

                        <td className="p-3.5 font-mono font-bold text-white">
                          {order.pricing.totalAmount} ر.س
                        </td>

                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              title="عرض التفاصيل الكاملة"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <select
                              value={order.status}
                              onChange={(e) => handleOverrideStatus(order._id, e.target.value)}
                              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-400 focus:outline-none focus:border-purple-500"
                            >
                              <option value="pending">تعديل: Pending</option>
                              <option value="confirmed">تعديل: Confirmed</option>
                              <option value="assigned">تعديل: Assigned</option>
                              <option value="picked_up">تعديل: Picked Up</option>
                              <option value="in_transit">تعديل: In Transit</option>
                              <option value="delivered">تعديل: Delivered</option>
                              <option value="cancelled">تعديل: Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. USERS TAB */}
      {activeSubTab === 'users' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">المستخدم</th>
                <th className="p-3.5">البريد والهاتف</th>
                <th className="p-3.5">الدور (Role)</th>
                <th className="p-3.5">بيانات المركبة / الهوية</th>
                <th className="p-3.5">المدينة</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-bold text-white flex items-center gap-2">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-7 h-7 rounded-full bg-slate-800"
                    />
                    <span>{user.name}</span>
                  </td>

                  <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                    <div>{user.email}</div>
                    <div className="text-slate-500">{user.phone}</div>
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                        user.role === 'admin'
                          ? 'bg-purple-950 text-purple-300 border-purple-800'
                          : user.role === 'employee'
                          ? 'bg-blue-950 text-blue-300 border-blue-800'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="p-3.5 text-[11px]">
                    {user.role === 'employee' ? (
                      <div>
                        <span className="font-semibold text-slate-200">{user.vehicleType}</span>
                        {user.vehiclePlate && (
                          <span className="text-slate-400 mr-1.5 font-mono">({user.vehiclePlate})</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>

                  <td className="p-3.5 text-slate-300">{user.city || 'الرياض'}</td>

                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.status === 'active'
                          ? 'bg-emerald-950 text-emerald-400'
                          : 'bg-rose-950 text-rose-400'
                      }`}
                    >
                      {user.status === 'active' ? 'نشط' : 'معلق'}
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleUser(user._id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 transition cursor-pointer"
                      >
                        {user.status === 'active' ? 'تعليق الحساب' : 'تفعيل الحساب'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. SERVICES TAB */}
      {activeSubTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv) => (
            <div
              key={srv._id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-white text-sm">{srv.name}</div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono">
                  {srv.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{srv.description}</p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-500">السعر الأساسي:</span>{' '}
                  <strong className="text-emerald-400">{srv.basePrice} ر.س</strong>
                </div>
                <div>
                  <span className="text-slate-500">سعر الكيلو:</span>{' '}
                  <strong className="text-teal-400">{srv.pricePerKm} ر.س/كم</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-white text-base">إضافة مندوب توصيل جديد (Create Driver)</h3>
            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">الاسم الكامل للمندوب</label>
                <input
                  required
                  type="text"
                  value={empForm.name}
                  onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="مثال: تركي الشمري"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">البريد الإلكتروني</label>
                  <input
                    required
                    type="email"
                    value={empForm.email}
                    onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="driver@mersal.sa"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">رقم الجوال</label>
                  <input
                    required
                    type="tel"
                    value={empForm.phone}
                    onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="+966500000000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">نوع المركبة</label>
                  <select
                    value={empForm.vehicleType}
                    onChange={(e) => setEmpForm({ ...empForm, vehicleType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="motorcycle">دراجة نارية (Motorcycle)</option>
                    <option value="sedan">سيارة صغيرة (Sedan)</option>
                    <option value="van">فان بضائع (Van)</option>
                    <option value="truck">شاحنة نقل (Truck)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">لوحة المركبة</label>
                  <input
                    type="text"
                    value={empForm.vehiclePlate}
                    onChange={(e) => setEmpForm({ ...empForm, vehiclePlate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="أ ب ج 1234"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">كلمة المرور المؤقتة</label>
                <input
                  required
                  type="password"
                  value={empForm.password}
                  onChange={(e) => setEmpForm({ ...empForm, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Driver123!"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition cursor-pointer"
                >
                  حفظ وإصدار التوكن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};
