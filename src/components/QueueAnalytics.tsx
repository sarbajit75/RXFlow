import React from 'react';
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  Activity,
  Calendar
} from 'lucide-react';
import { cn } from '../utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line
} from 'recharts';

const WAIT_TIME_DATA = [
  { name: 'Mon', wait: 12, target: 15 },
  { name: 'Tue', wait: 18, target: 15 },
  { name: 'Wed', wait: 14, target: 15 },
  { name: 'Thu', wait: 22, target: 15 },
  { name: 'Fri', wait: 28, target: 15 },
  { name: 'Sat', wait: 15, target: 15 },
  { name: 'Sun', wait: 10, target: 15 },
];

const VOLUME_BY_HOUR = [
  { hour: '08:00', volume: 15 },
  { hour: '10:00', volume: 42 },
  { hour: '12:00', volume: 65 },
  { hour: '14:00', volume: 58 },
  { hour: '16:00', volume: 92 },
  { hour: '18:00', volume: 45 },
  { hour: '20:00', volume: 22 },
];

const KPI_CARDS = [
  { label: 'Avg Wait Time', value: '18.4m', trend: '+2.1m', isPositive: false, icon: Clock, color: 'text-rose-500', bg: 'bg-rose-50' },
  { label: 'SLA Compliance', value: '94.2%', trend: '+1.5%', isPositive: true, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { label: 'Peak Volume', value: '92 Rx/hr', trend: '+8%', isPositive: false, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Throughput', value: '450 Rx/day', trend: '+12%', isPositive: true, icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50' },
];

export const QueueAnalytics: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPI_CARDS.map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl group-hover:scale-110 transition-transform", kpi.bg)}>
                <kpi.icon className={cn("w-6 h-6", kpi.color)} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                kpi.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {kpi.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {kpi.trend}
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">{kpi.label}</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wait Time Trend */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Average Wait Time Trend</h3>
              <p className="text-sm text-slate-500">Weekly performance vs target SLA (15m)</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl">Weekly</button>
              <button className="px-4 py-2 text-xs font-bold bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors">Monthly</button>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WAIT_TIME_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
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
                <Line 
                  type="monotone" 
                  dataKey="wait" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  dot={{r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff'}} 
                  activeDot={{r: 8}} 
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#E2E8F0" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hour Analysis */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Volume by Hour</h3>
          <p className="text-sm text-slate-500 mb-8">Identifying peak operational hours</p>

          <div className="h-[300px] w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VOLUME_BY_HOUR}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                  {VOLUME_BY_HOUR.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.volume > 80 ? '#F43F5E' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-4">
              <AlertTriangle className="text-rose-600 w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">Bottleneck Detected</h4>
                <p className="text-xs text-rose-700 leading-relaxed mt-1">
                  Wait times consistently exceed SLA between 16:00 and 17:00. AI suggests adding 1 additional pharmacist during this window.
                </p>
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-4">
              <Zap className="text-indigo-600 w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-indigo-900">Efficiency Insight</h4>
                <p className="text-xs text-indigo-700 leading-relaxed mt-1">
                  Automated Task Routing has reduced average morning wait times by 15% this week.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-900 rounded-[32px] p-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="text-white w-5 h-5" />
            </div>
            <h4 className="font-bold">Error Rate Analysis</h4>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Clinical Errors</span>
                <span className="text-xs font-bold text-emerald-400">0.02%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-emerald-400 h-1.5 rounded-full" style={{width: '2%'}} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Labeling Errors</span>
                <span className="text-xs font-bold text-amber-400">0.15%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-amber-400 h-1.5 rounded-full" style={{width: '15%'}} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Admin Errors</span>
                <span className="text-xs font-bold text-rose-400">0.42%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-rose-400 h-1.5 rounded-full" style={{width: '42%'}} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-bold text-slate-800">Operational Health Index</h4>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <CheckCircle2 size={16} />
              Healthy
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Staffing', value: '98%', color: 'text-emerald-500' },
              { label: 'Inventory', value: '85%', color: 'text-amber-500' },
              { label: 'Automation', value: '92%', color: 'text-indigo-500' },
              { label: 'Satisfaction', value: '4.8/5', color: 'text-emerald-500' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className={cn("text-2xl font-bold mb-1", stat.color)}>{stat.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500 italic">"Store performance is in the top 5% of the region based on AI benchmarking."</p>
            <button className="text-xs font-bold text-indigo-600 hover:underline">Download Report</button>
          </div>
        </div>
      </div>
    </div>
  );
};
