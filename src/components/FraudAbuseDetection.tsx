import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Flag, 
  User, 
  FileText,
  ArrowRight,
  Zap,
  Filter
} from 'lucide-react';
import { cn } from '../utils';

const MOCK_ALERTS = [
  { 
    id: 'AL-1024', 
    patient: 'John Doe', 
    type: 'Doctor Shopping', 
    severity: 'High', 
    score: 92, 
    date: '2026-03-23', 
    desc: 'Patient filled 3 opioid prescriptions from different prescribers in the last 14 days.',
    status: 'Pending'
  },
  { 
    id: 'AL-1025', 
    patient: 'Jane Smith', 
    type: 'Unusual Volume', 
    severity: 'Medium', 
    score: 74, 
    date: '2026-03-22', 
    desc: 'Prescription volume for Gabapentin is 3x higher than historical average for this patient.',
    status: 'Investigating'
  },
  { 
    id: 'AL-1026', 
    patient: 'Robert Wilson', 
    type: 'Forged Rx Pattern', 
    severity: 'High', 
    score: 88, 
    date: '2026-03-21', 
    desc: 'Digital signature mismatch detected on high-value controlled substance prescription.',
    status: 'Flagged'
  },
];

export const FraudAbuseDetection: React.FC = () => {
  const [selectedAlert, setSelectedAlert] = useState<typeof MOCK_ALERTS[0] | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Alerts</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-800">12</h3>
            <span className="text-rose-600 text-xs font-bold bg-rose-50 px-2 py-1 rounded-lg">+3 today</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Risk Mitigation Rate</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-800">98.4%</h3>
            <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">Target: 95%</span>
          </div>
        </div>
        <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-100 text-white">
          <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">AI Confidence</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold">96.2%</h3>
            <Zap className="text-indigo-300 w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alert List */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Fraud Detection Queue</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                <Filter size={20} />
              </button>
              <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                <Search size={20} />
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {MOCK_ALERTS.map((alert) => (
              <button 
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={cn(
                  "w-full p-6 text-left hover:bg-slate-50 transition-all flex items-center gap-6 group",
                  selectedAlert?.id === alert.id && "bg-indigo-50/50 border-l-4 border-indigo-600"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                  alert.severity === 'High' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                )}>
                  <ShieldAlert size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800">{alert.patient}</h4>
                    <span className="text-[10px] font-bold text-slate-400">{alert.date}</span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-1">{alert.type}: {alert.desc}</p>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-xs font-bold mb-1",
                    alert.score > 80 ? "text-rose-600" : "text-amber-600"
                  )}>
                    Score: {alert.score}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{alert.status}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Alert Detail */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          {selectedAlert ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {selectedAlert.severity} Risk
                </span>
                <span className="text-slate-400 text-xs font-medium">ID: {selectedAlert.id}</span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-800">{selectedAlert.patient}</h3>
                <p className="text-indigo-600 font-bold text-sm mt-1">{selectedAlert.type}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Analysis</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedAlert.desc}
                </p>
                <div className="pt-3 border-t border-slate-200 flex items-center gap-2 text-xs font-bold text-rose-600">
                  <AlertTriangle size={14} />
                  Action Required: Verify with Prescriber
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold text-sm hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-100">
                  <Flag size={18} />
                  Report to Authorities
                </button>
                <button className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} />
                  Mark as False Positive
                </button>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Related Records</h4>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Patient Profile</span>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-600" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Prescription History</span>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-600" />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <ShieldAlert className="text-slate-200 w-8 h-8" />
              </div>
              <div>
                <h4 className="text-slate-800 font-bold">Select an Alert</h4>
                <p className="text-slate-400 text-xs mt-1">Choose a record from the queue to view AI analysis and take action.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
