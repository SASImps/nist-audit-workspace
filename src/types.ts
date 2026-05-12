export interface Control {
  id: string;
  category: string;
  requirement: string;
  evidence: string;
  remediation: string;
  mapping: {
    iso27001: string;
    gdpr: string;
    essential8: string;
  };
  score: number; // 0-5
  status: 'Incomplete' | 'In Progress' | 'Complete';
  notes: string;
}

export const MATURITY_SCALE = [
  { value: 0, label: 'Incomplete', description: 'No process or policy exists.' },
  { value: 1, label: 'Initial', description: 'Process is ad-hoc, disorganized, or purely reactive.' },
  { value: 2, label: 'Managed', description: 'Process is performed but relies on tribal knowledge (not documented).' },
  { value: 3, label: 'Defined', description: 'Formal documented policy exists and is followed consistently.' },
  { value: 4, label: 'Measured', description: 'Process is monitored via specific metrics and KPIs.' },
  { value: 5, label: 'Optimized', description: 'Process is automated and reviewed for continuous improvement.' },
];

export const INITIAL_CONTROLS: Control[] = [
  {
    id: 'GV.OC-01',
    category: 'GOVERN',
    requirement: 'Documentation of mission, vision, and legal requirements.',
    evidence: 'Risk Management Policy; Legal/ Regulatory Registry (GDPR/DPA).',
    remediation: 'Establish a centralized compliance registry.',
    mapping: { iso27001: 'A.5.1', gdpr: 'Article 24', essential8: 'N/A' },
    score: 2,
    status: 'In Progress',
    notes: ''
  },
  {
    id: 'GV.RR-01',
    category: 'GOVERN',
    requirement: 'Clear definition of cybersecurity roles and responsibilities.',
    evidence: 'RACI Matrix; Security-focused Job Descriptions.',
    remediation: 'Draft a RACI matrix for technical controls.',
    mapping: { iso27001: 'A.6.1.1', gdpr: 'Article 37', essential8: 'N/A' },
    score: 1,
    status: 'In Progress',
    notes: ''
  },
  {
    id: 'GV.PO-01',
    category: 'GOVERN',
    requirement: 'Cybersecurity policies are established and enforced.',
    evidence: 'Signed Acceptable Use Policy (AUP); Policy Library Access Logs.',
    remediation: 'Conduct an annual policy review cycle.',
    mapping: { iso27001: 'A.5.1.1', gdpr: 'Article 32', essential8: 'N/A' },
    score: 3,
    status: 'Complete',
    notes: ''
  },
  {
    id: 'ID.AM-01',
    category: 'IDENTIFY',
    requirement: 'Inventory of all physical devices and systems.',
    evidence: 'MDM Export; CMDB hardware inventory list.',
    remediation: 'Deploy automated network discovery tool.',
    mapping: { iso27001: 'A.8.1.1', gdpr: 'Article 30', essential8: 'Asset Inventory' },
    score: 2,
    status: 'In Progress',
    notes: ''
  },
  {
    id: 'ID.AM-02',
    category: 'IDENTIFY',
    requirement: 'Comprehensive software inventory is maintained.',
    evidence: 'Authorized Software List; Shadow IT discovery scan results.',
    remediation: 'Implement a software whitelist/allow-list.',
    mapping: { iso27001: 'A.8.1.1', gdpr: 'Article 30', essential8: 'Application Control' },
    score: 1,
    status: 'In Progress',
    notes: ''
  },
  {
    id: 'ID.RA-01',
    category: 'IDENTIFY',
    requirement: 'Vulnerabilities are identified and documented for all assets.',
    evidence: 'Nessus/OpenVAS Scan Reports; Risk Register entries.',
    remediation: 'Schedule monthly vulnerability scans.',
    mapping: { iso27001: 'A.12.6.1', gdpr: 'Article 32', essential8: 'Patch Applications' },
    score: 0,
    status: 'Incomplete',
    notes: ''
  },
  {
    id: 'ID.AM-04',
    category: 'IDENTIFY',
    requirement: 'External/Supply Chain dependencies are identified.',
    evidence: 'Vendor Inventory; SOC 2 Type II reports from providers.',
    remediation: 'Conduct a Tier-1 vendor risk assessment.',
    mapping: { iso27001: 'A.15.1.1', gdpr: 'Article 28', essential8: 'N/A' },
    score: 2,
    status: 'In Progress',
    notes: ''
  }
];
