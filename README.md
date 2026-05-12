# NIST Audit Workspace

A professional-grade cybersecurity compliance and audit management platform designed to streamline NIST CSF 2.0 assessments.

## Core Purpose

The **NIST Audit Workspace** empowers security analysts to perform rigorous, evidence-based security audits. It bridges the gap between high-level framework requirements and technical implementation, providing a centralized "Vault" for evidence, remediation planning, and real-time maturity scoring.

## Key Features

- **NIST CSF 2.0 Mapping**: Pre-configured with major NIST categories including Governance, Identification, Protection, Detection, Response, and Recovery.
- **Radar Maturity Visualization**: Instant visual feedback on organizational security posture across five critical domains.
- **Evidence Vault**: Secure local and cloud persistence (via Firestore) for audit snapshots, allowing for temporal analysis of security improvements.
- **Cross-Framework Alignment**: Integrated mapping to global standards like ISO 27001, GDPR, and the Essential 8.
- **Remediation Roadmap**: Automatically identifies critical gaps (scores below 2.0) and helps define clear remediation pathways.
- **Data Portability**: Full Excel/CSV export capabilities for snapshot sharing and regulatory reporting.
- **Premium Aesthetics**: A custom-crafted "Navy & Gold" interface designed for high-stakes corporate environments.

## Technical Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS + Motion (for fluid lifecycle animations)
- **Database**: Firebase/Firestore (Cloud Evidence Persistence)
- **Charts**: Recharts (Security Radar Charting)

## Security & Configuration

To prevent sensitive API keys from being exposed in Version Control:
1.  Add your Firebase credentials to your environment variables (using the `VITE_FIREBASE_*` prefix as defined in `.env.example`).
2.  The application will automatically use these environment variables if present.
3.  Ensure `firebase-applet-config.json` is added to your `.gitignore`.

## Getting Started

1. **Authenticate**: Log in via the Governance tab to enable Cloud persistence.
2. **Assess**: Navigate to the Assessment Workbook to score controls from 0 (Non-existent) to 5 (Optimized).
3. **Evidence**: Attach evidence links and documentation notes in the Control Insights drawer.
4. **Snapshot**: Push snapshots to the Vault to secure your current audit state.

---
*Built with precision for the modern security frontier.*
