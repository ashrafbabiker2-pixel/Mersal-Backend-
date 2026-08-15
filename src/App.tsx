import React, { useState, useEffect } from 'react';
import {
  Server,
  Layers,
  LayoutDashboard,
  Smartphone,
  Truck,
  Code,
  Radio,
  FileCode,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Header } from './components/Header';
import { ArchitectureView } from './components/ArchitectureView';
import { AdminPlatformView } from './components/AdminPlatformView';
import { CustomerAppView } from './components/CustomerAppView';
import { EmployeeAppView } from './components/EmployeeAppView';
import { ApiDocsView } from './components/ApiDocsView';
import { LogsView } from './components/LogsView';
import { CodeViewer } from './components/CodeViewer';
import { api } from './api/client';
import { IUser } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('architecture');
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [globalRefreshKey, setGlobalRefreshKey] = useState<number>(0);

  // Initialize session (default login as Admin to have full visibility)
  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        const meRes = await api.getMe();
        if (meRes.success && meRes.user) {
          setCurrentUser(meRes.user);
          return;
        }
      }
      // Default auto-login as Admin
      const loginRes = await api.login('admin@mersal.sa', 'Admin123!');
      if (loginRes.success && loginRes.user) {
        setCurrentUser(loginRes.user);
      }
    };
    initAuth();
  }, []);

  const handleSwitchUser = async (role: 'admin' | 'employee' | 'customer') => {
    let email = 'admin@mersal.sa';
    let pass = 'Admin123!';

    if (role === 'employee') {
      email = 'driver1@mersal.sa';
      pass = 'Driver123!';
    } else if (role === 'customer') {
      email = 'customer1@mersal.sa';
      pass = 'Customer123!';
    }

    const res = await api.login(email, pass);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setGlobalRefreshKey((k) => k + 1);

      // Auto-navigate to appropriate view when switching role
      if (role === 'customer') setActiveTab('customer');
      if (role === 'employee') setActiveTab('employee');
      if (role === 'admin') setActiveTab('admin');
    }
  };

  const handleGlobalRefresh = () => {
    setGlobalRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-purple-500 selection:text-white" dir="rtl">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between overflow-x-auto pb-2 border-b border-slate-800/80 gap-2 scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              id="tab-btn-architecture"
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTab === 'architecture'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>الهندسة المعمارية والمحاكاة</span>
            </button>

            <button
              id="tab-btn-admin"
              onClick={() => {
                if (currentUser?.role !== 'admin') handleSwitchUser('admin');
                setActiveTab('admin');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>منصة الإدارة (Admin Web)</span>
            </button>

            <button
              id="tab-btn-customer"
              onClick={() => {
                if (currentUser?.role !== 'customer') handleSwitchUser('customer');
                setActiveTab('customer');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTab === 'customer'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>تطبيق العملاء (Flutter App)</span>
            </button>

            <button
              id="tab-btn-employee"
              onClick={() => {
                if (currentUser?.role !== 'employee') handleSwitchUser('employee');
                setActiveTab('employee');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTab === 'employee'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>تطبيق الموظفين والمناديب</span>
            </button>

            <button
              id="tab-btn-apidocs"
              onClick={() => setActiveTab('apidocs')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTab === 'apidocs'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>توثيق وتجربة الـ REST API</span>
            </button>

            <button
              id="tab-btn-logs"
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>حركة الخادم الحية (Telemetry)</span>
            </button>

            <button
              id="tab-btn-code"
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>مستكشف الكود (Source)</span>
            </button>
          </div>
        </div>

        {/* View Switcher Container */}
        <div key={globalRefreshKey}>
          {activeTab === 'architecture' && (
            <ArchitectureView
              onNavigateTab={(tab) => {
                if (tab === 'customer') handleSwitchUser('customer');
                if (tab === 'employee') handleSwitchUser('employee');
                if (tab === 'admin') handleSwitchUser('admin');
                setActiveTab(tab);
              }}
              onRefreshData={handleGlobalRefresh}
            />
          )}

          {activeTab === 'admin' && (
            <AdminPlatformView onRefreshGlobal={handleGlobalRefresh} />
          )}

          {activeTab === 'customer' && (
            <CustomerAppView
              currentUser={currentUser}
              onRefreshGlobal={handleGlobalRefresh}
            />
          )}

          {activeTab === 'employee' && (
            <EmployeeAppView
              currentUser={currentUser}
              onRefreshGlobal={handleGlobalRefresh}
            />
          )}

          {activeTab === 'apidocs' && <ApiDocsView />}

          {activeTab === 'logs' && <LogsView />}

          {activeTab === 'code' && <CodeViewer />}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>Mersal Logistics Architecture • Single Source of Truth • Node.js Express + JWT + MongoDB</p>
      </footer>
    </div>
  );
}
