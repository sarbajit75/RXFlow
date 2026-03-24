import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ClipboardList, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Zap,
  UserCheck,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { cn } from '../utils';

interface Pharmacist {
  id: string;
  name: string;
  role: string;
  status: 'Available' | 'Busy' | 'Break';
  currentLoad: number;
  maxLoad: number;
  specialty: string[];
}

interface Task {
  id: string;
  rxNumber: string;
  type: 'Validation' | 'CDS' | 'Consultation' | 'Labeling';
  priority: 'High' | 'Medium' | 'Low';
  assignedTo?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  createdAt: Date;
}

const INITIAL_PHARMACISTS: Pharmacist[] = [
  { 
    id: 'p1', 
    name: 'Dr. Sarah Miller', 
    role: 'Clinical Pharmacist', 
    status: 'Available', 
    currentLoad: 0, 
    maxLoad: 5,
    specialty: ['Clinical Validation', 'CDS']
  },
  { 
    id: 'p2', 
    name: 'Dr. James Wilson', 
    role: 'Staff Pharmacist', 
    status: 'Available', 
    currentLoad: 0, 
    maxLoad: 8,
    specialty: ['Labeling', 'Dispensing']
  },
  { 
    id: 'p3', 
    name: 'Dr. Emily Chen', 
    role: 'Pharmacy Manager', 
    status: 'Busy', 
    currentLoad: 3, 
    maxLoad: 4,
    specialty: ['Consultation', 'Management']
  },
  { 
    id: 'p4', 
    name: 'Dr. Robert Taylor', 
    role: 'Staff Pharmacist', 
    status: 'Available', 
    currentLoad: 0, 
    maxLoad: 8,
    specialty: ['Labeling', 'Dispensing']
  }
];

const INITIAL_TASKS: Task[] = [
  { id: 't1', rxNumber: 'RX-78291', type: 'Validation', priority: 'High', status: 'Pending', createdAt: new Date(Date.now() - 1000 * 60 * 5) },
  { id: 't2', rxNumber: 'RX-99201', type: 'CDS', priority: 'Medium', status: 'Pending', createdAt: new Date(Date.now() - 1000 * 60 * 12) },
  { id: 't3', rxNumber: 'RX-11203', type: 'Consultation', priority: 'High', status: 'Pending', createdAt: new Date(Date.now() - 1000 * 60 * 2) },
  { id: 't4', rxNumber: 'RX-44592', type: 'Labeling', priority: 'Low', status: 'Pending', createdAt: new Date(Date.now() - 1000 * 60 * 25) },
  { id: 't5', rxNumber: 'RX-88210', type: 'Validation', priority: 'Medium', status: 'Pending', createdAt: new Date(Date.now() - 1000 * 60 * 8) },
];

