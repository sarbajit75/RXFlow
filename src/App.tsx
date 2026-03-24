/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Package, 
  Search, 
  Plus, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp,
  User,
  FileText,
  LayoutDashboard,
  ClipboardList,
  Settings,
  Bell,
  ChevronRight,
  BrainCircuit,
  Zap,
  History,
  AlertTriangle,
  Loader2,
  Database,
  ShieldAlert,
  RotateCcw,
  Camera,
  Mic,
  MessageSquare,
  FileCheck,
  Users,
  BarChart3,
  Heart,
  Smile,
  Meh,
  Frown,
  Activity as ActivityIcon,
  Volume2,
  MicOff
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PrescriptionData, processPrescription, validatePrescription, getClinicalRecommendation, validateLabel, getConsultationInsight, generateLabelImage } from './services/aiService';
import Markdown from 'react-markdown';
import { AutomatedTaskRouting } from './components/AutomatedTaskRouting';
import { StaffScheduling } from './components/StaffScheduling';
import { QueueAnalytics } from './components/QueueAnalytics';
import { FraudAbuseDetection } from './components/FraudAbuseDetection';
import { RegulationMonitoring } from './components/RegulationMonitoring';
import { HealthRiskPrediction } from './components/HealthRiskPrediction';
import { SmartOTCRecommendation } from './components/SmartOTCRecommendation';
import StockManagement from './components/StockManagement';
import { cn } from './utils';

// Mock initial data
const INITIAL_PRESCRIPTIONS: PrescriptionData[] = [
  {
    id: 'RX99201',
    patientName: 'Sarah Jenkins',
    medication: 'Amoxicillin 500mg',
    dosage: '500mg',
    frequency: 'Three times daily',
    isAcute: true,
    priority: 'High',
    status: 'Pending',
    validationErrors: [],
    clinicalNotes: ['Acute infection - prioritize for same-day collection'],
    labelInstructions: 'Take one capsule three times a day for 7 days. Finish the course.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: 'RX99203',
    patientName: 'John Doe',
    medication: 'Atorvastatin 20mg Tablets',
    dosage: '20mg',
    frequency: 'One daily at night',
    isAcute: false,
    priority: 'Low',
    status: 'Pending',
    validationErrors: [],
    clinicalNotes: ['Routine cholesterol management'],
    labelInstructions: 'Take one tablet daily at night.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: 'RX99202',
    patientName: 'Robert Chen',
    medication: 'Lisinopril 10mg',
    dosage: '10mg',
    frequency: 'Once daily',
    isAcute: false,
    priority: 'Medium',
    status: 'Pending',
    validationErrors: [],
    clinicalNotes: ['Chronic hypertension management'],
    labelInstructions: 'Take one tablet daily in the morning.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 120),
  }
];

const KPI_DATA = [
  { name: 'Mon', errors: 2, turnaround: 45 },
  { name: 'Tue', errors: 1, turnaround: 38 },
  { name: 'Wed', errors: 0, turnaround: 32 },
  { name: 'Thu', errors: 3, turnaround: 50 },
  { name: 'Fri', errors: 1, turnaround: 42 },
  { name: 'Sat', errors: 0, turnaround: 28 },
  { name: 'Sun', errors: 0, turnaround: 25 },
];

// Mock Columbus System Data
const COLUMBUS_DB: Record<string, any> = {
  'RX99201': {
    type: 'EPS',
    patientId: 'P1001',
    originalMessage: `
<?xml version="1.0" encoding="UTF-8"?>
<PrescriptionMessage xmlns="http://www.nhs.uk/schemas/eps">
  <Header>
    <MessageID>EPS-550e8400-e29b-41d4-a716-446655440000</MessageID>
    <Timestamp>2026-03-15T10:30:00Z</Timestamp>
  </Header>
  <PrescriptionDetails>
    <Prescriber>
      <Name>Dr. James Wilson</Name>
      <GMCNumber>7012345</GMCNumber>
      <PracticeCode>P84001</PracticeCode>
    </Prescriber>
    <Patient>
      <Name>Sarah Jenkins</Name>
      <DOB>1985-05-12</DOB>
      <NHSNumber>485 772 3456</NHSNumber>
      <Address>12 High Street, London, NW1 4NP</Address>
    </Patient>
    <MedicationItem>
      <DrugName>Amoxicillin 500mg Capsules</DrugName>
      <DoseInstructions>Take one capsule three times daily (TID)</DoseInstructions>
      <Quantity unit="capsule">21</Quantity>
      <IssueDate>2026-03-15</IssueDate>
      <ExpiryDate>2026-09-15</ExpiryDate>
      <RefillCount>0</RefillCount>
      <RepeatPrescription>false</RepeatPrescription>
    </MedicationItem>
  </PrescriptionDetails>
</PrescriptionMessage>
    `.trim(),
    extracted: {
      patientName: 'Sarah Jenkins',
      medication: 'Amoxicillin 500mg',
      dosage: '500mg',
      frequency: 'Three times daily',
      quantity: '21',
      prescriber: 'Dr. James Wilson',
      issueDate: '2026-03-15',
      expiryDate: '2026-09-15',
      refillCount: '0'
    }
  },
  'RX99203': {
    type: 'EPS',
    patientId: 'P1003',
    originalMessage: `
<?xml version="1.0" encoding="UTF-8"?>
<PrescriptionMessage xmlns="http://www.nhs.uk/schemas/eps">
  <Header>
    <MessageID>EPS-550e8400-e29b-41d4-a716-446655440001</MessageID>
    <Timestamp>2026-03-16T09:00:00Z</Timestamp>
  </Header>
  <PrescriptionDetails>
    <Patient>
      <Name>John Doe</Name>
      <NHSNumber>123 456 7890</NHSNumber>
    </Patient>
    <MedicationItem>
      <DrugName>Atorvastatin 20mg Tablets</DrugName>
      <DoseInstructions>Take one daily at night</DoseInstructions>
      <Quantity>28</Quantity>
    </MedicationItem>
  </PrescriptionDetails>
</PrescriptionMessage>
    `.trim(),
    extracted: {
      patientName: 'John Doe',
      medication: 'Atorvastatin 20mg Tablets',
      dosage: '10mg', // INTENTIONAL ERROR FOR VALIDATION DEMO
      frequency: 'One daily at night',
      quantity: '28',
      prescriber: 'Dr. Sarah Miller',
      issueDate: '2026-03-16',
      expiryDate: '2026-12-16'
    }
  },
  'RX99202': {
    type: 'Walk-in',
    patientId: 'P1002',
    imageUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0fff4"/>
        <rect width="100%" height="80" fill="#005eb8"/>
        <text x="40" y="50" font-family="Arial" font-size="32" font-weight="bold" fill="white">NHS Prescription (FP10)</text>
        
        <rect x="40" y="120" width="720" height="150" fill="white" stroke="#005eb8" stroke-width="2"/>
        <text x="60" y="160" font-family="Arial" font-size="18" font-weight="bold" fill="#005eb8">PATIENT DETAILS</text>
        <text x="60" y="200" font-family="Arial" font-size="24" fill="#333">Name: Robert Chen</text>
        <text x="60" y="240" font-family="Arial" font-size="20" fill="#333">Address: 45 Oak Lane, Manchester, M14 5TQ</text>
        
        <text x="40" y="320" font-family="Arial" font-size="40" font-weight="bold" fill="#005eb8">Rx</text>
        <line x1="40" y1="340" x2="760" y2="340" stroke="#005eb8" stroke-width="2"/>
        
        <text x="60" y="400" font-family="Arial" font-size="28" font-weight="bold" fill="#333">Lisinopril 10mg Tablets</text>
        <text x="60" y="440" font-family="Arial" font-size="22" fill="#555">Take ONE tablet daily</text>
        <text x="60" y="480" font-family="Arial" font-size="22" fill="#555">Quantity: 28 (Twenty Eight)</text>
        
        <rect x="40" y="750" width="720" height="200" fill="white" stroke="#005eb8" stroke-width="2"/>
        <text x="60" y="790" font-family="Arial" font-size="18" font-weight="bold" fill="#005eb8">PRESCRIBER DETAILS</text>
        <text x="60" y="830" font-family="Arial" font-size="22" fill="#333">Dr. Emily Brown (GMC: 6123456)</text>
        <text x="60" y="870" font-family="Arial" font-size="20" fill="#333">Central Medical Centre, M1 1AA</text>
        <text x="60" y="910" font-family="Arial" font-size="20" fill="#333">Date: 17/03/2026</text>
        
        <text x="600" y="940" font-family="Arial" font-size="14" font-style="italic" fill="#999">Refills: 3</text>
      </svg>
    `)}`,
    extracted: {
      patientName: 'Robert Chen',
      medication: 'Lisinopril 10mg',
      dosage: '1 tab daily',
      quantity: '28',
      prescriber: 'Dr. Emily Brown',
      issueDate: '2026-03-17',
      expiryDate: '2026-09-17',
      refillCount: '3'
    }
  },
  'RX99204': {
    type: 'Walk-in',
    patientId: 'P1004',
    imageUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#fff5f5"/>
        <rect width="100%" height="80" fill="#c53030"/>
        <text x="40" y="50" font-family="Arial" font-size="32" font-weight="bold" fill="white">NHS Prescription (FP10) - URGENT</text>
        
        <rect x="40" y="120" width="720" height="150" fill="white" stroke="#c53030" stroke-width="2"/>
        <text x="60" y="160" font-family="Arial" font-size="24" fill="#333">Name: Jane Smith</text>
        <text x="60" y="200" font-family="Arial" font-size="20" fill="#333">Address: 10 Downing Street, London</text>
        
        <text x="40" y="320" font-family="Arial" font-size="40" font-weight="bold" fill="#c53030">Rx</text>
        <line x1="40" y1="340" x2="760" y2="340" stroke="#c53030" stroke-width="2"/>
        
        <text x="60" y="400" font-family="Arial" font-size="28" font-weight="bold" fill="#333">Metformin 500mg Tablets</text>
        <text x="60" y="440" font-family="Arial" font-size="22" fill="#555">Take TWO tablets twice daily</text>
        <text x="60" y="480" font-family="Arial" font-size="22" fill="#555">Quantity: 56</text>
        
        <rect x="40" y="750" width="720" height="200" fill="white" stroke="#c53030" stroke-width="2"/>
        <text x="60" y="790" font-family="Arial" font-size="18" font-weight="bold" fill="#c53030">PRESCRIBER DETAILS</text>
        <text x="60" y="830" font-family="Arial" font-size="22" fill="#333">Dr. Sarah Connor (GMC: 9999999)</text>
        <text x="60" y="910" font-family="Arial" font-size="20" fill="#333">Date: 18/03/2026</text>
      </svg>
    `)}`,
    extracted: {
      patientName: 'Jane Smith',
      medication: 'Metformin 1000mg', // DISCREPANCY: Image says 500mg
      dosage: 'Take TWO tablets twice daily',
      quantity: '56',
      prescriber: 'Dr. Sarah Connor',
      issueDate: '2026-03-18',
      expiryDate: '2026-09-18',
      refillCount: '0'
    }
  }
};

