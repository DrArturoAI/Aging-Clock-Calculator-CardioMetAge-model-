
import React, { useState, useMemo, useEffect } from 'react';
import { Biomarkers, CalculationResult, Insight } from './types';
import { FORMULA_COEFFICIENTS, INITIAL_BIOMARKERS, FIELD_LABELS } from './constants';
import { getHealthInsights } from './services/geminiService';
import { 
  Heart, 
  Activity, 
  ShieldCheck, 
  AlertCircle, 
  Info, 
  RefreshCcw, 
  BrainCircuit,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const App: React.FC = () => {
  const [biomarkers, setBiomarkers] = useState<Biomarkers>(INITIAL_BIOMARKERS);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const calculateResult = useMemo((): CalculationResult => {
    const { 
      age, hbA1c, rdw, sbp, dbp, creatinine, lymphocytePercent, 
      mcv, pulseRate, ua, crp, wc, bun 
    } = biomarkers;

    const pp = sbp - dbp;
    const c = FORMULA_COEFFICIENTS;

    // Formula Implementation
    // CardioMetAgePredict = 0.831320 × age + 19.5734 × log(HbA1c + 1) + 1.77394 × RDW + 0.0760217 × SBP 
    // + 6.18803 × creatinine - 0.148076 × lymphocyte_percent + 0.218946 × MCV + 0.105980 × pulse_rate 
    // + 0.0603608 × PP + 0.636711 × UA + 2.40001 × log(CRP + 1) + 0.0283277 × WC + 0.0754119 × BUN - 101.454

    const predictedAge = 
      (c.AGE * age) +
      (c.HBA1C_LOG * Math.log(hbA1c + 1)) +
      (c.RDW * rdw) +
      (c.SBP * sbp) +
      (c.CREATININE * creatinine) +
      (c.LYMPHOCYTE * lymphocytePercent) +
      (c.MCV * mcv) +
      (c.PULSE * pulseRate) +
      (c.PP * pp) +
      (c.UA * ua) +
      (c.CRP_LOG * Math.log(crp + 1)) +
      (c.WC * wc) +
      (c.BUN * bun) +
      c.INTERCEPT;

    const ageGap = predictedAge - age;
    
    let status: 'optimal' | 'average' | 'at-risk' = 'average';
    if (ageGap < -2) status = 'optimal';
    else if (ageGap > 2) status = 'at-risk';

    return {
      chronologicalAge: age,
      predictedAge,
      ageGap,
      status
    };
  }, [biomarkers]);

  const handleInputChange = (key: keyof Biomarkers, value: string) => {
    const numValue = parseFloat(value) || 0;
    setBiomarkers(prev => ({ ...prev, [key]: numValue }));
    setInsight(null); // Reset insight when inputs change
  };

  const generateAIInsight = async () => {
    setLoadingInsight(true);
    try {
      const newInsight = await getHealthInsights(biomarkers, calculateResult);
      setInsight(newInsight);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsight(false);
    }
  };

  const chartData = [
    { name: 'Chronological', age: calculateResult.chronologicalAge, fill: '#6366f1' },
    { name: 'CardioMetAge', age: parseFloat(calculateResult.predictedAge.toFixed(1)), fill: calculateResult.status === 'optimal' ? '#22c55e' : (calculateResult.status === 'at-risk' ? '#ef4444' : '#eab308') }
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-indigo-600 text-white py-8 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">CardioMetAge Clock</h1>
              <p className="text-indigo-100 text-sm">Biomarker-based Aging Predictor</p>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-xs uppercase tracking-wider text-indigo-200">Scientific Methodology</p>
            <p className="text-sm font-medium">NHANES Cardiometabolic Score</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Primary Biomarkers
              </h2>
              <button 
                onClick={() => setBiomarkers(INITIAL_BIOMARKERS)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
              >
                <RefreshCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {(['age', 'hbA1c', 'creatinine', 'lymphocytePercent', 'bun', 'rdw', 'pulseRate', 'sbp'] as Array<keyof Biomarkers>).map((key) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      {FIELD_LABELS[key].label}
                      <span className="text-xs text-slate-400 font-normal">({FIELD_LABELS[key].unit})</span>
                    </label>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-slate-300 cursor-help" />
                      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl z-50">
                        {FIELD_LABELS[key].description}
                      </div>
                    </div>
                  </div>
                  <input 
                    type="number" 
                    step="0.01"
                    value={biomarkers[key]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
              ))}

              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full py-2 text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center justify-center gap-1 border-t border-slate-100 pt-4"
              >
                {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                {showAdvanced ? 'Hide' : 'Show'} Advanced Biomarkers
              </button>

              {showAdvanced && (
                <div className="space-y-5 pt-2 animate-in fade-in duration-300">
                  {(['dbp', 'mcv', 'ua', 'crp', 'wc'] as Array<keyof Biomarkers>).map((key) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                          {FIELD_LABELS[key].label}
                          <span className="text-xs text-slate-400 font-normal">({FIELD_LABELS[key].unit})</span>
                        </label>
                      </div>
                      <input 
                        type="number" 
                        step="0.01"
                        value={biomarkers[key]}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Side: Results & AI */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Main Scorecard */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4 text-center md:text-left">
                <h2 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Your Predicted Health Age</h2>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <span className="text-6xl font-black text-slate-900">{calculateResult.predictedAge.toFixed(1)}</span>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    calculateResult.status === 'optimal' ? 'bg-green-100 text-green-700' :
                    calculateResult.status === 'at-risk' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {calculateResult.status}
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Your cardiometabolic clock suggests your body is functioning like that of a 
                  <span className="font-bold text-slate-900"> {calculateResult.predictedAge.toFixed(1)}-year-old</span>.
                  This is <span className={`font-bold ${calculateResult.ageGap > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {Math.abs(calculateResult.ageGap).toFixed(1)} years {calculateResult.ageGap > 0 ? 'older' : 'younger'}
                  </span> than your chronological age.
                </p>
              </div>

              <div className="w-full md:w-64 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis hide domain={[0, 'auto']} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="age" radius={[10, 10, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* AI Insights Section */}
          <section className="bg-indigo-50 rounded-2xl border border-indigo-100 overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-6 h-6 text-indigo-600" />
                <h2 className="text-lg font-bold text-indigo-900">AI Health Analysis</h2>
              </div>
              <button 
                onClick={generateAIInsight}
                disabled={loadingInsight}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
              >
                {loadingInsight ? 'Analyzing...' : (insight ? 'Re-Analyze' : 'Generate Insight')}
              </button>
            </div>

            <div className="p-6 min-h-[200px] flex flex-col justify-center">
              {!insight && !loadingInsight && (
                <div className="text-center space-y-3">
                  <div className="inline-block p-4 bg-white rounded-full">
                    <Activity className="w-10 h-10 text-indigo-200" />
                  </div>
                  <p className="text-indigo-600/70 text-sm max-w-sm mx-auto">
                    Click "Generate Insight" to receive a personalized analysis of your cardiometabolic biomarkers and specific improvement steps.
                  </p>
                </div>
              )}

              {loadingInsight && (
                <div className="space-y-6 animate-pulse">
                  <div className="h-4 bg-indigo-200 rounded w-3/4"></div>
                  <div className="h-4 bg-indigo-200 rounded w-1/2"></div>
                  <div className="space-y-2 pt-4">
                    <div className="h-3 bg-indigo-200 rounded"></div>
                    <div className="h-3 bg-indigo-200 rounded"></div>
                    <div className="h-3 bg-indigo-200 rounded"></div>
                  </div>
                </div>
              )}

              {insight && !loadingInsight && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-widest mb-2">Summary</h3>
                    <p className="text-indigo-800 leading-relaxed text-sm">{insight.summary}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                      <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {insight.recommendations.map((rec, i) => (
                          <li key={i} className="text-xs text-indigo-800 leading-tight flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                      <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Risk Analysis
                      </h3>
                      <p className="text-xs text-indigo-800 leading-normal italic">
                        {insight.riskAnalysis}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Educational Note */}
          <footer className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500" />
              Medical Disclaimer
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              The CardioMetAge score is an estimate based on clinical research data (NHANES) linking specific biomarkers to morbidity and early mortality risk. It is not a diagnostic tool and does not constitute medical advice. Biomarker values should always be interpreted by a qualified medical professional within the context of your overall medical history.
            </p>
          </footer>
        </div>
      </main>

      {/* Sticky Quick Access */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 md:hidden flex justify-between items-center shadow-2xl">
         <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Score:</span>
            <span className="text-lg font-black text-indigo-600">{calculateResult.predictedAge.toFixed(1)}</span>
         </div>
         <button 
           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-full"
         >
           Update Labs
         </button>
      </div>
    </div>
  );
};

export default App;
