import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard,
  ClipboardList,
  AlertCircle,
  FileSpreadsheet,
  ChevronRight,
  Info,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
  RotateCcw,
  Search,
  Filter,
  MoreVertical,
  Plus,
  X,
  Upload,
  ShieldAlert,
  Database,
  FileJson,
  Trash2,
  FileText,
  LogOut,
  LogIn,
  Cloud,
  Loader2,
  Wrench
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer
} from 'recharts';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { cn } from './lib/utils';
import { Control, INITIAL_CONTROLS, MATURITY_SCALE } from './types';
import { useAuth } from './components/FirebaseProvider';
import { auth, db } from './lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

type Tab = 'dashboard' | 'assessment' | 'remediation' | 'mapping' | 'governance';

const STORAGE_KEY = 'nist-csf-v1';

export default function App() {
  const { user, signIn, logout, loading: authLoading } = useAuth();
  const [controls, setControls] = useState<Control[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CONTROLS;
  });
  
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [analystName, setAnalystName] = useState(user?.displayName || 'Analyst');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [cloudAssessments, setCloudAssessments] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    if (user && analystName === 'Analyst') {
      setAnalystName(user.displayName || 'Analyst');
    }
  }, [user]);
  const [newControl, setNewControl] = useState<Partial<Control>>({
    id: '',
    category: 'GOVERN',
    requirement: '',
    evidence: '',
    remediation: '',
    mapping: { iso27001: '', gdpr: '', essential8: '' },
    score: 0,
    status: 'Incomplete',
    notes: ''
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(controls));
  }, [controls]);

  const stats = useMemo(() => {
    const avgScore = controls.reduce((acc, c) => acc + c.score, 0) / controls.length;
    const completedCount = controls.filter(c => c.status === 'Complete').length;
    const highRiskCount = controls.filter(c => c.score < 2).length;
    
    const categories = Array.from(new Set(controls.map(c => c.category)));
    const radarData = categories.map(cat => {
      const catControls = controls.filter(c => c.category === cat);
      const avg = catControls.reduce((acc, c) => acc + c.score, 0) / catControls.length;
      return { category: cat, score: parseFloat(avg.toFixed(1)), fullMark: 5 };
    });

    return { avgScore, completedCount, highRiskCount, radarData };
  }, [controls]);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);

  const filteredControls = useMemo(() => {
    return controls.filter(c => {
      const matchesSearch = c.requirement.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [controls, searchQuery, selectedCategory]);

  const categories = ['ALL', 'GOVERN', 'IDENTIFY', 'PROTECT', 'DETECT', 'RESPOND', 'RECOVER'];

  const updateControl = (id: string, updates: Partial<Control>) => {
    setControls(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleAddControl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newControl.id || !newControl.requirement) return;
    
    const controlToAdd: Control = {
      id: newControl.id!,
      category: newControl.category!,
      requirement: newControl.requirement!,
      evidence: newControl.evidence || 'No evidence provided',
      remediation: newControl.remediation || 'Pending remediation strategy',
      mapping: {
        iso27001: newControl.mapping?.iso27001 || 'N/A',
        gdpr: newControl.mapping?.gdpr || 'N/A',
        essential8: newControl.mapping?.essential8 || 'N/A',
      },
      score: newControl.score || 0,
      status: (newControl.score === 5 ? 'Complete' : newControl.score === 0 ? 'Incomplete' : 'In Progress') as any,
      notes: newControl.notes || ''
    };

    setControls(prev => [...prev, controlToAdd]);
    setIsAddModalOpen(false);
    setNewControl({
      id: '',
      category: 'GOVERN',
      requirement: '',
      evidence: '',
      remediation: '',
      mapping: { iso27001: '', gdpr: '', essential8: '' },
      score: 0,
      status: 'Incomplete',
      notes: ''
    });
  };

  const resetData = () => {
    if (confirm('Reset all assessment data?')) {
      setControls(INITIAL_CONTROLS);
    }
  };

  const exportToFile = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(controls.map(c => ({
      ID: c.id, 
      Category: c.category, 
      Requirement: c.requirement, 
      Evidence: c.evidence, 
      Score: c.score, 
      Status: c.status
    }))), "Assessment Data");
    
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `NIST_Audit_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportJSON = () => {
    const data = {
      version: '2.0',
      analyst: analystName,
      timestamp: new Date().toISOString(),
      controls: controls
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `NIST_CSF_Evidence_${new Date().toISOString().split('T')[0]}.json`);
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.controls && Array.isArray(data.controls)) {
          if (confirm('Importing this file will overwrite current session data. Proceed?')) {
            setControls(data.controls);
            if (data.analyst) setAnalystName(data.analyst);
            alert('Evidence artifacts successfully loaded.');
          }
        } else {
          alert('Invalid file format. Please provide a valid NIST Auditor JSON snapshot.');
        }
      } catch (err) {
        alert('Failed to parse the file. Ensure it is a valid JSON document.');
      }
    };
    reader.readAsText(file);
  };

  const purgeAllData = () => {
    if (confirm('CRITICAL: This will permanently delete all local assessment data, satisfying Right to Erasure (GDPR Art. 17). This action is irreversible. Proceed?')) {
      localStorage.removeItem(STORAGE_KEY);
      setControls(INITIAL_CONTROLS);
      setActiveTab('dashboard');
    }
  };

  const getScoreColor = (score: number) => {
    if (score === 0) return 'text-slate-400 bg-slate-50';
    if (score < 2) return 'text-rose-600 bg-rose-50';
    if (score < 4) return 'text-gold-600 bg-gold-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const syncToCloud = async () => {
    if (!user) return;
    setIsSyncing(true);
    const path = `users/${user.uid}/assessments`;
    try {
      await addDoc(collection(db, path), {
        analyst: analystName,
        timestamp: new Date().toISOString(),
        serverTime: serverTimestamp(),
        controls: controls,
        version: '2.0',
        userId: user.uid
      });
      setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      alert('Assessment successfully synced to Cloud Evidence Vault.');
      fetchCloudAssessments();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchCloudAssessments = async () => {
    if (!user) return;
    const path = `users/${user.uid}/assessments`;
    try {
      const q = query(collection(db, path), orderBy('serverTime', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCloudAssessments(docs);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  };

  const deleteFromCloud = async (id: string) => {
    if (!user || !confirm('Permanently delete this cloud snapshot?')) return;
    const path = `users/${user.uid}/assessments/${id}`;
    try {
      await deleteDoc(doc(db, path));
      fetchCloudAssessments();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const loadFromCloud = (assessment: any) => {
    if (confirm('Overwrite local data with this cloud snapshot?')) {
      setControls(assessment.controls);
      if (assessment.analyst) setAnalystName(assessment.analyst);
      setActiveTab('assessment');
    }
  };

  useEffect(() => {
    if (user && activeTab === 'governance') {
      fetchCloudAssessments();
    }
  }, [user, activeTab]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-brand-100 pb-20 lg:pb-0">
      {/* Sidebar Nav */}
      <nav className="fixed left-0 top-0 hidden h-full w-24 flex-col items-center border-r border-slate-200 bg-brand-700 py-10 lg:flex z-50">
        <div className="mb-14 flex h-14 w-14 items-center justify-center rounded-xl bg-white text-brand-700 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <ShieldCheck size={32} />
        </div>
        <div className="flex flex-col gap-8">
          <NavItem icon={<LayoutDashboard size={22} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="Summary" />
          <NavItem icon={<ClipboardList size={22} />} active={activeTab === 'assessment'} onClick={() => setActiveTab('assessment')} label="Audit" />
          <NavItem icon={<AlertCircle size={22} />} active={activeTab === 'remediation'} onClick={() => setActiveTab('remediation')} label="Gaps" />
          <NavItem icon={<ExternalLink size={22} />} active={activeTab === 'mapping'} onClick={() => setActiveTab('mapping')} label="Align" />
          <NavItem icon={<Database size={22} />} active={activeTab === 'governance'} onClick={() => setActiveTab('governance')} label="Vault" />
        </div>
        <div className="mt-auto flex flex-col gap-6">
          <button onClick={resetData} title="Reset Data" className="p-3 text-brand-300 hover:text-white transition-colors"><RotateCcw size={20} /></button>
          <button onClick={exportToFile} title="Export Excel" className="h-12 w-12 flex items-center justify-center rounded-xl bg-gold-500 text-white hover:bg-gold-600 transition-all shadow-lg shadow-gold-500/20"><Download size={22} /></button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-slate-200 bg-white/95 backdrop-blur-xl lg:hidden">
        <MobileItem icon={<LayoutDashboard size={20} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileItem icon={<ClipboardList size={20} />} active={activeTab === 'assessment'} onClick={() => setActiveTab('assessment')} />
        <button onClick={exportToFile} className="relative -top-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-800 text-white shadow-lg"><Download size={20} /></button>
        <MobileItem icon={<AlertCircle size={20} />} active={activeTab === 'remediation'} onClick={() => setActiveTab('remediation')} />
        <MobileItem icon={<ExternalLink size={20} />} active={activeTab === 'mapping'} onClick={() => setActiveTab('mapping')} />
        <MobileItem icon={<Database size={20} />} active={activeTab === 'governance'} onClick={() => setActiveTab('governance')} />
      </nav>

      <div className="lg:pl-24">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/70 backdrop-blur-md px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-brand-900">NIST Audit Workspace</h1>
            <div className="flex items-center gap-4 mt-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none flex items-center gap-2">
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isSyncing ? "bg-brand-500 animate-spin" : "bg-emerald-500 animate-pulse"
                )} />
                {analystName} • VERSION 2.1
              </p>
              {lastSyncedAt && (
                <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                  <Cloud size={10} className="text-brand-400" />
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest leading-none">Vault Synced • {lastSyncedAt}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2.5"
            >
              <Plus size={16} /> New Assessment Case
            </button>
            <button onClick={exportToFile} className="bg-brand-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-brand-700 transition-all active:scale-95 shadow-md shadow-brand-900/10">Release Snapshot</button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-6 lg:p-10">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="db" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div onClick={() => setActiveTab('assessment')} className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-95">
                    <StatItem label="Maturity Score" value={stats.avgScore.toFixed(1)} sub="Scale 0-5" trend="Overall Posture" />
                  </div>
                  <div onClick={() => setActiveTab('assessment')} className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-95">
                    <StatItem label="Controls Assessed" value={`${stats.completedCount}/${controls.length}`} sub="Verified" progress={(stats.completedCount/controls.length)*100} color="emerald" />
                  </div>
                  <div onClick={() => setActiveTab('remediation')} className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-95">
                    <StatItem label="Critical Gaps" value={stats.highRiskCount} sub="Score < 2.0" color="rose" trend="Action Required" />
                  </div>
                  <div onClick={() => setActiveTab('mapping')} className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-95">
                    <StatItem label="Framework" value="CSF 2.0" sub="Global Standard" color="gold" trend="Master Version" />
                  </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 professional-shadow relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-10 flex items-center gap-3">
                        <span className="h-1 w-6 bg-gold-500 rounded-full" />
                        Security Posture Radar
                      </h3>
                      <div className="h-[350px] sm:h-[450px]">
                        <ResponsiveContainer>
                          <RadarChart data={stats.radarData}>
                            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                            <PolarAngleAxis dataKey="category" tick={{fill:'#94a3b8', fontSize:11, fontWeight:700, letterSpacing: '0.05em'}} />
                            <Radar name="Maturity" dataKey="score" stroke="#C5A059" strokeWidth={3} fill="#C5A059" fillOpacity={0.08} />
                            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="absolute -left-10 -top-10 text-slate-50 opacity-20 pointer-events-none">
                      <ShieldCheck size={300} strokeWidth={1} />
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 professional-shadow">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-10 flex items-center gap-3">
                      <span className="h-1 w-6 bg-brand-800 rounded-full" />
                      Maturity Scale Matrix
                    </h3>
                    <div className="space-y-4">
                      {MATURITY_SCALE.map(s => (
                        <div key={s.value} className="flex gap-6 p-4 rounded-2xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                          <div className={cn("h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg transition-transform group-hover:scale-110", s.value < 3 ? "bg-gold-500 shadow-gold-200" : "bg-brand-700 shadow-brand-200")}>{s.value}</div>
                          <div className="flex flex-col justify-center">
                            <p className="text-sm font-bold text-slate-900 group-hover:text-gold-600 transition-colors uppercase tracking-tight">{s.label}</p>
                            <p className="text-[11px] text-slate-500 leading-snug mt-1 font-medium">{s.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'assessment' && (
              <motion.div key="audit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4 items-end">
                    <div className="space-y-4 w-full">
                      <h2 className="text-xl font-bold text-brand-900">Assessment Workbook</h2>
                      <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                              selectedCategory === cat 
                                ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-100" 
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-72">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search requirement..." 
                          value={searchQuery} 
                          onChange={e => setSearchQuery(e.target.value)} 
                          className="bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold w-full outline-none focus:ring-4 focus:ring-brand-50/50 transition-all shadow-sm" 
                        />
                      </div>
                      <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-brand-700 text-white h-10 w-10 flex items-center justify-center rounded-xl sm:hidden"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead><tr className="bg-slate-50/80 border-b border-slate-200"><th className="p-6 text-[10px] font-bold uppercase text-slate-500 tracking-[0.1em]">Control ID</th><th className="p-6 text-[10px] font-bold uppercase text-slate-500 tracking-[0.1em]">Assessment Requirement</th><th className="p-6 text-[10px] font-bold uppercase text-slate-500 tracking-[0.1em] text-center">Score Allocation</th></tr></thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredControls.map(c => (
                          <tr 
                            key={c.id} 
                            onClick={() => setSelectedControl(c)}
                            className="hover:bg-brand-50/20 transition-all cursor-pointer group"
                          >
                            <td className="p-6 whitespace-nowrap align-top border-r border-slate-200/50">
                              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md group-hover:bg-brand-100 group-hover:text-brand-700 transition-colors">{c.id}</span>
                              <div className="text-[9px] font-bold text-gold-600 uppercase tracking-wider mt-3">{c.category}</div>
                            </td>
                            <td className="p-6 max-w-md border-r border-slate-200/50">
                              <p className="text-sm font-semibold text-slate-800 leading-normal group-hover:text-brand-900 transition-colors">{c.requirement}</p>
                              <div className="flex gap-2 mt-3">
                                <span className="text-[9px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded uppercase tracking-tighter">
                                  Score: {c.score}
                                </span>
                                <span className={cn(
                                  "text-[9px] font-bold px-2 py-1 rounded uppercase tracking-tighter",
                                  c.status === 'Complete' ? "bg-brand-700 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-500"
                                )}>
                                  {c.status}
                                </span>
                              </div>
                            </td>
                            <td className="p-6 min-w-[280px] border-l border-slate-50">
                              <div className="flex flex-col gap-3">
                                <div className="flex justify-center gap-1.5" onClick={e => e.stopPropagation()}>
                                  {[0,1,2,3,4,5].map(v => (
                                    <button key={v} onClick={() => updateControl(c.id, {score:v, status:v===5?'Complete':'In Progress'})} className={cn("h-8 w-8 rounded-lg text-[10px] font-bold transition-all border-2", c.score===v?"bg-brand-700 border-brand-700 text-white shadow-lg shadow-brand-700/10 scale-105":"border-slate-100 text-slate-300 hover:border-slate-200 hover:text-slate-600 bg-white")}>{v}</button>
                                  ))}
                                </div>
                                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(c.score / 5) * 100}%` }}
                                    className={cn(
                                      "h-full transition-all duration-500",
                                      c.score < 2 ? "bg-rose-500" : c.score < 4 ? "bg-gold-500" : "bg-emerald-500"
                                    )} 
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'remediation' && (
              <motion.div key="gaps" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-brand-900">Remediation Roadmap</h2>
                    <p className="text-xs font-medium text-slate-500 mt-1">High-priority security gaps identified during NIST assessment.</p>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-rose-50 rounded-2xl border border-rose-100">
                    <span className="h-8 w-8 rounded-xl bg-rose-500 flex items-center justify-center text-white"><AlertCircle size={18} /></span>
                    <div className="pr-4">
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Urgent Actions</p>
                      <p className="text-sm font-black text-rose-600 leading-none">{stats.highRiskCount} Critical Gaps</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6">
                  {controls.filter(c => c.score < 3).length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] py-24 text-center">
                      <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm"><ShieldCheck size={32} /></div>
                      <h3 className="text-lg font-bold text-brand-900">Zero Critical Gaps</h3>
                      <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">All security objectives are operating at or above baseline maturity.</p>
                    </div>
                  ) : (
                    controls.filter(c => c.score < 3).map(c => (
                      <div key={c.id} className="group flex flex-col md:flex-row bg-white border border-slate-200 rounded-[2rem] overflow-hidden professional-shadow hover:border-slate-300 transition-all">
                        <div className="p-8 md:w-24 bg-slate-50 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 shrink-0">
                          <span className="font-mono text-xs font-black text-slate-400 rotate-0 md:-rotate-90 whitespace-nowrap">{c.id}</span>
                        </div>
                        <div className="p-8 flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em]">{c.category}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400">Current Maturity:</span>
                              <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">{c.score}/5</span>
                            </div>
                          </div>
                          <h4 className="text-base font-bold text-slate-900 mb-6">{c.requirement}</h4>
                          <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                              <Wrench size={16} className="text-rose-400 mt-1 shrink-0" />
                              <div>
                                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1">Recommended Remediation</p>
                                <p className="text-sm text-slate-700 font-medium leading-relaxed">{c.remediation || "No remediation plan defined. Open Audit drawer to specify actions."}</p>
                              </div>
                            </div>
                            <button onClick={() => setSelectedControl(c)} className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-2 py-2 px-3 hover:bg-brand-50 rounded-xl transition-all">Define Plan <ChevronRight size={14} /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'mapping' && (
              <motion.div key="mapping" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                 <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Framework Alignment</h2>
                    <p className="text-xs font-medium text-slate-500 mt-1">Cross-referencing NIST CSF 2.0 with global regulatory standards.</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-4 py-2 bg-brand-50 border border-brand-100 rounded-xl">
                      <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Master Version</p>
                      <p className="text-xs font-black text-brand-600">NIST CSF 2.0</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden professional-shadow">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          <th className="p-6 text-[10px] font-bold uppercase text-slate-500 tracking-[0.1em]">NIST ID</th>
                          <th className="p-6 text-[10px] font-bold uppercase text-slate-500 tracking-[0.1em]">ISO 27001:2022</th>
                          <th className="p-6 text-[10px] font-bold uppercase text-slate-500 tracking-[0.1em]">Article 32 (GDPR)</th>
                          <th className="p-6 text-[10px] font-bold uppercase text-slate-500 tracking-[0.1em]">Essential 8</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {controls.map(c => (
                          <tr key={`map-${c.id}`} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="p-6">
                              <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md">{c.id}</span>
                            </td>
                            <td className="p-6">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(30,58,138,0.4)]" />
                                <span className="text-xs font-bold text-slate-700">{c.mapping.iso27001}</span>
                              </div>
                            </td>
                            <td className="p-6">
                               <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-gold-400 shadow-[0_0_8px_rgba(197,160,89,0.4)]" />
                                <span className="text-xs font-bold text-slate-700">{c.mapping.gdpr}</span>
                              </div>
                            </td>
                            <td className="p-6">
                              <span className={cn(
                                "text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter",
                                c.mapping.essential8 === 'N/A' 
                                  ? "bg-slate-100 text-slate-400 border border-slate-200" 
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              )}>
                                {c.mapping.essential8}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'governance' && (
              <motion.div key="gov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Governance & Persistence</h2>
                    <p className="text-xs font-medium text-slate-500 mt-1">Manage audit artifacts, session security, and multi-user synchronization.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1.5 bg-slate-100 rounded-lg">Storage Bound: Session + Cloud</span>
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-8">
                    {/* Vault Ledger */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 professional-shadow relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Database size={120} />
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
                          <span className="h-1 w-6 bg-gold-500 rounded-full" />
                          Vault Ledger (Cloud Snapshot History)
                        </h3>
                        
                        {!user ? (
                          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                            <Lock size={40} className="mx-auto mb-4 text-slate-300" />
                            <h4 className="text-sm font-bold text-slate-600">Vault Locked</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">Sign in with Google to enable cloud synchronization and evidence archiving.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {cloudAssessments.length === 0 ? (
                              <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                                <Cloud size={32} className="mx-auto mb-3 text-slate-200" />
                                <p className="text-xs font-medium text-slate-400">Vault empty. Push a snapshot to begin history.</p>
                              </div>
                            ) : (
                              <div className="grid gap-3">
                                {cloudAssessments.map(item => (
                                  <div key={item.id} className="group flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-brand-100 hover:bg-brand-50/30 transition-all">
                                    <div className="flex items-center gap-4">
                                      <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-brand-500 shadow-sm group-hover:scale-110 transition-transform"><FileText size={22} /></div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <p className="text-sm font-bold text-slate-900">{new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}</p>
                                          <span className="text-[9px] font-black bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded tracking-tighter uppercase">SECURED</span>
                                        </div>
                                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">{item.analyst} • {item.controls.length} Audit Control Points</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button onClick={() => loadFromCloud(item)} className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 rounded-xl transition-all shadow-sm"><Upload size={18} /></button>
                                      <button onClick={() => deleteFromCloud(item.id)} className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-xl transition-all shadow-sm"><Trash2 size={18} /></button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <FileText size={18} className="text-brand-500" /> Transparency Notice & Terms
                      </h3>
                      <div className="prose prose-slate prose-sm max-w-none text-slate-500 italic space-y-4">
                        <p>
                          <strong>Data Ownership:</strong> You maintain absolute ownership of all "Evidence Artifacts" generated within this platform. No telemetry or PII is transmitted to any third-party infrastructure unless you explicitly use "Sync to Cloud."
                        </p>
                        <p>
                          <strong>Right to Portability:</strong> To satisfy ISO 27001 requirements for audit history, we provide high-integrity JSON and XLSX export capabilities for point-in-time snapshots.
                        </p>
                        <p>
                          <strong>Retention Policy:</strong> Data persists in your browser's Local Storage until manually purged. We recommend purging after every major audit cycle once snapshots are secured in your organization's formal GRC repository.
                        </p>
                      </div>
                    </div>

                    {user && (
                      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                         <div className="flex items-center justify-between mb-6">
                           <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cloud Evidence Vault</h3>
                           <button onClick={fetchCloudAssessments} className="text-[10px] font-bold text-brand-500 hover:underline">Refresh</button>
                         </div>
                         <div className="space-y-3">
                           {cloudAssessments.length === 0 ? (
                             <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                               <p className="text-xs text-slate-400">No cloud snapshots found.</p>
                             </div>
                           ) : (
                             cloudAssessments.map(item => (
                               <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                 <div className="flex items-center gap-3">
                                   <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-brand-500 shadow-sm"><FileText size={20} /></div>
                                   <div>
                                     <p className="text-xs font-bold text-slate-900">{new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}</p>
                                     <p className="text-[10px] text-slate-400">{item.analyst} • {item.controls.length} controls</p>
                                   </div>
                                 </div>
                                 <div className="flex gap-2">
                                   <button onClick={() => loadFromCloud(item)} className="p-2 text-slate-400 hover:text-brand-500 transition-colors"><Upload size={16} /></button>
                                   <button onClick={() => deleteFromCloud(item.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                                 </div>
                               </div>
                             ))
                           )}
                         </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-8">
                    {/* Access Portal */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 professional-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 h-24 w-24 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8 relative z-10">Access Portal</h3>
                      {!user ? (
                        <div className="space-y-6 relative z-10">
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">Sign in to activate cloud sync and unlock the full governance suite.</p>
                          <button 
                            onClick={signIn}
                            className="w-full flex items-center justify-center gap-3 p-4 bg-brand-800 text-white rounded-2xl hover:bg-brand-700 transition-all font-bold text-xs shadow-lg shadow-brand-900/10"
                          >
                            <LogIn size={18} /> Authenticate
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-8 relative z-10">
                          <div className="flex items-center gap-4">
                            <img src={user.photoURL || ''} className="h-16 w-16 rounded-[1.5rem] border-4 border-slate-50 shadow-sm" alt="" referrerPolicy="no-referrer" />
                            <div>
                              <p className="text-base font-bold text-slate-900 tracking-tight">{user.displayName}</p>
                              <p className="text-xs font-bold text-gold-600 uppercase tracking-widest mt-1">Lead Analyst</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Verification</span>
                              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-tighter">Verified Session</span>
                            </div>
                            <button onClick={logout} className="w-full py-3 text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100">Terminate Protocol</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Vault Commands */}
                    <div className="bg-brand-800 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-brand-900/40 relative overflow-hidden">
                       <div className="absolute bottom-0 right-0 opacity-5 -translate-y-2 translate-x-2">
                        <Database size={140} stroke="#C5A059" />
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400/60 mb-10 relative z-10">Vault Commands</h3>
                      <div className="space-y-4 relative z-10">
                        {user && (
                          <button 
                            onClick={syncToCloud}
                            disabled={isSyncing}
                            className="w-full flex items-center justify-between p-5 bg-gold-500 text-white rounded-2xl hover:bg-gold-600 transition-all group disabled:opacity-50 shadow-lg shadow-gold-600/20"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                                {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <Cloud size={18} />}
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-black uppercase tracking-tight">Push Snapshot</p>
                                <p className="text-[10px] text-brand-50/80 font-medium">Commit to Vault</p>
                              </div>
                            </div>
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        )}

                        <button 
                          onClick={exportJSON}
                          className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gold-300"><FileJson size={18} /></div>
                            <div className="text-left">
                              <p className="text-xs font-black uppercase tracking-tight">Local Export</p>
                              <p className="text-[10px] text-slate-400 font-medium">JSON Evidence File</p>
                            </div>
                          </div>
                          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="relative">
                          <input type="file" accept=".json" onChange={importJSON} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                           <div className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400"><Upload size={18} /></div>
                              <div className="text-left">
                                <p className="text-xs font-black uppercase tracking-tight">Restore Vault</p>
                                <p className="text-[10px] text-slate-400 font-medium">Import Artifact</p>
                              </div>
                            </div>
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>

                        <button 
                          onClick={purgeAllData}
                          className="w-full flex items-center justify-between p-5 bg-rose-50/10 border border-rose-500/20 rounded-2xl hover:bg-rose-500/20 hover:border-rose-500/40 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500"><Trash2 size={18} /></div>
                            <div className="text-left">
                              <p className="text-xs font-black text-rose-500 uppercase tracking-tight">Purge Session</p>
                              <p className="text-[10px] text-rose-400 font-medium">Destroy Local Cache</p>
                            </div>
                          </div>
                          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Add Control Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="text-lg font-bold">New Assessment Entry</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleAddControl} className="p-6 overflow-y-auto space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Control ID</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. GV.OC-01" 
                      value={newControl.id}
                      onChange={e => setNewControl({...newControl, id: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Category</label>
                    <select 
                      value={newControl.category}
                      onChange={e => setNewControl({...newControl, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all appearance-none"
                    >
                      <option value="GOVERN">GOVERN</option>
                      <option value="IDENTIFY">IDENTIFY</option>
                      <option value="PROTECT">PROTECT</option>
                      <option value="DETECT">DETECT</option>
                      <option value="RESPOND">RESPOND</option>
                      <option value="RECOVER">RECOVER</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Requirement Statement</label>
                  <textarea 
                    required
                    rows={2}
                    placeholder="Describe the cybersecurity goal..." 
                    value={newControl.requirement}
                    onChange={e => setNewControl({...newControl, requirement: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all resize-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Evidence Artifacts</label>
                    <input 
                      type="text" 
                      placeholder="Policy, logs, etc." 
                      value={newControl.evidence}
                      onChange={e => setNewControl({...newControl, evidence: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Remediation strategy</label>
                    <input 
                      type="text" 
                      placeholder="Plan to address gaps" 
                      value={newControl.remediation}
                      onChange={e => setNewControl({...newControl, remediation: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <h4 className="text-[10px] font-bold uppercase text-gold-500 tracking-widest mb-4">Framework Mappings</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-400">ISO 27001</label>
                      <input 
                        type="text" 
                        placeholder="A.5.1" 
                        value={newControl.mapping?.iso27001}
                        onChange={e => setNewControl({...newControl, mapping: { ...newControl.mapping!, iso27001: e.target.value }})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-brand-100 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-400">UK GDPR</label>
                      <input 
                        type="text" 
                        placeholder="Art. 32" 
                        value={newControl.mapping?.gdpr}
                        onChange={e => setNewControl({...newControl, mapping: { ...newControl.mapping!, gdpr: e.target.value }})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-brand-100 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-400">Essential 8</label>
                      <input 
                        type="text" 
                        placeholder="ML1..." 
                        value={newControl.mapping?.essential8}
                        onChange={e => setNewControl({...newControl, mapping: { ...newControl.mapping!, essential8: e.target.value }})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-brand-100 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 shrink-0">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="submit" className="bg-brand-800 text-white px-8 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity active:scale-95 shadow-lg shadow-brand-900/10">Add Control</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Control Insight Drawer */}
      <AnimatePresence>
        {selectedControl && (
          <div className="fixed inset-0 z-[60] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedControl(null)}
              className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-white shadow-2xl h-full flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-xs font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded uppercase tracking-widest">{selectedControl.id}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{selectedControl.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-brand-900">Control Insights</h3>
                </div>
                <button onClick={() => setSelectedControl(null)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 transition-all shadow-sm"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Requirement Statement</h4>
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed italic">"{selectedControl.requirement}"</p>
                  </div>
                </section>

                <section className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Scoring & Governance</h4>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                       <p className="text-[10px] font-bold text-slate-500 mb-3 uppercase">Maturity Level</p>
                       <div className="flex gap-1">
                         {[0,1,2,3,4,5].map(v => (
                           <button 
                             key={v} 
                             onClick={() => {
                               updateControl(selectedControl.id, { score: v, status: v === 5 ? 'Complete' : 'In Progress' });
                               setSelectedControl({...selectedControl, score: v, status: v === 5 ? 'Complete' : 'In Progress'});
                             }}
                             className={cn(
                               "h-8 w-8 rounded-lg text-[10px] font-bold transition-all border-2",
                               selectedControl.score === v 
                                 ? "bg-brand-800 border-brand-800 text-white shadow-md scale-105" 
                                 : "border-slate-100 text-slate-300 hover:border-slate-200 bg-slate-50"
                             )}
                           >
                             {v}
                           </button>
                         ))}
                       </div>
                     </div>
                     <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                       <p className="text-[10px] font-bold text-slate-500 mb-3 uppercase">Status Tracker</p>
                       <span className={cn(
                         "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                         selectedControl.status === 'Complete' ? "bg-emerald-50 text-emerald-600" : "bg-gold-50 text-gold-600"
                       )}>
                         <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", selectedControl.status === 'Complete' ? "bg-emerald-500" : "bg-gold-500")} />
                         {selectedControl.status}
                       </span>
                     </div>
                   </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Evidence Artifacts</h4>
                    <span className="text-[10px] font-bold text-brand-500 flex items-center gap-1"><Info size={12} /> Auto-saving</span>
                  </div>
                  <textarea 
                    rows={4}
                    value={selectedControl.evidence}
                    onChange={e => {
                      updateControl(selectedControl.id, { evidence: e.target.value });
                      setSelectedControl({...selectedControl, evidence: e.target.value});
                    }}
                    placeholder="List policies, log files, or procedural documentation..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-50 transition-all resize-none"
                  />
                </section>

                <section className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Framework Mappings</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">ISO 27001</p>
                      <p className="text-xs font-bold text-slate-700">{selectedControl.mapping.iso27001}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">UK GDPR</p>
                      <p className="text-xs font-bold text-slate-700">{selectedControl.mapping.gdpr}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Essential 8</p>
                      <p className="text-xs font-bold text-slate-700">{selectedControl.mapping.essential8}</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4 pb-12">
                   <h4 className="text-[10px] font-black uppercase text-rose-500 tracking-[0.2em]">Remediation Roadmap</h4>
                   <textarea 
                    rows={3}
                    value={selectedControl.remediation}
                    onChange={e => {
                      updateControl(selectedControl.id, { remediation: e.target.value });
                      setSelectedControl({...selectedControl, remediation: e.target.value});
                    }}
                    placeholder="Describe the plan to address security gaps..."
                    className="w-full bg-rose-50/20 border border-rose-100 rounded-2xl p-5 text-sm font-medium text-rose-900 placeholder:text-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-50 transition-all resize-none"
                  />
                </section>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
                <button 
                  onClick={() => setSelectedControl(null)}
                  className="bg-brand-800 text-white px-10 py-3 rounded-xl text-xs font-bold shadow-lg shadow-brand-900/20 hover:opacity-90 active:scale-95 transition-all"
                >
                  Finalize Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, active, onClick, label }: any) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "group relative h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300",
        active 
          ? "bg-white text-brand-700 shadow-[0_0_15px_rgba(255,255,255,0.15)] scale-110" 
          : "text-brand-300 hover:text-white hover:bg-white/5"
      )}
    >
      {icon}
      <span className="absolute left-[calc(100%+24px)] opacity-0 -translate-x-2 pointer-events-none rounded-md bg-brand-800 text-white text-[10px] font-bold px-3 py-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all z-50 shadow-2xl whitespace-nowrap border border-white/5">
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="activeTabIndicator"
          className="absolute -left-10 w-1.5 h-8 bg-white rounded-r-full"
        />
      )}
    </button>
  );
}

function MobileItem({ icon, active, onClick }: any) {
  return (<button onClick={onClick} className={cn("h-10 w-10 flex items-center justify-center rounded-xl transition-colors", active?"bg-brand-50 text-brand-700":"text-brand-400 hover:bg-brand-50")}>{icon}</button>);
}

function StatItem({ label, value, sub, trend, progress, color='slate' }: any) {
  const c = { 
    slate:'bg-brand-800 shadow-brand-900/10', 
    emerald:'bg-emerald-600 shadow-emerald-600/10', 
    rose:'bg-rose-600 shadow-rose-600/10', 
    gold:'bg-gold-500 shadow-gold-500/20' 
  }[color as keyof typeof StatItem] || 'bg-brand-800';
  
  return (
    <div className="p-8 rounded-[2rem] border border-slate-200 bg-white professional-shadow hover:border-slate-300 transition-all group overflow-hidden relative">
      <div className="relative z-10">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">{label}</p>
        <div className="flex items-baseline gap-2.5">
          <h4 className="text-4xl font-bold text-slate-900 tracking-tight">{value}</h4>
          <span className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">{sub}</span>
        </div>
        
        {progress !== undefined ? (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Maturity Progress</span>
              <span className="text-[10px] font-black text-slate-900">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{width:0}} 
                animate={{width:`${progress}%`}} 
                className={cn("h-full transition-all duration-1000", c)} 
              />
            </div>
          </div>
        ) : (
          <div className="mt-8 flex items-center gap-2 py-1 px-2.5 bg-slate-50 rounded-lg w-fit border border-slate-100">
            <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", c)} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{trend}</span>
          </div>
        )}
      </div>
      <div className="absolute -right-6 -bottom-6 text-slate-50/50 group-hover:text-slate-100/50 transition-colors pointer-events-none">
        <Database size={100} strokeWidth={1} />
      </div>
    </div>
  );
}