const PATIENT_DB: Record<string, any> = {
  'P1001': {
    name: 'Sarah Jenkins',
    dob: '1985-05-12',
    address: '12 High Street, London, NW1 4NP',
    nhsNumber: '485 772 3456',
    gp: 'Dr. James Wilson (Practice: P84001)',
    height: '165cm',
    weight: '62kg',
    allergies: ['Penicillin', 'Peanuts'],
    conditions: ['Asthma', 'Mild Hypertension'],
    insurance: 'NHS Exempt (Maternity)',
    currentMedications: [
      { date: '2026-03-10', medication: 'Amoxicillin 500mg', status: 'Active' }
    ],
    pastMedications: [
      { date: '2026-01-10', medication: 'Salbutamol 100mcg Inhaler', status: 'Completed' },
      { date: '2025-11-20', medication: 'Paracetamol 500mg', status: 'Completed' }
    ],
    interactions: [
      { type: 'Allergy Warning', severity: 'High', detail: 'Patient is allergic to Penicillin (Reaction recorded Jan 2026). Amoxicillin is a Penicillin-class antibiotic.' }
    ]
  },
  'P1002': {
    name: 'Robert Chen',
    dob: '1972-08-24',
    address: '45 Oak Lane, Manchester, M14 5TQ',
    nhsNumber: '992 114 8876',
    gp: 'Dr. Emily Brown (Practice: M1 1AA)',
    height: '180cm',
    weight: '85kg',
    allergies: ['None'],
    conditions: ['Type 2 Diabetes', 'Hypertension'],
    insurance: 'Private (BUPA)',
    currentMedications: [
      { date: '2026-02-15', medication: 'Metformin 500mg', status: 'Active' },
      { date: '2026-01-05', medication: 'Amlodipine 5mg', status: 'Active' }
    ],
    pastMedications: [
      { date: '2025-12-10', medication: 'Ibuprofen 400mg', status: 'Completed' }
    ],
    interactions: [
      { type: 'Drug-Condition', severity: 'Medium', detail: 'Lisinopril is appropriate for Hypertension but monitor renal function due to Diabetes.' }
    ]
  },
  'P1003': {
    name: 'John Doe',
    dob: '1960-01-01',
    address: '10 Downing Street, London, SW1A 2AA',
    nhsNumber: '123 456 7890',
    gp: 'Dr. Alice Smith (Practice: L1 1AA)',
    height: '175cm',
    weight: '78kg',
    allergies: ['Latex'],
    conditions: ['High Cholesterol'],
    insurance: 'NHS Standard',
    currentMedications: [
      { date: '2026-03-12', medication: 'Atorvastatin 20mg', status: 'Active' },
      { date: '2025-12-01', medication: 'Aspirin 75mg', status: 'Active' }
    ],
    pastMedications: [],
    interactions: [
      { type: 'Routine', severity: 'Low', detail: 'Atorvastatin is standard for High Cholesterol.' }
    ]
  },
  'P1004': {
    name: 'Jane Smith',
    dob: '1990-11-11',
    address: '22 Baker Street, London, NW1 6XE',
    nhsNumber: '555 666 7777',
    gp: 'Dr. Sarah Connor (Practice: B1 1AA)',
    height: '160cm',
    weight: '55kg',
    allergies: ['Sulfa Drugs'],
    conditions: ['PCOS'],
    insurance: 'NHS Standard',
    currentMedications: [],
    pastMedications: [],
    interactions: []
  }
};

