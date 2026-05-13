export interface AssessmentItem {
  id: string;
  function: 'GOVERN' | 'IDENTIFY' | 'PROTECT' | 'DETECT' | 'RESPOND' | 'RECOVER';
  category: string;
  title: string;
  description: string;
  currentScore: number; // 1-5
  targetScore: number; // 1-5
  notes: string;
  remediation: string;
}

export interface OrganizationInfo {
  name: string;
  analyst: string;
  date: string;
  period: string;
  version: string;
  targetMaturity: number;
}

export const MATURITY_SCALE = [
  { value: 1, label: 'Initial', color: '#880808', description: 'Process is ad-hoc, disorganized, or purely reactive.' },
  { value: 2, label: 'Developing', color: '#FFBF00', description: 'Process is performed but relies on tribal knowledge (not documented).' },
  { value: 3, label: 'Defined', color: '#0000FF', description: 'Formal documented policy exists and is followed consistently.' },
  { value: 4, label: 'Managed', color: '#006400', description: 'Process is monitored via specific metrics and KPIs.' },
  { value: 5, label: 'Optimizing', color: '#008080', description: 'Process is automated and reviewed for continuous improvement.' },
];

export const FUNCTION_COLORS = {
  GOVERN: 'bg-purple-600',
  IDENTIFY: 'bg-blue-600',
  PROTECT: 'bg-green-600',
  DETECT: 'bg-amber-500',
  RESPOND: 'bg-red-600',
  RECOVER: 'bg-pink-500',
};

export const FUNCTION_TEXT_COLORS = {
  GOVERN: 'text-purple-600',
  IDENTIFY: 'text-blue-600',
  PROTECT: 'text-green-600',
  DETECT: 'text-amber-500',
  RESPOND: 'text-red-600',
  RECOVER: 'text-pink-500',
};
