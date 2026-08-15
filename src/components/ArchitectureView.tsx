import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Smartphone,
  LayoutDashboard,
  Truck,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Lock,
  Globe,
  Radio,
  FileCheck,
  Terminal,
  Activity,
  FolderTree,
  Code2,
  Clock,
  Layers,
  Check,
  ChevronRight,
  Cpu,
  Building2,
  Wrench,
  Package,
} from 'lucide-react';
import { api } from '../api/client';

interface ArchitectureViewProps {
  onNavigateTab: (tab: string) => void;
  onRefreshData: () => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  onNavigateTab,
  onRefreshData,
}) => {
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simLog, setSimLog] = useState<string[]>([]);
  const [simOrderId, setSimOrderId] = useState<string | null>(null);

  // Health check live state
  const [healthData, setHealthData] = useState<any>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [healthLatency, setHealthLatency] = useState<number | null>(null);

  // Active sub-tab in Foundation Hub
  const [foundationTab, setFoundationTab] = useState<'roadmap' | 'health' | 'structure' | 'schemas'>('roadmap');

  const checkServerHealth = async () => {
    setIsCheckingHealth(true);
    const start = performance.now();
    try {
      const res = await api.getHealth();
      const end = performance.now();
      setHealthLatency(Math.round(end - start));
      setHealthData(res);
    } catch (e: any) {
      setHealthData({ status: 'error', message: e.message });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkServerHealth();
  }, []);

  const runLiveSimulation = async () => {
    setIsSimulating(true);
    setSimulationStep(1);
    setSimLog([
      '🚀 بدء محاكاة دورة حياة الشحنة الحقيقية عبر منظومة مرسال المركزية (Mersal Core)...',
    ]);

    try {
      // Step 1: Customer Login & Create Order
      setSimLog((prev) => [
        ...prev,
        '1️⃣ تطبيق العملاء: تسجيل دخول العميل (سلطان بن عبدالعزيز) واستخراج توكن JWT...',
      ]);
      await api.login('customer1@mersal.sa', 'Customer123!');

      setSimLog((prev) => [
        ...prev,
        '2️⃣ تطبيق العملاء -> إرسال POST /api/v1/orders (استخراج customerId من JWT برمجياً في الخادم)...',
      ]);
      const orderRes = await api.createOrder({
        serviceId: 'srv_property_mgmt',
        serviceCode: 'property_management',
        sender: {
          name: 'سلطان بن عبدالعزيز (المالك)',
          phone: '+966555123456',
          city: 'الرياض',
          district: 'الملقا',
          addressDetails: 'شارع أنس بن مالك، فيلا 22',
        },
        receiver: {
          name: 'إدارة أملاك مرسال',
          phone: '+966112223344',
          city: 'الرياض',
          district: 'الملقا',
          addressDetails: 'مقر المعاينة',
        },
        propertyDetails: {
          propertyType: 'villa',
          unitNumber: 'Villa-22',
          city: 'الرياض',
          district: 'الملقا',
          addressDetails: 'شارع أنس بن مالك، تقاطع طريق الخير',
          accessKeyInstructions: 'المفتاح مع حارس المجمع',
        },
        serviceDetails: {
          inspectionType: 'فحص دوري شامل وتسليم مستأجر جديد',
          notes: 'معاينة الكهرباء والمضخات ومكيفات الدور الثاني',
        },
        paymentMethod: 'online',
      });

      if (!orderRes.success || !orderRes.order) {
        throw new Error(orderRes.message || 'فشل إنشاء الطلب');
      }

      const createdOrder = orderRes.order;
      setSimOrderId(createdOrder._id);
      setSimLog((prev) => [
        ...prev,
        `✅ تم إنشاء الطلب وتخزينه في MongoDB بنجاح برقم: [${createdOrder.orderNumber || createdOrder.trackingNumber}]`,
      ]);

      await new Promise((r) => setTimeout(r, 1200));

      // Step 2: Admin Assigns Employee
      setSimulationStep(2);
      setSimLog((prev) => [
        ...prev,
        '3️⃣ منصة الإدارة: تسجيل دخول المشرف (Admin) بـ JWT والتحقق من الصلاحيات (Role: admin)...',
      ]);
      await api.login('admin@mersal.sa', 'Admin123!');

      setSimLog((prev) => [
        ...prev,
        `4️⃣ منصة الإدارة -> إرسال PATCH /api/v1/admin/orders/${createdOrder._id}/assign لإسناد المهمة للفني (فهد المنصور)...`,
      ]);
      await api.assignEmployee(createdOrder._id, 'usr_emp_001');

      setSimLog((prev) => [
        ...prev,
        '✅ تم إسناد المهمة للفني وتحديث حالة الطلب إلى (Assigned) وإرسال إشعار فوري للفني.',
      ]);

      await new Promise((r) => setTimeout(r, 1200));

      // Step 3: Employee Starts Visit
      setSimulationStep(3);
      setSimLog((prev) => [
        ...prev,
        '5️⃣ تطبيق الموظف: تسجيل دخول الفني (فهد المنصور) بـ JWT (Role: employee)...',
      ]);
      await api.login('driver1@mersal.sa', 'Driver123!');

      setSimLog((prev) => [
        ...prev,
        `6️⃣ تطبيق الموظف -> إرسال PATCH /api/v1/employees/tasks/${createdOrder._id}/status لتحديث الحالة إلى (In Progress / بدء المعاينة)...`,
      ]);
      await api.updateTaskStatus(
        createdOrder._id,
        'in_progress',
        'تم الوصول لموقع العقار والبدء بالفحص الميداني',
        'الرياض - حي الملقا'
      );

      setSimLog((prev) => [
        ...prev,
        '✅ تم تسجيل الحضور الميداني للفني وتحديث الخط الزمني (Timeline) لحظياً في MongoDB.',
      ]);

      await new Promise((r) => setTimeout(r, 1200));

      // Step 4: Complete and Submit POD
      setSimulationStep(4);
      setSimLog((prev) => [
        ...prev,
        '7️⃣ تطبيق الموظف -> إنهاء المعاينة وتوثيق إثبات الإنجاز الرقمي (POD & Report)...',
      ]);
      await api.completeTask(
        createdOrder._id,
        'سلطان بن عبدالعزيز',
        'تم إنهاء فحص العقار بالكامل وإعداد تقرير السلامة الكهربائية والسباكة',
        true
      );

      setSimLog((prev) => [
        ...prev,
        '🎉 اكتملت الدورة بنجاح: تم إغلاق الطلب، توثيق كود POD، وتحديث منصة الإدارة وتطبيق العميل تلقائياً!',
      ]);

      onRefreshData();
    } catch (err: any) {
      setSimLog((prev) => [
        ...prev,
        `❌ خطأ أثناء المحاكاة: ${err.message || 'حدث خطأ غير متوقع'}`,
      ]);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 5-Unit Master Roadmap Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>خريطة مشروع خادم مرسال الحقيقي (MERSAL Backend Roadmap)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              الوحدة الأولى: Architecture & Foundation (مكتملة وجاهزة)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              تأسيس النواة الصلبة لخادم مرسال (Node.js + Express + MongoDB + JWT)، هيكلة المجلدات، معالجة الأخطاء الشاملة، طبقة الأمان، ونماذج Mongoose المركزية للخدمات الثلاث والطلبات الميدانية.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={checkServerHealth}
              disabled={isCheckingHealth}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold border border-slate-700 transition cursor-pointer"
            >
              <Activity className={`w-3.5 h-3.5 text-emerald-400 ${isCheckingHealth ? 'animate-spin' : ''}`} />
              <span>فحص صحة الخادم</span>
            </button>
          </div>
        </div>

        {/* 5 Units Status Progress Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* Unit 1 */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/80 font-bold">الوحدة 1</span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <Check className="w-3.5 h-3.5" /> مكتملة
              </span>
            </div>
            <div className="font-bold text-xs text-white">Architecture & Foundation</div>
            <p className="text-[11px] text-emerald-200/70">Express, Mongo, Models, Error Handling & Health Check</p>
          </div>

          {/* Unit 2 */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 font-bold text-slate-400">الوحدة 2</span>
              <span className="text-[11px] font-bold text-amber-400">التالية ⏳</span>
            </div>
            <div className="font-bold text-xs text-white">Authentication & RBAC</div>
            <p className="text-[11px] text-slate-400">5 أدوار، JWT، تشفير، حماية API، وتفعيل/تعطيل الحسابات</p>
          </div>

          {/* Unit 3 */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 font-bold text-slate-400">الوحدة 3</span>
              <span className="text-[11px] font-bold text-slate-500">مجدولة</span>
            </div>
            <div className="font-bold text-xs text-white">MERSAL Core Platform</div>
            <p className="text-[11px] text-slate-400">الخدمات الـ 3، دورة الطلبات، والتنفيذ الميداني (Visits/Reports)</p>
          </div>

          {/* Unit 4 */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 font-bold text-slate-400">الوحدة 4</span>
              <span className="text-[11px] font-bold text-slate-500">مجدولة</span>
            </div>
            <div className="font-bold text-xs text-white">Events & Communication</div>
            <p className="text-[11px] text-slate-400">محرك الأحداث المركزي، الإشعارات، السجلات، والتقارير الإدارية</p>
          </div>

          {/* Unit 5 */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 font-bold text-slate-400">الوحدة 5</span>
              <span className="text-[11px] font-bold text-slate-500">مجدولة</span>
            </div>
            <div className="font-bold text-xs text-white">Deployment & Production</div>
            <p className="text-[11px] text-slate-400">PM2, Nginx, SSL, CI/CD, وربط تطبيقات Flutter الإنتاجية</p>
          </div>
        </div>
      </div>

      {/* Unit 1 Interactive Explorer (Tabs: Health Status / Folder Structure / Mongoose Schemas) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-extrabold text-white">
              مكونات الوحدة الأولى (Unit 1 Foundation Hub):
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFoundationTab('roadmap')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                foundationTab === 'roadmap' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              الهندسة المعمارية
            </button>
            <button
              onClick={() => setFoundationTab('health')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                foundationTab === 'health' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>صحة الخادم (/api/v1/health)</span>
              {healthLatency !== null && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono">
                  {healthLatency}ms
                </span>
              )}
            </button>
            <button
              onClick={() => setFoundationTab('structure')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                foundationTab === 'structure' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              هيكلية المجلدات
            </button>
            <button
              onClick={() => setFoundationTab('schemas')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                foundationTab === 'schemas' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              نماذج Mongoose Schemas
            </button>
          </div>
        </div>

        {/* Tab 1: Architecture Topology */}
        {foundationTab === 'roadmap' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Left Column: Mobile Applications */}
              <div className="space-y-4">
                <div
                  onClick={() => onNavigateTab('customer')}
                  className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-800/60 hover:border-blue-500 transition cursor-pointer shadow-lg space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                      <Smartphone className="w-4 h-4" />
                      <span>تطبيق العميل (Customer Flutter App)</span>
                    </div>
                    <span className="text-[10px] bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded font-mono">
                      JWT Auth
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    إنشاء ومتابعة طلبات الخدمات الـ 3 (إدارة العقارات، الشراء والتوصيل، متابعة الصيانة)، الدفع، واستعراض التقارير.
                  </p>
                </div>

                <div
                  onClick={() => onNavigateTab('employee')}
                  className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-800/60 hover:border-amber-500 transition cursor-pointer shadow-lg space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <Truck className="w-4 h-4" />
                      <span>تطبيق الموظف والمندوب (Employee App)</span>
                    </div>
                    <span className="text-[10px] bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded font-mono">
                      Role: employee
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    تنفيذ الزيارات الميدانية، المهام، رفع الصور والفيديوهات، تسجيل المصروفات، وتوثيق إثبات الإنجاز POD.
                  </p>
                </div>
              </div>

              {/* Center: Mersal Central Backend */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-purple-950/80 via-slate-900 to-slate-950 border-2 border-purple-500/50 shadow-2xl space-y-4 text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-emerald-400 to-blue-500"></div>

                <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40 shadow-inner">
                  <Server className="w-7 h-7 animate-pulse" />
                </div>

                <div>
                  <h4 className="text-base font-black text-white">خادم مرسال المركزي (MERSAL Backend)</h4>
                  <p className="text-xs text-purple-300 font-mono">Node.js + Express + REST API v1</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-right font-mono text-slate-300">
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-emerald-400 font-bold">🔐 JWT Extraction:</span>
                    <p className="text-slate-400 text-[10px]">استخراج customerId برمجياً</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-purple-400 font-bold">🛡️ RBAC Guard:</span>
                    <p className="text-slate-400 text-[10px]">حماية الصلاحيات والأدوار</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-blue-400 font-bold">⚡ Central Engine:</span>
                    <p className="text-slate-400 text-[10px]">إدارة الكيان المركزي للطلب</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-amber-400 font-bold">📡 Live Telemetry:</span>
                    <p className="text-slate-400 text-[10px]">تسجيل ومراقبة حركة الـ API</p>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-400" />
                      <span>MongoDB: MERSAL_DATA</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-900/80 rounded font-bold">Connected</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Admin Management Platform */}
              <div className="space-y-4">
                <div
                  onClick={() => onNavigateTab('admin')}
                  className="p-4 rounded-2xl bg-gradient-to-l from-purple-950/60 to-slate-900 border border-purple-800/60 hover:border-purple-500 transition cursor-pointer shadow-lg space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>منصة الإدارة (Admin Web Portal)</span>
                    </div>
                    <span className="text-[10px] bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded font-mono">
                      Role: admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    لوحة تحكم مركزية، تعيين الفنيين، اعتماد المصروفات، تقارير الأداء، وإدارة المستخدمين والخدمات.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>مبدأ المصدر الوحيد للحقيقة (SSOT):</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    لا يوجد أي تطبيق يتحدث مع قاعدة البيانات مباشرة؛ خادم مرسال هو البوابة المركزية الوحيدة المنفذة لمنطق العمل (Business Logic).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Health Check Diagnostic (/api/v1/health) */}
        {foundationTab === 'health' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs font-mono flex items-center gap-2">
                    <span>GET /api/v1/health</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">200 OK</span>
                  </div>
                  <p className="text-[11px] text-slate-400">فحص الجاهزية اللحظية، محرك قاعدة البيانات، واستهلاك الذاكرة</p>
                </div>
              </div>

              <button
                onClick={checkServerHealth}
                disabled={isCheckingHealth}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
              >
                {isCheckingHealth ? 'جاري الفحص...' : 'إعادة الفحص الآن'}
              </button>
            </div>

            {healthData ? (
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed">
                {JSON.stringify(healthData, null, 2)}
              </pre>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs font-mono">
                جاري استدعاء نقطة النهاية /api/v1/health...
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Folder Structure */}
        {foundationTab === 'structure' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="text-purple-400 font-bold flex items-center gap-2">
                <FolderTree className="w-4 h-4" />
                <span>هيكلية مشروع mersal-backend المعتمدة:</span>
              </div>
              <pre className="text-slate-300 leading-relaxed text-[11px]">
{`mersal-backend/
├── src/
│   ├── config/
│   │   ├── environment.ts        # إدارة المتغيرات البيئية والإعدادات
│   │   └── db.ts                 # الاتصال بـ MongoDB ومحرك التخزين
│   ├── models/
│   │   ├── User.ts               # نموذج المستخدمين والأدوار الـ 5
│   │   ├── Service.ts            # خدمات مرسال الـ 3 وحقولها الديناميكية
│   │   ├── Order.ts              # الكيان المركزي للطلب (Visits/Tasks/Reports/Media)
│   │   └── index.ts              # سجل النماذج المركزي
│   ├── middleware/
│   │   ├── auth_middleware.ts    # التحقق من JWT واستخراج الهوية
│   │   ├── role_middleware.ts    # التحقق من صلاحيات RBAC
│   │   ├── error_middleware.ts   # معالج الأخطاء المركزي (Global Error Handler)
│   │   ├── security_middleware.ts# أمان الترويسات وحماية CORS
│   │   └── logger_middleware.ts  # مسجل الاتصالات اللحظي (Telemetry)
│   ├── controllers/
│   │   ├── auth_controller.ts    # تسجيل الدخول وإنشاء الحساب
│   │   ├── order_controller.ts   # إدارة الطلبات والمحطة المركزية
│   │   ├── employee_controller.ts# مهام المندوبين وإثبات التسليم POD
│   │   ├── admin_controller.ts   # الإحصائيات وتعيين المشرفين
│   │   └── service_controller.ts # باقات وأسعار الخدمات
│   ├── routes/
│   │   └── v1/
│   │       ├── health_routes.ts  # فحص صحة الخادم
│   │       └── index.ts          # الراوتر المجمع للإصدار الأول v1
│   ├── utils/
│   │   ├── app_error.ts          # فئة الأخطاء التشغيلية المخصصة
│   │   ├── jwt.ts                # تشفير وفك تشفير التوكن
│   │   └── response.ts           # موحد استجابات JSON
│   └── server.ts                 # نقطة البداية وتشغيل الخادم المركزي
├── package.json
└── tsconfig.json`}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 4: Mongoose Schemas */}
        {foundationTab === 'schemas' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* User Model Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-xs font-mono">User Schema</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono">5 Roles</span>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1 font-mono">
                <li>• name, email (unique), phone (unique)</li>
                <li>• password (hashed, select: false)</li>
                <li>• role: [customer, employee, supervisor, manager, admin]</li>
                <li>• addresses: [title, city, district, coords]</li>
                <li>• employeeProfile: [code, dept, vehicle, rating, location]</li>
                <li>• status: [active, inactive, suspended]</li>
              </ul>
            </div>

            {/* Service Model Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-xs font-mono">Service Schema</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono">3 Services</span>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1 font-mono">
                <li>• 1. إدارة الأملاك والعقارات (Property Mgmt)</li>
                <li>• 2. الشراء والتوصيل (Purchase & Delivery)</li>
                <li>• 3. متابعة الصيانة والتشطيب (Maintenance)</li>
                <li>• basePrice, pricePerKm, slaHours</li>
                <li>• requiredFields: [key, label, type, options]</li>
              </ul>
            </div>

            {/* Order Model Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-xs font-mono">Order Schema</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono">Central Entity</span>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1 font-mono">
                <li>• orderNumber (unique), customer, service</li>
                <li>• status: [pending, accepted, assigned, in_progress, completed, archived]</li>
                <li>• visits: [technician, purpose, checkIn/Out]</li>
                <li>• tasks: [title, isCompleted, priority]</li>
                <li>• media: [photo/video, category: before/after]</li>
                <li>• reports, invoices, expenses, notes, timeline</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Live Simulation Engine Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>محاكاة دورة حياة الشحنة الحقيقية (Live End-to-End Simulation)</span>
            </h3>
            <p className="text-xs text-slate-400">
              اختبار فوري لتكامل كافة الواجهات البرمجية (REST API) والـ JWT وتحديث قاعدة البيانات لحظياً
            </p>
          </div>

          <button
            onClick={runLiveSimulation}
            disabled={isSimulating}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs text-white transition shadow-xl cursor-pointer ${
              isSimulating
                ? 'bg-slate-700 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
            }`}
          >
            {isSimulating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>جاري تنفيذ المحاكاة...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>تشغيل المحاكاة الكاملة الآن</span>
              </>
            )}
          </button>
        </div>

        {/* 4 Interactive Flow Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div
            className={`p-4 rounded-2xl border transition ${
              simulationStep === 1
                ? 'bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/30 shadow-lg'
                : simulationStep > 1
                ? 'bg-slate-950/80 border-emerald-700/60 text-slate-300'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold">المرحلة 1</span>
              {simulationStep > 1 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : simulationStep === 1 ? (
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping"></span>
              ) : null}
            </div>
            <div className="font-bold text-xs text-white mb-1">إنشاء الطلب بالـ JWT</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              تطبيق العميل يستدعي POST /api/v1/orders ويستخرج الخادم هوية العميل من التوكن.
            </p>
          </div>

          {/* Step 2 */}
          <div
            className={`p-4 rounded-2xl border transition ${
              simulationStep === 2
                ? 'bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/30 shadow-lg'
                : simulationStep > 2
                ? 'bg-slate-950/80 border-emerald-700/60 text-slate-300'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold">المرحلة 2</span>
              {simulationStep > 2 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : simulationStep === 2 ? (
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping"></span>
              ) : null}
            </div>
            <div className="font-bold text-xs text-white mb-1">القبول وتعيين الفني</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              المشرف في لوحة الإدارة يراجع الطلب ويسنده للفني فهد المنصور (Role: admin).
            </p>
          </div>

          {/* Step 3 */}
          <div
            className={`p-4 rounded-2xl border transition ${
              simulationStep === 3
                ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
                : simulationStep > 3
                ? 'bg-slate-950/80 border-emerald-700/60 text-slate-300'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold">المرحلة 3</span>
              {simulationStep > 3 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : simulationStep === 3 ? (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              ) : null}
            </div>
            <div className="font-bold text-xs text-white mb-1">بدء المعاينة الميدانية</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              الفني يسجل الوصول ويبدأ تنفيذ المهام ورفع الملاحظات والصور (In Progress).
            </p>
          </div>

          {/* Step 4 */}
          <div
            className={`p-4 rounded-2xl border transition ${
              simulationStep === 4
                ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg'
                : simulationStep > 4
                ? 'bg-slate-950/80 border-emerald-700/60 text-slate-300'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold">المرحلة 4</span>
              {simulationStep === 4 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : null}
            </div>
            <div className="font-bold text-xs text-white mb-1">إثبات الإنجاز (POD)</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              اعتماد إتمام الزيارة وتوثيق كود الإثبات الرقمي وإغلاق الطلب (Completed).
            </p>
          </div>
        </div>

        {/* Live Simulation Console Stream */}
        {simLog.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 max-h-56 overflow-y-auto">
            <div className="flex items-center justify-between text-slate-500 border-b border-slate-800/80 pb-1.5 text-[11px]">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                <span>Simulation Execution Log Stream</span>
              </span>
              <span>{simLog.length} events</span>
            </div>
            <div className="space-y-1 text-emerald-300">
              {simLog.map((log, i) => (
                <div key={i} className="leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
