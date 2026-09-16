import express from 'express';
import { db } from '../db.js';
import { evaluateSlot, generatePriorityRescheduleSlots, compareAlgorithms } from '../algorithms/slotEngine.js';
import { iotService } from '../services/iotService.js';
import { notificationService } from '../services/notificationService.js';
import { weatherService } from '../services/weatherService.js';
import { chatbotService } from '../services/chatbotService.js';

const router = express.Router();

// 1. Auth Endpoint
router.post('/auth/login', (req, res) => {
  const { role = 'FARMER', username, phone } = req.body;

  if (role === 'FARMER') {
    const farmer = db.findOne('farmers', f => f.phone === phone || f.farmerId === username) || db.find('farmers')[0];
    return res.json({
      success: true,
      user: {
        id: farmer.id,
        farmerId: farmer.farmerId,
        name: farmer.name,
        phone: farmer.phone,
        role: 'FARMER',
        language: farmer.language || 'te',
        village: farmer.village,
        district: farmer.district,
        crop: farmer.crop
      }
    });
  } else if (role === 'PROCURER') {
    return res.json({
      success: true,
      user: {
        id: 'PROC-USER-01',
        name: 'M. Jagadish (Procurement Officer)',
        centerId: 'PROC-001',
        centerName: 'Warangal Agricultural Market Yard',
        role: 'PROCURER'
      }
    });
  } else {
    return res.json({
      success: true,
      user: {
        id: 'ADMIN-USER-01',
        name: 'State Agricultural Admin',
        role: 'ADMIN'
      }
    });
  }
});

// 2. Farmers Endpoints
router.get('/farmers', (req, res) => {
  res.json({ success: true, farmers: db.find('farmers') });
});

router.post('/farmers', (req, res) => {
  const farmer = db.insert('farmers', req.body);
  res.json({ success: true, farmer });
});

// 3. Crops Endpoints
router.get('/crops', (req, res) => {
  res.json({ success: true, crops: db.find('crops') });
});

router.put('/crops/:id', (req, res) => {
  const updated = db.update('crops', c => c.id === req.params.id, req.body);
  res.json({ success: true, crop: updated[0] });
});

// 4. Procurement Centers Endpoints
router.get('/centers', (req, res) => {
  res.json({ success: true, centers: db.find('procurementCenters') });
});

router.put('/centers/:id', (req, res) => {
  const updated = db.update('procurementCenters', c => c.id === req.params.id, req.body);
  res.json({ success: true, center: updated[0] });
});

// 5. Slots Endpoints
router.get('/slots', (req, res) => {
  const { centerId, date } = req.query;
  const filter = s => (!centerId || s.centerId === centerId) && (!date || s.date === date);
  res.json({ success: true, slots: db.find('slots', filter) });
});

// 5.1 Village Weather Forecast Endpoint
router.get('/weather/forecast', (req, res) => {
  const { village = 'Gundlapally', district = 'Warangal' } = req.query;
  const forecastData = weatherService.getVillageForecast(village, district);
  res.json({
    success: true,
    ...forecastData
  });
});

// 6. Recommendation & Weather Evaluation Endpoint
router.post('/recommendations', (req, res) => {
  const {
    requestedDate = new Date().toISOString().split('T')[0],
    requestedTime = '10:00 AM - 11:00 AM',
    centerId = 'PROC-001',
    crop = 'Paddy (Samba Mahsuri)',
    expectedQuantity = 4.5
  } = req.body;

  const center = db.findOne('procurementCenters', c => c.id === centerId) || { dailyCapacity: 100 };
  const weather = weatherService.getWeather(center.district || 'Warangal', requestedDate);

  const slots = db.find('slots', s => s.centerId === centerId && s.date === requestedDate);
  const matchedSlot = slots.find(s => s.startTime.includes(requestedTime.split(' ')[0])) || slots[0] || {};

  const bookedQuantity = matchedSlot.bookedQuantity || 45.0;
  const queueCount = db.find('bookings', b => b.centerId === centerId && b.requestedDate === requestedDate).length;

  const evaluation = evaluateSlot({
    requestedDate,
    requestedTime,
    crop,
    expectedQuantity: parseFloat(expectedQuantity),
    temperature: weather.temperature,
    humidity: weather.humidity,
    rainfallProbability: weather.rainfallProbability,
    centerCapacity: center.dailyCapacity,
    bookedQuantity,
    queueCount,
    isPreferredTime: true
  });

  const algorithmComparison = compareAlgorithms({
    requestedDate,
    requestedTime,
    crop,
    expectedQuantity: parseFloat(expectedQuantity),
    temperature: weather.temperature,
    humidity: weather.humidity,
    rainfallProbability: weather.rainfallProbability,
    centerCapacity: center.dailyCapacity,
    bookedQuantity,
    queueCount
  });

  res.json({
    success: true,
    weather,
    evaluation,
    algorithmComparison
  });
});

