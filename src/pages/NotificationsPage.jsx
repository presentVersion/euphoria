import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  ChevronRight,
  Filter,
  Flame,
  Check
} from 'lucide-react';
import { SAMPLE_NOTIFICATIONS, SAMPLE_AUDIT_LOGS } from '../data/mockPatients';

export default function NotificationsPage({
  onSelectPatient,
  onNavigate
}) {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [activeTab, setActiveTab] = useState('notifications'); // 'notifications' | 'activity'

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const filteredNotifs = notifications.filter(n => filter === 'all' || (filter === 'unread' && n.unread));
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="p-5 md:p-7 space-y-6 flex-1 max-w-5xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Notifications & Activity Center
            </h1>
            {unreadCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time emergency escalations, reassessment alerts, and legal audit activity logs.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 text-teal-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Tabs: Notifications vs Audit Activity */}
      <div className="border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-2.5 relative transition-colors ${
              activeTab === 'notifications'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'hover:text-slate-800'
            }`}
          >
            Alert Notifications ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-2.5 relative transition-colors ${
              activeTab === 'activity'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'hover:text-slate-800'
            }`}
          >
            Clinical Audit Activity ({SAMPLE_AUDIT_LOGS.length})
          </button>
        </div>

        {activeTab === 'notifications' && (
          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                filter === 'unread' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Unread Only
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: NOTIFICATIONS LIST */}
      {activeTab === 'notifications' && (
        <div className="space-y-3">
          {filteredNotifs.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              No notifications to display.
            </div>
          ) : (
            filteredNotifs.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  markAsRead(item.id);
                  if (item.patientId) {
                    onSelectPatient(item.patientId);
                    onNavigate('patient-details');
                  }
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  item.unread
                    ? 'bg-white border-teal-300 shadow-sm ring-1 ring-teal-500/10'
                    : 'bg-white/70 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.priority === 'Critical'
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : item.priority === 'High'
                      ? 'bg-orange-50 text-orange-600 border border-orange-200'
                      : 'bg-teal-50 text-teal-600 border border-teal-200'
                  }`}>
                    {item.priority === 'Critical' ? <Flame className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      {item.unread && (
                        <span className="w-2 h-2 rounded-full bg-teal-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-mono">
                      <span>{item.time}</span>
                      {item.patientId && <span>PATIENT: {item.patientId}</span>}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: AUDIT ACTIVITY LOG */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800">Hospital Legal Electronic Audit Record</span>
            <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-bold">
              TAMPER-PROOF SYSTEM
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {SAMPLE_AUDIT_LOGS.map(log => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-teal-800">{log.action}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-sans font-semibold text-slate-900">{log.entity}</span>
                  </div>
                  <p className="font-sans text-[11px] text-slate-600 mt-0.5">{log.details}</p>
                </div>

                <div className="text-right">
                  <div className="font-sans text-[11px] font-bold text-slate-700">{log.user}</div>
                  <div className="text-[10px] text-slate-400">{log.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