export const AutomatedTaskRouting: React.FC = () => {
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>(INITIAL_PHARMACISTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isRouting, setIsRouting] = useState(false);
  const [routingLog, setRoutingLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setRoutingLog(prev => [msg, ...prev].slice(0, 10));
  };

  const autoRoute = () => {
    setIsRouting(true);
    addLog("Initiating specialty-first automated task routing...");

    setTimeout(() => {
      setTasks(prevTasks => {
        const newTasks = [...prevTasks];
        const newPharmacists = [...pharmacists];

        newTasks.forEach(task => {
          if (task.status === 'Pending') {
            // Find best pharmacist: Available and has capacity
            const availablePharmacists = newPharmacists.filter(p => p.status === 'Available' && p.currentLoad < p.maxLoad);
            
            if (availablePharmacists.length > 0) {
              // 1. Filter for specialists (case-insensitive partial match)
              const specialists = availablePharmacists.filter(p => 
                p.specialty.some(s => s.toLowerCase().includes(task.type.toLowerCase()))
              );

              let selected;
              let isSpecialistMatch = false;

              if (specialists.length > 0) {
                // Sort specialists by load percentage (tie-breaker)
                specialists.sort((a, b) => (a.currentLoad / a.maxLoad) - (b.currentLoad / b.maxLoad));
                selected = specialists[0];
                isSpecialistMatch = true;
              } else {
                // 2. Fallback to general load balancing among all available staff
                availablePharmacists.sort((a, b) => (a.currentLoad / a.maxLoad) - (b.currentLoad / b.maxLoad));
                selected = availablePharmacists[0];
              }

              task.assignedTo = selected.id;
              task.status = 'In Progress';
              selected.currentLoad += 1;
              if (selected.currentLoad >= selected.maxLoad) selected.status = 'Busy';
              
              addLog(`${isSpecialistMatch ? '★ Specialist' : 'General'}: Assigned ${task.rxNumber} (${task.type}) to ${selected.name}`);
            }
          }
        });

        setPharmacists(newPharmacists);
        return newTasks;
      });
      setIsRouting(false);
      addLog("Routing cycle complete.");
    }, 1500);
  };

  const resetTasks = () => {
    setTasks(INITIAL_TASKS.map(t => ({ ...t, status: 'Pending', assignedTo: undefined })));
    setPharmacists(INITIAL_PHARMACISTS);
    setRoutingLog(["System reset."]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-rose-600 bg-rose-50';
      case 'Medium': return 'text-amber-600 bg-amber-50';
      case 'Low': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Automated Task Routing</h2>
          <p className="text-slate-500">AI-driven workload distribution prioritizing clinical specialty and staff capacity.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={resetTasks}
            className="p-3 text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors"
            title="Reset Simulation"
          >
            <RefreshCw size={20} className={cn(isRouting && "animate-spin")} />
          </button>
          <button 
            onClick={autoRoute}
            disabled={isRouting || tasks.every(t => t.status !== 'Pending')}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <Zap size={18} className={cn(isRouting && "animate-pulse")} />
            {isRouting ? "Routing..." : "Run Auto-Routing"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats Overview */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-indigo-50 rounded-2xl">
                <ClipboardList className="text-indigo-600 w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Queue Depth</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900">{tasks.filter(t => t.status === 'Pending').length} <span className="text-sm font-medium text-slate-400">Pending</span></h3>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-emerald-50 rounded-2xl">
                <Users className="text-emerald-600 w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Available Staff</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900">{pharmacists.filter(p => p.status === 'Available').length} <span className="text-sm font-medium text-slate-400">Active</span></h3>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-amber-50 rounded-2xl">
                <BarChart3 className="text-amber-600 w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Avg Load</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900">
              {Math.round((pharmacists.reduce((acc, p) => acc + p.currentLoad, 0) / pharmacists.reduce((acc, p) => acc + p.maxLoad, 0)) * 100)}%
            </h3>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <Clock className="text-blue-600 w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Wait Time</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900">12 <span className="text-sm font-medium text-slate-400">Mins</span></h3>
          </div>
        </div>

        {/* Pharmacist Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="text-indigo-600" size={20} />
              Store Pharmacists
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase">{pharmacists.length} Total</span>
          </div>
          
          <div className="space-y-4">
            {pharmacists.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      {p.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{p.name}</h4>
                      <p className="text-xs text-slate-500">{p.role}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider",
                    p.status === 'Available' ? "bg-emerald-50 text-emerald-600" : 
                    p.status === 'Busy' ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"
                  )}>
                    {p.status}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Workload</span>
                    <span className="text-slate-900">{p.currentLoad}/{p.maxLoad} Tasks</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-500",
                        (p.currentLoad / p.maxLoad) > 0.8 ? "bg-rose-500" : "bg-indigo-500"
                      )}
                      style={{ width: `${(p.currentLoad / p.maxLoad) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1">
                  {p.specialty.map(s => (
                    <span key={s} className="text-[9px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="text-indigo-600" size={20} />
              Prescription Queue
            </h3>
            <div className="flex gap-2">
              <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded-lg uppercase">
                {tasks.filter(t => t.priority === 'High').length} Urgent
              </span>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Prescription</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tasks.map(task => (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <Zap size={14} className="text-indigo-600" />
                          </div>
                          <span className="font-bold text-slate-900">{task.rxNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-medium">{task.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("text-[10px] font-bold px-2 py-1 rounded-lg uppercase", getPriorityColor(task.priority))}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {task.status === 'Pending' ? (
                            <Clock size={14} className="text-slate-400" />
                          ) : task.status === 'In Progress' ? (
                            <RefreshCw size={14} className="text-indigo-500 animate-spin" />
                          ) : (
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          )}
                          <span className={cn(
                            "text-sm font-bold",
                            task.status === 'Pending' ? "text-slate-400" :
                            task.status === 'In Progress' ? "text-indigo-600" : "text-emerald-600"
                          )}>
                            {task.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {task.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                              {pharmacists.find(p => p.id === task.assignedTo)?.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                              {pharmacists.find(p => p.id === task.assignedTo)?.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Routing Log */}
          <div className="bg-slate-900 rounded-[2rem] p-6 text-slate-300 font-mono text-xs space-y-2 shadow-xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
              <span className="text-indigo-400 font-bold uppercase tracking-widest">Routing Engine Log</span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            {routingLog.length === 0 ? (
              <p className="text-slate-600 italic">Waiting for routing cycle...</p>
            ) : (
              routingLog.map((log, i) => (
                <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2">
                  <span className="text-slate-600">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                  <span className={cn(log.includes('Assigned') ? "text-emerald-400" : "text-slate-300")}>
                    {log.startsWith('Assigned') ? '> ' : ''}{log}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
