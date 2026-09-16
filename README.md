# 🌾 Dhaan Mitra — Smart Farmer Procurement & Grain Quality Management System
### Smart India Hackathon (SIH Problem Statement: SIH 26032) • Government of Telangana

Dhaan Mitra is a full-stack smart agricultural procurement system featuring AI-driven multi-lingual voice slot booking (**DhaanVaani 🎙️**), IoT grain heap moisture spot testing, real-time load-balancing across market yards, automated direct DBT disbursements, and State Command Center deep analytics.

---

## 🌐 3 Role-Based Portals

| Role | Route | Key Features |
|---|---|---|
| **👨‍🌾 Farmer Portal** | `/farmer` | **DhaanVaani** Voice AI Assistant, Weather-integrated Slot Booking, Token Passbook, Live Bank DBT Tracker |
| **🏬 Procurer Portal** | `/procurer` | Grain Heap Cross-Section Camera Inspection, Random 4-Pin IoT Moisture Grading ($\le 14\%$ FCI threshold), Automatic Decisioning |
| **🛡️ State Admin Portal** | `/admin` | State-wide Command Center, Mandi Live Capacity & Utilization Heatmaps, IoT Quality Pass Rates, Deep District Analytics |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
cd mobile-app && npm install && cd ..
cd admin-web && npm install && cd ..
```

### 2. Build Frontend Applications
```bash
npm run build
```

### 3. Start the Server
```bash
npm start
```

Open in browser:
- **Farmer Portal**: `http://localhost:5000/farmer`
- **Procurer Portal**: `http://localhost:5000/procurer`
- **Admin Portal**: `http://localhost:5000/admin`

---

## 🎙️ DhaanVaani Voice Assistant Features
- **Continuous Speech Recognition**: Stays listening until you finish speaking without cutting off.
- **2-Second Auto-Send**: Automatically submits queries 2 seconds after speech stops — no send button needed.
- **Smart Time Slot Parsing**: Interprets *"book slot for tomorrow 11"* as **Tomorrow at 11:00 AM** time slot.
- **Languages Supported**: Telugu (`తెలుగు`), English, and Hindi (`हिंदी`).

---

## 🛠️ Technology Stack
- **Frontend**: React 18, Vite, HTML5 Web Speech API & Capacitor TTS/STT, SVG Data Visualizations
- **Backend**: Node.js, Express, Server-Sent Events (SSE) for real-time yard updates
- **Database**: Embedded JSON Store with live state sync
