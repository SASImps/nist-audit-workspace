import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard,
  ClipboardList,
  AlertCircle,
  BookOpen,
  Home,
  ChevronRight,
  Info,
  CheckCircle2,
  Download,
  Search,
  Wrench,
  Building2,
  User as UserIcon,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { cn } from './lib/utils';
import { 
  AssessmentItem, 
  OrganizationInfo, 
  MATURITY_SCALE, 
  FUNCTION_COLORS, 
  FUNCTION_TEXT_COLORS 
} from './types';
import { NIST_CSF_2_0_DATA } from './constants/nistData';
import { Walkthrough } from './components/Walkthrough';

type Tab = 'cover' | 'assessment' | 'dashboard' | 'gap-analysis' | 'reference';

const STORAGE_KEY_ITEMS = 'nist-csf-2-0-items';
const STORAGE_KEY_INFO = 'nist-csf-2-0-info';
const STORAGE_KEY_WALKTHROUGH = 'nist-csf-2-0-walkthrough-complete';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('cover');
  const [showWalkthrough, setShowWalkthrough] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_WALKTHROUGH) !== 'true';
  });
  
  // Initialize organization info
  const [orgInfo, setOrgInfo] = useState<OrganizationInfo>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_INFO);
    return saved ? JSON.parse(saved) : {
      name: '',
      analyst: '',
      date: new Date().toISOString().split('T')[0],
      period: 'Annual Review 2024',
      version: 'NIST CSF 2.0',
      targetMaturity: 3
    };
  });

  // Initialize assessment items
  const [items, setItems] = useState<AssessmentItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (saved) return JSON.parse(saved);
    
    return NIST_CSF_2_0_DATA.map(d => ({
      ...d,
      currentScore: 1,
      targetScore: 3,
      notes: '',
      remediation: ''
    }));
  });

  // Persist data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INFO, JSON.stringify(orgInfo));
  }, [orgInfo]);

  // Calculations
  const stats = useMemo(() => {
    const functions = ['GOVERN', 'IDENTIFY', 'PROTECT', 'DETECT', 'RESPOND', 'RECOVER'] as const;
    
    const functionAverages = functions.map(f => {
      const fItems = items.filter(item => item.function === f);
      const currentAvg = fItems.reduce((acc, curr) => acc + curr.currentScore, 0) / fItems.length;
      const targetAvg = fItems.reduce((acc, curr) => acc + curr.targetScore, 0) / fItems.length;
      return { 
        name: f, 
        current: parseFloat(currentAvg.toFixed(1)), 
        target: parseFloat(targetAvg.toFixed(1)) 
      };
    });

    const overallCurrent = items.reduce((acc, curr) => acc + curr.currentScore, 0) / items.length;
    const overallTarget = items.reduce((acc, curr) => acc + curr.targetScore, 0) / items.length;
    const meanGap = items.reduce((acc, curr) => acc + (curr.targetScore - curr.currentScore), 0) / items.length;

    const findMaturityLabel = (score: number) => {
      const rounded = Math.round(score);
      const scale = MATURITY_SCALE.find(s => s.value === rounded);
      return scale ? `${scale.label} — ${scale.description.split('.')[0]}` : 'Unknown';
    };

    return { 
      functionAverages, 
      overallCurrent: parseFloat(overallCurrent.toFixed(1)),
      overallTarget: parseFloat(overallTarget.toFixed(1)),
      meanGap: parseFloat(meanGap.toFixed(1)),
      maturityLabel: findMaturityLabel(overallCurrent)
    };
  }, [items]);

  const gaps = useMemo(() => {
    return items.filter(item => item.currentScore < item.targetScore);
  }, [items]);

  const updateItem = (id: string, updates: Partial<AssessmentItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const navTabs = [
    { id: 'cover', label: 'Cover', icon: <Home size={18} /> },
    { id: 'assessment', label: 'Assessment', icon: <ClipboardList size={18} /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'gap-analysis', label: 'Gap Analysis', icon: <AlertCircle size={18} /> },
    { id: 'reference', label: 'Reference Guide', icon: <BookOpen size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0A192F] text-white font-sans selection:bg-sky-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full h-16 bg-[#0E2238] border-b border-sky-900/50 flex items-center justify-between px-8 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 rounded-lg border border-sky-500/20">
            <ShieldCheck className="text-sky-400" size={24} />
          </div>
          <span className="font-bold tracking-tight text-sky-50 hidden sm:block">NIST CSF 2.0 Auditor</span>
        </div>

        <div className="flex bg-[#0A192F] p-1 rounded-xl border border-sky-900/50">
          {navTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300",
                activeTab === tab.id 
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" 
                  : "text-slate-400 hover:text-sky-300"
              )}
            >
              {tab.icon}
              <span className="hidden md:block">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowWalkthrough(true)}
            className="p-2 text-slate-400 hover:text-sky-300 transition-colors flex items-center gap-2 group"
            title="Interactive Guide"
          >
            <Info size={20} className="group-hover:animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:block text-sky-500/50 group-hover:text-sky-400">Guide</span>
          </button>

          <button 
            onClick={() => {
              const data = JSON.stringify({ items, orgInfo }, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `nist-assessment-${orgInfo.name || 'export'}.json`;
              a.click();
            }}
            className="p-2 text-slate-400 hover:text-sky-300 transition-colors"
          >
            <Download size={20} />
          </button>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {/* TAB 1: COVER */}
          {activeTab === 'cover' && (
            <motion.div 
              key="cover"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="text-center py-12 space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-500 animate-pulse">Official Template 2024</h2>
                <h1 className="text-4xl md:text-6xl font-black text-[#F0F9FF] leading-tight max-w-4xl mx-auto">
                  NIST CSF 2.0 Cybersecurity <br />
                  <span className="text-sky-400 font-outline-2">Self-Assessment Template</span>
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-sm font-medium leading-relaxed">
                  A high-integrity framework for measuring, communicating, and improving cybersecurity governance and operations according to the latest NIST standards.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Organization Details Form */}
                <div className="bg-[#0E2238] p-8 rounded-[2rem] border border-sky-900/50 space-y-6 shadow-2xl">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <Building2 size={20} className="text-sky-400" />
                    Assessment Metadata
                  </h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-sky-500/70 uppercase tracking-widest pl-1">Organization Name</label>
                      <input 
                        type="text"
                        value={orgInfo.name}
                        onChange={e => setOrgInfo({...orgInfo, name: e.target.value})}
                        placeholder="e.g. Acme Corp Infrastructure"
                        className="w-full bg-[#0A192F] border border-sky-900/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-medium text-sky-50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-sky-500/70 uppercase tracking-widest pl-1">Lead Analyst</label>
                        <div className="relative">
                          <UserIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500/50" />
                          <input 
                            type="text"
                            value={orgInfo.analyst}
                            onChange={e => setOrgInfo({...orgInfo, analyst: e.target.value})}
                            placeholder="Full Name"
                            className="w-full bg-[#0A192F] border border-sky-900/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-medium"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-sky-500/70 uppercase tracking-widest pl-1">Assessment Date</label>
                        <div className="relative">
                          <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500/50" />
                          <input 
                            type="date"
                            value={orgInfo.date}
                            onChange={e => setOrgInfo({...orgInfo, date: e.target.value})}
                            className="w-full bg-[#0A192F] border border-sky-900/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-medium"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-sky-500/70 uppercase tracking-widest pl-1">Assessment Period</label>
                        <input 
                          type="text"
                          value={orgInfo.period}
                          onChange={e => setOrgInfo({...orgInfo, period: e.target.value})}
                          placeholder="e.g. Q3 2024"
                          className="w-full bg-[#0A192F] border border-sky-900/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-sky-500/70 uppercase tracking-widest pl-1">Framework Version</label>
                        <input 
                          type="text"
                          readOnly
                          value={orgInfo.version}
                          className="w-full bg-[#0A192F]/50 border border-sky-900/50 rounded-xl px-4 py-3 text-sm font-medium text-sky-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-sky-500/70 uppercase tracking-widest pl-1">Target Maturity Level</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(level => (
                          <button
                            key={level}
                            onClick={() => setOrgInfo({...orgInfo, targetMaturity: level})}
                            className={cn(
                              "flex-1 py-3 rounded-xl text-xs font-bold transition-all border",
                              orgInfo.targetMaturity === level 
                                ? "bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/30 scale-105" 
                                : "bg-[#0A192F] border-sky-900/30 text-sky-900 hover:border-sky-700 hover:text-sky-500"
                            )}
                          >
                            Level {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <button 
                      onClick={() => setActiveTab('assessment')}
                      className="w-full py-4 bg-sky-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-sky-400 transition-all active:scale-95 shadow-xl shadow-sky-500/20"
                    >
                      Start Assessment <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-sky-100">
                    <Layers size={20} className="text-sky-400" />
                    Maturity Scale Legend
                  </h3>
                  <div className="space-y-4">
                    {MATURITY_SCALE.map(scale => (
                      <div key={scale.value} className="bg-[#0E2238] p-5 rounded-2xl border border-sky-900/30 flex gap-4 transition-all hover:border-sky-500/50 group">
                        <div 
                          className="h-12 w-12 rounded-xl flex items-center justify-center text-white text-lg font-black shrink-0 shadow-lg group-hover:scale-110 transition-transform" 
                          style={{ backgroundColor: scale.color }}
                        >
                          {scale.value}
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="font-bold text-sky-50 tracking-tight">{scale.label}</p>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">{scale.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Bar Flow */}
              <div className="flex flex-col items-center gap-6 py-8">
                <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-6 text-2xl font-bold">
                   <div className="text-sky-500">Cover</div>
                   <ChevronRight className="text-sky-900" />
                   <div className="text-sky-900 opacity-50">Assessment</div>
                   <ChevronRight className="text-sky-900" />
                   <div className="text-sky-900 opacity-50">Dashboard</div>
                   <ChevronRight className="text-sky-900" />
                   <div className="text-sky-900 opacity-50">Gap Analysis</div>
                   <ChevronRight className="text-sky-900" />
                   <div className="text-sky-900 opacity-50">Reference</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ASSESSMENT */}
          {activeTab === 'assessment' && (
            <motion.div 
              key="assessment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">Security Control Assessment</h1>
                  <p className="text-xs font-medium text-slate-400 mt-1">Populate maturity scores for each of the 62 NIST CSF 2.0 subcategories.</p>
                </div>
                <div className="flex gap-4">
                  <div className="px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">{orgInfo.name || "Default Entity"}</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-[2rem] border border-sky-900/50 shadow-2xl">
                <table className="w-full text-left border-collapse bg-[#0E2238]">
                  <thead className="bg-[#0A192F]">
                    <tr>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-sky-400/70 border-b border-sky-900/50">Function</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-sky-400/70 border-b border-sky-900/50">Category</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-sky-400/70 border-b border-sky-900/50">Sub-ID</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-sky-400/70 border-b border-sky-900/50 text-center">Score (1-5)</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-sky-400/70 border-b border-sky-900/50 text-center">Target</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-sky-400/70 border-b border-sky-900/50 text-center">Gap</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-sky-400/70 border-b border-sky-900/50">Notes / Evidence</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-sky-400/70 border-b border-sky-900/50">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-900/30">
                    {items.map(item => (
                      <tr key={item.id} className="hover:bg-sky-500/5 transition-all group">
                        <td className="p-4 whitespace-nowrap">
                          <span className={cn(
                            "text-[10px] font-black px-2.5 py-1 rounded-md text-white uppercase tracking-tighter",
                            FUNCTION_COLORS[item.function]
                          )}>
                            {item.function}
                          </span>
                        </td>
                        <td className="p-4 min-w-[150px]">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight leading-tight">{item.category}</p>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-xs font-black text-sky-400">{item.id}</span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center">
                            <input 
                              type="number" 
                              min="1" 
                              max="5"
                              value={item.currentScore}
                              onChange={e => {
                                const val = parseInt(e.target.value);
                                if (val >= 1 && val <= 5) updateItem(item.id, { currentScore: val });
                              }}
                              className={cn(
                                "w-12 h-10 bg-[#0A192F] border border-sky-900/50 rounded-xl text-center font-black text-lg outline-none focus:ring-2 focus:ring-sky-500/50 transition-all",
                                item.currentScore < 2 ? "text-red-500 bg-red-500/5 border-red-900/50" : 
                                item.currentScore < 4 ? "text-amber-500 bg-amber-500/5 border-amber-900/50" : "text-emerald-500 bg-emerald-500/5 border-emerald-900/50"
                              )}
                            />
                          </div>
                        </td>
                        <td className="p-4 text-center">
                           <div className="flex justify-center">
                            <input 
                              type="number" 
                              min="1" 
                              max="5"
                              value={item.targetScore}
                              onChange={e => {
                                const val = parseInt(e.target.value);
                                if (val >= 1 && val <= 5) updateItem(item.id, { targetScore: val });
                              }}
                              className="w-12 h-10 bg-sky-900/20 border border-sky-900/50 rounded-xl text-center font-black text-lg text-sky-200 outline-none"
                            />
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={cn(
                            "font-black text-lg",
                            item.targetScore - item.currentScore > 0 ? "text-rose-500" : "text-sky-500/30"
                          )}>
                            {item.targetScore - item.currentScore}
                          </span>
                        </td>
                        <td className="p-4 min-w-[250px]">
                          <textarea 
                            value={item.notes}
                            onChange={e => updateItem(item.id, { notes: e.target.value })}
                            placeholder="Add evidence..."
                            className="w-full bg-transparent border border-transparent focus:bg-[#0A192F] focus:border-sky-900/50 rounded-lg p-2 text-xs font-medium text-slate-300 transition-all resize-none outline-none h-10 hover:border-sky-900/30"
                          />
                        </td>
                        <td className="p-4 min-w-[250px]">
                           <textarea 
                            value={item.remediation}
                            onChange={e => updateItem(item.id, { remediation: e.target.value })}
                            placeholder="Recommended action..."
                            className="w-full bg-transparent border border-transparent focus:bg-[#0A192F] focus:border-sky-900/50 rounded-lg p-2 text-xs font-medium text-slate-300 transition-all resize-none outline-none h-10 hover:border-sky-900/30"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Totals Row */}
                  <tfoot className="bg-[#0A192F] border-t border-sky-900/50">
                    <tr>
                      <td colSpan={3} className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Workbook Averages</td>
                      <td className="p-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-black text-white leading-none">{stats.overallCurrent}</span>
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter mt-1">Current Score</span>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-black text-sky-400 leading-none">{stats.overallTarget}</span>
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter mt-1">Target Score</span>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-black text-rose-500 leading-none">{stats.meanGap}</span>
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter mt-1">Mean Gap</span>
                        </div>
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 3: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.functionAverages.map(f => (
                  <div key={f.name} className="bg-[#0E2238] p-6 rounded-3xl border border-sky-900/50 shadow-xl group hover:border-sky-500/50 transition-all">
                    <p className={cn("text-[9px] font-black uppercase tracking-[0.2em] mb-4", FUNCTION_TEXT_COLORS[f.name as keyof typeof FUNCTION_TEXT_COLORS])}>{f.name}</p>
                    <div className="flex items-baseline gap-1">
                      <h4 className="text-3xl font-black text-white">{f.current}</h4>
                      <span className="text-[10px] font-bold text-slate-500 tracking-tighter uppercase">/ 5.0</span>
                    </div>
                    <div className="mt-4 h-1 w-full bg-[#0A192F] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(f.current / 5) * 100}%` }}
                        className={cn("h-full transition-all duration-1000", FUNCTION_COLORS[f.name as keyof typeof FUNCTION_COLORS])}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2.5">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Target: {f.target}</span>
                      <span className="text-[8px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">{(f.current/f.target*100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Overall Maturity Card */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-[#0E2238] p-10 rounded-[2.5rem] border border-sky-900/50 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                      <ShieldCheck size={200} />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500/70 mb-8">Overall Maturity Rating</h3>
                    <div className="flex items-baseline gap-3 relative z-10">
                      <h2 className="text-7xl font-black text-white tracking-tighter shadow-sky-500/20">{stats.overallCurrent}</h2>
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-sky-400">/ 5.0</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Composite Score</span>
                      </div>
                    </div>
                    <div className="mt-10 p-5 bg-[#0A192F] border border-sky-900/50 rounded-2xl relative z-10">
                      <p className="text-xs font-bold text-sky-200 leading-relaxed italic">
                        "{stats.maturityLabel}"
                      </p>
                    </div>
                    <div className="mt-8 flex items-center gap-4 relative z-10">
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                          <span>Progress to Target</span>
                          <span className="text-sky-400">{(stats.overallCurrent / stats.overallTarget * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-[#0A192F] rounded-full overflow-hidden border border-sky-900/30">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(stats.overallCurrent / stats.overallTarget) * 100}%` }}
                            className="h-full bg-gradient-to-r from-sky-600 to-sky-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0E2238] p-8 rounded-[2rem] border border-sky-900/50 shadow-xl">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 font-mono">Assessor Notes</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      The radar chart to the right illustrates the delta between current operating reality and the target posture defined in the assessment metadata. Key functions requiring immediate focus are visualized by acute indentations in the "Current" series.
                    </p>
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="lg:col-span-2 bg-[#0E2238] p-10 rounded-[2.5rem] border border-sky-900/50 shadow-2xl">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500/70">Maturity Radar Comparison</h3>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Current</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-[450px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.functionAverages}>
                        <PolarGrid stroke="#1e293b" />
                        <PolarAngleAxis 
                          dataKey="name" 
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'black', letterSpacing: '0.1em' }} 
                        />
                        <PolarRadiusAxis 
                          angle={30} 
                          domain={[0, 5]} 
                          tick={false}
                          axisLine={false}
                        />
                        <Radar
                          name="Current"
                          dataKey="current"
                          stroke="#0ea5e9"
                          strokeWidth={3}
                          fill="#0ea5e9"
                          fillOpacity={0.15}
                        />
                        <Radar
                          name="Target"
                          dataKey="target"
                          stroke="#f43f5e"
                          strokeWidth={3}
                          fill="#f43f5e"
                          fillOpacity={0.05}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0E2238', border: '1px solid #1e40af', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: GAP ANALYSIS */}
          {activeTab === 'gap-analysis' && (
            <motion.div 
              key="gap-analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-rose-50 tracking-tight">Remediation Roadmap</h1>
                  <p className="text-xs font-medium text-slate-400 mt-1">Auto-generated list of all 1-to-1 gaps between current scores and target baseline.</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                  <div className="h-10 w-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg"><AlertCircle size={20} /></div>
                  <div className="pr-4">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Active Gaps</p>
                    <p className="text-lg font-black text-rose-50 leading-none">{gaps.length} Items</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {gaps.length === 0 ? (
                  <div className="bg-[#0E2238] border-2 border-dashed border-sky-900/30 rounded-[3rem] py-32 text-center">
                    <div className="h-20 w-20 bg-sky-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-sky-500 border border-sky-500/20 animate-bounce">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-xl font-black text-sky-50">Zero Priority Gaps</h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">All cybersecurity controls are meeting or exceeding the defined target maturity levels.</p>
                  </div>
                ) : (
                  <div className="bg-[#0E2238] rounded-[2rem] border border-sky-900/50 overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#0A192F]">
                        <tr>
                          <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Function</th>
                          <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Sub-ID</th>
                          <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Current</th>
                          <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Target</th>
                          <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Gap</th>
                          <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Recommended Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sky-900/30">
                        {gaps.map(gap => (
                          <tr key={`gap-${gap.id}`} className="hover:bg-rose-500/5 transition-all">
                            <td className="p-5">
                               <span className={cn(
                                "text-[10px] font-black px-2.5 py-1 rounded-md text-white uppercase tracking-tighter",
                                FUNCTION_COLORS[gap.function]
                              )}>
                                {gap.function}
                              </span>
                            </td>
                            <td className="p-5">
                              <span className="font-mono text-xs font-black text-rose-400">{gap.id}</span>
                            </td>
                            <td className="p-5 text-center">
                              <span className="text-base font-black text-slate-200">{gap.currentScore}</span>
                            </td>
                            <td className="p-5 text-center">
                              <span className="text-base font-black text-sky-400">{gap.targetScore}</span>
                            </td>
                            <td className="p-5 text-center">
                              <div className="inline-flex items-center justify-center h-8 w-8 bg-rose-500/20 text-rose-500 rounded-lg font-black">{gap.targetScore - gap.currentScore}</div>
                            </td>
                            <td className="p-5">
                              <div className="flex flex-col gap-2">
                                <p className="text-xs font-bold text-slate-100">{gap.title}</p>
                                <textarea 
                                  value={gap.remediation}
                                  onChange={e => updateItem(gap.id, { remediation: e.target.value })}
                                  placeholder="Define remediation steps..."
                                  className="w-full bg-[#0A192F] border border-sky-900/50 rounded-xl p-3 text-xs font-medium text-sky-50 shadow-inner h-20 resize-none outline-none focus:ring-2 focus:ring-rose-500/30"
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 5: REFERENCE GUIDE */}
          {activeTab === 'reference' && (
            <motion.div 
              key="reference"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">NIST CSF 2.0 Reference Guide</h1>
                  <p className="text-xs font-medium text-slate-400 mt-1">Full authoritative descriptions for all 62 subcategories released February 2024.</p>
                </div>
                <div className="relative w-full sm:w-80">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500/50" />
                  <input 
                    type="text" 
                    placeholder="Search controls..." 
                    className="w-full bg-[#0E2238] border border-sky-900/50 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-white outline-none focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-slate-600 shadow-xl"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {NIST_CSF_2_0_DATA.map(control => (
                  <div key={`ref-${control.id}`} className="bg-[#0E2238] p-8 rounded-[2rem] border border-sky-900/50 flex flex-col hover:border-sky-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-6">
                       <span className={cn(
                        "text-[10px] font-black px-2.5 py-1 rounded-md text-white uppercase tracking-tighter",
                        FUNCTION_COLORS[control.function]
                      )}>
                        {control.function}
                      </span>
                      <span className="font-mono text-xs font-black text-sky-400/50 group-hover:text-sky-400 transition-colors">{control.id}</span>
                    </div>
                    <h4 className="text-sm font-black text-sky-50 mb-4 h-10 overflow-hidden leading-tight uppercase tracking-tight">{control.title}</h4>
                    <div className="flex-1 p-5 bg-[#0A192F]/50 rounded-2xl border border-sky-900/30">
                      <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic">
                        "{control.description}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Walkthrough */}
      <AnimatePresence>
        {showWalkthrough && (
          <Walkthrough 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onComplete={() => {
              setShowWalkthrough(false);
              localStorage.setItem(STORAGE_KEY_WALKTHROUGH, 'true');
            }}
          />
        )}
      </AnimatePresence>

      {/* Persistence Floating Status */}
      <div className="fixed bottom-6 right-6 hidden sm:flex items-center gap-3 px-4 py-2 bg-[#0E2238] border border-sky-900/50 rounded-full shadow-2xl z-50">
        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Autosave Active • Local Protocol</span>
      </div>
    </div>
  );
}
