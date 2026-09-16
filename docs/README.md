# Dhaan Mitra (ధాన్ మిత్ర) — Smart Farmer Procurement & Grain Quality System

> **Smart Farmer Procurement Slot Booking, Live Weather Forecasts, IoT Moisture Meter Spot Testing, and Payment Tracking System.**

---

## Executive Summary

**Dhaan Mitra** ("Grain Friend") is an agronomic digital procurement system designed to solve long queues, uncoordinated farmer arrivals, grain spoilage due to high moisture, and communication barriers at agricultural market yards. 

By combining weather-based slot predictions, real-world grain photo spot sampling, deterministic sun-drying calculations, priority rescheduling, and automated Dabba-phone voice call alerts, Dhaan Mitra turns grain procurement into a predictable, transparent agricultural workflow.

---

## Real-World Operational Workflow

1. **Farmer Procurement Slot Booking**:
   - Farmers select Crop, Quantity (Tonnes), Procurement Center, Preferred Date, and Preferred Time.
   - Farmers **do not** enter technical moisture values. The system automatically fetches and displays the **Live Weather & Rainfall Prediction Report** (Rainfall %, Temp, Humidity) for that day and checks yard capacity.

2. **Procurer Grain Photo Inspection & IoT Spot Sampling**:
   - Procurers view their daily assigned procurement schedule.
   - When inspecting grain, the system generates a **Captured Grain Heap Photo** overlaid with **3 Random Moisture Sampling Pins** (Top Surface, Core Center, Base Heap).
   - The procurer measures moisture at those 3 spots using an IoT moisture meter.

3. **Field Drying Calculator & Date-Locked Priority Rescheduling**:
   - If average moisture exceeds the crop limit (e.g. 15.8% vs max 14.0%):
     - The system calculates exact **minimum required sun drying days** based on local village weather ($31^\circ\text{C}$ sun, humidity).
     - **Date Locking**: Locks out all dates before the required drying days elapse.
     - **Priority Re-Booking**: Grants the farmer a **PRIORITY QUEUE** slot starting on or after the required drying days.

4. **Regional Dryness & Grain Care Advisory**:
   - Displays village-level sun drying indices (Optimal / Fair / Slow).
   - Provides actionable farmer guidance on tarpaulin sun drying, grain turning frequency, and night dew protection.

5. **Non-Smartphone (Dabba-Phone) Voice Call Alerts**:
   - Multilingual support in **Telugu (తెలుగు)**, **Hindi (हिंदी)**, and **English**.
   - Simulates automated interactive voice calls (IVR) with audio waveform visualizers.

---

## Tech Stack

- **Backend**: Node.js, Express.js REST API
- **Database**: File-persisted ACID database (`dhaan_mitra.db.json`)
- **Frontend**: React 18, Vite, Recharts, Lucide Icons, Custom HSL Farmers' Green Design System
- **IoT Integration**: ESP32 REST API JSON endpoint + Interactive IoT Slider Simulator
- **Localization**: Native JSON translation dictionaries for English, Telugu, and Hindi

---

## How to Run locally

### Step 1: Install Dependencies
```bash
npm install
npm --prefix client install
```

### Step 2: Build Production Bundle
```bash
npm run build
```

### Step 3: Start Application Server
```bash
npm start
```
Access the application at: **`http://localhost:5000`**
