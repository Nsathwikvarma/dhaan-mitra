import { db } from '../db.js';

class IoTService {
  constructor() {
    this.currentSensorData = {
      deviceId: 'MOISTURE-ESP32-01',
      centerId: 'PROC-001',
      centerName: 'Warangal Agricultural Market Yard',
      bayName: 'Bay 02 (Main Intake)',
      moisture: 13.4,
      temperature: 29.4,
      humidity: 61.0,
      status: 'ONLINE', // 'ONLINE' | 'FAULTY' | 'CALIBRATION_DRIFT' | 'PROBE_DISCONNECTED'
      healthScore: 98,
      battery: 94,
      signalStrength: '92%',
      voltage: 3.28,
      probeImpedanceOhms: 1420,
      calibrationOffset: 0.05,
      isFaulty: false,
      faultDetails: null,
      timestamp: new Date().toISOString()
    };

    // Pool of IoT Devices across Bays & Nearby Centers
    this.deviceRegistry = [
      {
        deviceId: 'MOISTURE-ESP32-01',
        centerId: 'PROC-001',
        centerName: 'Warangal Agricultural Market Yard',
        bayName: 'Bay 02 (Active Intake)',
        distanceMeters: 0,
        distanceText: 'Current Device',
        status: 'ONLINE',
        isCurrent: true,
        inUse: true,
        battery: 94,
        signalStrength: '92%',
        healthScore: 98,
        firmware: 'v2.4.1-TS-AGRI'
      },
      {
        deviceId: 'MOISTURE-ESP32-03',
        centerId: 'PROC-001',
        centerName: 'Warangal Agricultural Market Yard',
        bayName: 'Bay 03 (Weighing Shed)',
        distanceMeters: 140,
        distanceText: '140 m away (Bay 03)',
        status: 'ONLINE',
        isCurrent: false,
        inUse: false, // NOT IN USE (IDLE)
        battery: 98,
        signalStrength: '96%',
        healthScore: 100,
        firmware: 'v2.4.1-TS-AGRI',
        lastUsed: '1 hour ago'
      },
      {
        deviceId: 'MOISTURE-ESP32-04',
        centerId: 'PROC-001',
        centerName: 'Warangal Agricultural Market Yard',
        bayName: 'Bay 04 (Secondary Inspection)',
        distanceMeters: 310,
        distanceText: '310 m away (Bay 04)',
        status: 'ONLINE',
        isCurrent: false,
        inUse: false, // NOT IN USE (IDLE)
        battery: 91,
        signalStrength: '88%',
        healthScore: 96,
        firmware: 'v2.4.1-TS-AGRI',
        lastUsed: '45 mins ago'
      },
      {
        deviceId: 'MOISTURE-ESP32-05',
        centerId: 'PROC-001',
        centerName: 'Warangal Agricultural Market Yard',
        bayName: 'Bay 05 (Covered Platform)',
        distanceMeters: 550,
        distanceText: '550 m away (Bay 05)',
        status: 'ONLINE',
        isCurrent: false,
        inUse: false, // NOT IN USE (IDLE)
        battery: 88,
        signalStrength: '84%',
        healthScore: 94,
        firmware: 'v2.4.0-TS-AGRI',
        lastUsed: '3 hours ago'
      },
      {
        deviceId: 'MOISTURE-ESP32-06',
        centerId: 'PROC-002',
        centerName: 'Kazipet Sub-Procurement Hub',
        bayName: 'Bay 01 (Gate Counter)',
        distanceMeters: 1800,
        distanceText: '1.8 km away (Kazipet Hub)',
        status: 'ONLINE',
        isCurrent: false,
        inUse: false, // NOT IN USE (IDLE)
        battery: 95,
        signalStrength: '90%',
        healthScore: 99,
        firmware: 'v2.4.1-TS-AGRI',
        lastUsed: 'Yesterday'
      },
      {
        deviceId: 'MOISTURE-ESP32-07',
        centerId: 'PROC-003',
        centerName: 'Hanamkonda Grain Terminal',
        bayName: 'Bay 02 (Rapid Inspection)',
        distanceMeters: 3400,
        distanceText: '3.4 km away (Hanamkonda)',
        status: 'ONLINE',
        isCurrent: false,
        inUse: false, // NOT IN USE (IDLE)
        battery: 89,
        signalStrength: '86%',
        healthScore: 97,
        firmware: 'v2.4.1-TS-AGRI',
        lastUsed: '2 hours ago'
      }
    ];
  }

