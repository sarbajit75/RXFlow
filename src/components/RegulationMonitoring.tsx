import React, { useState } from 'react';
import { 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  History, 
  Search, 
  ArrowRight,
  Zap,
  FileText,
  Lock
} from 'lucide-react';
import { cn } from '../utils';

const MOCK_REGULATIONS = [
  { 
    id: 'REG-2024-01', 
    title: 'New Controlled Substance Labeling', 
    source: 'FDA', 
    status: 'Compliant', 
    date: '2026-03-20', 
    desc: 'Updated requirements for auxiliary labels on schedule II narcotics.',
    impact: 'Low'
  },
  { 
    id: 'REG-2024-02', 
    title: 'Telehealth Rx Verification', 
    source: 'State Board', 
    status: 'Action Required', 
    date: '2026-03-22', 
    desc: 'Mandatory video verification for first-time telehealth prescriptions.',
    impact: 'High'
  },
  { 
    id: 'REG-2024-03', 
    title: 'DSCSA Serialization Update', 
    source: 'Federal', 
    status: 'Monitoring', 
    date: '2026-03-21', 
    desc: 'Enhanced tracking for biological products at the unit level.',
    impact: 'Medium'
  },
];

export const RegulationMonitoring: React.FC = () => {
  const [selectedReg, setSelectedReg] = useState<typeof MOCK_REGULATIONS[0] | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Compliance Score</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-800">99.2%</h3>
            <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">Excellent</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">New Regulations</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-800">4</h3>
            <span className="text-amber-600 text-xs font-bold bg-amber-50 px-2 py-1 rounded-lg">Last 7 days</span>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl shadow-lg shadow-slate-200 text-white">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Next Audit</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold">12 Days</h3>
            <Calendar className="text-slate-500 w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Regulation List */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Regulatory Updates</h3>
            <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
              <Search size={20} />
            </button>
          </div>

          <div className="divide-y divide-slate-50">
            {MOCK_REGULATIONS.map((reg) => (
              <button 
                key={reg.id}
                onClick={() => setSelectedReg(reg)}
                className={cn(
                  "w-full p-6 text-left hover:bg-slate-50 transition-all flex items-center gap-6 group",
                  selectedReg?.id === reg.id && "bg-indigo-50/50 border-l-4 border-indigo-600"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                  reg.status === 'Compliant' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                )}>
                  <ShieldCheck size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800">{reg.title}</h4>
                    <span className="text-[10px] font-bold text-slate-400">{reg.date}</span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-1">{reg.source}: {reg.desc}</p>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-xs font-bold mb-1",
                    reg.impact === 'High' ? "text-rose-600" : "text-amber-600"
                  )}>
                    Impact: {reg.impact}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{reg.status}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Regulation Detail */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          {selectedReg ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  selectedReg.status === 'Compliant' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                )}>
                  {selectedReg.status}
                </span>
                <span className="text-slate-400 text-xs font-medium">ID: {selectedReg.id}</span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-800">{selectedReg.title}</h3>
                <p className="text-indigo-600 font-bold text-sm mt-1">Source: {selectedReg.source}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Regulation Summary</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedReg.desc}
                </p>
                <div className="pt-3 border-t border-slate-200 flex items-center gap-2 text-xs font-bold text-indigo-600">
                  <Zap size={14} />
                  AI Insight: Automated workflow adjustment available.
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100">
                  <CheckCircle2 size={18} />
                  Acknowledge & Apply
                </button>
                <button className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                  <FileText size={18} />
                  View Full Document
                </button>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compliance History</h4>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <History size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Past Audits</span>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-600" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Lock size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Security Protocols</span>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-600" />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <FileCheck className="text-slate-200 w-8 h-8" />
              </div>
              <div>
                <h4 className="text-slate-800 font-bold">Select a Regulation</h4>
                <p className="text-slate-400 text-xs mt-1">Choose a regulatory update to view details and compliance actions.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function Calendar({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  );
}
