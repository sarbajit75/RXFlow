import React, { useState } from 'react';
import { 
  Search, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  ShoppingCart, 
  Info, 
  ArrowRight,
  Filter,
  Package,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { cn } from '../utils';

const MOCK_OTC_PRODUCTS = [
  { 
    id: 'OTC-101', 
    name: 'Claritin-D 24 Hour', 
    category: 'Allergy', 
    price: 24.99, 
    stock: 12, 
    aiMatch: 98, 
    symptoms: ['Sneezing', 'Runny Nose', 'Itchy Eyes', 'Nasal Congestion'],
    activeIngredients: ['Loratadine 10mg', 'Pseudoephedrine sulfate 240mg'],
    usage: 'One tablet daily with a full glass of water.',
    desc: 'Non-drowsy relief for sneezing, runny nose, and itchy eyes.',
    suitability: 'High Match for Patient Profile',
    warning: 'Contains Pseudoephedrine. Check for hypertension.',
    contraindications: ['Hypertension', 'Heart Disease', 'Glaucoma']
  },
  { 
    id: 'OTC-102', 
    name: 'Advil Liqui-Gels', 
    category: 'Pain Relief', 
    price: 15.49, 
    stock: 45, 
    aiMatch: 85, 
    symptoms: ['Headache', 'Muscle Ache', 'Fever', 'Backache'],
    activeIngredients: ['Ibuprofen 200mg'],
    usage: '1 or 2 capsules every 4 to 6 hours while symptoms persist.',
    desc: 'Fast acting pain relief for headaches and muscle aches.',
    suitability: 'Good Match',
    warning: 'Avoid if patient is on blood thinners.',
    contraindications: ['NSAID Allergy', 'Stomach Ulcers', 'Kidney Disease', 'Blood Thinners']
  },
  { 
    id: 'OTC-103', 
    name: 'Mucinex DM', 
    category: 'Cough & Cold', 
    price: 18.99, 
    stock: 8, 
    aiMatch: 72, 
    symptoms: ['Cough', 'Chest Congestion', 'Mucus Build-up'],
    activeIngredients: ['Guaifenesin 600mg', 'Dextromethorphan HBr 30mg'],
    usage: 'One tablet every 12 hours. Do not exceed 2 tablets in 24 hours.',
    desc: 'Controls cough and thins mucus for 12 hours.',
    suitability: 'Moderate Match',
    warning: 'Check for interactions with current SSRI medication.',
    contraindications: ['SSRI Medication', 'MAOI Medication', 'Chronic Cough']
  },
  { 
    id: 'OTC-104', 
    name: 'Tylenol Extra Strength', 
    category: 'Pain Relief', 
    price: 12.99, 
    stock: 60, 
    aiMatch: 95, 
    symptoms: ['Headache', 'Fever', 'Minor Aches', 'Toothache'],
    activeIngredients: ['Acetaminophen 500mg'],
    usage: '2 caplets every 6 hours while symptoms last.',
    desc: 'Rapid release gels for tough pain relief.',
    suitability: 'High Match',
    warning: 'Severe liver damage may occur if you take more than 4,000 mg in 24 hours.',
    contraindications: ['Liver Disease', 'Alcoholism', 'Acetaminophen Allergy']
  },
  { 
    id: 'OTC-105', 
    name: 'Pepto Bismol', 
    category: 'Digestive Health', 
    price: 8.49, 
    stock: 25, 
    aiMatch: 90, 
    symptoms: ['Nausea', 'Heartburn', 'Indigestion', 'Upset Stomach', 'Diarrhea'],
    activeIngredients: ['Bismuth Subsalicylate 525mg'],
    usage: '30mL every 1/2 to 1 hour as needed.',
    desc: '5-symptom digestive relief.',
    suitability: 'Excellent Match',
    warning: 'Do not use if you have an ulcer or bleeding problem.',
    contraindications: ['Aspirin Allergy', 'Stomach Ulcers', 'Bleeding Disorders']
  }
];

const COMMON_SYMPTOMS = [
  'Headache', 'Fever', 'Cough', 'Sneezing', 'Runny Nose', 'Nausea', 'Heartburn', 'Muscle Ache'
];

const HEALTH_CONDITIONS = [
  'Hypertension', 'Diabetes', 'Heart Disease', 'Kidney Disease', 'Liver Disease', 'Stomach Ulcers', 'Asthma'
];

const ALLERGIES = [
  'NSAID Allergy', 'Aspirin Allergy', 'Acetaminophen Allergy', 'Penicillin', 'Sulfa'
];

export const SmartOTCRecommendation: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<typeof MOCK_OTC_PRODUCTS[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

  const toggleItem = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item) 
        : [...prev, item]
    );
  };

  const filteredProducts = MOCK_OTC_PRODUCTS.map(product => {
    let matchScore = product.aiMatch;
    const conflicts = [
      ...selectedConditions.filter(c => product.contraindications.includes(c)),
      ...selectedAllergies.filter(a => product.contraindications.includes(a))
    ];

    // Penalize match score if there are conflicts
    if (conflicts.length > 0) {
      matchScore = Math.max(0, matchScore - (conflicts.length * 40));
    }

    return { ...product, currentMatch: matchScore, conflicts };
  }).filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.symptoms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSymptoms = selectedSymptoms.length === 0 || 
                           selectedSymptoms.some(s => product.symptoms.includes(s));
    
    return matchesSearch && matchesSymptoms;
  }).sort((a, b) => b.currentMatch - a.currentMatch);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Patient Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Symptom Selector */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Stethoscope className="text-indigo-600 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Current Symptoms</h3>
              <p className="text-sm text-slate-500">What are you feeling today?</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map(symptom => (
              <button
                key={symptom}
                onClick={() => toggleItem(symptom, selectedSymptoms, setSelectedSymptoms)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                  selectedSymptoms.includes(symptom)
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                    : "bg-white text-slate-600 border-slate-100 hover:border-indigo-200"
                )}
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>

        {/* Health Profile Selector */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
              <AlertCircle className="text-rose-600 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Health Profile</h3>
              <p className="text-sm text-slate-500">Known conditions or allergies?</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Conditions</p>
              <div className="flex flex-wrap gap-2">
                {HEALTH_CONDITIONS.map(condition => (
                  <button
                    key={condition}
                    onClick={() => toggleItem(condition, selectedConditions, setSelectedConditions)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                      selectedConditions.includes(condition)
                        ? "bg-rose-600 text-white border-rose-600 shadow-md"
                        : "bg-white text-slate-600 border-slate-100 hover:border-rose-200"
                    )}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Allergies</p>
              <div className="flex flex-wrap gap-2">
                {ALLERGIES.map(allergy => (
                  <button
                    key={allergy}
                    onClick={() => toggleItem(allergy, selectedAllergies, setSelectedAllergies)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                      selectedAllergies.includes(allergy)
                        ? "bg-rose-600 text-white border-rose-600 shadow-md"
                        : "bg-white text-slate-600 border-slate-100 hover:border-rose-200"
                    )}
                  >
                    {allergy}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search OTC products or specific symptoms..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
          <button className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all">
            <Filter size={20} />
          </button>
        </div>
        <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-100 text-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">AI Match Accuracy</p>
            <h3 className="text-2xl font-bold">99.4%</h3>
          </div>
          <Zap className="text-indigo-300 w-8 h-8" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product List */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Recommended Products</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredProducts.length} Products Found</span>
          </div>

          <div className="divide-y divide-slate-50">
            {filteredProducts.length > 0 ? filteredProducts.map((product) => (
              <button 
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={cn(
                  "w-full p-6 text-left hover:bg-slate-50 transition-all flex items-center gap-6 group",
                  selectedProduct?.id === product.id && "bg-indigo-50/50 border-l-4 border-indigo-600"
                )}
              >
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Package className="text-slate-400 w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800">{product.name}</h4>
                    <span className="text-sm font-bold text-slate-900">£{product.price}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.category}</span>
                    <div className="flex gap-1">
                      {product.symptoms.slice(0, 2).map(s => (
                        <span key={s} className="text-[9px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                    </div>
                    {product.conflicts.length > 0 && (
                      <span className="text-[9px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <AlertCircle size={10} /> {product.conflicts.length} Contraindication{product.conflicts.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-xs font-bold mb-1",
                    product.currentMatch > 70 ? "text-indigo-600" : 
                    product.currentMatch > 30 ? "text-amber-600" : "text-rose-600"
                  )}>
                    {product.currentMatch}% Match
                  </div>
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn(
                      "h-full rounded-full transition-all duration-500",
                      product.currentMatch > 70 ? "bg-indigo-500" : 
                      product.currentMatch > 30 ? "bg-amber-500" : "bg-rose-500"
                    )} style={{width: `${product.currentMatch}%`}} />
                  </div>
                </div>
              </button>
            )) : (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <Search className="text-slate-300 w-8 h-8" />
                </div>
                <p className="text-slate-500 font-medium">No products found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Product Detail & Safety Check */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          {selectedProduct ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-widest">
                  <Zap size={14} /> AI Recommendation
                </div>
                <span className="text-slate-400 text-xs font-medium">ID: {selectedProduct.id}</span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-800">{selectedProduct.name}</h3>
                <p className={cn(
                  "font-bold text-sm mt-1 flex items-center gap-1",
                  selectedProduct.aiMatch > 70 ? "text-emerald-600" : "text-amber-600"
                )}>
                  <CheckCircle2 size={14} /> {selectedProduct.suitability}
                </p>
              </div>

              {selectedProduct.contraindications.some(c => selectedConditions.includes(c) || selectedAllergies.includes(c)) && (
                <div className="p-4 rounded-2xl bg-rose-600 text-white space-y-2 shadow-lg shadow-rose-100">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                    <AlertCircle size={14} /> High Risk Warning
                  </div>
                  <p className="text-xs font-medium leading-relaxed">
                    This product is contraindicated for your profile due to: 
                    <span className="font-bold ml-1">
                      {selectedProduct.contraindications.filter(c => selectedConditions.includes(c) || selectedAllergies.includes(c)).join(', ')}
                    </span>
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Ingredients</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.activeIngredients.map(ing => (
                      <span key={ing} className="text-[10px] font-bold bg-white text-slate-600 px-2 py-1 rounded-lg border border-slate-100">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Usage Instructions</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedProduct.usage}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-4">
                <AlertCircle className="text-rose-600 w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-rose-900">Safety Warning</h4>
                  <p className="text-xs text-rose-700 leading-relaxed mt-1">
                    {selectedProduct.warning}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  disabled={selectedProduct.contraindications.some(c => selectedConditions.includes(c) || selectedAllergies.includes(c))}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                >
                  <ShoppingCart size={18} />
                  {selectedProduct.contraindications.some(c => selectedConditions.includes(c) || selectedAllergies.includes(c)) ? "Incompatible Profile" : "Add to Cart"}
                </button>
                <button className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                  <Stethoscope size={18} />
                  Consult Pharmacist
                </button>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className={cn(
                    selectedProduct.contraindications.some(c => selectedConditions.includes(c) || selectedAllergies.includes(c)) ? "text-rose-500" : "text-emerald-500"
                  )} />
                  <span className="text-xs font-bold text-slate-500">
                    {selectedProduct.contraindications.some(c => selectedConditions.includes(c) || selectedAllergies.includes(c)) ? "Interaction Alert" : "Interaction Check: Passed"}
                  </span>
                </div>
                <button className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                  Drug Info <Info size={12} />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <Package className="text-slate-200 w-8 h-8" />
              </div>
              <div>
                <h4 className="text-slate-800 font-bold">Select a Product</h4>
                <p className="text-slate-400 text-xs mt-1">Choose an OTC product to view AI suitability analysis and safety warnings.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
