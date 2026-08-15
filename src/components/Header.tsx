import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  LayoutDashboard,
  Smartphone,
  Truck,
  Code2,
  Terminal,
  RefreshCw,
  UserCheck,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { api } from '../api/client';
import { IUser, UserRole } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: IUser | null;
  onUserSwitch: (role: UserRole) => void;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onUserSwitch,
  onRefresh,
}) => {
  const [serverHealth, setServerHealth] = useState<{
    status: string;
    version: string;
    stats?: { usersCount: number; ordersCount: number; servicesCount: number; logsCount: number };
  } | null>(null);
  const [pingLatency, setPingLatency] = useState<number>(12);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      const start = Date.now();
      const res = await api.getHealth();
      const latency = Date.now() - start;
      setPingLatency(latency);
      if (res && res.database) {
        setServerHealth({
          status: res.status,
          version: res.version,
          stats: res.database.stats,
        });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'architecture', label: 'بنية المنظومة والربط الحي', icon: Layers, badge: 'Live' },
    { id: 'admin', label: 'منصة الإدارة والتحكم', icon: LayoutDashboard, role: 'admin' },
    { id: 'customer', label: 'تطبيق العملاء', icon: Smartphone, role: 'customer' },
    { id: 'employee', label: 'تطبيق الموظفين والمناديب', icon: Truck, role: 'employee' },
    { id: 'api_docs', label: 'مختبر الـ API ومستندات REST', icon: Terminal, badge: 'REST' },
    { id: 'logs', label: 'سجل الاتصالات والعمليات', icon: Activity },
    { id: 'code', label: 'مستعرض الشيفرة المصدرية', icon: Code2 },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-40">
      {/* Top Status Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/60 text-xs">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Zap className="w-5 h-5 text-slate-950 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                منظومة مِرسال
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20 font-medium">
                  MERSAL BACKEND v1.0
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400">
              الخادم المركزي لربط تطبيقات العملاء ↔ منصة الإدارة ↔ تطبيقات الموظفين
            </p>
          </div>
        </div>

        {/* Server Health & Diagnostics Pills */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Server Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-slate-200">الخادم: متصل</span>
            <span className="text-[10px] text-slate-400 font-mono">({pingLatency}ms)</span>
          </div>

          {/* Database Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>MongoDB:</span>
            <span className="text-emerald-400 font-medium font-mono">
              {serverHealth?.stats?.ordersCount ?? 4} طلبات
            </span>
          </div>

          {/* Security / JWT Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>JWT Auth:</span>
            <span className="text-amber-300 font-mono text-[11px]">مفعل وصارم</span>
          </div>

          {/* Active Role Quick Selector */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all font-medium text-xs cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>الحساب النشط:</span>
              <span className="font-bold text-white underline decoration-emerald-400/50">
                {currentUser?.name || 'زائر / بدون مصادقة'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                {currentUser?.role === 'admin'
                  ? 'إدارة'
                  : currentUser?.role === 'employee'
                  ? 'مندوب'
                  : currentUser?.role === 'customer'
                  ? 'عميل'
                  : 'عام'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
            </button>

            {isMenuOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-800 mb-1">
                  التبديل الفوري بين أدوار المستخدمين:
                </div>
                <button
                  onClick={() => {
                    onUserSwitch('admin');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-right px-2.5 py-2 rounded-lg hover:bg-slate-800 flex items-center justify-between text-xs transition"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    <div>
                      <div className="font-semibold text-slate-200">عبدالله السبيعي</div>
                      <div className="text-[10px] text-slate-400">admin@mersal.sa</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono">
                    Admin
                  </span>
                </button>

                <button
                  onClick={() => {
                    onUserSwitch('employee');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-right px-2.5 py-2 rounded-lg hover:bg-slate-800 flex items-center justify-between text-xs transition"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <div>
                      <div className="font-semibold text-slate-200">فهد المنصور</div>
                      <div className="text-[10px] text-slate-400">driver1@mersal.sa (دراجة)</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono">
                    Driver
                  </span>
                </button>

                <button
                  onClick={() => {
                    onUserSwitch('customer');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-right px-2.5 py-2 rounded-lg hover:bg-slate-800 flex items-center justify-between text-xs transition"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <div>
                      <div className="font-semibold text-slate-200">سلطان بن عبدالعزيز</div>
                      <div className="text-[10px] text-slate-400">customer1@mersal.sa</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono">
                    Customer
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            title="تحديث البيانات من الخادم"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 space-x-reverse overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
