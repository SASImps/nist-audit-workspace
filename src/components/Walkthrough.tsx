import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  LayoutDashboard,
  ClipboardList,
  AlertCircle,
  BookOpen,
  Home,
  Download,
  PartyPopper
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  tab?: string;
  target?: string;
}

interface WalkthroughProps {
  onComplete: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

const STEPS: Step[] = [
  {
    title: "Welcome to NIST CSF 2.0 Auditor",
    description: "This toolkit is designed to help you conduct professional cybersecurity assessments using the latest 2024 NIST framework. Let's take a quick tour of the mission critical components.",
    icon: <ShieldCheck size={32} className="text-sky-400" />,
  },
  {
    title: "The Cover Page",
    description: "Start here by entering your organization's metadata. Define your analyst team, assessment period, and target maturity level. Review the Maturity Scale legend to understand the 1-5 scoring criteria.",
    icon: <Home size={32} className="text-amber-400" />,
    tab: 'cover'
  },
  {
    title: "Security Control Assessment",
    description: "This is the engine room. Every NIST CSF 2.0 subcategory is listed here. Enter your Current Score (1-5), set a Target, and add evidence in the Notes column. The Gap column updates live.",
    icon: <ClipboardList size={32} className="text-sky-400" />,
    tab: 'assessment'
  },
  {
    title: "Executive Dashboard",
    description: "Visualize your security posture. Here you'll find score cards for each of the six functions (Govern, Identify, Protect, Detect, Respond, Recover) and a high-impact radar chart comparing Current vs Target maturity.",
    icon: <LayoutDashboard size={32} className="text-emerald-400" />,
    tab: 'dashboard'
  },
  {
    title: "Remediation Roadmap",
    description: "The Gap Analysis tab automatically surfaces every control where you are falling short of your target. Use this as your prioritized list for security improvements and budget justification.",
    icon: <AlertCircle size={32} className="text-rose-400" />,
    tab: 'gap-analysis'
  },
  {
    title: "Reference Guide",
    description: "Unsure what a control means? The Reference Guide contains the full authoritative NIST CSF 2.0 descriptions for all 62 subcategories in plain English.",
    icon: <BookOpen size={32} className="text-indigo-400" />,
    tab: 'reference'
  },
  {
    title: "Export & Persistence",
    description: "All your data is managed locally on this device via secure protocols. Use the Download icon in the top right to export your assessment as a JSON file for backup or peer review.",
    icon: <Download size={32} className="text-sky-400" />,
  },
  {
    title: "You're Ready!",
    description: "Empower your organization with high-integrity cybersecurity reporting. You can restart this guide anytime from the help menu (coming soon) or by clearing your browser cache.",
    icon: <PartyPopper size={32} className="text-yellow-400" />,
  }
];

export const Walkthrough: React.FC<WalkthroughProps> = ({ onComplete, activeTab, setActiveTab }) => {
  const [currentStep, setCurrentStep] = React.useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      const nextStep = STEPS[currentStep + 1];
      if (nextStep.tab) {
        setActiveTab(nextStep.tab);
      }
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = STEPS[currentStep - 1];
      if (prevStep.tab) {
        setActiveTab(prevStep.tab);
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#0A192F]/90 backdrop-blur-sm"
        onClick={onComplete}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-xl bg-[#0E2238] border border-sky-900/50 rounded-[2.5rem] shadow-2xl shadow-sky-500/10 overflow-hidden"
      >
        <button 
          onClick={onComplete}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-10 space-y-8">
          <div className="flex justify-center">
            <motion.div 
              key={currentStep}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-6 bg-sky-500/10 rounded-3xl border border-sky-500/20"
            >
              {step.icon}
            </motion.div>
          </div>

          <div className="text-center space-y-3">
            <h2 className="text-2xl font-black text-white tracking-tight">{step.title}</h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              {step.description}
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <div className="flex gap-1.5">
              {STEPS.map((_, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    idx === currentStep ? "w-8 bg-sky-500" : "w-1.5 bg-sky-900"
                  )}
                />
              ))}
            </div>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <button 
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white border border-sky-900/50 hover:bg-sky-900/20 transition-all flex items-center gap-2"
                >
                  <ChevronLeft size={16} /> Back
                </button>
              )}
              <button 
                onClick={handleNext}
                className="px-8 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-sky-500/20"
              >
                {currentStep === STEPS.length - 1 ? "Get Started" : "Continue"} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-sky-900/20">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            className="h-full bg-sky-500"
          />
        </div>
      </motion.div>
    </div>
  );
};
