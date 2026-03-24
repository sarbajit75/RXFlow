import React, { useState } from 'react';
import { 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Heart, 
  User, 
  ArrowRight,
  Zap,
  ShieldCheck,
  Stethoscope,
  Plus
} from 'lucide-react';
import { cn } from '../utils';

const MOCK_RISK_PATIENTS = [
  { 
    id: 'P-101', 
    name: 'Alice Johnson', 
    age: 62, 
    risk: 'High', 
    condition: 'Type 2 Diabetes', 
    probability: 88, 
    factors: ['Family history', 'BMI 31', 'Sedentary lifestyle'],
    recommendation: 'HbA1c Screening & Nutritional Consultation',
    suggestedServices: [
      { name: 'Diabetes Risk Assessment', icon: Activity, desc: 'Comprehensive screening and risk profiling.' },
      { name: 'Weight Management Service', icon: TrendingUp, desc: 'Personalized plan to reach healthy BMI.' },
      { name: 'Flu Vaccination Service', icon: ShieldCheck, desc: 'Annual protection for high-risk patients.' }
    ]
  },
  { 
    id: 'P-102', 
    name: 'David Miller', 
    age: 45, 
    risk: 'Medium', 
    condition: 'Hypertension', 
    probability: 65, 
    factors: ['High sodium intake', 'Stress', 'Borderline BP'],
    recommendation: '24h BP Monitoring & DASH Diet Plan',
    suggestedServices: [
      { name: 'Blood Pressure Check Service', icon: Activity, desc: 'Regular monitoring and pharmacist review.' },
      { name: 'Smoking Cessation Service', icon: Zap, desc: 'Support and NRT to quit smoking.' },
      { name: 'Cholesterol Check Service', icon: Activity, desc: 'Lipid profile analysis and advice.' }
    ]
  },
  { 
    id: 'P-103', 
    name: 'Emma Davis', 
    age: 58, 
    risk: 'Low', 
    condition: 'Cardiovascular', 
    probability: 22, 
    factors: ['Age', 'Mild cholesterol elevation'],
    recommendation: 'Annual Lipid Panel & Omega-3 Supplementation',
    suggestedServices: [
      { name: 'Cholesterol Check Service', icon: Activity, desc: 'Preventive lipid screening.' },
      { name: 'Blood Pressure Check Service', icon: Activity, desc: 'Baseline BP monitoring.' },
      { name: 'Flu Vaccination Service', icon: ShieldCheck, desc: 'Routine seasonal protection.' }
    ]
  },
];

export const HealthRiskPrediction: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<typeof MOCK_RISK_PATIENTS[0] | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Risk Identifications</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-800">142</h3>
            <span className="text-indigo-600 text-xs font-bold bg-indigo-50 px-2 py-1 rounded-lg">Last 30 days</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Preventive Conversion</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-800">64%</h3>
            <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">+12% vs LY</span>
          </div>
        </div>
        <div className="bg-rose-600 p-6 rounded-3xl shadow-lg shadow-rose-100 text-white">
          <p className="text-xs font-bold text-rose-200 uppercase tracking-wider mb-1">High Risk Alerts</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold">8</h3>
            <AlertCircle className="text-rose-300 w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient Risk Queue */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Health Risk Analysis</h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2">
                <Plus size={14} /> New Analysis
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {MOCK_RISK_PATIENTS.map((patient) => (
              <button 
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className={cn(
                  "w-full p-6 text-left hover:bg-slate-50 transition-all flex items-center gap-6 group",
                  selectedPatient?.id === patient.id && "bg-indigo-50/50 border-l-4 border-indigo-600"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                  patient.risk === 'High' ? "bg-rose-50 text-rose-600" : 
                  patient.risk === 'Medium' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                )}>
                  <Heart size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800">{patient.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400">Age: {patient.age}</span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-1">Condition: {patient.condition} ({patient.probability}% probability)</p>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-xs font-bold mb-1",
                    patient.risk === 'High' ? "text-rose-600" : 
                    patient.risk === 'Medium' ? "text-amber-600" : "text-emerald-600"
                  )}>
                    {patient.risk} Risk
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {patient.id}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Patient Detail & Recommendation */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          {selectedPatient ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  selectedPatient.risk === 'High' ? "bg-rose-100 text-rose-700" : 
                  selectedPatient.risk === 'Medium' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                )}>
                  {selectedPatient.risk} Risk Level
                </span>
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                  <User size={20} className="text-slate-400" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-800">{selectedPatient.name}</h3>
                <p className="text-indigo-600 font-bold text-sm mt-1">Predicted: {selectedPatient.condition}</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Risk Factors</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.factors.map((factor, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-900 text-white space-y-3 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-2">
                    <Zap size={12} /> AI Recommendation
                  </div>
                  <h4 className="text-sm font-bold mb-2">{selectedPatient.recommendation}</h4>
                  <p className="text-xs text-indigo-100/80 leading-relaxed">
                    Early intervention could reduce long-term complication risk by up to 45%.
                  </p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suggested Pharmacy Services</h4>
                <div className="space-y-3">
                  {selectedPatient.suggestedServices.map((service, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                      <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white transition-colors">
                        <service.icon size={16} className="text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-bold text-slate-800">{service.name}</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">{service.desc}</p>
                      </div>
                      <button className="p-2 text-slate-300 hover:text-indigo-600">
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100">
                  <Stethoscope size={18} />
                  Schedule Consultation
                </button>
                <button className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                  <ShieldCheck size={18} />
                  Enroll in Care Program
                </button>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold text-slate-500">Vital Trends: Stable</span>
                </div>
                <button className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                  Full History <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <TrendingUp className="text-slate-200 w-8 h-8" />
              </div>
              <div>
                <h4 className="text-slate-800 font-bold">Select a Patient</h4>
                <p className="text-slate-400 text-xs mt-1">Choose a patient to view health risk predictions and preventive care plans.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