  getCurrentReadings() {
    return this.currentSensorData;
  }

  getDiagnostics() {
    const isFaulty = this.currentSensorData.isFaulty;
    return {
      success: true,
      deviceId: this.currentSensorData.deviceId,
      centerId: this.currentSensorData.centerId,
      centerName: this.currentSensorData.centerName,
      bayName: this.currentSensorData.bayName,
      status: this.currentSensorData.status,
      healthScore: this.currentSensorData.healthScore,
      isFaulty: this.currentSensorData.isFaulty,
      faultDetails: this.currentSensorData.faultDetails,
      hardwareMetrics: {
        battery: this.currentSensorData.battery,
        signalStrength: this.currentSensorData.signalStrength,
        voltage: this.currentSensorData.voltage,
        probeImpedanceOhms: this.currentSensorData.probeImpedanceOhms,
        calibrationOffset: this.currentSensorData.calibrationOffset,
        temperature: this.currentSensorData.temperature,
        humidity: this.currentSensorData.humidity
      },
      diagnosticChecks: [
        {
          testName: 'Capacitive Moisture Sensor Probe Contact',
          passed: !isFaulty,
          status: isFaulty ? 'FAILED (ERR_PROBE_SHORT)' : 'PASSED',
          description: isFaulty ? 'Short circuit or contact open detected on prong pin 2' : 'Stable contact resistance (< 2kΩ)'
        },
        {
          testName: 'Dual Frequency Soil/Grain Calibration',
          passed: !isFaulty,
          status: isFaulty ? 'DRIFT DETECTED (+7.8%)' : 'CALIBRATED',
          description: isFaulty ? 'Calibration reference drift exceeds ±0.5% tolerance' : 'Zero-point verified'
        },
        {
          testName: 'Supply Voltage & ADC Precision',
          passed: true,
          status: 'NORMAL (3.28V)',
          description: 'Regulated 3.3V rail stable within ±2%'
        },
        {
          testName: 'Wireless BLE / LoRa Mesh Link',
          passed: true,
          status: 'CONNECTED',
          description: 'Ping latency 18ms, packet loss 0%'
        }
      ],
      nearbyIdleDevices: this.getNearbyIdleDevices()
    };
  }

  getNearbyIdleDevices() {
    return this.deviceRegistry.filter(d => !d.inUse && d.deviceId !== this.currentSensorData.deviceId);
  }

