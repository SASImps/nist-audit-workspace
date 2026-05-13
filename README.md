# NIST CSF 2.0 Cybersecurity Self-Assessment Template

A professional, high-integrity cybersecurity compliance toolkit designed to measure, communicate, and improve security posture based on the authoritative NIST CSF 2.0 framework (released February 2024).

![NIST CSF 2.0 Auditor Dashboard](./dashboard_preview.png)

## 🚀 The Workspace Structure

The auditor is divided into five specialized tabs to guide you through a complete assessment lifecycle:

### **Tab 1 — Cover**
The mission control center. Define your organization's metadata, analyst team, and target maturity goals. Features a high-contrast dark navy theme with a built-in **Maturity Scale Legend** (1-5) explaining the lifecycle from *Initial* to *Optimizing*.

### **Tab 2 — Assessment**
The scoring engine. Contains 62 rows representing every NIST CSF 2.0 subcategory. 
- **Color-Coded Functions**: Govern (Purple), Identify (Blue), Protect (Green), Detect (Amber), Respond (Red), and Recover (Pink).
- **Live Scoring**: Enter scores (1-5) to see automatic gap calculations against your defined targets.
- **Evidence Persistence**: Native fields for documenting notes and remediation actions per control.

### **Tab 3 — Dashboard**
The executive summary. Features six high-fidelity scorecards calculating function-specific maturity. The centerpiece is a **Dynamic Radar Chart** comparing *Current* vs. *Target* posture—perfect for stakeholders and board-level reporting.

### **Tab 4 — Gap Analysis**
Your remediation roadmap. This tab automatically surfaces critical control failures where current scores fall below targets. It isolates what needs to be fixed and in what order, creating a clear pathway to security compliance.

### **Tab 5 — Reference Guide**
The authoritative cheat sheet. Contains the full descriptions for all 62 subcategories in plain English, sourced directly from the NIST CSF 2.0 publication. Use this to ensure scoring accuracy and framework alignment.

## 🛠 Technical Stack

- **Framework**: React 18 / TypeScript / Vite
- **Animations**: Motion (Framer) for state transitions
- **Visualization**: Recharts (Custom Radar implementation)
- **Styling**: Tailwind CSS (Navy & Sky Blue specialized theme)
- **Persistence**: Local Protocol + Firebase Integration (Optional)

## 📖 How to Use

1. **Setup**: Open the **Cover** tab and enter your organizational details.
2. **Score**: Navigate to **Assessment**. Audit each subcategory by entering a score of 1-5 guided by the **Reference Guide**.
3. **Analyze**: Review the **Dashboard** to visualize organizational strengths and weaknesses.
4. **Remediate**: Use the **Gap Analysis** tab to build your security improvement roadmap.
5. **Export**: Use the download tool to export your assessment as a JSON payload for record-keeping.

---
*Empowering organizations with high-integrity cybersecurity reporting.*