// 7. Priority Reschedule Endpoint
router.post('/recommendations/reschedule', (req, res) => {
  const {
    measuredMoisture = 16.5,
    targetMoisture = 14.0,
    village = 'Gundlapally'
  } = req.body;

  const result = generatePriorityRescheduleSlots({
    measuredMoisture: parseFloat(measuredMoisture),
    targetMoisture: parseFloat(targetMoisture),
    village
  });

  res.json({
    success: true,
    ...result
  });
});

// 8. Bookings Endpoints
router.get('/bookings', (req, res) => {
  const { farmerId, centerId } = req.query;
  let filter = () => true;
  if (farmerId) filter = b => b.farmerId === farmerId;
  if (centerId) filter = b => b.centerId === centerId;

  res.json({ success: true, bookings: db.find('bookings', filter) });
});

router.post('/bookings', (req, res) => {
  const {
    farmerId = 'FARM-101',
    farmerName = 'Rambabu Peddinti',
    farmerPhone = '+91 94401 23456',
    centerId = 'PROC-001',
    centerName = 'Warangal Agricultural Market Yard',
    cropId = 'crop-1',
    cropName = 'Paddy (Samba Mahsuri)',
    quantity = 4.5,
    requestedDate,
    requestedTime,
    recommendationScore = 88,
    notificationChannel = 'VOICE_CALL',
    language = 'te'
  } = req.body;

  const count = db.find('bookings').length + 1;
  const tokenNo = `P${String(count).padStart(3, '0')}`;
  const bookingId = `BK-${Date.now()}`;

  const newBooking = db.insert('bookings', {
    bookingId,
    tokenNo,
    farmerId,
    farmerName,
    farmerPhone,
    centerId,
    centerName,
    cropId,
    cropName,
    quantity: parseFloat(quantity),
    requestedDate: requestedDate || new Date().toISOString().split('T')[0],
    requestedTime: requestedTime || '10:00 AM - 11:00 AM',
    recommendationScore,
    status: 'Inspection Phase',
    createdAt: new Date().toISOString()
  });

  // Automated notification
  const notifResult = notificationService.sendNotification({
    farmerId,
    farmerName,
    phone: farmerPhone,
    language,
    type: 'SLOT_CONFIRMATION',
    channel: notificationChannel,
    metadata: {
      crop: cropName,
      date: newBooking.requestedDate,
      time: newBooking.requestedTime,
      center: centerName,
      bookingId: tokenNo
    }
  });

  // Payment tracking
  const crop = db.findOne('crops', c => c.name === cropName) || { ratePerTonne: 21830 };
  const rate = crop.ratePerTonne || 21830;
  db.insert('payments', {
    bookingId: tokenNo,
    farmerId,
    farmerName,
    quantity: parseFloat(quantity),
    ratePerTonne: rate,
    amount: parseFloat((quantity * rate).toFixed(2)),
    status: 'Pending',
    transactionReference: `TXN-DM-${Date.now().toString().slice(-6)}`,
    paidAt: null
  });

  res.json({
    success: true,
    booking: newBooking,
    callSent: true,
    callStatus: 'CALL_SENT',
    callMessage: `Call Sent: Automated voice call dispatched to ${farmerPhone} with token ${tokenNo}`,
    notification: notifResult
  });
});

router.put('/bookings/:id/status', (req, res) => {
  const { status, requestedDate, requestedTime } = req.body;
  const updatePayload = { status };
  if (requestedDate) updatePayload.requestedDate = requestedDate;
  if (requestedTime) updatePayload.requestedTime = requestedTime;

  const updated = db.update('bookings', b => b.id === req.params.id || b.tokenNo === req.params.id, updatePayload);

  if (updated.length > 0) {
    const booking = updated[0];
    if (status === 'Accepted' || status === 'Ready') {
      notificationService.sendNotification({
        farmerId: booking.farmerId,
        farmerName: booking.farmerName,
        phone: booking.farmerPhone,
        language: 'te',
        type: 'QUALITY_APPROVED',
        channel: 'VOICE_CALL',
        metadata: {
          crop: booking.cropName,
          moisture: booking.moistureAtBooking || 13.4
        }
      });
    }
  }

  res.json({ success: true, booking: updated[0] });
});