  toggleFault(faultType = 'PROBE_SHORT') {
    if (this.currentSensorData.isFaulty) {
      this.currentSensorData.isFaulty = false;
      this.currentSensorData.status = 'ONLINE';
      this.currentSensorData.healthScore = 98;
      this.currentSensorData.faultDetails = null;
      this.currentSensorData.probeImpedanceOhms = 1420;
      this.currentSensorData.calibrationOffset = 0.05;
      this.currentSensorData.moisture = 13.4;

      const dev = this.deviceRegistry.find(d => d.deviceId === this.currentSensorData.deviceId);
      if (dev) {
        dev.status = 'ONLINE';
        dev.healthScore = 98;
      }

      return {
        success: true,
        isFaulty: false,
        status: 'ONLINE',
        message: 'IoT sensor restored to normal healthy operation. Probe calibrated and ready.'
      };
    } else {
      let faultDetails = {
        code: 'ERR_PROBE_SHORT_CIRCUIT',
        type: faultType,
        severity: 'CRITICAL',
        title: 'CRITICAL IOT SENSOR PROBE FAULT',
        description: 'Capacitive probe electrode short-circuit detected. Moisture readings fluctuating erratically (+8.2% drift). Moisture reading locked for quality safety.',
        suggestedAction: 'Switch immediately to an idle backup IoT probe at a nearby bay.',
        detectedAt: new Date().toISOString()
      };

      if (faultType === 'CALIBRATION_DRIFT') {
        faultDetails = {
          code: 'ERR_CALIBRATION_DRIFT',
          type: faultType,
          severity: 'HIGH',
          title: 'SENSOR CALIBRATION DRIFT FAULT',
          description: 'Grain dielectric reference out of acceptable tolerance range (±0.5% limit exceeded). Re-calibration required.',
          suggestedAction: 'Pair with adjacent idle IoT device.',
          detectedAt: new Date().toISOString()
        };
      } else if (faultType === 'PROBE_DISCONNECTED') {
        faultDetails = {
          code: 'ERR_PROBE_DISCONNECTED',
          type: faultType,
          severity: 'CRITICAL',
          title: 'IOT SENSOR PROBE DETACHED / NO CONTACT',
          description: 'Probe connector detached from ESP32 master module. Zero signal received.',
          suggestedAction: 'Connect to nearby standby IoT probe.',
          detectedAt: new Date().toISOString()
        };
      }

      this.currentSensorData.isFaulty = true;
      this.currentSensorData.status = 'FAULTY';
      this.currentSensorData.healthScore = 18;
      this.currentSensorData.faultDetails = faultDetails;
      this.currentSensorData.probeImpedanceOhms = 85;
      this.currentSensorData.calibrationOffset = 8.2;
      this.currentSensorData.moisture = 28.4;

      const dev = this.deviceRegistry.find(d => d.deviceId === this.currentSensorData.deviceId);
      if (dev) {
        dev.status = 'FAULTY';
        dev.healthScore = 18;
      }

      return {
        success: true,
        isFaulty: true,
        status: 'FAULTY',
        faultDetails,
        nearbyIdleDevices: this.getNearbyIdleDevices(),
        message: 'Fault injected: IoT Sensor marked as FAULTY. Red Alert dispatched with nearby idle device recommendations.'
      };
    }
  }

  switchActiveDevice(targetDeviceId) {
    const target = this.deviceRegistry.find(d => d.deviceId === targetDeviceId);
    if (!target) {
      throw new Error(`Device ${targetDeviceId} not found in procurement network.`);
    }

    const oldDeviceId = this.currentSensorData.deviceId;
    const oldDev = this.deviceRegistry.find(d => d.deviceId === oldDeviceId);
    if (oldDev) {
      oldDev.inUse = false;
      oldDev.isCurrent = false;
      if (this.currentSensorData.isFaulty) {
        oldDev.status = 'IN_MAINTENANCE';
      }
    }

    target.inUse = true;
    target.isCurrent = true;
    target.status = 'ONLINE';

    this.currentSensorData = {
      deviceId: target.deviceId,
      centerId: target.centerId,
      centerName: target.centerName,
      bayName: target.bayName,
      moisture: parseFloat((13.1 + Math.random() * 0.8).toFixed(1)),
      temperature: 29.8,
      humidity: 59.0,
      status: 'ONLINE',
      healthScore: target.healthScore || 100,
      battery: target.battery,
      signalStrength: target.signalStrength,
      voltage: 3.30,
      probeImpedanceOhms: 1380,
      calibrationOffset: 0.02,
      isFaulty: false,
      faultDetails: null,
      timestamp: new Date().toISOString()
    };

    return {
      success: true,
      switchedTo: target,
      readings: this.currentSensorData,
      message: `Successfully connected to ${target.deviceId} at ${target.bayName}! Operational health 100%. Fault cleared.`
    };
  }

  updateReadings({ deviceId, centerId, moisture, temperature, humidity }) {
    if (this.currentSensorData.isFaulty) {
      return this.currentSensorData;
    }

    const updated = {
      deviceId: deviceId || this.currentSensorData.deviceId,
      centerId: centerId || this.currentSensorData.centerId,
      centerName: this.currentSensorData.centerName,
      bayName: this.currentSensorData.bayName,
      moisture: parseFloat(parseFloat(moisture).toFixed(1)),
      temperature: parseFloat(parseFloat(temperature).toFixed(1)),
      humidity: parseFloat(parseFloat(humidity).toFixed(1)),
      status: 'ONLINE',
      healthScore: 98,
      battery: 92,
      signalStrength: '94%',
      voltage: 3.28,
      probeImpedanceOhms: 1420,
      calibrationOffset: 0.05,
      isFaulty: false,
      faultDetails: null,
      timestamp: new Date().toISOString()
    };

    this.currentSensorData = updated;
    db.insert('sensorReadings', updated);

    return updated;
  }

