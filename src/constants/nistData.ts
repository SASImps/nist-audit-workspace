export interface NISTSubcategory {
  id: string;
  function: 'GOVERN'|'IDENTIFY'|'PROTECT'|'DETECT'|'RESPOND'|'RECOVER';
  category: string;
  title: string;
  description: string;
}

export const NIST_CSF_2_0_DATA: NISTSubcategory[] = [
  // GOVERN (GV)
  { id: 'GV.OC-01', function: 'GOVERN', category: 'Organizational Context', title: 'Organizational context', description: 'The organizational mission is understood and informs cybersecurity risk management.' },
  { id: 'GV.OC-02', function: 'GOVERN', category: 'Organizational Context', title: 'Stakeholder expectations', description: 'Internal and external stakeholders of the organization, and their cybersecurity needs and expectations, are identified and understood.' },
  { id: 'GV.OC-03', function: 'GOVERN', category: 'Organizational Context', title: 'Legal and regulatory requirements', description: 'Legal, regulatory, and contractual requirements regarding cybersecurity are understood and managed.' },
  { id: 'GV.OC-04', function: 'GOVERN', category: 'Organizational Context', title: 'Critical objectives', description: 'Critical objectives and services are prioritized and inform cybersecurity risk management.' },
  { id: 'GV.OC-05', function: 'GOVERN', category: 'Organizational Context', title: 'Outcomes and services', description: 'The organization’s outcomes and services are identified and prioritized.' },
  
  { id: 'GV.RM-01', function: 'GOVERN', category: 'Risk Management Strategy', title: 'Risk management objectives', description: 'Cybersecurity risk management objectives are established and agreed upon by organizational stakeholders.' },
  { id: 'GV.RM-02', function: 'GOVERN', category: 'Risk Management Strategy', title: 'Risk appetite', description: 'Risk appetite and risk tolerance statements are established and agreed upon.' },
  { id: 'GV.RM-03', function: 'GOVERN', category: 'Risk Management Strategy', title: 'Risk management framework', description: 'Cybersecurity risk management is integrated into broader enterprise risk management.' },
  { id: 'GV.RM-04', function: 'GOVERN', category: 'Risk Management Strategy', title: 'Risk management prioritization', description: 'Strategic cybersecurity risk management decisions are informed by the organization’s mission and objectives.' },
  { id: 'GV.RM-05', function: 'GOVERN', category: 'Risk Management Strategy', title: 'Line of business risk', description: 'Cybersecurity risk to the organization is expressed as part of organizational risk management.' },
  { id: 'GV.RM-06', function: 'GOVERN', category: 'Risk Management Strategy', title: 'Risk management review', description: 'The risk management strategy is regularly reviewed and updated.' },
  { id: 'GV.RM-07', function: 'GOVERN', category: 'Risk Management Strategy', title: 'Risk management communication', description: 'Strategic risk management decisions are communicated to stakeholders.' },
  
  { id: 'GV.PO-01', function: 'GOVERN', category: 'Roles, Responsibilities, and Authorities', title: 'Cybersecurity policies', description: 'Cybersecurity policies are established, communicated, and enforced.' },
  { id: 'GV.PO-02', function: 'GOVERN', category: 'Roles, Responsibilities, and Authorities', title: 'Policy review', description: 'Cybersecurity policies are reviewed and updated at least annually.' },
  
  { id: 'GV.RR-01', function: 'GOVERN', category: 'Roles, Responsibilities, and Authorities', title: 'Organizational roles', description: 'Organizational roles and responsibilities are clearly defined and communicated.' },
  { id: 'GV.RR-02', function: 'GOVERN', category: 'Roles, Responsibilities, and Authorities', title: 'Responsibility for risk', description: 'Cybersecurity risk management responsibilities are clearly defined and communicated.' },
  { id: 'GV.RR-03', function: 'GOVERN', category: 'Roles, Responsibilities, and Authorities', title: 'Authority for risk', description: 'Authorities for cybersecurity risk management are clearly defined and communicated.' },
  { id: 'GV.RR-04', function: 'GOVERN', category: 'Roles, Responsibilities, and Authorities', title: 'Qualified personnel', description: 'Personnel are qualified to fulfill their cybersecurity roles and responsibilities.' },
  
  { id: 'GV.OV-01', function: 'GOVERN', category: 'Policy, Planning, and Oversight', title: 'Governance activities', description: 'Cybersecurity governance activities are prioritized and inform mission/business objectives.' },
  { id: 'GV.OV-02', function: 'GOVERN', category: 'Policy, Planning, and Oversight', title: 'Oversight', description: 'Cybersecurity strategy and risk management is integrated into organizational governance.' },
  { id: 'GV.OV-03', function: 'GOVERN', category: 'Policy, Planning, and Oversight', title: 'Performance monitoring', description: 'Cybersecurity performance is monitored and reported to stakeholders.' },
  
  { id: 'GV.SC-01', function: 'GOVERN', category: 'Cybersecurity Supply Chain Risk Management', title: 'Supply chain strategy', description: 'Supply chain risk management (SCRM) is integrated into the cybersecurity strategy.' },
  { id: 'GV.SC-02', function: 'GOVERN', category: 'Cybersecurity Supply Chain Risk Management', title: 'Supplier identification', description: 'Suppliers are identified and prioritized based on criticality.' },
  { id: 'GV.SC-03', function: 'GOVERN', category: 'Cybersecurity Supply Chain Risk Management', title: 'Supplier risk management', description: 'Cybersecurity requirements for suppliers are defined and integrated into contracts.' },
  { id: 'GV.SC-04', function: 'GOVERN', category: 'Cybersecurity Supply Chain Risk Management', title: 'Supplier risk assessment', description: 'Supplier cybersecurity risk is assessed and managed throughout the lifecycle.' },
  { id: 'GV.SC-05', function: 'GOVERN', category: 'Cybersecurity Supply Chain Risk Management', title: 'Supplier monitoring', description: 'Suppliers are monitored to ensure cybersecurity requirements are met.' },
  { id: 'GV.SC-06', function: 'GOVERN', category: 'Cybersecurity Supply Chain Risk Management', title: 'Supplier relationship management', description: 'The organization manages supplier relationships to support cybersecurity goals.' },
  { id: 'GV.SC-07', function: 'GOVERN', category: 'Cybersecurity Supply Chain Risk Management', title: 'Supply chain communications', description: 'Cybersecurity risk and status are communicated to supply chain partners.' },
  { id: 'GV.SC-08', function: 'GOVERN', category: 'Cybersecurity Supply Chain Risk Management', title: 'Supplier exit strategy', description: 'Supplier exit and transition strategies are developed.' },
  { id: 'GV.SC-09', function: 'GOVERN', category: 'Cybersecurity Supply Chain Risk Management', title: 'Supply chain planning', description: 'Supply chain risk management is integrated into organizational planning.' },
  { id: 'GV.SC-10', function: 'GOVERN', category: 'Cybersecurity Supply Chain Risk Management', title: 'Supply chain oversight', description: 'The supply chain risk management program is monitored and reviewed.' },

  // IDENTIFY (ID)
  { id: 'ID.AM-01', function: 'IDENTIFY', category: 'Asset Management', title: 'Inventory of physical assets', description: 'Physical devices and systems within the organization are inventoried.' },
  { id: 'ID.AM-02', function: 'IDENTIFY', category: 'Asset Management', title: 'Inventory of software assets', description: 'Software platforms and applications within the organization are inventoried.' },
  { id: 'ID.AM-03', function: 'IDENTIFY', category: 'Asset Management', title: 'Communication flows', description: 'Organizational communication and data flows are mapped.' },
  { id: 'ID.AM-05', function: 'IDENTIFY', category: 'Asset Management', title: 'Resource prioritization', description: 'Resources are prioritized based on their classification, criticality, and business value.' },
  { id: 'ID.AM-07', function: 'IDENTIFY', category: 'Asset Management', title: 'Personnel management', description: 'Personnel and their cybersecurity roles and responsibilities are identified.' },
  { id: 'ID.AM-08', function: 'IDENTIFY', category: 'Asset Management', title: 'Asset lifecycle management', description: 'Asset lifecycle management processes are implemented.' },
  
  { id: 'ID.RA-01', function: 'IDENTIFY', category: 'Risk Assessment', title: 'Vulnerabilities', description: 'Vulnerabilities are identified and documented.' },
  { id: 'ID.RA-02', function: 'IDENTIFY', category: 'Risk Assessment', title: 'Threats', description: 'Threats are identified and documented.' },
  { id: 'ID.RA-03', function: 'IDENTIFY', category: 'Risk Assessment', title: 'Risk impact', description: 'The impact and likelihood of risks are determined.' },
  
  // PROTECT (PR)
  { id: 'PR.AA-01', function: 'PROTECT', category: 'Identity Management, Authentication, and Access Control', title: 'Identities', description: 'Identities for personnel and devices are managed.' },
  { id: 'PR.AA-02', function: 'PROTECT', category: 'Identity Management, Authentication, and Access Control', title: 'Authentication', description: 'Authentication is performed and managed.' },
  { id: 'PR.AA-03', function: 'PROTECT', category: 'Identity Management, Authentication, and Access Control', title: 'Access control', description: 'Access is granted and managed according to the principle of least privilege.' },
  { id: 'PR.AA-05', function: 'PROTECT', category: 'Identity Management, Authentication, and Access Control', title: 'Network integrity', description: 'Network integrity is protected.' },
  
  { id: 'PR.AT-01', function: 'PROTECT', category: 'Awareness and Training', title: 'Awareness', description: 'Personnel are provided with cybersecurity awareness and training.' },
  { id: 'PR.AT-02', function: 'PROTECT', category: 'Awareness and Training', title: 'Specialized training', description: 'Personnel with specialized roles are provided with training.' },
  
  { id: 'PR.DS-01', function: 'PROTECT', category: 'Data Security', title: 'Data at rest', description: 'Data at rest is protected.' },
  { id: 'PR.DS-02', function: 'PROTECT', category: 'Data Security', title: 'Data in transit', description: 'Data in transit is protected.' },
  { id: 'PR.DS-10', function: 'PROTECT', category: 'Data Security', title: 'Data integrity', description: 'Data integrity is protected.' },
  
  { id: 'PR.PS-01', function: 'PROTECT', category: 'Platform Security', title: 'Configuration management', description: 'Configuration management is implemented for systems.' },
  { id: 'PR.PS-02', function: 'PROTECT', category: 'Platform Security', title: 'Software management', description: 'Software platforms and applications are managed.' },
  
  { id: 'PR.IR-01', function: 'PROTECT', category: 'Technology Infrastructure Resilience', title: 'Infrastructure resilience', description: 'Technology infrastructure is resilient.' },

  // DETECT (DE)
  { id: 'DE.AE-01', function: 'DETECT', category: 'Adverse Event Analysis', title: 'Event analysis', description: 'Events are analyzed to understand and detect adverse events.' },
  { id: 'DE.CM-01', function: 'DETECT', category: 'Continuous Monitoring', title: 'Network monitoring', description: 'The network is monitored to detect adverse events.' },
  { id: 'DE.CM-02', function: 'DETECT', category: 'Continuous Monitoring', title: 'Physical monitoring', description: 'The physical environment is monitored to detect adverse events.' },
  { id: 'DE.CM-03', function: 'DETECT', category: 'Continuous Monitoring', title: 'Personnel monitoring', description: 'Personnel activity is monitored to detect adverse events.' },
  { id: 'DE.CM-09', function: 'DETECT', category: 'Continuous Monitoring', title: 'Continuous monitoring', description: 'Continuous monitoring is performed to detect adverse events.' },

  // RESPOND (RS)
  { id: 'RS.MA-01', function: 'RESPOND', category: 'Incident Management', title: 'Incident management', description: 'Incident management processes are established and followed.' },
  { id: 'RS.AN-01', function: 'RESPOND', category: 'Incident Analysis', title: 'Incident analysis', description: 'Incidents are analyzed to determine the impact and root cause.' },
  { id: 'RS.CO-01', function: 'RESPOND', category: 'Incident Response Communications', title: 'Incident communication', description: 'Incidents are communicated to stakeholders and partners.' },

  // RECOVER (RC)
  { id: 'RC.RP-01', function: 'RECOVER', category: 'Incident Recovery Plan Execution', title: 'Recovery plan', description: 'Recovery plans are executed to restore critical services.' },
  { id: 'RC.CO-01', function: 'RECOVER', category: 'Incident Recovery Communications', title: 'Recovery communication', description: 'Recovery activities are communicated to stakeholders.' },
  { id: 'RC.CO-03', function: 'RECOVER', category: 'Incident Recovery Communications', title: 'Public relations', description: 'Public relations are managed during and after recovery.' },
];
