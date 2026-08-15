import React, { useState } from 'react';
import {
  Code,
  Send,
  Lock,
  Globe,
  Copy,
  Check,
  Zap,
  Terminal,
  Server,
  Layers,
} from 'lucide-react';

interface EndpointDoc {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  category: string;
  description: string;
  authRequired: boolean;
  requiredRole?: 'admin' | 'employee' | 'customer';
  defaultBody?: any;
  defaultParams?: Record<string, string>;
}

const ENDPOINTS: EndpointDoc[] = [
  // Auth
  {
    method: 'POST',
    path: '/api/auth/register',
    category: 'Auth',
    description: 'تسجيل حساب جديد وتوليد رمز JWT مشفر',
    authRequired: false,
    defaultBody: {
      name: 'عميل تجريبي',
      email: 'demo@mersal.sa',
      phone: '+966509988776',
      password: 'DemoPassword123!',
      role: 'customer',
    },
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    category: 'Auth',
    description: 'تسجيل الدخول والتحقق من كلمة المرور مع إرجاع توكن JWT',
    authRequired: false,
    defaultBody: {
      email: 'admin@mersal.sa',
      password: 'Admin123!',
    },
  },
  {
    method: 'GET',
    path: '/api/auth/me',
    category: 'Auth',
    description: 'استرجاع الملف الشخصي الحالي بالاعتماد على التوكن الممرر',
    authRequired: true,
  },

  // Services
  {
    method: 'GET',
    path: '/api/services',
    category: 'Services',
    description: 'استرجاع قائمة خدمات وباقات التوصيل المتاحة وأسعارها',
    authRequired: false,
  },

  // Orders
  {
    method: 'POST',
    path: '/api/orders',
    category: 'Orders',
    description: 'إنشاء طلب شحنة جديد (استخراج هوية العميل من التوكن برمجياً)',
    authRequired: true,
    requiredRole: 'customer',
    defaultBody: {
      serviceId: 'srv_express',
      sender: {
        name: 'سلطان بن عبدالعزيز',
        phone: '+966555123456',
        city: 'الرياض',
        district: 'الملقا',
        addressDetails: 'شارع أنس بن مالك',
      },
      receiver: {
        name: 'مكتب الرياض للأعمال',
        phone: '+966554433221',
        city: 'الرياض',
        district: 'العليا',
        addressDetails: 'برج الفيصلية',
      },
      package: {
        title: 'مستندات وعقود هامة',
        category: 'وثائق',
        weightKg: 0.5,
        isFragile: false,
      },
      paymentMethod: 'online',
      estimatedDistanceKm: 15,
    },
  },
  {
    method: 'GET',
    path: '/api/orders/my-orders',
    category: 'Orders',
    description: 'استرجاع الشحنات الخاصة بالعميل صاحب التوكن الحالي',
    authRequired: true,
  },
  {
    method: 'GET',
    path: '/api/orders/track/MRS-2026-8941',
    category: 'Orders',
    description: 'تتبع الشحنة برقم التتبع العام دون الحاجة لتسجيل الدخول',
    authRequired: false,
  },

  // Employees
  {
    method: 'GET',
    path: '/api/employees/tasks',
    category: 'Employees',
    description: 'استرجاع قائمة المهام المسندة للمندوب صاحب التوكن',
    authRequired: true,
    requiredRole: 'employee',
  },
  {
    method: 'GET',
    path: '/api/employees/tasks/available',
    category: 'Employees',
    description: 'استعراض الشحنات الجاهزة للتكليف في المنطقة',
    authRequired: true,
    requiredRole: 'employee',
  },
  {
    method: 'POST',
    path: '/api/employees/tasks/ord_101/complete',
    category: 'Employees',
    description: 'إتمام التسليم وإرفاق إثبات التسليم الرقمي (POD)',
    authRequired: true,
    requiredRole: 'employee',
    defaultBody: {
      recipientName: 'عبدالرحمن العتيبي',
      notes: 'تم التسليم باليد والتوقيع الرقمي',
      signatureReceived: true,
    },
  },

  // Admin
  {
    method: 'GET',
    path: '/api/admin/stats',
    category: 'Admin',
    description: 'مؤشرات الأداء الشاملة والإحصائيات الحية للمنظومة',
    authRequired: true,
    requiredRole: 'admin',
  },
  {
    method: 'PATCH',
    path: '/api/admin/orders/ord_101/assign',
    category: 'Admin',
    description: 'تعيين مندوب توصيل محدد للشحنة وتحديث حالتها',
    authRequired: true,
    requiredRole: 'admin',
    defaultBody: {
      employeeId: 'usr_emp_001',
    },
  },
];

