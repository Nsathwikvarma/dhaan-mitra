import { db } from './db.js';

export function seedDatabase() {
  db.reset();

  // 1. Seed Multi-Crop Catalog (Telangana & National MSP Standards)
  const crops = [
    { id: 'crop-1', name: 'Paddy (Samba Mahsuri)', variety: 'Grade A Fine', maxMoisturePercentage: 14.0, moistureThreshold: 14.0, ratePerTonne: 21830, category: 'Cereals', icon: '🌾', active: true },
    { id: 'crop-2', name: 'Paddy (BPT 5204 / Telangana Sona)', variety: 'Super Fine', maxMoisturePercentage: 13.5, moistureThreshold: 13.5, ratePerTonne: 22030, category: 'Cereals', icon: '🌾', active: true },
    { id: 'crop-3', name: 'Maize (Hybrid Yellow)', variety: 'Commercial Grade', maxMoisturePercentage: 14.5, moistureThreshold: 14.5, ratePerTonne: 20900, category: 'Coarse Cereals', icon: '🌽', active: true },
    { id: 'crop-4', name: 'Wheat (Sharbati / Lokwan)', variety: 'Grade A Durum', maxMoisturePercentage: 12.0, moistureThreshold: 12.0, ratePerTonne: 22750, category: 'Cereals', icon: '🌾', active: true },
    { id: 'crop-5', name: 'Cotton (Long Staple / Kapas)', variety: 'Shankar-6', maxMoisturePercentage: 8.0, moistureThreshold: 8.0, ratePerTonne: 70200, category: 'Fibre', icon: '⚪', active: true },
    { id: 'crop-6', name: 'Soybean (Yellow)', variety: 'JS-335', maxMoisturePercentage: 12.0, moistureThreshold: 12.0, ratePerTonne: 46000, category: 'Oilseeds', icon: '🫘', active: true },
    { id: 'crop-7', name: 'Bengal Gram / Chana', variety: 'Desi Bold', maxMoisturePercentage: 10.0, moistureThreshold: 10.0, ratePerTonne: 54400, category: 'Pulses', icon: '🌱', active: true },
    { id: 'crop-8', name: 'Red Gram / Tur (Arhar)', variety: 'Asha / ICPH', maxMoisturePercentage: 10.0, moistureThreshold: 10.0, ratePerTonne: 70000, category: 'Pulses', icon: '🥣', active: true },
    { id: 'crop-9', name: 'Groundnut (Pods)', variety: 'K-6 / Bold', maxMoisturePercentage: 8.0, moistureThreshold: 8.0, ratePerTonne: 63770, category: 'Oilseeds', icon: '🥜', active: true }
  ];
  crops.forEach(c => db.insert('crops', c));

  // 2. Seed Procurement Centers
  const centers = [
    {
      id: 'PROC-001',
      name: 'Warangal Agricultural Market Yard',
      location: 'Warangal Urban, Telangana',
      district: 'Warangal',
      dailyCapacity: 100.0,
      active: true,
      phone: '+91 98480 12345'
    },
    {
      id: 'PROC-002',
      name: 'Nalgonda Rythu Procurement Center',
      location: 'Nalgonda Main Yard, Telangana',
      district: 'Nalgonda',
      dailyCapacity: 120.0,
      active: true,
      phone: '+91 98480 23456'
    },
    {
      id: 'PROC-003',
      name: 'Karimnagar Grain Hub',
      location: 'Collectorate Road, Karimnagar, Telangana',
      district: 'Karimnagar',
      dailyCapacity: 80.0,
      active: true,
      phone: '+91 98480 34567'
    }
  ];
  centers.forEach(c => db.insert('procurementCenters', c));

  // 3. Seed Demo Farmers (Multi-Crop Profiles)
  const farmers = [
    {
      id: 'FARM-101',
      farmerId: 'FARM-101',
      name: 'Rambabu Peddinti',
      phone: '+91 94401 23456',
      village: 'Gundlapally',
      district: 'Warangal',
      language: 'te',
      crop: 'Paddy (Samba Mahsuri)',
      expectedQuantity: 4.5,
      harvestDate: '2026-09-01'
    },
    {
      id: 'FARM-102',
      farmerId: 'FARM-102',
      name: 'Kishan Kumar Singh',
      phone: '+91 98100 87654',
      village: 'Rampur',
      district: 'Warangal',
      language: 'hi',
      crop: 'Maize (Hybrid Yellow)',
      expectedQuantity: 6.0,
      harvestDate: '2026-09-02'
    },
    {
      id: 'FARM-103',
      farmerId: 'FARM-103',
      name: 'Srinivas Rao Vangala',
      phone: '+91 98490 55443',
      village: 'Nakrekal',
      district: 'Nalgonda',
      language: 'te',
      crop: 'Cotton (Long Staple / Kapas)',
      expectedQuantity: 3.2,
      harvestDate: '2026-09-03'
    },
    {
      id: 'FARM-104',
      farmerId: 'FARM-104',
      name: 'Lakshmi Narayana',
      phone: '+91 91770 11223',
      village: 'Choppadandi',
      district: 'Karimnagar',
      language: 'te',
      crop: 'Bengal Gram / Chana',
      expectedQuantity: 3.5,
      harvestDate: '2026-09-02'
    },
    {
      id: 'FARM-105',
      farmerId: 'FARM-105',
      name: 'Rajesh Sharma',
      phone: '+91 99887 66554',
      village: 'Chandur',
      district: 'Nalgonda',
      language: 'en',
      crop: 'Wheat (Sharbati / Lokwan)',
      expectedQuantity: 5.0,
      harvestDate: '2026-09-04'
    }
  ];
  farmers.forEach(f => db.insert('farmers', f));

  // 4. Generate Slots for next 4 days
  const today = new Date();
  const dateStrings = [0, 1, 2, 3].map(offset => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  });

  const timeSlots = [
    { start: '08:00 AM', end: '09:00 AM' },
    { start: '09:00 AM', end: '10:00 AM' },
    { start: '10:00 AM', end: '11:00 AM' },
    { start: '11:00 AM', end: '12:00 PM' },
    { start: '01:00 PM', end: '02:00 PM' },
    { start: '02:00 PM', end: '03:00 PM' },
    { start: '03:00 PM', end: '04:00 PM' }
  ];

  centers.forEach(center => {
    dateStrings.forEach(date => {
      timeSlots.forEach((t, idx) => {
        const isPeak = idx >= 1 && idx <= 3;
        const baseBooked = isPeak ? Math.floor(Math.random() * 8) + 4 : Math.floor(Math.random() * 4);
        db.insert('slots', {
          id: `SLOT-${center.id}-${date}-${idx}`,
          centerId: center.id,
          date,
          startTime: t.start,
          endTime: t.end,
          capacity: 15.0,
          bookedQuantity: parseFloat(baseBooked.toFixed(1)),
          status: 'AVAILABLE'
        });
      });
    });
  });

  // 5. Seed Bookings with Multi-Crop Initial Statuses
  const demoBookings = [
    {
      id: 'BK-1001',
      bookingId: 'P001',
      tokenNo: 'P001',
      farmerId: 'FARM-101',
      farmerName: 'Rambabu Peddinti',
      farmerPhone: '+91 94401 23456',
      centerId: 'PROC-001',
      centerName: 'Warangal Agricultural Market Yard',
      cropId: 'crop-1',
      cropName: 'Paddy (Samba Mahsuri)',
      moistureThreshold: 14.0,
      quantity: 4.5,
      requestedDate: dateStrings[0],
      requestedTime: '09:00 AM - 10:00 AM',
      recommendationScore: 88,
      status: 'Inspection Phase',
      createdAt: new Date().toISOString()
    },
    {
      id: 'BK-1002',
      bookingId: 'P002',
      tokenNo: 'P002',
      farmerId: 'FARM-102',
      farmerName: 'Kishan Kumar Singh',
      farmerPhone: '+91 98100 87654',
      centerId: 'PROC-001',
      centerName: 'Warangal Agricultural Market Yard',
      cropId: 'crop-3',
      cropName: 'Maize (Hybrid Yellow)',
      moistureThreshold: 14.5,
      quantity: 6.0,
      requestedDate: dateStrings[0],
      requestedTime: '10:00 AM - 11:00 AM',
      recommendationScore: 84,
      status: 'Inspection Phase',
      createdAt: new Date().toISOString()
    },
    {
      id: 'BK-1003',
      bookingId: 'P003',
      tokenNo: 'P003',
      farmerId: 'FARM-103',
      farmerName: 'Srinivas Rao Vangala',
      farmerPhone: '+91 98490 55443',
      centerId: 'PROC-001',
      centerName: 'Warangal Agricultural Market Yard',
      cropId: 'crop-5',
      cropName: 'Cotton (Long Staple / Kapas)',
      moistureThreshold: 8.0,
      quantity: 3.2,
      requestedDate: dateStrings[0],
      requestedTime: '11:00 AM - 12:00 PM',
      recommendationScore: 92,
      status: 'Inspection Phase',
      createdAt: new Date().toISOString()
    },
    {
      id: 'BK-1004',
      bookingId: 'P004',
      tokenNo: 'P004',
      farmerId: 'FARM-104',
      farmerName: 'Lakshmi Narayana',
      farmerPhone: '+91 91770 11223',
      centerId: 'PROC-001',
      centerName: 'Warangal Agricultural Market Yard',
      cropId: 'crop-7',
      cropName: 'Bengal Gram / Chana',
      moistureThreshold: 10.0,
      quantity: 3.5,
      requestedDate: dateStrings[1],
      requestedTime: '10:00 AM - 11:00 AM',
      recommendationScore: 89,
      status: 'Inspection Phase',
      createdAt: new Date().toISOString()
    }
  ];
  demoBookings.forEach(b => db.insert('bookings', b));

  // 6. Seed IoT Sensor Readings
  const readings = [
    {
      id: 'READ-001',
      deviceId: 'MOISTURE-ESP32-01',
      centerId: 'PROC-001',
      moisture: 13.4,
      temperature: 31.0,
      humidity: 58.0,
      status: 'ONLINE',
      timestamp: new Date().toISOString()
    }
  ];
  readings.forEach(r => db.insert('sensorReadings', r));

  // 7. Seed Payments
  const demoPayments = [
    {
      id: 'PAY-1001',
      bookingId: 'P001',
      farmerId: 'FARM-101',
      farmerName: 'Rambabu Peddinti',
      cropName: 'Paddy (Samba Mahsuri)',
      quantity: 4.5,
      ratePerTonne: 21830,
      amount: 4.5 * 21830,
      status: 'Pending',
      transactionReference: 'TXN-DM-20260901-0847',
      paidAt: null
    }
  ];
  demoPayments.forEach(p => db.insert('payments', p));

  // 8. Seed Notifications
  const demoNotifications = [
    {
      id: 'NOTIF-101',
      farmerId: 'FARM-101',
      type: 'SLOT_CONFIRMATION',
      message: 'నమస్కారం Rambabu Peddinti గారూ. Dhaan Mitra నుండి మీ పంట సేకరణ స్లాట్ నిర్ధారించబడింది. ID: P001.',
      channel: 'VOICE_CALL',
      status: 'DELIVERED',
      callStatus: 'Completed (Telugu)',
      createdAt: new Date().toISOString()
    }
  ];
  demoNotifications.forEach(n => db.insert('notifications', n));

  console.log('✅ Dhaan Mitra Database seeded with Multi-Crop catalog & Active Inspection Phase!');
}
