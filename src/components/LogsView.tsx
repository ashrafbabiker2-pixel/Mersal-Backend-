import React, { useState, useEffect } from 'react';
import {
  Terminal,
  RefreshCw,
  Trash2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio,
  Server,
  Zap,
} from 'lucide-react';
import { api } from '../api/client';
import { IApiLog } from '../types';

export const LogsView: React.FC = () => {
  const [logs, setLogs] = useState<IApiLog[]>([]);
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchLogs = async () => {
    const res = await api.getLogs(50);
    if (res.success && res.logs) {
      setLogs(res.logs);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchLogs();
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredLogs = logs.filter((log) => {
    if (filterMethod !== 'all' && log.method !== filterMethod) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
            <Radio className="w-5 h-5 animate-pulse text-emerald-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              سجل حركة الخادم والـ API الحي (Live Server Telemetry & Audit Logs)
            </h3>
            <p className="text-xs text-slate-400">
              تسجيل تدفق كل طلب HTTP، فك تشفير JWT، دور المستخدم المنفذ، وزمن الاستجابة بالمللي ثانية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-slate-700 text-teal-500 focus:ring-0"
            />
            <span>تحديث تلقائي (2.5s)</span>
          </label>

          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="تحديث فوري"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400">تصفية حسب نوع العملية (HTTP Method):</span>
        <button
          onClick={() => setFilterMethod('all')}
          className={`px-3 py-1 rounded-lg font-mono font-bold transition ${
            filterMethod === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400'
          }`}
        >
          ALL ({logs.length})
        </button>
        <button
          onClick={() => setFilterMethod('POST')}
          className={`px-3 py-1 rounded-lg font-mono font-bold transition ${
            filterMethod === 'POST' ? 'bg-emerald-700 text-white' : 'bg-slate-900 text-emerald-400'
          }`}
        >
          POST
        </button>
        <button
          onClick={() => setFilterMethod('GET')}
          className={`px-3 py-1 rounded-lg font-mono font-bold transition ${
            filterMethod === 'GET' ? 'bg-blue-700 text-white' : 'bg-slate-900 text-blue-400'
          }`}
        >
          GET
        </button>
        <button
          onClick={() => setFilterMethod('PATCH')}
          className={`px-3 py-1 rounded-lg font-mono font-bold transition ${
            filterMethod === 'PATCH' ? 'bg-amber-700 text-white' : 'bg-slate-900 text-amber-400'
          }`}
        >
          PATCH
        </button>
      </div>

      {/* Logs Table / Stream */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 font-mono text-xs shadow-2xl">
        <table className="w-full text-right">
          <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800 text-[11px]">
            <tr>
              <th className="p-3">الوقت (Timestamp)</th>
              <th className="p-3">Method</th>
              <th className="p-3">Endpoint Path</th>
              <th className="p-3">Status</th>
              <th className="p-3">الزمن (Latency)</th>
              <th className="p-3">المستخدم والـ Role</th>
              <th className="p-3">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900 text-slate-300">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 font-sans">
                  لا توجد سجلات مسجلة بعد. قم بتنفيذ أي عملية في التطبيقات لتشاهد السجلات فوراً.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-900/60 transition">
                  <td className="p-3 text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString('ar-SA')}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.method === 'POST'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : log.method === 'GET'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {log.method}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-200">{log.path}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        log.statusCode >= 200 && log.statusCode < 300
                          ? 'text-emerald-400'
                          : log.statusCode >= 400 && log.statusCode < 500
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px]">{log.durationMs}ms</td>
                  <td className="p-3">
                    {log.userRole ? (
                      <span className="text-teal-300 font-medium">
                        {log.userRole} <span className="text-slate-500">({log.userId?.slice(-6)})</span>
                      </span>
                    ) : (
                      <span className="text-slate-600">Guest / Unauth</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">{log.ip}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