export const ApiDocsView: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDoc>(ENDPOINTS[0]);
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify(ENDPOINTS[0].defaultBody || {}, null, 2)
  );
  const [customPath, setCustomPath] = useState<string>(ENDPOINTS[0].path);
  const [responseCode, setResponseCode] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<any>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const handleSelectEndpoint = (ep: EndpointDoc) => {
    setSelectedEndpoint(ep);
    setCustomPath(ep.path);
    setRequestBody(JSON.stringify(ep.defaultBody || {}, null, 2));
    setResponseCode(null);
    setResponseData(null);
  };

  const handleExecuteRequest = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('mersal_jwt_token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (selectedEndpoint.authRequired && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method: selectedEndpoint.method,
      headers,
    };

    if (selectedEndpoint.method !== 'GET' && requestBody.trim()) {
      try {
        options.body = requestBody;
      } catch (e) {
        // use raw
      }
    }

    const startTime = performance.now();
    try {
      const res = await fetch(customPath, options);
      const endTime = performance.now();
      setResponseCode(res.status);

      const data = await res.json().catch(() => ({ message: 'Non-JSON response' }));
      setResponseData({
        executionTimeMs: Math.round(endTime - startTime),
        statusText: res.statusText,
        body: data,
      });
    } catch (err: any) {
      setResponseCode(500);
      setResponseData({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const currentCurl = `curl -X ${selectedEndpoint.method} "${window.location.origin}${customPath}" \\
  -H "Content-Type: application/json" \\${
    selectedEndpoint.authRequired
      ? `\n  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \\`
      : ''
  }${
    selectedEndpoint.method !== 'GET' && requestBody
      ? `\n  -d '${requestBody.replace(/\n/g, '')}'`
      : ''
  }`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(currentCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              منصة توثيق واختبار الـ REST API (Interactive API Console)
            </h3>
            <p className="text-xs text-slate-400">
              واجهات برمجية متوافقة مع معايير RESTful تربط تطبيقات Flutter ومنصة الويب
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>Base URL: /api/*</span>
        </div>
      </div>

      {/* Main Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Endpoint List */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-400 mb-2 px-1">
            نقاط النهاية البرمجية (Endpoints):
          </div>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {ENDPOINTS.map((ep, idx) => {
              const isSelected =
                selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-right p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-purple-950/50 border-purple-500 ring-1 ring-purple-500/30'
                      : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                        ep.method === 'GET'
                          ? 'bg-blue-950 text-blue-300'
                          : ep.method === 'POST'
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      {ep.authRequired && <Lock className="w-2.5 h-2.5 text-amber-400" />}
                      {ep.category}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-white font-bold truncate">
                    {ep.path}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">
                    {ep.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Interactive Request & Response Panel */}
        <div className="lg:col-span-8 space-y-4">
          {/* Request Config Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <span
                className={`px-3 py-2 rounded-xl text-xs font-mono font-black text-center ${
                  selectedEndpoint.method === 'GET'
                    ? 'bg-blue-600 text-white'
                    : selectedEndpoint.method === 'POST'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                {selectedEndpoint.method}
              </span>

              <input
                type="text"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              />

              <button
                onClick={handleExecuteRequest}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-purple-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isLoading ? 'جاري الإرسال...' : 'Send Request'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <div>{selectedEndpoint.description}</div>
              {selectedEndpoint.requiredRole && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono">
                  Role: {selectedEndpoint.requiredRole}
                </span>
              )}
            </div>

            {/* Request Body Editor if not GET */}
            {selectedEndpoint.method !== 'GET' && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-300">Request JSON Body:</div>
                <textarea
                  rows={6}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            {/* Curl Command Snippet */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-400 font-mono">cURL Command:</span>
                <button
                  onClick={handleCopyCurl}
                  className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-mono"
                >
                  {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCurl ? 'تم النسخ' : 'نسخ أمر cURL'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                {currentCurl}
              </pre>
            </div>
          </div>

          {/* Response Inspector Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white text-xs">Response Payload</span>
              </div>
              {responseCode !== null && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      responseCode >= 200 && responseCode < 300
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    Status: {responseCode}
                  </span>
                  {responseData?.executionTimeMs && (
                    <span className="text-slate-400">{responseData.executionTimeMs} ms</span>
                  )}
                </div>
              )}
            </div>

            {responseData ? (
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 max-h-80 overflow-y-auto leading-relaxed">
                {JSON.stringify(responseData.body || responseData, null, 2)}
              </pre>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs font-mono">
                اضغط على &ldquo;Send Request&rdquo; لتنفيذ الطلب واستعراض استجابة الخادم اللحظية
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