// 9. IoT & Sensors Endpoints
router.get('/sensors/latest', (req, res) => {
  res.json({
    success: true,
    readings: iotService.getCurrentReadings(),
    history: db.find('sensorReadings').slice(-10)
  });
});

router.get('/sensors/diagnostics', (req, res) => {
  const diag = iotService.getDiagnostics();
  res.json(diag);
});

router.post('/sensors/toggle-fault', (req, res) => {
  const { faultType = 'PROBE_SHORT' } = req.body;
  const result = iotService.toggleFault(faultType);
  res.json(result);
});

router.get('/sensors/nearby-idle-devices', (req, res) => {
  const devices = iotService.getNearbyIdleDevices();
  res.json({
    success: true,
    devices
  });
});

router.post('/sensors/switch-device', (req, res) => {
  try {
    const { deviceId } = req.body;
    const result = iotService.switchActiveDevice(deviceId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/sensors/readings', (req, res) => {
  const updated = iotService.updateReadings(req.body);
  const evaluation = iotService.evaluateQuality(updated.moisture, req.body.threshold || 14.0);
  res.json({ success: true, readings: updated, evaluation });
});

router.post('/sensors/simulate', (req, res) => {
  const { moisture = 13.5, temperature = 31.0, humidity = 58.0, threshold = 14.0 } = req.body;
  const updated = iotService.updateReadings({
    deviceId: 'MOISTURE-ESP32-01',
    centerId: 'PROC-001',
    moisture,
    temperature,
    humidity
  });
  const evaluation = iotService.evaluateQuality(moisture, threshold);
  res.json({ success: true, readings: updated, evaluation });
});

// 10. Quality Checks Endpoints
router.get('/quality-checks', (req, res) => {
  const { bookingId, farmerId } = req.query;
  let filter = () => true;

  if (bookingId) filter = q => q.bookingId === bookingId;
  else if (farmerId) {
    const farmerBookings = db.find('bookings', b => b.farmerId === farmerId).map(b => b.tokenNo);
    filter = q => farmerBookings.includes(q.bookingId) || q.farmerId === farmerId;
  }

  res.json({ success: true, qualityChecks: db.find('qualityChecks', filter) });
});

router.post('/quality-checks', (req, res) => {
  const { bookingId, farmerId, moisture, temperature, humidity, remarks, pins, vehicleLoadNo, quantity, cropName } = req.body;
  
  const booking = db.findOne('bookings', b => b.tokenNo === bookingId || b.id === bookingId);
  const matchedCrop = db.findOne('crops', c => c.name === (cropName || booking?.cropName)) || { maxMoisturePercentage: 14.0, moistureThreshold: 14.0 };
  const cropThreshold = parseFloat(matchedCrop.maxMoisturePercentage || matchedCrop.moistureThreshold || 14.0);

  const evaluation = iotService.evaluateQuality(moisture, cropThreshold);
  const targetFarmerId = farmerId || booking?.farmerId || 'FARM-101';

  const check = db.insert('qualityChecks', {
    bookingId,
    farmerId: targetFarmerId,
    cropName: cropName || booking?.cropName || 'Paddy (Samba Mahsuri)',
    cropThreshold,
    moisture: parseFloat(moisture),
    temperature: parseFloat(temperature || 31.0),
    humidity: parseFloat(humidity || 58.0),
    pins: pins || [],
    vehicleLoadNo: vehicleLoadNo || 'TS-08-EX-4921',
    quantity: parseFloat(quantity || booking?.quantity || 4.5),
    status: evaluation.status,
    grade: evaluation.grade,
    recommendation: evaluation.recommendation,
    remarks: remarks || evaluation.recommendation,
    checkedAt: new Date().toISOString()
  });

  const isProcurementAccepted = parseFloat(moisture) <= cropThreshold;
  const nextStatus = isProcurementAccepted ? 'Procurement Completed' : 'Requires Field Sun Drying';
  
  db.update('bookings', b => b.tokenNo === bookingId || b.id === bookingId, {
    status: nextStatus,
    moistureAtBooking: parseFloat(moisture),
    moistureThreshold: cropThreshold,
    vehicleLoadNo: vehicleLoadNo || 'TS-08-EX-4921',
    procurementCompletedAt: isProcurementAccepted ? new Date().toISOString() : null,
    reportStoredAt: new Date().toISOString()
  });

  if (isProcurementAccepted) {
    db.update('payments', p => p.bookingId === bookingId, { status: 'Processing' });
    
    // Automatically trigger notification to farmer
    notificationService.sendNotification({
      farmerId: targetFarmerId,
      farmerName: booking?.farmerName || 'Farmer',
      phone: booking?.farmerPhone || '+91 94401 23456',
      language: 'te',
      type: 'QUALITY_APPROVED',
      channel: 'VOICE_CALL',
      metadata: {
        crop: booking?.cropName || 'Paddy',
        moisture: parseFloat(moisture)
      }
    });
  }

  res.json({
    success: true,
    qualityCheck: check,
    evaluation,
    procurementCompleted: isProcurementAccepted,
    procurementStatus: nextStatus,
    callSent: true,
    message: isProcurementAccepted
      ? 'Procurement completed: Grain approved & intake logged. Confirmation call sent to farmer.'
      : 'Drying required: Reschedule advisory stored & notification call sent to farmer.',
    reportStored: true
  });
});

// 11. Payments Endpoints
router.get('/payments', (req, res) => {
  const { farmerId } = req.query;
  const filter = farmerId ? p => p.farmerId === farmerId : () => true;
  res.json({ success: true, payments: db.find('payments', filter) });
});

router.put('/payments/:id/status', (req, res) => {
  const { status } = req.body;
  const updated = db.update('payments', p => p.id === req.params.id || p.bookingId === req.params.id, {
    status,
    paidAt: status === 'Paid' ? new Date().toISOString() : null
  });

  if (updated.length > 0 && status === 'Paid') {
    const payment = updated[0];
    db.update('bookings', b => b.tokenNo === payment.bookingId, { status: 'Payment Completed' });

    notificationService.sendNotification({
      farmerId: payment.farmerId,
      farmerName: payment.farmerName,
      language: 'te',
      type: 'PAYMENT_COMPLETED',
      channel: 'VOICE_CALL',
      metadata: {
        amount: payment.amount.toLocaleString('en-IN'),
        txn: payment.transactionReference
      }
    });
  }

  res.json({ success: true, payment: updated[0] });
});

// 12. Notifications Endpoints
router.get('/notifications', (req, res) => {
  const { farmerId } = req.query;
  if (farmerId) {
    return res.json({ success: true, notifications: notificationService.getNotificationsForFarmer(farmerId) });
  }
  res.json({ success: true, notifications: notificationService.getAllNotifications() });
});

router.post('/notifications/send', (req, res) => {
  const result = notificationService.sendNotification(req.body);
  res.json(result);
});

// 13. Admin Analytics Dashboard Endpoint
router.get('/analytics/dashboard', (req, res) => {
  const farmers = db.find('farmers');
  const bookings = db.find('bookings');
  const centers = db.find('procurementCenters');
  const payments = db.find('payments');
  const qualityChecks = db.find('qualityChecks');

  const totalBookedQuantity = bookings.reduce((sum, b) => sum + (b.quantity || 0), 0);
  const acceptedBookings = bookings.filter(b => b.status === 'Accepted' || b.status === 'Payment Completed');
  const rejectedBookings = bookings.filter(b => b.status === 'Requires Field Sun Drying');

  const cropStats = {};
  bookings.forEach(b => {
    cropStats[b.cropName] = (cropStats[b.cropName] || 0) + b.quantity;
  });

  const cropChartData = Object.keys(cropStats).map(name => ({
    name,
    quantity: cropStats[name]
  }));

  res.json({
    success: true,
    metrics: {
      totalRegisteredFarmers: farmers.length,
      totalBookedQuantity: parseFloat(totalBookedQuantity.toFixed(1)),
      totalProcurementCenters: centers.length,
      totalBookingsCount: bookings.length,
      acceptedCount: acceptedBookings.length,
      rejectedCount: rejectedBookings.length,
      pendingPaymentCount: payments.filter(p => p.status !== 'Paid').length,
      totalDisbursedPayment: payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0)
    },
    cropChartData,
    centersSummary: centers.map(c => {
      const centerBookings = bookings.filter(b => b.centerId === c.id);
      const centerQuantity = centerBookings.reduce((s, b) => s + b.quantity, 0);
      return {
        id: c.id,
        name: c.name,
        dailyCapacity: c.dailyCapacity,
        bookedQuantity: parseFloat(centerQuantity.toFixed(1)),
        remainingCapacity: parseFloat((c.dailyCapacity - centerQuantity).toFixed(1)),
        utilizationPercentage: Math.min(100, Math.round((centerQuantity / c.dailyCapacity) * 100))
      };
    }),
    recentQualityChecks: qualityChecks.slice(-5)
  });
});

// 14. SSE Real-time Stream Endpoint
const sseClients = new Set();

router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const buildPayload = () => {
    const farmers = db.find('farmers');
    const bookings = db.find('bookings');
    const centers = db.find('procurementCenters');
    const payments = db.find('payments');
    const qualityChecks = db.find('qualityChecks');

    const totalBookedQuantity = bookings.reduce((sum, b) => sum + (b.quantity || 0), 0);
    const acceptedBookings = bookings.filter(b => b.status === 'Accepted' || b.status === 'Payment Completed');
    const rejectedBookings = bookings.filter(b => b.status === 'Requires Field Sun Drying');

    return {
      metrics: {
        totalRegisteredFarmers: farmers.length,
        totalBookedQuantity: parseFloat(totalBookedQuantity.toFixed(1)),
        totalProcurementCenters: centers.length,
        totalBookingsCount: bookings.length,
        acceptedCount: acceptedBookings.length,
        rejectedCount: rejectedBookings.length,
        pendingPaymentCount: payments.filter(p => p.status !== 'Paid').length,
        totalDisbursedPayment: payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0)
      },
      centersSummary: centers.map(c => {
        const centerBookings = bookings.filter(b => b.centerId === c.id);
        const centerQuantity = centerBookings.reduce((s, b) => s + b.quantity, 0);
        return {
          id: c.id,
          name: c.name,
          dailyCapacity: c.dailyCapacity,
          bookedQuantity: parseFloat(centerQuantity.toFixed(1)),
          remainingCapacity: parseFloat((c.dailyCapacity - centerQuantity).toFixed(1)),
          utilizationPercentage: Math.min(100, Math.round((centerQuantity / c.dailyCapacity) * 100))
        };
      }),
      recentQualityChecks: qualityChecks.slice(-5),
      serverTime: new Date().toISOString()
    };
  };

  // Send initial snapshot immediately
  res.write(`data: ${JSON.stringify(buildPayload())}\n\n`);

  // Push updates every 5 seconds
  const interval = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify(buildPayload())}\n\n`);
    } catch (e) {
      clearInterval(interval);
    }
  }, 5000);

  // Heartbeat every 20s to prevent proxy timeouts
  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat\n\n`);
    } catch (e) {
      clearInterval(heartbeat);
    }
  }, 20000);

  sseClients.add(res);

  req.on('close', () => {
    clearInterval(interval);
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// 14. Voice Multilingual Chatbot Endpoints
router.post('/chat/message', async (req, res) => {
  try {
    const { message, text, language = 'te', farmerId = 'FARM-101', pendingState = null } = req.body;
    const queryText = message || text || '';
    const result = await chatbotService.processMessage({
      text: queryText,
      language,
      farmerId,
      pendingState
    });
    res.json(result);
  } catch (err) {
    console.error('Chatbot processing error:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      replyText: 'An error occurred while processing your request. Please try again.',
      voiceText: 'An error occurred. Please try again.'
    });
  }
});

router.post('/chat/register', async (req, res) => {
  try {
    const { name, phone, village, district = 'Warangal', aadhaar, landPassbook, acres, language = 'te' } = req.body;
    const regAcres = acres || '3.5';
    const passbookText = landPassbook || `Survey #512/B (${regAcres} Acres)`;
    const newFarmerId = `FARM-${Date.now().toString().slice(-4)}`;
    
    const newFarmer = db.insert('farmers', {
      farmerId: newFarmerId,
      name: name || 'Ramesh Naidu',
      phone: phone || '+91 98480 11223',
      village: village || 'Gundlapally',
      district,
      crop: 'Paddy (Samba Mahsuri)',
      aadhaar: aadhaar || '9042-8812-4912',
      landPassbook: passbookText,
      bankAccount: 'SBI ****4821',
      expectedQuantity: parseFloat((parseFloat(regAcres) * 1.5).toFixed(1)),
      harvestDate: new Date().toISOString().split('T')[0]
    });

    res.json({
      success: true,
      farmer: newFarmer,
      message: 'Registration successful'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

