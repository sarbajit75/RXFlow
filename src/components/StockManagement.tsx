import React, { useState, useMemo } from 'react';
import { 
  Database, 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  ArrowRight, 
  RotateCcw, 
  Zap, 
  BarChart3, 
  Calendar, 
  Clock,
  ShoppingCart, 
  ArrowUpRight, 
  ArrowDownRight,
  Info,
  CheckCircle2,
  Loader2,
  History,
  TrendingDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from '../utils';
import { format, addDays, subDays } from 'date-fns';

// Mock Inventory Data
const MOCK_INVENTORY = [
  { id: '1', name: 'Amoxicillin 500mg', category: 'Antibiotics', currentStock: 450, minThreshold: 500, unit: 'capsules', price: 0.15, leadTime: 3 },
  { id: '2', name: 'Paracetamol 500mg', category: 'Analgesics', currentStock: 2500, minThreshold: 1000, unit: 'tablets', price: 0.02, leadTime: 2 },
  { id: '3', name: 'Atorvastatin 20mg', category: 'Statins', currentStock: 120, minThreshold: 300, unit: 'tablets', price: 0.45, leadTime: 5 },
  { id: '4', name: 'Metformin 500mg', category: 'Antidiabetics', currentStock: 800, minThreshold: 600, unit: 'tablets', price: 0.12, leadTime: 4 },
  { id: '5', name: 'Salbutamol Inhaler', category: 'Respiratory', currentStock: 15, minThreshold: 40, unit: 'units', price: 3.50, leadTime: 7 },
  { id: '6', name: 'Lansoprazole 30mg', category: 'Gastrointestinal', currentStock: 600, minThreshold: 400, unit: 'capsules', price: 0.25, leadTime: 3 },
  { id: '7', name: 'Amlodipine 5mg', category: 'Cardiovascular', currentStock: 300, minThreshold: 500, unit: 'tablets', price: 0.18, leadTime: 4 },
];

// Mock Historical Sales & Demand Trends
const generateHistoricalData = (productName: string) => {
  const data = [];
  const baseDemand = productName.includes('Paracetamol') ? 150 : 20;
  const seasonality = productName.includes('Salbutamol') ? 1.5 : 1.0;
  
  for (let i = 30; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const randomFactor = 0.8 + Math.random() * 0.4;
    data.push({
      date: format(date, 'MMM dd'),
      sales: Math.round(baseDemand * seasonality * randomFactor),
      stock: Math.max(0, 1000 - (30 - i) * baseDemand) // Simplified stock drain
    });
  }
  return data;
};

// Mock Forecast Data
const generateForecastData = (productName: string, currentStock: number) => {
  const data = [];
  const baseDemand = productName.includes('Paracetamol') ? 160 : 25;
  const trend = 1.05; // 5% growth trend
  
  let projectedStock = currentStock;
  
  for (let i = 1; i <= 30; i++) {
    const date = addDays(new Date(), i);
    const predictedSales = Math.round(baseDemand * Math.pow(trend, i / 30) * (0.9 + Math.random() * 0.2));
    projectedStock -= predictedSales;
    
    data.push({
      date: format(date, 'MMM dd'),
      predictedSales,
      projectedStock: Math.max(0, projectedStock)
    });
  }
  return data;
};

export default function StockManagement() {
  const [selectedProduct, setSelectedProduct] = useState(MOCK_INVENTORY[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

  const historicalData = useMemo(() => generateHistoricalData(selectedProduct.name), [selectedProduct]);
  const forecastData = useMemo(() => generateForecastData(selectedProduct.name, selectedProduct.currentStock), [selectedProduct]);

  const lowStockItems = MOCK_INVENTORY.filter(item => item.currentStock < item.minThreshold);

  // Calculate reorder suggestions for all items (especially low stock)
  const allReorderSuggestions = useMemo(() => {
    return MOCK_INVENTORY.map(item => {
      const itemHistoricalData = generateHistoricalData(item.name);
      const dailyDemand = itemHistoricalData.reduce((acc, curr) => acc + curr.sales, 0) / itemHistoricalData.length;
      const daysUntilStockout = item.currentStock / dailyDemand;
      const suggestedReorderDate = addDays(new Date(), Math.max(0, Math.floor(daysUntilStockout - item.leadTime - 2)));
      const suggestedQuantity = Math.round(dailyDemand * 30); // 30 days supply

      return {
        id: item.id,
        name: item.name,
        unit: item.unit,
        price: item.price,
        daysUntilStockout: Math.floor(daysUntilStockout),
        suggestedReorderDate,
        suggestedQuantity,
        urgency: daysUntilStockout < item.leadTime + 2 ? 'High' : daysUntilStockout < 14 ? 'Medium' : 'Low'
      };
    });
  }, []);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowForecast(true);
    }, 1500);
  };

  const reorderSuggestion = useMemo(() => {
    const dailyDemand = historicalData.reduce((acc, curr) => acc + curr.sales, 0) / historicalData.length;
    const daysUntilStockout = selectedProduct.currentStock / dailyDemand;
    const suggestedReorderDate = addDays(new Date(), Math.max(0, Math.floor(daysUntilStockout - selectedProduct.leadTime - 2)));
    const suggestedQuantity = Math.round(dailyDemand * 30); // 30 days supply

    return {
      daysUntilStockout: Math.floor(daysUntilStockout),
      suggestedReorderDate,
      suggestedQuantity,
      urgency: daysUntilStockout < selectedProduct.leadTime + 2 ? 'High' : daysUntilStockout < 14 ? 'Medium' : 'Low'
    };
  }, [selectedProduct, historicalData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Database className="text-blue-600" size={32} />
            AI Inventory Forecasting
          </h2>
          <p className="text-slate-500 mt-1 font-medium">Predictive stock management & demand trend analysis.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Status</p>
            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1 justify-end">
              <CheckCircle2 size={14} /> Live Sync Active
            </p>
          </div>
          <button 
            onClick={() => setShowForecast(false)}
            className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Package className="text-blue-600" size={24} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
              <ArrowUpRight size={12} /> +4.2%
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total SKU Count</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{MOCK_INVENTORY.length} Items</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-50 rounded-2xl">
              <AlertTriangle className="text-rose-600" size={24} />
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
              Action Required
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Low Stock Alerts</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{lowStockItems.length} SKUs</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 rounded-2xl">
              <TrendingUp className="text-amber-600" size={24} />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
              Seasonal Peak
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Predicted Demand</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">+18% Next Week</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 rounded-2xl">
              <Zap className="text-indigo-600" size={24} />
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
              AI Optimized
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Stock Efficiency</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">94.8%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventory List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-600" />
                Inventory Status
              </h3>
              <div className="relative">
                <ShoppingCart size={16} className="text-slate-400" />
              </div>
            </div>
            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
              {MOCK_INVENTORY.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedProduct(item);
                    setShowForecast(false);
                  }}
                  className={cn(
                    "w-full p-4 text-left transition-all hover:bg-slate-50 flex items-center gap-4 group",
                    selectedProduct.id === item.id ? "bg-blue-50/50 border-l-4 border-blue-600" : "border-l-4 border-transparent"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    item.currentStock < item.minThreshold ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
                  )}>
                    <Package size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                      {item.category} • {item.leadTime}d Lead
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-black",
                      item.currentStock < item.minThreshold ? "text-rose-600" : "text-slate-700"
                    )}>
                      {item.currentStock}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">In Stock</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {lowStockItems.length > 0 && (
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-black text-xl flex items-center gap-2">
                    <Zap size={24} className="text-blue-400" />
                    AI Reorder Hub
                  </h4>
                  <span className="text-[10px] font-bold bg-blue-600 px-2 py-1 rounded-lg uppercase tracking-widest">
                    {lowStockItems.length} Alerts
                  </span>
                </div>
                
                <div className="space-y-4 mb-8">
                  {lowStockItems.map(item => {
                    const suggestion = allReorderSuggestions.find(s => s.id === item.id);
                    if (!suggestion) return null;
                    
                    return (
                      <div key={item.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{item.name}</span>
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                            suggestion.urgency === 'High' ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
                          )}>
                            {suggestion.urgency}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                          <div className="flex items-center gap-1">
                            <ShoppingCart size={10} />
                            Order: <span className="text-white font-bold">{suggestion.suggestedQuantity} {item.unit}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={10} />
                            Date: <span className="text-white font-bold">{format(suggestion.suggestedReorderDate, 'MMM dd')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95">
                  Execute AI Reorder Plan <ArrowRight size={18} />
                </button>
                <p className="text-center text-[10px] text-slate-500 mt-4 font-medium">
                  Plan factors in {selectedProduct.leadTime}d lead times & seasonal demand
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Analysis & Forecasting */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{selectedProduct.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-slate-500 font-medium">{selectedProduct.category}</p>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    <Clock size={12} /> {selectedProduct.leadTime} Days Lead
                  </div>
                </div>
              </div>
              {!showForecast && (
                <button 
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                  className="px-6 py-3 bg-[#0F172A] text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} className="text-blue-400" />}
                  {isAnalyzing ? 'Analyzing Trends...' : 'Run AI Forecast'}
                </button>
              )}
            </div>

            {showForecast ? (
              <div className="space-y-8 animate-in zoom-in-95 duration-500">
                {/* Forecast Chart */}
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-600" />
                        <span className="text-xs font-bold text-slate-600">Projected Stock</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-xs font-bold text-slate-600">Predicted Sales</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-widest">
                      <Zap size={12} /> AI Prediction Model v2.4
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecastData}>
                        <defs>
                          <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                        <Tooltip 
                          contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                        />
                        <Area type="monotone" dataKey="projectedStock" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorStock)" />
                        <Line type="monotone" dataKey="predictedSales" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* AI Insights & Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-600 rounded-3xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <ShoppingCart size={60} />
                    </div>
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Zap size={20} />
                      Smart Reorder Suggestion
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <span className="text-sm opacity-80">Suggested Date</span>
                        <span className="font-bold">{format(reorderSuggestion.suggestedReorderDate, 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <span className="text-sm opacity-80">Suggested Quantity</span>
                        <span className="font-bold">{reorderSuggestion.suggestedQuantity} {selectedProduct.unit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm opacity-80">Estimated Cost</span>
                        <span className="font-bold">£{(reorderSuggestion.suggestedQuantity * selectedProduct.price).toFixed(2)}</span>
                      </div>
                    </div>
                    <button className="w-full mt-6 py-3 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors">
                      Approve Reorder
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <TrendingUp size={20} className="text-blue-600" />
                      Demand Analysis
                    </h4>
                    <div className="space-y-4">
                      <div className="p-3 bg-white rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Stockout Risk</span>
                          <span className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-full",
                            reorderSuggestion.urgency === 'High' ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                          )}>
                            {reorderSuggestion.urgency}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-800">Predicted stockout in {reorderSuggestion.daysUntilStockout} days</p>
                      </div>
                      
                      <div className="p-3 bg-white rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Market Trend</span>
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                            <ArrowUpRight size={12} /> Rising
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-800">Demand increasing by 12% MoM</p>
                      </div>

                      <div className="flex items-start gap-3 text-slate-500">
                        <Info size={16} className="shrink-0 mt-0.5" />
                        <p className="text-[10px] leading-relaxed">
                          Forecasting considers historical sales, local health trends, and current lead times from suppliers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Historical Chart */}
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <History size={16} className="text-slate-400" />
                      30-Day Sales History
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-400" />
                        <span className="text-xs font-bold text-slate-500">Historical Sales</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                        <Tooltip 
                          cursor={{fill: '#F1F5F9'}}
                          contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="sales" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="text-center py-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                  <TrendingUp size={48} className="text-slate-300 mx-auto mb-4" />
                  <h4 className="text-slate-800 font-bold mb-2">Ready for Predictive Analysis</h4>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                    Run the AI forecast to see predicted stock levels, demand trends, and automated reorder suggestions.
                  </p>
                  <button 
                    onClick={runAnalysis}
                    disabled={isAnalyzing}
                    className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2 mx-auto shadow-lg shadow-blue-100"
                  >
                    {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                    {isAnalyzing ? 'Analyzing...' : 'Generate Forecast'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
