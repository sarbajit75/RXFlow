import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  Zap, 
  AlertCircle, 
  CheckCircle2,
  TrendingUp,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import { cn } from '../utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const DEMAND_DATA = [
  { time: '08:00', demand: 12, capacity: 15 },
  { time: '10:00', demand: 45, capacity: 30 },
  { time: '12:00', demand: 68, capacity: 45 },
  { time: '14:00', demand: 52, capacity: 45 },
  { time: '16:00', demand: 85, capacity: 60 },
  { time: '18:00', demand: 40, capacity: 45 },
  { time: '20:00', demand: 15, capacity: 15 },
];

const INITIAL_STAFF = [
  { id: '1', name: 'Dr. Aris Thorne', role: 'Senior Pharmacist', shift: '08:00 - 16:00', status: 'On Shift', efficiency: 98 },
  { id: '2', name: 'Elena Vance', role: 'Pharmacy Tech', shift: '09:00 - 17:00', status: 'On Shift', efficiency: 94 },
  { id: '3', name: 'Marcus Wright', role: 'Pharmacist', shift: '12:00 - 20:00', status: 'Upcoming', efficiency: 92 },
  { id: '4', name: 'Sarah Jenkins', role: 'Pharmacy Tech', shift: '14:00 - 22:00', status: 'Upcoming', efficiency: 96 },
];

export const StaffScheduling: React.FC = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationComplete, setOptimizationComplete] = useState(false);

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setOptimizationComplete(true);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <TrendingUp className="text-indigo-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Predicted Peak</p>
              <h4 className="text-xl font-bold text-slate-800">16:00 - 17:30</h4>
            </div>
          </div>
          <div className="flex items-center gap-2 text-rose-600 text-xs font-bold">
            <AlertCircle size={14} />
            Capacity gap detected: -25%
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <Users className="text-emerald-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Staff</p>
              <h4 className="text-xl font-bold text-slate-800">8 Members</h4>
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
            <CheckCircle2 size={14} />
            Optimal coverage for current load
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-slate-800">AI Shift Optimizer</h4>
            <p className="text-xs text-slate-500">Auto-balance based on demand</p>
          </div>
          <button 
            onClick={handleOptimize}
            disabled={isOptimizing}
            className={cn(
              "px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2",
              optimizationComplete 
                ? "bg-emerald-100 text-emerald-700" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100"
            )}
          >
            {isOptimizing ? (
              <>
                <Zap className="w-4 h-4 animate-pulse" />
                Optimizing...
              </>
            ) : optimizationComplete ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Optimized
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Optimize
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Demand Forecast Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Demand vs. Capacity Forecast</h3>
              <p className="text-sm text-slate-500">Predicted prescription volume for the next 24 hours</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-xs font-bold text-slate-500">Demand</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="text-xs font-bold text-slate-500">Capacity</span>
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DEMAND_DATA}>
                <defs>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 12}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 12}} 
                />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="demand" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorDemand)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="capacity" 
                  stroke="#E2E8F0" 
                  strokeWidth={2} 
                  fill="transparent" 
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Staff List */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Shift Roster</h3>
            <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-indigo-600">
              <UserPlus size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {INITIAL_STAFF.map((staff) => (
              <div key={staff.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 font-bold text-indigo-600">
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{staff.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{staff.role}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                    staff.status === 'On Shift' ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
                  )}>
                    {staff.status}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/50">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock size={14} />
                    {staff.shift}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{width: `${staff.efficiency}%`}} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{staff.efficiency}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
            View Full Calendar
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-indigo-900 rounded-[32px] p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-widest">
              <Zap className="w-4 h-4" /> AI Recommendation
            </div>
            <h3 className="text-2xl font-bold">Optimize Afternoon Overlap</h3>
            <p className="text-indigo-100/80 leading-relaxed">
              Based on historical data, we predict a 40% surge in prescription volume between 15:00 and 17:00. 
              Extending Elena Vance's shift by 1 hour and bringing Marcus Wright in 30 minutes early would eliminate the predicted backlog.
            </p>
          </div>
          <button className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all shrink-0">
            Apply AI Adjustment
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />
      </div>
    </div>
  );
};