  evaluateQuality(moisture, targetThreshold = 14.0) {
    const m = parseFloat(moisture);
    const threshold = parseFloat(targetThreshold || 14.0);
    const diff = m - threshold;

    if (diff <= 0) {
      return {
        status: 'GREEN',
        grade: 'Grade A (Acceptable)',
        badgeClass: 'badge-green',
        recommendation: `Approved for procurement intake (Moisture ${m}% ≤ ${threshold}% limit).`,
        isAcceptable: true,
        threshold
      };
    } else if (diff <= 1.0) {
      return {
        status: 'YELLOW',
        grade: 'Grade B (Borderline High Moisture)',
        badgeClass: 'badge-yellow',
        recommendation: `Requires 2-4 hours sun-drying before final weigh-in (Moisture ${m}% exceeds ${threshold}% limit by ${diff.toFixed(1)}%).`,
        isAcceptable: true,
        threshold
      };
    } else {
      return {
        status: 'RED',
        grade: 'Grade C (Unsuitable Moisture)',
        badgeClass: 'badge-red',
        recommendation: `Rejected for direct intake. High spoilage risk (Moisture ${m}% exceeds ${threshold}% limit). Sun-drying required.`,
        isAcceptable: false,
        threshold
      };
    }
  }

  startLiveSimulation() {
    if (this._simulationTimer) return;

    this._simulationTimer = setInterval(() => {
      if (this.currentSensorData.isFaulty) return;

      const deltaMoisture = (Math.random() * 0.4 - 0.2);
      const deltaTemp = (Math.random() * 0.6 - 0.3);
      const deltaHumid = (Math.random() * 1.0 - 0.5);

      const newM = Math.max(11.5, Math.min(17.5, this.currentSensorData.moisture + deltaMoisture));
      const newT = Math.max(26.0, Math.min(38.0, this.currentSensorData.temperature + deltaTemp));
      const newH = Math.max(45.0, Math.min(75.0, this.currentSensorData.humidity + deltaHumid));

      this.currentSensorData = {
        ...this.currentSensorData,
        moisture: parseFloat(newM.toFixed(1)),
        temperature: parseFloat(newT.toFixed(1)),
        humidity: parseFloat(newH.toFixed(1)),
        battery: Math.max(85, Math.min(100, Math.round(this.currentSensorData.battery + (Math.random() * 0.2 - 0.1)))),
        timestamp: new Date().toISOString()
      };
    }, 6000);

    this._inspectionTimer = setInterval(() => {
      try {
        if (this.currentSensorData.isFaulty) return;
        const bookings = db.find('bookings');
        const centers = db.find('procurementCenters');
        if (bookings.length === 0 || centers.length === 0) return;

        const randomBooking = bookings[Math.floor(Math.random() * bookings.length)];
        const simMoisture = parseFloat((12.5 + Math.random() * 3.0).toFixed(1));
        const simTemp = parseFloat((28.0 + Math.random() * 5.0).toFixed(1));
        const simHumid = parseFloat((50.0 + Math.random() * 18.0).toFixed(1));
        const evaluation = this.evaluateQuality(simMoisture, randomBooking.moistureThreshold || 14.0);

        db.insert('qualityChecks', {
          bookingId: randomBooking.tokenNo,
          farmerId: randomBooking.farmerId,
          cropName: randomBooking.cropName || 'Paddy (Samba Mahsuri)',
          moisture: simMoisture,
          temperature: simTemp,
          humidity: simHumid,
          status: evaluation.status,
          grade: evaluation.grade,
          recommendation: evaluation.recommendation,
          remarks: evaluation.recommendation,
          checkedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Simulation error:', err);
      }
    }, 25000);
  }
}

export const iotService = new IoTService();
iotService.startLiveSimulation();