function LabelValidation() {
  const [rxNumber, setRxNumber] = useState('');
  const [currentRx, setCurrentRx] = useState<any>(null);
  const [labelImage, setLabelImage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = () => {
    const rx = COLUMBUS_DB[rxNumber.toUpperCase()];
    if (rx) {
      setCurrentRx(rx.extracted);
      setResult(null);
    } else {
      alert("RX Number not found.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLabelImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runValidation = async () => {
    if (!labelImage || !currentRx) return;
    setIsValidating(true);
    try {
      const res = await validateLabel(labelImage, currentRx);
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsValidating(false);
    }
  };

  const generateMockLabel = async (withError: boolean = false) => {
    if (!currentRx) return;
    setIsGenerating(true);
    try {
      const img = await generateLabelImage(currentRx, withError);
      setLabelImage(img);
      setResult(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">AI Label Validation</h2>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Enter RX Number..." 
            className="px-4 py-2 border border-slate-200 rounded-lg outline-none w-64"
            value={rxNumber}
            onChange={(e) => setRxNumber(e.target.value)}
          />
          <button 
            onClick={handleSearch}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Load RX
          </button>
        </div>
      </div>

      {currentRx && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-blue-500" />
                Prescription Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 uppercase text-[10px] font-bold">Medication</p>
                  <p className="font-bold text-slate-800">{currentRx.medication}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase text-[10px] font-bold">Dosage</p>
                  <p className="font-bold text-slate-800">{currentRx.dosage}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase text-[10px] font-bold">Frequency</p>
                  <p className="font-bold text-slate-800">{currentRx.frequency}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase text-[10px] font-bold">Quantity</p>
                  <p className="font-bold text-slate-800">{currentRx.quantity || '28'} Units</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Camera size={18} className="text-indigo-500" />
                  Medication Label
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => generateMockLabel(false)}
                    disabled={isGenerating}
                    className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1"
                  >
                    {isGenerating ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                    Generate Correct
                  </button>
                  <button 
                    onClick={() => generateMockLabel(true)}
                    disabled={isGenerating}
                    className="text-[10px] font-bold bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1"
                  >
                    {isGenerating ? <Loader2 size={10} className="animate-spin" /> : <AlertTriangle size={10} />}
                    Generate Error
                  </button>
                </div>
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-500 hover:bg-indigo-50/30 transition-all relative min-h-[200px] flex items-center justify-center group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                {labelImage ? (
                  <img src={labelImage} alt="Label" className="max-h-64 mx-auto rounded-lg shadow-md animate-in zoom-in duration-300" />
                ) : (
                  <div className="space-y-2 group-hover:scale-105 transition-transform duration-300">
                    <Camera className="mx-auto text-slate-300 group-hover:text-indigo-400 transition-colors" size={48} />
                    <p className="text-sm text-slate-500 font-medium">Upload Label Scan or use AI Generator</p>
                    <p className="text-[10px] text-slate-400">Supports PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
              {labelImage && (
                <button 
                  onClick={runValidation}
                  disabled={isValidating}
                  className="w-full mt-4 bg-indigo-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-200 active:scale-[0.98]"
                >
                  {isValidating ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                  {isValidating ? 'Validating Label...' : 'Run AI Label Check'}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {result ? (
              <div className={cn(
                "p-8 rounded-[2.5rem] border-2 shadow-2xl animate-in slide-in-from-right-8 duration-500 relative overflow-hidden",
                result.passed ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
              )}>
                {/* Background decorative element */}
                <div className={cn(
                  "absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10",
                  result.passed ? "bg-emerald-500" : "bg-rose-500"
                )} />

                <div className="flex items-center gap-4 mb-8">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                    result.passed ? "bg-emerald-500 shadow-emerald-200" : "bg-rose-500 shadow-rose-200"
                  )}>
                    {result.passed ? <CheckCircle2 className="text-white" size={28} /> : <AlertCircle className="text-white" size={28} />}
                  </div>
                  <div>
                    <h3 className={cn("text-2xl font-black tracking-tight", result.passed ? "text-emerald-800" : "text-rose-800")}>
                      {result.passed ? 'Label Verified' : 'Label Discrepancy Found'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest", 
                        result.passed ? "bg-emerald-200/50 text-emerald-700" : "bg-rose-200/50 text-rose-700")}>
                        AI Confidence: {(result.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {!result.passed && (
                  <div className="space-y-3 mb-8">
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest ml-1">Detected Issues</p>
                    {result.discrepancies.map((d: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 text-rose-800 bg-white/60 p-4 rounded-2xl border border-rose-100 shadow-sm">
                        <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-500" />
                        <p className="text-sm font-bold leading-tight">{d}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-white/50 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <BrainCircuit size={16} className={result.passed ? "text-emerald-500" : "text-rose-500"} />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Clinical Reasoning</p>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                    "{result.reasoning}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center h-full flex flex-col justify-center items-center">
                <ShieldCheck size={64} className="text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-400">Awaiting Label Scan</h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2">Upload a scan of the medication label to perform an AI-powered safety match against the prescription.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PatientConsultation() {
  const [selectedPatientId, setSelectedPatientId] = useState('P1001');
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insight, setInsight] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const runAnalysis = async () => {
    if (!transcript.trim()) return;
    setIsAnalyzing(true);
    try {
      const patientContext = PATIENT_DB[selectedPatientId];
      const res = await getConsultationInsight(transcript, patientContext);
      setInsight(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setInsight(null);
      setTranscript("");
      // Simulate live transcription
      const phrases = [
        "Patient: I've been feeling a bit dizzy since starting the new blood pressure meds. ",
        "\nPharmacist: When do you take them? ",
        "\nPatient: Usually in the morning with my coffee. ",
        "\nPharmacist: Are you taking any other supplements? ",
        "\nPatient: Just some St. John's Wort for my mood. ",
        "\nPharmacist: I see. St. John's Wort can interact with several medications. ",
        "\nPatient: Oh, I didn't know that. I also sometimes forget to take my evening dose."
      ];
      
      let currentPhrase = 0;
      const interval = setInterval(() => {
        if (currentPhrase < phrases.length) {
          setTranscript(prev => prev + phrases[currentPhrase]);
          currentPhrase++;
        } else {
          clearInterval(interval);
        }
      }, 2000);
    } else {
      setIsRecording(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return <Smile className="text-emerald-500" size={20} />;
      case 'Neutral': return <Meh className="text-slate-500" size={20} />;
      case 'Anxious': return <AlertTriangle className="text-amber-500" size={20} />;
      case 'Frustrated': return <Frown className="text-rose-500" size={20} />;
      default: return <Meh className="text-slate-500" size={20} />;
    }
  };

  const getAdherenceRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Low': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI Patient Consultation</h2>
          <p className="text-sm text-slate-500">Real-time clinical analysis and documentation assistant</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
            <User size={16} className="text-slate-400" />
            <select 
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="text-sm font-bold text-slate-700 outline-none bg-transparent"
            >
              {Object.entries(PATIENT_DB).map(([id, p]) => (
                <option key={id} value={id}>{p.name}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={toggleRecording}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95",
              isRecording ? "bg-rose-500 text-white shadow-rose-200 animate-pulse" : "bg-indigo-600 text-white shadow-indigo-200"
            )}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            {isRecording ? `End (${formatDuration(recordingDuration)})` : 'Start Consultation'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            {isRecording && (
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 overflow-hidden">
                <div className="h-full bg-rose-500 animate-progress" style={{ width: '100%' }} />
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-500" />
                Live Transcript
              </h3>
              {isRecording && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Live</span>
                </div>
              )}
            </div>
            <div className="relative">
              <textarea 
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Consultation transcript will appear here in real-time..."
                className="w-full h-80 p-6 bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl text-slate-700 transition-all outline-none resize-none text-sm font-mono leading-relaxed"
              />
              {isRecording && (
                <div className="absolute bottom-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm">
                  <Volume2 size={12} className="text-indigo-500 animate-bounce" />
                  <span className="text-[10px] font-bold text-slate-500">Listening...</span>
                </div>
              )}
            </div>
            <button 
              onClick={runAnalysis}
              disabled={isAnalyzing || !transcript.trim() || isRecording}
              className="w-full mt-4 bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-200 active:scale-[0.98]"
            >
              {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
              {isAnalyzing ? 'Analyzing Consultation...' : 'Generate AI Clinical Insights'}
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User size={18} className="text-indigo-500" />
              Patient Context
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conditions</p>
                <div className="flex flex-wrap gap-1">
                  {PATIENT_DB[selectedPatientId].conditions.map((c: string, i: number) => (
                    <span key={i} className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">{c}</span>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Allergies</p>
                <div className="flex flex-wrap gap-1">
                  {PATIENT_DB[selectedPatientId].allergies.map((a: string, i: number) => (
                    <span key={i} className="text-[10px] font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100 text-rose-600">{a}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {insight ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <BrainCircuit size={80} />
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex flex-col">
                    <h3 className="text-2xl font-black tracking-tight">Clinical Insights</h3>
                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">AI-Powered Analysis</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Sentiment</p>
                      {getSentimentIcon(insight.sentiment)}
                    </div>
                    <p className="text-lg font-bold">{insight.sentiment}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Adherence Risk</p>
                      <AlertTriangle className={cn(
                        insight.adherenceRisk === 'High' ? "text-rose-400" : 
                        insight.adherenceRisk === 'Medium' ? "text-amber-400" : "text-emerald-400"
                      )} size={20} />
                    </div>
                    <p className="text-lg font-bold">{insight.adherenceRisk} Risk</p>
                  </div>
                </div>

                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-2">Executive Summary</p>
                  <p className="text-sm text-indigo-50 leading-relaxed italic">"{insight.summary}"</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    Clinical Recommendations
                  </h4>
                  <ul className="space-y-2.5">
                    {insight.clinicalRecommendations.map((r: string, i: number) => (
                      <li key={i} className="text-xs font-bold text-slate-700 flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                    <AlertCircle size={14} className="text-amber-500" />
                    Patient Concerns
                  </h4>
                  <ul className="space-y-2.5">
                    {insight.patientConcerns.map((c: string, i: number) => (
                      <li key={i} className="text-xs font-bold text-slate-700 flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-2">
                    <FileText size={14} className="text-indigo-500" />
                    Professional Documentation
                  </h4>
                  <button className="text-[10px] font-bold text-indigo-600 hover:underline">Edit Note</button>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-600 leading-relaxed font-mono whitespace-pre-wrap">{insight.documentation}</p>
                </div>
                <div className="flex gap-3 mt-4">
                  <button className="flex-1 bg-indigo-50 text-indigo-600 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all">
                    <RotateCcw size={14} /> Re-analyze
                  </button>
                  <button className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                    <CheckCircle2 size={14} /> Commit to Record
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center h-full flex flex-col justify-center items-center">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                <Zap size={40} className="text-indigo-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-400">Awaiting Consultation Data</h3>
              <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2">Start a recording or provide a transcript to generate AI-powered clinical documentation and recommendations.</p>
              
              <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="p-4 bg-white rounded-2xl border border-slate-100 text-left">
                  <Volume2 size={16} className="text-indigo-400 mb-2" />
                  <p className="text-[10px] font-bold text-slate-800 mb-1">Live Mode</p>
                  <p className="text-[9px] text-slate-400">Real-time transcription & sentiment tracking</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-100 text-left">
                  <BrainCircuit size={16} className="text-emerald-400 mb-2" />
                  <p className="text-[10px] font-bold text-slate-800 mb-1">Clinical Audit</p>
                  <p className="text-[9px] text-slate-400">Automatic documentation & risk assessment</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ClinicalDecisionSupport({ initialRxNumber, onSearch }: { initialRxNumber: string, onSearch: (rx: string) => void }) {
  const [rxNumber, setRxNumber] = useState(initialRxNumber);
  const [patientData, setPatientData] = useState<any>(null);
  const [currentRx, setCurrentRx] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (initialRxNumber) {
      handleSearch(initialRxNumber);
    }
  }, [initialRxNumber]);

  const handleSearch = (num: string) => {
    setIsLoading(true);
    setRecommendation(null);
    const rx = COLUMBUS_DB[num.toUpperCase()];
    if (rx) {
      setCurrentRx(rx.extracted);
      setPatientData(PATIENT_DB[rx.patientId]);
      onSearch(num.toUpperCase());
    } else {
      setCurrentRx(null);
      setPatientData(null);
    }
    setIsLoading(false);
  };

  const generateRecommendation = async () => {
    if (!patientData || !currentRx) return;
    setIsGenerating(true);
    try {
      const result = await getClinicalRecommendation(patientData, currentRx);
      setRecommendation(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Clinical Decision Support</h2>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Enter RX Number..." 
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
            value={rxNumber}
            onChange={(e) => setRxNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(rxNumber)}
          />
          <button 
            onClick={() => handleSearch(rxNumber)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Pull Data
          </button>
        </div>
      </div>

      {!patientData && !isLoading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Patient Data Loaded</h3>
          <p className="text-slate-500">Enter a valid RX number to pull the patient profile and clinical history.</p>
        </div>
      )}

      {patientData && (
        <div className="space-y-6">
          {/* Safety Scorecard - Prominent Top Section */}
          {recommendation && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-4 duration-700">
              <div className={cn(
                "p-6 rounded-[2rem] border-2 shadow-xl flex flex-col justify-between",
                recommendation.riskLevel === 'High' ? "bg-red-50 border-red-200" :
                recommendation.riskLevel === 'Medium' ? "bg-amber-50 border-amber-200" :
                "bg-emerald-50 border-emerald-200"
              )}>
                <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert size={20} className={recommendation.riskLevel === 'High' ? "text-red-500" : recommendation.riskLevel === 'Medium' ? "text-amber-500" : "text-emerald-500"} />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Risk Assessment</span>
                </div>
                <div>
                  <h4 className={cn("text-3xl font-black mb-1", 
                    recommendation.riskLevel === 'High' ? "text-red-700" : 
                    recommendation.riskLevel === 'Medium' ? "text-amber-700" : 
                    "text-emerald-700"
                  )}>
                    {recommendation.riskLevel}
                  </h4>
                  <p className="text-xs font-medium opacity-70">Overall Clinical Risk</p>
                </div>
              </div>

              <div className={cn(
                "p-6 rounded-[2rem] border-2 shadow-xl flex flex-col justify-between",
                recommendation.actionPlan === 'STOP' ? "bg-red-600 text-white border-red-700" :
                recommendation.actionPlan === 'COUNSEL' ? "bg-amber-500 text-white border-amber-600" :
                "bg-emerald-600 text-white border-emerald-700"
              )}>
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={20} className="text-white/80" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Required Action</span>
                </div>
                <div>
                  <h4 className="text-3xl font-black mb-1">{recommendation.actionPlan}</h4>
                  <p className="text-xs font-medium text-white/70">Pharmacist Directive</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-xl flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-4 text-slate-400">
                  <Activity size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Clinical Verdict</span>
                </div>
                <p className="text-sm font-bold text-slate-700 leading-tight line-clamp-3">
                  {recommendation.summary}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Patient Profile & History */}
            <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-6 py-4 border-bottom border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Patient Profile</h3>
                    <p className="text-xs text-slate-500">NHS: {patientData.nhsNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    {patientData.insurance}
                  </span>
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Full Name</label>
                  <p className="font-medium text-slate-900">{patientData.name}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date of Birth</label>
                  <p className="font-medium text-slate-900">{patientData.dob}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">GP Details</label>
                  <p className="font-medium text-slate-900">{patientData.gp}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Height / Weight</label>
                  <p className="font-medium text-slate-900">{patientData.height} / {patientData.weight}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Address</label>
                  <p className="font-medium text-slate-900">{patientData.address}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Allergies & Conditions */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-500" />
                  Clinical Context
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Allergies</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {patientData.allergies.map((a: string) => (
                        <span key={a} className="px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium border border-red-100">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Health Conditions</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {patientData.conditions.map((c: string) => (
                        <span key={c} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Medication History */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <History size={18} className="text-blue-500" />
                  Medication History
                </h3>
                
                <div className="space-y-6">
                  {/* Current Medications */}
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Current Medications</h4>
                    <div className="space-y-2">
                      {patientData.currentMedications.map((h: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-blue-50/30 rounded-lg border border-blue-100/50">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{h.medication}</p>
                            <p className="text-[10px] text-slate-500">{h.date}</p>
                          </div>
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter bg-blue-50 px-2 py-1 rounded">
                            {h.status}
                          </span>
                        </div>
                      ))}
                      {patientData.currentMedications.length === 0 && (
                        <p className="text-xs text-slate-400 italic">No active medications.</p>
                      )}
                    </div>
                  </div>

                  {/* Past Medications */}
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Complete History (Past)</h4>
                    <div className="space-y-2">
                      {patientData.pastMedications.map((h: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{h.medication}</p>
                            <p className="text-[10px] text-slate-500">{h.date}</p>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-100 px-2 py-1 rounded">
                            {h.status}
                          </span>
                        </div>
                      ))}
                      {patientData.pastMedications.length === 0 && (
                        <p className="text-xs text-slate-400 italic">No past medications recorded.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interaction & AI Recommendation */}
          <div className="lg:sticky lg:top-6 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert size={18} className="text-rose-500" />
                  Clinical Safety Analysis
                </h3>
                {recommendation && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    AI Enhanced
                  </span>
                )}
              </div>
              
              <div className="space-y-3">
                {/* Display AI-detected interactions if available, otherwise fallback to database interactions */}
                {(recommendation?.interactions || patientData.interactions).map((inter: any, i: number) => (
                  <div key={i} className={`p-4 rounded-xl border-l-4 animate-in slide-in-from-right-2 duration-300 delay-${i * 100} ${
                    inter.severity === 'High' ? 'bg-red-50 border-red-500' : 
                    inter.severity === 'Medium' ? 'bg-amber-50 border-amber-500' : 
                    'bg-blue-50 border-blue-500'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        inter.severity === 'High' ? 'text-red-700' : 
                        inter.severity === 'Medium' ? 'text-amber-700' : 
                        'text-blue-700'
                      }`}>
                        {inter.type}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inter.severity === 'High' ? 'bg-red-200 text-red-800' : 
                        inter.severity === 'Medium' ? 'bg-amber-200 text-amber-800' : 
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {inter.severity} Risk
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{inter.detail}</p>
                  </div>
                ))}
                
                {(!recommendation?.interactions && patientData.interactions.length === 0) && (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-slate-500 font-medium">No immediate interactions flagged.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Run AI Insight for deep clinical cross-check.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#0F172A] rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden border border-slate-800">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <BrainCircuit size={120} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Zap size={20} className="text-blue-400" />
                      </div>
                      AI Clinical Decision Support
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">Real-time safety analysis & interaction check</p>
                  </div>
                  {!recommendation && (
                    <button 
                      onClick={generateRecommendation}
                      disabled={isGenerating}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95"
                    >
                      {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                      {isGenerating ? 'Analyzing...' : 'Run Safety Check'}
                    </button>
                  )}
                </div>
                
                {isGenerating ? (
                  <div className="space-y-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                      <p className="text-xs text-blue-400 font-mono">Scanning patient history...</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-800 rounded-full animate-pulse w-3/4" />
                      <div className="h-3 bg-slate-800 rounded-full animate-pulse w-full" />
                      <div className="h-3 bg-slate-800 rounded-full animate-pulse w-5/6" />
                    </div>
                  </div>
                ) : recommendation ? (
                  <div className="space-y-6">
                    <div className="prose prose-invert prose-sm max-w-none bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                      <Markdown>{recommendation.fullAnalysis}</Markdown>
                    </div>
                    
                    {recommendation.patientAdvice && (
                      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <User size={16} className="text-blue-400" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Patient Counseling Advice</span>
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed italic">
                          "{recommendation.patientAdvice}"
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <p className="text-[10px] text-slate-500 italic">AI-generated clinical advice. Final decision rests with the pharmacist.</p>
                      <button 
                        onClick={() => setRecommendation(null)}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                      >
                        <RotateCcw size={12} />
                        Re-run Analysis
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                    <ShieldCheck size={48} className="text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm font-medium mb-2">Ready for Clinical Cross-Check</p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">Click the button above to perform a deep clinical interaction check against patient history and conditions.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}

function PrescriptionValidation({ initialRxNumber, onProceedToCDS }: { initialRxNumber: string, onProceedToCDS: (rx: string) => void }) {
  const [rxNumber, setRxNumber] = useState(initialRxNumber);
  const [currentRx, setCurrentRx] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  useEffect(() => {
    if (initialRxNumber) {
      handleSearch(initialRxNumber);
    }
  }, [initialRxNumber]);

  const handleSearch = (num: string) => {
    const result = COLUMBUS_DB[num.toUpperCase()];
    if (result) {
      setCurrentRx({ ...result, id: num.toUpperCase() });
      setValidationResult(null);
    } else {
      setCurrentRx(null);
    }
  };

  const handleRunValidation = async () => {
    if (!currentRx) return;
    setIsValidating(true);
    try {
      const source = currentRx.type === 'EPS' ? currentRx.originalMessage : currentRx.imageUrl;
      const result = await validatePrescription(source, currentRx.extracted, currentRx.type === 'Walk-in');
      setValidationResult(result);
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">AI Prescription Validation</h2>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Enter RX Number..." 
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-64"
            value={rxNumber}
            onChange={(e) => setRxNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(rxNumber)}
          />
          <button 
            onClick={() => handleSearch(rxNumber)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Pull Details
          </button>
        </div>
      </div>

      {!currentRx && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Awaiting Prescription Data</h3>
          <p className="text-slate-500">Enter an RX number to begin the AI-powered cross-verification process.</p>
        </div>
      )}

      {currentRx && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Left Side: Source of Truth */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Original Prescriber Message ({currentRx.type})
              </h3>
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md uppercase tracking-widest">Source of Truth</span>
            </div>
            <div className="flex-1 p-8 overflow-auto max-h-[600px]">
              {currentRx.type === 'EPS' ? (
                <pre className="text-sm font-mono text-slate-600 bg-slate-50 p-6 rounded-2xl border border-slate-100 whitespace-pre-wrap">
                  {currentRx.originalMessage}
                </pre>
              ) : (
                <div className="relative group">
                  <img 
                    src={currentRx.imageUrl} 
                    alt="Scanned Prescription" 
                    className="w-full rounded-2xl shadow-lg border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                    <span className="bg-white/90 px-4 py-2 rounded-xl text-xs font-bold shadow-xl">AI Scanning Active</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Columbus Data */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                Columbus System Data
              </h3>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-md uppercase tracking-widest">Extracted Details</span>
            </div>
            <div className="flex-1 p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {Object.entries(currentRx.extracted).map(([key, value]: [string, any]) => (
                  <div key={key} className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-sm font-semibold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">{value}</p>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-slate-100">
                <button 
                  onClick={handleRunValidation}
                  disabled={isValidating}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3"
                >
                  {isValidating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      AI Cross-Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-6 h-6" /> Validate with AI Tool
                    </>
                  )}
                </button>
              </div>

              {validationResult && (
                <div className={cn(
                  "mt-6 p-6 rounded-2xl animate-in zoom-in duration-300",
                  validationResult.passed ? "bg-emerald-50 border border-emerald-100" : "bg-rose-50 border border-rose-100"
                )}>
                  <div className="flex items-center gap-3 mb-4">
                    {validationResult.passed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-rose-600" />
                    )}
                    <h4 className={cn(
                      "font-bold text-lg",
                      validationResult.passed ? "text-emerald-800" : "text-rose-800"
                    )}>
                      {validationResult.passed ? "Validation Passed" : "Validation Failed"}
                    </h4>
                    <span className="ml-auto text-[10px] font-bold bg-white/50 px-2 py-1 rounded-lg">
                      Confidence: {(validationResult.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  
                  {!validationResult.passed && (
                    <div className="space-y-4">
                      <p className="text-sm text-rose-700 font-medium italic mb-2">
                        AI Reasoning: {validationResult.reasoning}
                      </p>
                      <ul className="space-y-2">
                        {validationResult.discrepancies.map((d: string, i: number) => (
                          <li key={i} className="text-sm text-rose-700 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {validationResult.passed && (
                    <div className="space-y-4">
                      <p className="text-sm text-emerald-700">
                        {validationResult.reasoning}
                      </p>
                      <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom-2 duration-500">
                        <div>
                          <h4 className="text-indigo-900 font-bold">Validation Successful</h4>
                          <p className="text-indigo-700 text-xs">Safe to proceed for clinical review.</p>
                        </div>
                        <button 
                          onClick={() => onProceedToCDS(currentRx.id)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-100"
                        >
                          Proceed to CDS
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PrescriptionLifecycleStepper({ currentStatus }: { currentStatus: PrescriptionData['status'] }) {
  const stages = [
    { id: 'Pending', label: 'Received', icon: Clock, desc: 'Awaiting AI Validation' },
    { id: 'Validated', label: 'Validated', icon: ShieldCheck, desc: 'AI Cross-Check Complete' },
    { id: 'Dispensed', label: 'Dispensed', icon: CheckCircle2, desc: 'Final Safety Match & Handover' }
  ];

  const currentIdx = stages.findIndex(s => s.id === currentStatus);

  return (
    <div className="flex items-center w-full max-w-2xl mx-auto mb-12">
      {stages.map((stage, i) => {
        const isCompleted = i < currentIdx;
        const isActive = i === currentIdx;
        const isLast = i === stages.length - 1;

        return (
          <React.Fragment key={stage.id}>
            <div className="flex flex-col items-center relative group">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg",
                isCompleted ? "bg-emerald-500 text-white shadow-emerald-200" :
                isActive ? "bg-indigo-600 text-white shadow-indigo-200 scale-110" :
                "bg-slate-100 text-slate-400"
              )}>
                <stage.icon size={20} />
              </div>
              <div className="absolute top-14 text-center w-32">
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  isActive ? "text-indigo-600" : isCompleted ? "text-emerald-600" : "text-slate-400"
                )}>
                  {stage.label}
                </p>
                <p className="text-[8px] text-slate-400 font-medium mt-0.5 leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
                  {stage.desc}
                </p>
              </div>
            </div>
            {!isLast && (
              <div className="flex-1 h-1 mx-4 rounded-full bg-slate-100 relative overflow-hidden">
                <div 
                  className={cn(
                    "absolute inset-0 bg-indigo-500 transition-all duration-1000",
                    isCompleted ? "w-full" : "w-0"
                  )} 
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function PrescriptionLifecycleOverview() {
  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Activity size={120} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <ClipboardList className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Prescription Lifecycle</h2>
            <p className="text-sm text-slate-500 font-medium">End-to-end AI-governed dispensing workflow</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Clock size={16} className="text-slate-400" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage 1</span>
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Intake & Extraction</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Prescriptions are received via EPS or Scan. AI extracts clinical data and flags immediate discrepancies.
            </p>
          </div>

          <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <ShieldCheck size={16} className="text-indigo-500" />
              </div>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Stage 2</span>
            </div>
            <h4 className="font-bold text-indigo-900 mb-1">Clinical Governance</h4>
            <p className="text-xs text-indigo-700 leading-relaxed">
              AI performs a deep safety check against patient history, allergies, and conditions to prevent adverse events.
            </p>
          </div>

          <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Stage 3</span>
            </div>
            <h4 className="font-bold text-emerald-900 mb-1">Final Verification</h4>
            <p className="text-xs text-emerald-700 leading-relaxed">
              AI matches the printed label against the original prescription before final pharmacist sign-off and dispensing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>(INITIAL_PRESCRIPTIONS);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workflow' | 'analytics' | 'validate' | 'cds' | 'label-validation' | 'consultation' | 'task-routing' | 'staff-scheduling' | 'queue-analytics' | 'fraud-detection' | 'regulation-monitoring' | 'health-risk' | 'smart-otc' | 'inventory-forecasting'>('workflow');
  const [view, setView] = useState<'landing' | 'journey' | 'feature'>('landing');
  const [activeJourney, setActiveJourney] = useState<'dispense' | 'workflow' | 'stock' | 'fraud' | 'clinical' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Validation State
  const [searchRx, setSearchRx] = useState('');

  // CDS State
  const [cdsRxNumber, setCdsRxNumber] = useState('');

  const handleProceedToCDS = (rxNumber: string) => {
    setCdsRxNumber(rxNumber);
    setSearchRx(rxNumber);
    setActiveTab('cds');
    setView('feature');
  };

  const handleSearchRx = () => {
    // No-op, managed in PrescriptionValidation component
  };

  // ... rest of the component logic ...

  // KPIs
  const kpis = useMemo(() => {
    const total = prescriptions.length;
    const dispensed = prescriptions.filter(p => p.status === 'Dispensed').length;
    const errors = prescriptions.reduce((acc, p) => acc + p.validationErrors.length, 0);
    const avgTurnaround = 35; // Mock avg in minutes
    
    return [
      { label: 'Error Rate', value: '0.8%', icon: AlertCircle, color: 'text-rose-500', trend: '-12%' },
      { label: 'Avg Turnaround', value: `${avgTurnaround}m`, icon: Clock, color: 'text-blue-500', trend: '-5m' },
      { label: 'Interventions', value: '14', icon: ShieldCheck, color: 'text-amber-500', trend: '+2' },
      { label: 'Patient Wait', value: '12m', icon: TrendingUp, color: 'text-emerald-500', trend: '-3m' },
    ];
  }, [prescriptions]);

  const handleAddPrescription = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    try {
      const data = await processPrescription(inputText);
      setPrescriptions(prev => [data as PrescriptionData, ...prev]);
      setInputText('');
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to process prescription:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateStatus = (id: string, nextStatus: PrescriptionData['status']) => {
    setPrescriptions(prev => prev.map(p => 
      p.id === id ? { ...p, status: nextStatus, processedAt: nextStatus === 'Dispensed' ? new Date() : p.processedAt } : p
    ));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Sidebar - only show in feature view */}
      {view === 'feature' && (
        <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-20 hidden lg:flex flex-col">
          <div className="p-6 flex items-center gap-3 border-b border-slate-100">
            <button 
              onClick={() => setView('journey')}
              className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 hover:scale-105 transition-transform"
            >
              <Activity className="text-white w-6 h-6" />
            </button>
            <span className="font-bold text-xl tracking-tight text-slate-800">RxFlow</span>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button 
              onClick={() => setActiveTab('validate')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === 'validate' ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <ShieldCheck className={cn("w-5 h-5", activeTab === 'validate' ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
              Prescription Validation
            </button>
            <button 
              onClick={() => setActiveTab('cds')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === 'cds' ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <BrainCircuit className={cn("w-5 h-5", activeTab === 'cds' ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
              Clinical Support
            </button>
            <button 
              onClick={() => setActiveTab('label-validation')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === 'label-validation' ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <FileCheck className={cn("w-5 h-5", activeTab === 'label-validation' ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
              Label Validation
            </button>
            <button 
              onClick={() => setActiveTab('consultation')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === 'consultation' ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <MessageSquare className={cn("w-5 h-5", activeTab === 'consultation' ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
              Patient Consultation
            </button>
            <button 
              onClick={() => setActiveTab('workflow')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === 'workflow' ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <ClipboardList className={cn("w-5 h-5", activeTab === 'workflow' ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
              Prescription Lifecycle
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === 'analytics' ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <TrendingUp className={cn("w-5 h-5", activeTab === 'analytics' ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
              Analytics
            </button>

            <div className="pt-4 pb-2 px-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workflow</p>
            </div>
            <button 
              onClick={() => setActiveTab('task-routing')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === 'task-routing' ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <Zap className={cn("w-5 h-5", activeTab === 'task-routing' ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
              Task Routing
            </button>
            <button 
              onClick={() => setActiveTab('staff-scheduling')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === 'staff-scheduling' ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <Users className={cn("w-5 h-5", activeTab === 'staff-scheduling' ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
              Staff Scheduling
            </button>
            <button 
              onClick={() => setActiveTab('queue-analytics')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === 'queue-analytics' ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <BarChart3 className={cn("w-5 h-5", activeTab === 'queue-analytics' ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
              Queue Analytics
            </button>

            <div className="pt-4 pb-2 px-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Governance</p>
            </div>
            <button 
              onClick={() => setActiveTab('fraud-detection')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === 'fraud-detection' ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <ShieldAlert className={cn("w-5 h-5", activeTab === 'fraud-detection' ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
              Fraud Detection
            </button>
            <button 
              onClick={() => setActiveTab('regulation-monitoring')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === 'regulation-monitoring' ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <FileCheck className={cn("w-5 h-5", activeTab === 'regulation-monitoring' ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
              Regulation Monitoring
            </button>

            <div className="pt-4 pb-2 px-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinical</p>
            </div>
            <button 
              onClick={() => setActiveTab('health-risk')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === 'health-risk' ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <TrendingUp className={cn("w-5 h-5", activeTab === 'health-risk' ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
              Health Risk
            </button>
            <button 
              onClick={() => setActiveTab('smart-otc')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === 'smart-otc' ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <Zap className={cn("w-5 h-5", activeTab === 'smart-otc' ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
              Smart OTC
            </button>

            <div className="pt-4 pb-2 px-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory</p>
            </div>
            <button 
              onClick={() => setActiveTab('inventory-forecasting')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === 'inventory-forecasting' ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <Database className={cn("w-5 h-5", activeTab === 'inventory-forecasting' ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
              Stock Management
            </button>
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Dr. Sarah Miller</p>
                  <p className="text-[10px] text-slate-500">Clinical Pharmacist</p>
                </div>
              </div>
              <button className="w-full py-2 text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center justify-center gap-2 transition-colors">
                <Settings className="w-3 h-3" /> Settings
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className={cn(
        "min-h-screen transition-all duration-300",
        view === 'feature' ? "lg:ml-64" : "lg:ml-0"
      )}>
        {/* Header - only show in feature view */}
        {view === 'feature' && (
          <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-10 px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <button 
                onClick={() => setView('journey')}
                className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <RotateCcw size={20} />
              </button>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search prescriptions, patients, or meds..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm transition-all outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView('journey')}
                className="hidden lg:flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors"
              >
                <RotateCcw size={16} /> Back to Journey
              </button>
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl relative transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
          </header>
        )}

        <div className={cn("p-8 space-y-8", view !== 'feature' && "max-w-7xl mx-auto")}>
          {view === 'landing' && (
            <div className="space-y-12 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-200 mx-auto mb-6">
                  <Activity className="text-white w-10 h-10" />
                </div>
                <h1 className="text-5xl font-black tracking-tight text-slate-900">Pharmacy Journey Hub</h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto">Select a specialized journey to optimize your clinical workflow and patient safety.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { 
                    id: 'dispense', 
                    title: 'Prescription Journey RX - Dispense', 
                    desc: 'End-to-end dispensing workflow with AI safety checks.', 
                    icon: Package, 
                    color: 'bg-indigo-600',
                    shadow: 'shadow-indigo-100'
                  },
                  { 
                    id: 'workflow', 
                    title: 'Workflow Optimization', 
                    desc: 'Analyze and improve pharmacy operational efficiency.', 
                    icon: Zap, 
                    color: 'bg-emerald-600',
                    shadow: 'shadow-emerald-100'
                  },
                  { 
                    id: 'fraud', 
                    title: 'Fraud & Governance', 
                    desc: 'AI-driven fraud detection and regulatory monitoring.', 
                    icon: ShieldAlert, 
                    color: 'bg-rose-600',
                    shadow: 'shadow-rose-100'
                  },
                  { 
                    id: 'clinical', 
                    title: 'Clinical & Preventive', 
                    desc: 'Health risk prediction and smart OTC care.', 
                    icon: Heart, 
                    color: 'bg-amber-600',
                    shadow: 'shadow-amber-100'
                  },
                  { 
                    id: 'stock', 
                    title: 'Stock Management', 
                    desc: 'AI-powered inventory tracking and prediction.', 
                    icon: Database, 
                    color: 'bg-blue-600',
                    shadow: 'shadow-blue-100'
                  }
                ].map((journey) => (
                  <button
                    key={journey.id}
                    onClick={() => {
                      setActiveJourney(journey.id as any);
                      setView('journey');
                    }}
                    className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-300 text-left flex flex-col h-full active:scale-[0.98]"
                  >
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform", journey.color)}>
                      <journey.icon className="text-white w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">{journey.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">{journey.desc}</p>
                    <div className="mt-auto flex items-center gap-2 text-indigo-600 font-bold text-sm">
                      Start Journey <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === 'journey' && activeJourney === 'dispense' && (
            <div className="space-y-12 py-12 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('landing')}
                  className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
                >
                  <RotateCcw size={18} /> Back to Hub
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <Package className="text-white w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Prescription Journey RX</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: 'validate', title: 'Prescription Validation', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { id: 'cds', title: 'Clinical Decision Support', icon: BrainCircuit, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { id: 'consultation', title: 'Patient Consultation', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { id: 'label-validation', title: 'Label Validation', icon: FileCheck, color: 'text-rose-600', bg: 'bg-rose-50' },
                  { id: 'workflow', title: 'Prescription Lifecycle', icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' }
                ].map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => {
                      setActiveTab(feature.id as any);
                      setView('feature');
                    }}
                    className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 text-left flex items-center gap-5 active:scale-[0.98]"
                  >
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", feature.bg)}>
                      <feature.icon className={cn("w-7 h-7", feature.color)} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{feature.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">AI-powered safety and efficiency.</p>
                    </div>
                    <ChevronRight className="ml-auto text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === 'journey' && activeJourney === 'workflow' && (
            <div className="space-y-12 py-12 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('landing')}
                  className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
                >
                  <RotateCcw size={18} /> Back to Hub
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <Zap className="text-white w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Workflow Optimization</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: 'task-routing', title: 'Automated Task Routing', icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'AI-driven workload distribution prioritizing clinical specialty.' },
                  { id: 'staff-scheduling', title: 'Staff Scheduling', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Optimize staff shifts based on predicted demand.' },
                  { id: 'queue-analytics', title: 'Queue Analytics', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Real-time insights into prescription wait times.' }
                ].map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => {
                      setActiveTab(feature.id as any);
                      setView('feature');
                    }}
                    className={cn(
                      "group bg-white p-6 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 text-left flex items-center gap-5 active:scale-[0.98]"
                    )}
                  >
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", feature.bg)}>
                      <feature.icon className={cn("w-7 h-7", feature.color)} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{feature.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{feature.desc}</p>
                    </div>
                    <ChevronRight className="ml-auto text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === 'journey' && activeJourney === 'fraud' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('landing')}
                  className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
                >
                  <RotateCcw size={18} /> Back to Hub
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center">
                    <ShieldAlert className="text-white w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Fraud & Governance</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: 'fraud-detection', title: 'Fraud & Abuse Detection', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50', desc: 'AI-driven identification of doctor shopping and forged Rxs.' },
                  { id: 'regulation-monitoring', title: 'Regulation Monitoring', icon: FileCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Real-time updates and compliance tracking for new regulations.' }
                ].map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => {
                      setActiveTab(feature.id as any);
                      setView('feature');
                    }}
                    className={cn(
                      "group bg-white p-6 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 text-left flex items-center gap-5 active:scale-[0.98]"
                    )}
                  >
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", feature.bg)}>
                      <feature.icon className={cn("w-7 h-7", feature.color)} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{feature.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{feature.desc}</p>
                    </div>
                    <ChevronRight className="ml-auto text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === 'journey' && activeJourney === 'clinical' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('landing')}
                  className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
                >
                  <RotateCcw size={18} /> Back to Hub
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                    <Heart className="text-white w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Clinical & Preventive</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: 'health-risk', title: 'Health Risk Prediction', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50', desc: 'Identify patients at risk for chronic conditions early.' },
                  { id: 'smart-otc', title: 'Smart OTC Recommendation', icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Personalized OTC suggestions based on patient profile.' }
                ].map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => {
                      setActiveTab(feature.id as any);
                      setView('feature');
                    }}
                    className={cn(
                      "group bg-white p-6 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 text-left flex items-center gap-5 active:scale-[0.98]"
                    )}
                  >
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", feature.bg)}>
                      <feature.icon className={cn("w-7 h-7", feature.color)} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{feature.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{feature.desc}</p>
                    </div>
                    <ChevronRight className="ml-auto text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === 'journey' && activeJourney === 'stock' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('landing')}
                  className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
                >
                  <RotateCcw size={18} /> Back to Hub
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Database className="text-white w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Stock Management</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: 'inventory-forecasting', title: 'AI Inventory Forecasting', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Predict stock levels and demand trends with AI.' },
                ].map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => {
                      setActiveTab(feature.id as any);
                      setView('feature');
                    }}
                    className={cn(
                      "group bg-white p-6 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 text-left flex items-center gap-5 active:scale-[0.98]"
                    )}
                  >
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", feature.bg)}>
                      <feature.icon className={cn("w-7 h-7", feature.color)} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{feature.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{feature.desc}</p>
                    </div>
                    <ChevronRight className="ml-auto text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === 'feature' && activeTab === 'dashboard' && (
            <>
              {/* KPI Section */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("p-3 rounded-2xl bg-slate-50 group-hover:scale-110 transition-transform", kpi.color.replace('text', 'bg').replace('500', '50'))}>
                        <kpi.icon className={cn("w-6 h-6", kpi.color)} />
                      </div>
                      <span className={cn("text-xs font-bold px-2 py-1 rounded-lg", kpi.trend.startsWith('-') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                        {kpi.trend}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">{kpi.label}</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{kpi.value}</h3>
                  </div>
                ))}
              </section>

              {/* Charts Section */}
              <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Workflow Efficiency</h3>
                      <p className="text-sm text-slate-500">Average turnaround time vs error rate</p>
                    </div>
                    <select className="bg-slate-50 border-none text-sm font-semibold rounded-lg px-3 py-1 outline-none">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                    </select>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={KPI_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                        <Tooltip 
                          contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                        />
                        <Line type="monotone" dataKey="turnaround" stroke="#4F46E5" strokeWidth={3} dot={{r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                        <Line type="monotone" dataKey="errors" stroke="#F43F5E" strokeWidth={3} dot={{r: 4, fill: '#F43F5E', strokeWidth: 2, stroke: '#fff'}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Priority Queue</h3>
                  <div className="space-y-4">
                    {prescriptions.filter(p => p.status !== 'Dispensed').slice(0, 5).map((p) => (
                      <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                        <div className={cn(
                          "w-2 h-10 rounded-full",
                          p.priority === 'High' ? "bg-rose-500" : p.priority === 'Medium' ? "bg-amber-500" : "bg-blue-500"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{p.patientName}</p>
                          <p className="text-xs text-slate-500 truncate">{p.medication}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                      </div>
                    ))}
                    <button 
                      onClick={() => setActiveTab('workflow')}
                      className="w-full py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors"
                    >
                      View Full Queue
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}

          {view === 'feature' && activeTab === 'workflow' && (
            <section className="space-y-6">
              <PrescriptionLifecycleOverview />

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Active Prescription Queue</h3>
                <div className="flex gap-2">
                  {['All', 'Pending', 'Validated', 'Dispensed'].map(status => (
                    <button key={status} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white hover:shadow-sm rounded-xl transition-all uppercase tracking-widest">
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {prescriptions.map((p) => (
                  <div key={p.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500">
                    <div className="p-8">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-8 mb-8">
                        {/* Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="text-xl font-black text-slate-900 tracking-tight">{p.patientName}</h4>
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                              p.priority === 'High' ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                            )}>
                              {p.priority} Priority
                            </span>
                          </div>
                          <p className="text-slate-600 font-bold text-lg">{p.medication} — {p.dosage}</p>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Received {format(p.receivedAt, 'HH:mm')}</span>
                            <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {p.id}</span>
                          </div>
                        </div>

                        {/* AI Status Stepper */}
                        <div className="lg:w-1/2">
                          <PrescriptionLifecycleStepper currentStatus={p.status} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                        {/* AI Insights */}
                        <div className="lg:col-span-2 bg-slate-50 rounded-3xl p-6 border border-slate-100 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-5">
                            <BrainCircuit size={48} />
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                            <Zap className="w-3.5 h-3.5 text-indigo-500" /> AI Governance Insight
                          </div>
                          {p.validationErrors.length > 0 ? (
                            <div className="flex items-start gap-3 text-rose-600">
                              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                              <p className="text-sm font-bold leading-tight">{p.validationErrors[0]}</p>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3 text-emerald-600">
                              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                              <p className="text-sm font-bold leading-tight">AI has verified clinical integrity. No anomalies detected in current history.</p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3">
                          {p.status === 'Pending' && (
                            <button 
                              onClick={() => updateStatus(p.id, 'Validated')}
                              className="w-full lg:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2"
                            >
                              <ShieldCheck size={18} /> Validate RX
                            </button>
                          )}
                          {p.status === 'Validated' && (
                            <button 
                              onClick={() => updateStatus(p.id, 'Dispensed')}
                              className="w-full lg:w-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 active:scale-95"
                            >
                              <Package className="w-18 h-18" /> Dispense & Label
                            </button>
                          )}
                          {p.status === 'Dispensed' && (
                            <div className="flex items-center gap-2 text-emerald-600 font-black text-sm px-6 py-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                              <CheckCircle2 className="w-5 h-5" /> Dispensed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Expandable Label Preview */}
                    {p.status === 'Validated' && (
                      <div className="px-8 pb-8 pt-2 border-t border-slate-50 bg-indigo-50/30">
                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-6 flex gap-6">
                          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                            <ClipboardList className="w-7 h-7 text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI-Generated Label Directive</p>
                            <p className="text-sm text-slate-700 leading-relaxed font-bold italic">"{p.labelInstructions}"</p>
                            <p className="text-[10px] text-slate-400 mt-2">AI matched these instructions against EPS Source 485-772.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {view === 'feature' && activeTab === 'task-routing' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('journey')}
                  className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
                >
                  <RotateCcw size={18} /> Back to Journey
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <Zap className="text-white w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Automated Task Routing</h2>
                </div>
              </div>
              <AutomatedTaskRouting />
            </div>
          )}

          {view === 'feature' && activeTab === 'staff-scheduling' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('journey')}
                  className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
                >
                  <RotateCcw size={18} /> Back to Journey
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <Users className="text-white w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Staff Scheduling</h2>
                </div>
              </div>
              <StaffScheduling />
            </div>
          )}

          {view === 'feature' && activeTab === 'queue-analytics' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('journey')}
                  className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
                >
                  <RotateCcw size={18} /> Back to Journey
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="text-white w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Queue Analytics</h2>
                </div>
              </div>
              <QueueAnalytics />
            </div>
          )}

          {view === 'feature' && activeTab === 'fraud-detection' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('journey')}
                  className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
                >
                  <RotateCcw size={18} /> Back to Journey
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center">
                    <ShieldAlert className="text-white w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Fraud & Abuse Detection</h2>
                </div>
              </div>
              <FraudAbuseDetection />
            </div>
          )}

          {view === 'feature' && activeTab === 'regulation-monitoring' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('journey')}
                  className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
                >
                  <RotateCcw size={18} /> Back to Journey
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <FileCheck className="text-white w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Regulation Monitoring</h2>
                </div>
              </div>
              <RegulationMonitoring />
            </div>
          )}

          {view === 'feature' && activeTab === 'health-risk' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('journey')}
                  className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
                >
                  <RotateCcw size={18} /> Back to Journey
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-white w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Health Risk Prediction</h2>
                </div>
              </div>
              <HealthRiskPrediction />
            </div>
          )}

          {view === 'feature' && activeTab === 'smart-otc' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('journey')}
                  className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
                >
                  <RotateCcw size={18} /> Back to Journey
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <Zap className="text-white w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Smart OTC Recommendation</h2>
                </div>
              </div>
              <SmartOTCRecommendation />
            </div>
          )}

          {view === 'feature' && activeTab === 'inventory-forecasting' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('journey')}
                  className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
                >
                  <RotateCcw size={18} /> Back to Journey
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Database className="text-white w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Stock Management</h2>
                </div>
              </div>
              <StockManagement />
            </div>
          )}

          {view === 'feature' && activeTab === 'validate' && (
            <PrescriptionValidation 
              initialRxNumber={searchRx} 
              onProceedToCDS={handleProceedToCDS}
            />
          )}

          {view === 'feature' && activeTab === 'analytics' && (
            <section className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Error Rate Distribution</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={KPI_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                        <Bar dataKey="errors" radius={[8, 8, 0, 0]}>
                          {KPI_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.errors > 2 ? '#F43F5E' : '#4F46E5'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-slate-700">Clinical Intervention Rate</span>
                        <span className="text-sm font-bold text-indigo-600">4.2%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3">
                        <div className="bg-indigo-600 h-3 rounded-full" style={{width: '42%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-slate-700">Near-Miss Detection Rate</span>
                        <span className="text-sm font-bold text-emerald-600">98.5%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3">
                        <div className="bg-emerald-500 h-3 rounded-full" style={{width: '98.5%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-slate-700">Prescription Rework %</span>
                        <span className="text-sm font-bold text-rose-600">1.2%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3">
                        <div className="bg-rose-500 h-3 rounded-full" style={{width: '12%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {view === 'feature' && activeTab === 'cds' && (
            <ClinicalDecisionSupport 
              initialRxNumber={cdsRxNumber} 
              onSearch={(rx) => setCdsRxNumber(rx)}
            />
          )}

          {view === 'feature' && activeTab === 'label-validation' && (
            <LabelValidation />
          )}

          {view === 'feature' && activeTab === 'consultation' && (
            <PatientConsultation />
          )}
        </div>
      </main>

      {/* Add Prescription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Process New Prescription</h3>
                <p className="text-sm text-slate-500">Paste the electronic prescription text for AI analysis</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45 text-slate-400" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prescription Text</label>
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="e.g. Rx: Sarah Jenkins, Amoxicillin 500mg, 1 cap TID for 7 days..."
                  className="w-full h-48 p-6 bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl text-slate-700 transition-all outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <Activity className="text-white w-5 h-5" />
                </div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Our AI will automatically extract patient info, validate dosages, detect clinical anomalies, and prioritize based on medication urgency.
                </p>
              </div>
            </div>

            <div className="p-8 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddPrescription}
                disabled={isProcessing || !inputText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Analyze & Add <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
