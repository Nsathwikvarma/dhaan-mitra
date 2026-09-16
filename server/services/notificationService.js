import { db } from '../db.js';

class NotificationService {
  constructor() {
    this.voiceTranscripts = {
      te: {
        SLOT_CONFIRMATION: (name, crop, date, time, center, id) =>
          `నమస్కారం ${name} గారూ. Dhaan Mitra నుండి మీ ${crop} సేకరణ స్లాట్ ${date} తేదీన ఉదయం ${time}కి ${center} వద్ద నిర్ధారించబడింది. బుకింగ్ ID: ${id}.`,
        QUALITY_APPROVED: (name, crop, moisture) =>
          `నమస్కారం ${name} గారూ. మీ ${crop} ధాన్యం తనిఖీ పూర్తయింది. తేమ శాతము ${moisture}% లోపు ఉన్నందున కొనుగోలు ఆమోదించబడింది.`,
        PAYMENT_COMPLETED: (name, amount, txn) =>
          `నమస్కారం ${name} గారూ. మీ ధాన్యం సొమ్ము రూ. ${amount} మీ బ్యాంక్ ఖాతాలో జమ చేయబడింది. రశీదు ID: ${txn}.`
      },
      hi: {
        SLOT_CONFIRMATION: (name, crop, date, time, center, id) =>
          `नमस्ते ${name} जी। धान मित्र की ओर से आपकी ${crop} खरीद का स्लॉट ${date} को ${time} बजे ${center} पर कन्फर्म हुआ है। बुकिंग ID: ${id}।`,
        QUALITY_APPROVED: (name, crop, moisture) =>
          `नमस्ते ${name} जी। आपकी ${crop} की गुणवत्ता जांच पूरी हुई। नमी ${moisture}% पाई गई और खरीद स्वीकार कर ली गई है।`,
        PAYMENT_COMPLETED: (name, amount, txn) =>
          `नमस्ते ${name} जी। आपकी फसल का भुगतान ₹ ${amount} आपके खाते में ट्रांसफर कर दिया गया है। संदर्भ: ${txn}।`
      },
      en: {
        SLOT_CONFIRMATION: (name, crop, date, time, center, id) =>
          `Hello ${name}. Greetings from Dhaan Mitra. Your ${crop} procurement slot is confirmed for ${date} at ${time} at ${center}. Booking ID: ${id}.`,
        QUALITY_APPROVED: (name, crop, moisture) =>
          `Hello ${name}. Your ${crop} quality check is completed. Moisture reading is ${moisture}%. Grain accepted for procurement.`,
        PAYMENT_COMPLETED: (name, amount, txn) =>
          `Hello ${name}. Payment of ₹ ${amount} for your grain procurement has been successfully processed. Transaction: ${txn}.`
      }
    };
  }

  sendNotification({
    farmerId = 'FARM-101',
    farmerName = 'Rambabu Peddinti',
    phone = '+91 94401 23456',
    language = 'te',
    type = 'SLOT_CONFIRMATION',
    channel = 'VOICE_CALL', // APP, SMS, VOICE_CALL
    metadata = {}
  }) {
    const lang = ['te', 'hi', 'en'].includes(language) ? language : 'en';
    const maskedPhone = phone.replace(/(\+\d{2}\s?\d{2})\d{4}(\d{4})/, '$1****$2');

    let messageText = '';
    const templates = this.voiceTranscripts[lang] || this.voiceTranscripts.en;

    if (templates[type]) {
      messageText = templates[type](
        farmerName,
        metadata.crop || 'Paddy',
        metadata.date || 'Today',
        metadata.time || '10:00 AM',
        metadata.center || 'Procurement Center',
        metadata.bookingId || 'P001',
        metadata.moisture || '13.4',
        metadata.amount || '98,235',
        metadata.txn || 'TXN-99812'
      );
    } else {
      messageText = `Dhaan Mitra alert for ${farmerName}: ${type} notification generated.`;
    }

    const notificationRecord = {
      farmerId,
      farmerName,
      phone: maskedPhone,
      language: lang,
      type,
      channel,
      message: messageText,
      status: 'DELIVERED',
      callStatus: channel === 'VOICE_CALL' ? `Automated Voice Call Delivered (${lang.toUpperCase()})` : 'SMS Sent',
      deliveredAt: new Date().toISOString(),
      metadata
    };

    const saved = db.insert('notifications', notificationRecord);

    return {
      success: true,
      notification: saved,
      simulatedCall: channel === 'VOICE_CALL' ? {
        duration: '24s',
        audioTranscript: messageText,
        language: lang,
        status: 'COMPLETED'
      } : null
    };
  }

  getNotificationsForFarmer(farmerId) {
    return db.find('notifications', n => n.farmerId === farmerId);
  }

  getAllNotifications() {
    return db.find('notifications');
  }
}

export const notificationService = new NotificationService();
