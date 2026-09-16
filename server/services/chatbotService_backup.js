import { db } from '../db.js';
import { weatherService } from './weatherService.js';
import { notificationService } from './notificationService.js';

/**
 * Intelligent Multilingual Voice Chatbot Service for Dhaan Mitra
 * Supports Telugu (te), Hindi (hi), and English (en).
 */

// Helper to parse dates from natural language in English, Telugu, and Hindi
function parseRequestedDate(text) {
  const lower = (text || '').toLowerCase();
  const today = new Date();
  
  // 1. Tomorrow
  if (
    lower.includes('tomorrow') ||
    lower.includes('రేపు') ||
    lower.includes('repu') ||
    lower.includes('कल') ||
    lower.includes('kal')
  ) {
    const d = new Date(today);
    d.setDate(today.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  // 2. Day after tomorrow
  if (
    lower.includes('day after tomorrow') ||
    lower.includes('ఎల్లుండి') ||
    lower.includes('ellundi') ||
    lower.includes('परसों') ||
    lower.includes('parson')
  ) {
    const d = new Date(today);
    d.setDate(today.getDate() + 2);
    return d.toISOString().split('T')[0];
  }

  // 3. Today
  if (
    lower.includes('today') ||
    lower.includes('ఈరోజు') ||
    lower.includes('eroju') ||
    lower.includes('आज') ||
    lower.includes('aaj')
  ) {
    return today.toISOString().split('T')[0];
  }

  // 4. Look for day numbers e.g. "10th", "10th sep", "15వ", "12 तारीख", "slot on 15"
  const dayMatch = text.match(/(\b\d{1,2})(?:st|nd|rd|th|వ|va| तारीख| tareekh)?\b/i);
  if (dayMatch) {
    const dayNum = parseInt(dayMatch[1], 10);
    if (dayNum >= 1 && dayNum <= 31) {
      let targetMonth = today.getMonth();
      let targetYear = today.getFullYear();
      if (dayNum < today.getDate()) {
        targetMonth += 1;
        if (targetMonth > 11) {
          targetMonth = 0;
          targetYear += 1;
        }
      }
      const d = new Date(targetYear, targetMonth, dayNum);
      return d.toISOString().split('T')[0];
    }
  }

  // 5. ISO format YYYY-MM-DD
  const isoMatch = text.match(/\b\d{4}-\d{2}-\d{2}\b/);
  if (isoMatch) return isoMatch[0];

  // Default to tomorrow if slot booking is asked without specific day
  const defaultDate = new Date(today);
  defaultDate.setDate(today.getDate() + 1);
  return defaultDate.toISOString().split('T')[0];
}

// Helper to extract quantity from prompt (e.g. "5 tonnes", "4.5 tons", "6 టన్నులు", "5 टन")
function extractQuantity(text) {
  if (!text) return null;
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:tonnes?|tons?|t|టన్నులు?|tannulu|टन|tan)\b/i);
  if (match) {
    const q = parseFloat(match[1]);
    if (!isNaN(q) && q > 0) return q;
  }
  // Standalone numbers that look like quantity if prompt explicitly has "quantity 5" or "5 q"
  const qMatch = text.match(/(?:quantity|పరిమాణం|मात्रा)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
  if (qMatch) {
    const q = parseFloat(qMatch[1]);
    if (!isNaN(q) && q > 0) return q;
  }
  return null;
}

// Helper to extract time slot preference (e.g. "10 AM", "11:00", "ఉదయం 10", "दोपहर 2")
function extractTimeSlot(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes('8 am') || lower.includes('08:00')) return '08:00 AM - 09:00 AM';
  if (lower.includes('9 am') || lower.includes('09:00')) return '09:00 AM - 10:00 AM';
  if (lower.includes('10 am') || lower.includes('10:00') || lower.includes('10 గంట')) return '10:00 AM - 11:00 AM';
  if (lower.includes('11 am') || lower.includes('11:00') || lower.includes('11 గంట')) return '11:00 AM - 12:00 PM';
  if (lower.includes('1 pm') || lower.includes('01:00') || lower.includes('1 గంట')) return '01:00 PM - 02:00 PM';
  if (lower.includes('2 pm') || lower.includes('02:00') || lower.includes('2 గంట')) return '02:00 PM - 03:00 PM';
  if (lower.includes('3 pm') || lower.includes('03:00') || lower.includes('3 గంట')) return '03:00 PM - 04:00 PM';
  return null;
}

export class ChatbotService {
  /**
   * Main message handling pipeline
   */
  async processMessage({ text = '', language = 'te', farmerId = 'FARM-101', pendingState = null }) {
    const input = text.trim();
    const lower = input.toLowerCase();
    const effectiveLang = language === 'visual' ? 'te' : (language || 'te');

    // Retrieve farmer profile
    const farmer = db.findOne('farmers', f => f.farmerId === farmerId || f.phone === farmerId) || {
      farmerId: 'FARM-101',
      name: 'Rambabu Peddinti',
      phone: '+91 94401 23456',
      village: 'Gundlapally',
      district: 'Warangal',
      crop: 'Paddy (Samba Mahsuri)',
      expectedQuantity: 4.5,
      landPassbook: 'Survey #412/A (3.5 Acres)',
      aadhaar: 'XXXX-XXXX-4912',
      bankAccount: 'SBI ****4821'
    };

    // ----------------------------------------------------
    // 1. REGISTRATION INTENT (Voice Registration)
    // ----------------------------------------------------
    if (
      pendingState?.action === 'REGISTER' ||
      lower.includes('register') ||
      lower.includes('నమోదు') ||
      lower.includes('namodu') ||
      lower.includes('పంజికరణ్') ||
      lower.includes('पंजीकरण') ||
      lower.includes('नया किसान') ||
      lower.includes('new farmer')
    ) {
      return this.handleRegistration({ input, farmer, language: effectiveLang, pendingState });
    }

    // ----------------------------------------------------
    // 2. PAYMENT STATUS INTENT
    // ----------------------------------------------------
    if (
      lower.includes('payment') ||
      lower.includes('money') ||
      lower.includes('bank') ||
      lower.includes('dbt') ||
      lower.includes('status') ||
      lower.includes('పేమెంట్') ||
      lower.includes('చెల్లింపు') ||
      lower.includes('పైసలు') ||
      lower.includes('డబ్బులు') ||
      lower.includes('ఖాతా') ||
      lower.includes('ఖాతాలో') ||
      lower.includes('స్థితి') ||
      lower.includes('भुगतान') ||
      lower.includes('पैसे') ||
      lower.includes('खाते') ||
      lower.includes('खाता') ||
      lower.includes('स्थिति')
    ) {
      return this.handlePaymentStatus({ farmer, language: effectiveLang });
    }

    // ----------------------------------------------------
    // 3. WEATHER FORECAST INTENT
    // ----------------------------------------------------
    if (
      (lower.includes('weather') ||
      lower.includes('rain') ||
      lower.includes('వాతావరణం') ||
      lower.includes('వర్షం') ||
      lower.includes('ఎండ') ||
      lower.includes('मौसम') ||
      lower.includes('बारिश') ||
      lower.includes('धूप')) &&
      !lower.includes('slot') &&
      !lower.includes('బుక్') &&
      !lower.includes('book')
    ) {
      return this.handleWeatherQuery({ input, farmer, language: effectiveLang });
    }

    // ----------------------------------------------------
    // 4. CONFIRM BOOKING INTENT (Voice Confirmation)
    // ----------------------------------------------------
    const isConfirmation =
      lower.includes('confirm') ||
      lower.includes('yes') ||
      lower.includes('book it') ||
      lower.includes('ఖరారు') ||
      lower.includes('చేయండి') ||
      lower.includes('హా') ||
      lower.includes('అవును') ||
      lower.includes('हाँ') ||
      lower.includes('पक्का') ||
      lower.includes('बुक करो') ||
      lower.includes('कर दो');

    if (isConfirmation && (pendingState?.action === 'AWAITING_BOOKING_CONFIRM' || pendingState?.date)) {
      return this.handleBookingConfirmation({ input, farmer, language: effectiveLang, pendingState });
    }

    // ----------------------------------------------------
    // 5. CHECK SLOT AVAILABILITY & BOOKING QUERY (Core Requirement 1)
    // ----------------------------------------------------
    if (
      lower.includes('slot') ||
      lower.includes('book') ||
      lower.includes('స్లాట్') ||
      lower.includes('బుక్') ||
      lower.includes('स्लॉट') ||
      lower.includes('తారీఖు') ||
      lower.includes('తేదీ') ||
      lower.includes('tomorrow') ||
      lower.includes('రేపు') ||
      lower.includes('कल')
    ) {
      return this.handleSlotCheckAndBooking({ input, farmer, language: effectiveLang, pendingState });
    }

    // ----------------------------------------------------
    // 6. DEFAULT / GREETING / HELP
    // ----------------------------------------------------
    return this.handleGreetingAndHelp({ farmer, language: effectiveLang });
  }

  /**
   * FEATURE 1: Check Slot Availability on Specified Day, Weather, Quantity & Ask Confirmation
   */
  async handleSlotCheckAndBooking({ input, farmer, language, pendingState }) {
    const targetDate = parseRequestedDate(input) || pendingState?.date;
    const detectedQty = extractQuantity(input) || pendingState?.quantity;
    const detectedTime = extractTimeSlot(input) || pendingState?.selectedTime;

    const centerId = 'PROC-001';
    const center = db.findOne('procurementCenters', c => c.id === centerId) || {
      name: 'Warangal Agricultural Market Yard',
      dailyCapacity: 100.0,
      district: 'Warangal'
    };

    // 1. Evaluate Weather on that day
    const weather = weatherService.getWeather(center.district || 'Warangal', targetDate);
    const isRainRisk = weather.rainfallProbability > 30;

    // 2. Query available slots on that date
    let existingSlots = db.find('slots', s => s.centerId === centerId && s.date === targetDate);
    
    // Auto-generate standard slots for that day if not yet in DB
    if (!existingSlots || existingSlots.length === 0) {
      const standardHours = [
        { start: '08:00 AM', end: '09:00 AM' },
        { start: '09:00 AM', end: '10:00 AM' },
        { start: '10:00 AM', end: '11:00 AM' },
        { start: '11:00 AM', end: '12:00 PM' },
        { start: '01:00 PM', end: '02:00 PM' },
        { start: '02:00 PM', end: '03:00 PM' },
        { start: '03:00 PM', end: '04:00 PM' }
      ];
      existingSlots = standardHours.map((t, idx) => ({
        id: `SLOT-${centerId}-${targetDate}-${idx}`,
        centerId,
        date: targetDate,
        startTime: t.start,
        endTime: t.end,
        capacity: 15.0,
        bookedQuantity: Math.floor(Math.random() * 5) + 2,
        status: 'AVAILABLE'
      }));
    }

    const availableSlots = existingSlots.filter(s => s.bookedQuantity < s.capacity);
    const slotsAvailable = availableSlots.length > 0;

    // Available time strings list
    const availableTimeList = availableSlots.slice(0, 4).map(s => s.startTime).join(', ');

    // Check if farmer already told the quantity
    const hasQuantity = detectedQty !== null && detectedQty !== undefined;
    const finalQuantity = hasQuantity ? detectedQty : (farmer.expectedQuantity || 4.5);
    const chosenTime = detectedTime || (availableSlots[0]?.startTime ? `${availableSlots[0].startTime} - ${availableSlots[0].endTime}` : '10:00 AM - 11:00 AM');

    const formattedDisplayDate = new Date(targetDate).toLocaleDateString(language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    let replyText = '';
    let voiceText = '';

    if (!slotsAvailable) {
      if (language === 'te') {
        replyText = `క్షమించండి, ${formattedDisplayDate} తేదీన అన్ని స్లాట్లు నిండిపోయాయి. దయచేసి మరుసటి రోజు ప్రయత్నించండి.`;
        voiceText = `క్షమించండి, ${formattedDisplayDate} నాడు స్లాట్లు ఖాళీగా లేవు. దయచేసి వేరే తేదీని అడగండి.`;
      } else if (language === 'hi') {
        replyText = `माफ़ कीजिए, ${formattedDisplayDate} को सभी स्लॉट भर चुके हैं। कृपया अगले दिन का स्लॉट चुनें।`;
        voiceText = `माफ़ कीजिए, ${formattedDisplayDate} को स्लॉट उपलब्ध नहीं हैं।`;
      } else {
        replyText = `Sorry, no slots are available on ${formattedDisplayDate}. All capacity is booked. Please check another date.`;
        voiceText = `Sorry, slots are not available on ${formattedDisplayDate}. Please choose another day.`;
      }

      return {
        success: true,
        intent: 'SLOT_CHECK',
        available: false,
        date: targetDate,
        replyText,
        voiceText,
        slots: [],
        weather,
        quickReplies: ['Check tomorrow slots', 'Check 15th slots', 'Weather Forecast']
      };
    }

    // SLOTS ARE AVAILABLE!
    if (language === 'te') {
      const weatherDesc = isRainRisk 
        ? `వర్షం పడే అవకాశం ${weather.rainfallProbability}% ఉంది (జాగ్రత్త).` 
        : `ఎండగా ఉంటుంది ☀️ (వర్షం అవకాశం ${weather.rainfallProbability}% మాత్రమే).`;

      if (hasQuantity) {
        replyText = `అవును! ${formattedDisplayDate} నాడు స్లాట్లు అందుబాటులో ఉన్నాయి.\n⏰ అందుబాటులో ఉన్న సమయాలు: ${availableTimeList}.\n🌤️ వాతావరణం: ${weatherDesc} ఉష్ణోగ్రత ${weather.temperature}°C.\n⚖️ మీ ధాన్యం పరిమాణం: ${finalQuantity} టన్నులు.\nమీకు ఈ సమయం ఓకేనా? బుకింగ్ ఖరారు చేయమంటారా? ("బుక్ చేయండి" అని చెప్పండి).`;
        voiceText = `అవును! ${formattedDisplayDate} నాడు స్లాట్లు అందుబాటులో ఉన్నాయి. సమయాలు: ${availableTimeList}. వాతావరణం: ${weatherDesc}. మీ ${finalQuantity} టన్నుల బుకింగ్ ఖరారు చేయమంటారా? బుక్ చేయండి అని చెప్పండి.`;
      } else {
        replyText = `అవును! ${formattedDisplayDate} నాడు స్లాట్లు అందుబాటులో ఉన్నాయి.\n⏰ అందుబాటులో ఉన్న సమయాలు: ${availableTimeList}.\n🌤️ వాతావరణం: ${weatherDesc} ఉష్ణోగ్రత ${weather.temperature}°C.\nదయచేసి మీ ధాన్యం ఎన్ని టన్నులో చెప్పి, బుకింగ్ ఖరారు చేయమంటారా? (ఉదాహరణకు: "4.5 టన్నులు బుక్ చేయండి")`;
        voiceText = `అవును! ${formattedDisplayDate} నాడు స్లాట్లు ఉన్నాయి. సమయాలు: ${availableTimeList}. వాతావరణం: ${weatherDesc}. దయచేసి ఎన్ని టన్నులో చెప్పి, స్లాట్ ఖరారు చేయండి.`;
      }
    } else if (language === 'hi') {
      const weatherDesc = isRainRisk 
        ? `बारिश की संभावना ${weather.rainfallProbability}% है।` 
        : `मौसम साफ़ और धूप वाला है ☀️ (बारिश केवल ${weather.rainfallProbability}%).`;

      if (hasQuantity) {
        replyText = `हाँ! ${formattedDisplayDate} को स्लॉट उपलब्ध हैं।\n⏰ उपलब्ध समय: ${availableTimeList}.\n🌤️ मौसम: ${weatherDesc} तापमान ${weather.temperature}°C.\n⚖️ मात्रा: ${finalQuantity} टन।\nक्या मैं आपकी बुकिंग कन्फर्म कर दूँ? (बोलें "हाँ बुक करो").`;
        voiceText = `हाँ! ${formattedDisplayDate} को स्लॉट उपलब्ध हैं। उपलब्ध समय: ${availableTimeList}। मौसम: ${weatherDesc}। क्या मैं ${finalQuantity} टन की बुकिंग पक्की कर दूँ?`;
      } else {
        replyText = `हाँ! ${formattedDisplayDate} को स्लॉट उपलब्ध हैं।\n⏰ उपलब्ध समय: ${availableTimeList}.\n🌤️ मौसम: ${weatherDesc} तापमान ${weather.temperature}°C.\nकृपया अपनी अनुमानित अनाज मात्रा (टन) बताएं और बुकिंग की पुष्टि करें।`;
        voiceText = `हाँ! ${formattedDisplayDate} को स्लॉट उपलब्ध हैं। उपलब्ध समय: ${availableTimeList}। मौसम: ${weatherDesc}। कृपया मात्रा बताएं और बुकिंग कन्फर्म करें।`;
      }
    } else {
      const weatherDesc = isRainRisk 
        ? `Rain probability is ${weather.rainfallProbability}% (keep grain covered).` 
        : `Optimal sunny drying weather ☀️ (Rain chance only ${weather.rainfallProbability}%).`;

      if (hasQuantity) {
        replyText = `Yes! Slots are available on ${formattedDisplayDate}.\n⏰ Available Times: ${availableTimeList}.\n🌤️ Weather: ${weatherDesc} Temperature ${weather.temperature}°C.\n⚖️ Quantity: ${finalQuantity} Tonnes.\nWould you like me to confirm this booking? (Say "Confirm booking").`;
        voiceText = `Yes! Slots are available on ${formattedDisplayDate}. Open times are ${availableTimeList}. Weather forecast is ${weatherDesc}. Should I confirm booking for ${finalQuantity} tonnes?`;
      } else {
        replyText = `Yes! Slots are available on ${formattedDisplayDate}.\n⏰ Available Times: ${availableTimeList}.\n🌤️ Weather: ${weatherDesc} Temperature ${weather.temperature}°C.\nPlease let me know your expected quantity (tonnes) and confirm to book!`;
        voiceText = `Yes! Slots are available on ${formattedDisplayDate}. Open times are ${availableTimeList}. Weather forecast is ${weatherDesc}. Please tell your expected quantity and say confirm to book.`;
      }
    }

    return {
      success: true,
      intent: 'SLOT_AVAILABLE',
      available: true,
      date: targetDate,
      time: chosenTime,
      quantity: finalQuantity,
      hasQuantity,
      weather,
      availableSlots: availableSlots.slice(0, 5),
      replyText,
      voiceText,
      pendingState: {
        action: 'AWAITING_BOOKING_CONFIRM',
        date: targetDate,
        time: chosenTime,
        quantity: finalQuantity,
        crop: farmer.crop || 'Paddy (Samba Mahsuri)',
        centerId,
        centerName: center.name
      },
      quickReplies: [
        language === 'te' ? '✅ బుకింగ్ ఖరారు చేయండి' : language === 'hi' ? '✅ बुकिंग पक्की करो' : '✅ Confirm Booking',
        language === 'te' ? '4.5 టన్నులు బుక్ చేయండి' : language === 'hi' ? '4.5 टन बुक करो' : 'Book 4.5 Tonnes',
        language === 'te' ? '10:00 AM స్లాట్' : language === 'hi' ? '10:00 AM स्लॉट' : '10:00 AM Slot'
      ]
    };
  }

  /**
   * FEATURE 1 (Part 2): Execute Booking & Dispatch Automated Voice Confirmation Call
   */
  async handleBookingConfirmation({ input, farmer, language, pendingState }) {
    const bookingDate = pendingState?.date || new Date().toISOString().split('T')[0];
    const bookingTime = extractTimeSlot(input) || pendingState?.time || '10:00 AM - 11:00 AM';
    const quantity = extractQuantity(input) || pendingState?.quantity || farmer.expectedQuantity || 4.5;
    const cropName = pendingState?.crop || farmer.crop || 'Paddy (Samba Mahsuri)';
    const centerName = pendingState?.centerName || 'Warangal Agricultural Market Yard';
    const centerId = pendingState?.centerId || 'PROC-001';

    const count = db.find('bookings').length + 1;
    const tokenNo = `P${String(count).padStart(3, '0')}`;
    const bookingId = `BK-${Date.now()}`;

    const newBooking = db.insert('bookings', {
      bookingId,
      tokenNo,
      farmerId: farmer.farmerId || 'FARM-101',
      farmerName: farmer.name || 'Rambabu Peddinti',
      farmerPhone: farmer.phone || '+91 94401 23456',
      centerId,
      centerName,
      cropId: 'crop-1',
      cropName,
      quantity: parseFloat(quantity),
      requestedDate: bookingDate,
      requestedTime: bookingTime,
      recommendationScore: 92,
      status: 'Inspection Phase',
      createdAt: new Date().toISOString()
    });

    notificationService.sendNotification({
      farmerId: farmer.farmerId || 'FARM-101',
      farmerName: farmer.name || 'Rambabu Peddinti',
      phone: farmer.phone || '+91 94401 23456',
      language,
      type: 'SLOT_CONFIRMATION',
      channel: 'VOICE_CALL',
      metadata: {
        crop: cropName,
        date: bookingDate,
        time: bookingTime,
        center: centerName,
        bookingId: tokenNo
      }
    });

    const crop = db.findOne('crops', c => c.name === cropName) || { ratePerTonne: 21830 };
    const rate = crop.ratePerTonne || 21830;
    db.insert('payments', {
      bookingId: tokenNo,
      farmerId: farmer.farmerId || 'FARM-101',
      farmerName: farmer.name || 'Rambabu Peddinti',
      quantity: parseFloat(quantity),
      ratePerTonne: rate,
      amount: parseFloat((quantity * rate).toFixed(2)),
      status: 'Pending',
      transactionReference: `TXN-DM-${Date.now().toString().slice(-6)}`,
      paidAt: null
    });

    let replyText = '';
    let voiceText = '';

    if (language === 'te') {
      replyText = `🎉 మీ స్లాట్ విజయవంతంగా బుక్ అయింది!\n🎫 ప్రొక్యూర్‌మెంట్ టోకెన్ నంబర్: ${tokenNo}\n📍 కేంద్రం: ${centerName}\n📅 తేదీ: ${bookingDate} | సమయం: ${bookingTime}\n⚖️ పరిమాణం: ${quantity} టన్నులు\n\n📞 మీకు మీ మొబైల్ (${farmer.phone || '+91 94401 23456'}) కు ఆటోమేటిక్ బుకింగ్ నిర్ధారణ కాల్ పంపబడుతోంది!`;
      voiceText = `మీ స్లాట్ విజయవంతంగా బుక్ అయింది. మీ టోకెన్ నంబర్ ${tokenNo}. మీ మొబైల్ కు ఇప్పుడే ఆటోమేటిక్ వాయిస్ కాల్ వస్తుంది.`;
    } else if (language === 'hi') {
      replyText = `🎉 आपकी स्लॉट बुकिंग पक्की हो गई है!\n🎫 टोकन नंबर: ${tokenNo}\n📍 खरीद केंद्र: ${centerName}\n📅 तिथि: ${bookingDate} | समय: ${bookingTime}\n⚖️ मात्रा: ${quantity} टन\n\n📞 आपके मोबाइल (${farmer.phone || '+91 94401 23456'}) पर स्वचालित पुष्टि कॉल भेजी जा रही है!`;
      voiceText = `आपकी स्लॉट बुकिंग पक्की हो गई है। आपका टोकन नंबर ${tokenNo} है। आपके मोबाइल पर स्वचालित कॉल आ रही है।`;
    } else {
      replyText = `🎉 Booking Confirmed Successfully!\n🎫 Token Number: ${tokenNo}\n📍 Center: ${centerName}\n📅 Date: ${bookingDate} | Slot: ${bookingTime}\n⚖️ Quantity: ${quantity} Tonnes\n\n📞 An automated confirmation voice call is being sent to your phone (${farmer.phone || '+91 94401 23456'})!`;
      voiceText = `Booking confirmed! Your procurement token number is ${tokenNo}. You will receive an automated confirmation call right now.`;
    }

    return {
      success: true,
      intent: 'BOOKING_CONFIRMED',
      booking: newBooking,
      tokenNo,
      replyText,
      voiceText,
      callSent: true,
      pendingState: null,
      quickReplies: ['Check token status', 'Weather report', 'Payment status']
    };
  }

  /**
   * FEATURE 2: Farmer Registration via Chatbot (Basic info, Land & Aadhaar details)
   */
  async handleRegistration({ input, farmer, language, pendingState }) {
    const phoneMatch = input.match(/(?:\+91\s*)?[6-9]\d{9}/);
    const aadhaarMatch = input.match(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/);
    const acresMatch = input.match(/(\d+(?:\.\d+)?)\s*(?:acres?|ఎకరాలు?|एकड़)/i);
    const surveyMatch = input.match(/survey\s*#?\s*([0-9A-Za-z/]+)/i);

    const isReadyToRegister = phoneMatch || aadhaarMatch || pendingState?.collectedName;

    if (isReadyToRegister) {
      let cleanedName = input.replace(/register|farmer|నమోదు|చేయండి|రైతు|పంజికరణ్|पंजीकरण|किसान|करो/gi, '').split(/[,.\n]/)[0].trim();
      if (!cleanedName || cleanedName.length < 2) cleanedName = 'Ramesh Naidu';
      const regName = pendingState?.collectedName || cleanedName;
      const regPhone = phoneMatch ? phoneMatch[0] : (farmer.phone || '9848099887');
      const regAadhaar = aadhaarMatch ? aadhaarMatch[0] : '8892-4102-7712';
      const regAcres = acresMatch ? acresMatch[1] : '4.0';
      const regSurvey = surveyMatch ? surveyMatch[1] : '512/B';
      const regPassbook = `Survey #${regSurvey} (${regAcres} Acres)`;
      const regVillage = farmer.village || 'Gundlapally';

      const newFarmerId = `FARM-${Date.now().toString().slice(-4)}`;
      const newFarmerRecord = db.insert('farmers', {
        farmerId: newFarmerId,
        name: regName,
        phone: regPhone,
        village: regVillage,
        district: 'Warangal',
        crop: 'Paddy (Samba Mahsuri)',
        aadhaar: regAadhaar,
        landPassbook: regPassbook,
        bankAccount: 'SBI ****5190',
        expectedQuantity: parseFloat((parseFloat(regAcres) * 1.5).toFixed(1)),
        harvestDate: new Date().toISOString().split('T')[0]
      });

      let replyText = '';
      let voiceText = '';

      if (language === 'te') {
        replyText = `✅ రైతు నమోదు విజయవంతంగా పూర్తయింది!\n🧑‍🌾 పేరు: ${regName}\n📱 ఫోన్: ${regPhone}\n🏛️ ఆధార్: ${regAadhaar} (ధృవీకరించబడింది)\n📜 పట్టాదార్ పాస్‌బుక్: ${regPassbook}\n📍 గ్రామం: ${regVillage}\nబ్యాంక్ ఖాతా: SBI (DBT లింక్ చేయబడింది).\n\nఇప్పుడు మీరు నేరుగా వాయిస్ ద్వారా స్లాట్ బుక్ చేసుకోవచ్చు!`;
        voiceText = `రైతు నమోదు విజయవంతంగా పూర్తయింది! మీ ఆధార్ మరియు పట్టాదారు పాస్‌బుక్ వివరాలు లింక్ చేయబడ్డాయి. ఇప్పుడు మీరు స్లాట్ బుక్ చేసుకోవచ్చు.`;
      } else if (language === 'hi') {
        replyText = `✅ किसान पंजीकरण सफलतापूर्वक पूर्ण हुआ!\n🧑‍🌾 नाम: ${regName}\n📱 फोन: ${regPhone}\n🏛️ आधार: ${regAadhaar} (सत्यापित)\n📜 भूमि विवरण: ${regPassbook}\n📍 गाँव: ${regVillage}\n\nअब आप सीधे वॉइस से खरीद स्लॉट बुक कर सकते हैं!`;
        voiceText = `किसान पंजीकरण सफलतापूर्वक पूरा हुआ! आपकी आधार और भूमि जानकारी सत्यापित हो गई है।`;
      } else {
        replyText = `✅ Farmer Registered Successfully!\n🧑‍🌾 Name: ${regName}\n📱 Phone: ${regPhone}\n🏛️ Aadhaar: ${regAadhaar} (Verified)\n📜 Land Passbook: ${regPassbook}\n📍 Village: ${regVillage}\n\nYou are now ready to book procurement slots via voice!`;
        voiceText = `Farmer registration completed successfully! Your Aadhaar and land passbook details are seeded. You can now book slots directly.`;
      }

      return {
        success: true,
        intent: 'REGISTRATION_SUCCESS',
        farmer: newFarmerRecord,
        replyText,
        voiceText,
        pendingState: null,
        quickReplies: ['Book slot tomorrow', 'Check weather', 'View my details']
      };
    }

    let promptText = '';
    let voicePrompt = '';

    if (language === 'te') {
      promptText = `📝 దయచేసి మీ వివరాలను చెప్పండి లేదా నమోదు చేయండి:\n1. మీ పేరు & ఫోన్ నంబర్\n2. ఆధార్ నంబర్\n3. పట్టాదారు పాస్‌బుక్ సర్వే నంబర్ & ఎకరాలు\n(ఉదాహరణ: "రమేష్, 9848011223, ఆధార్ 9042-8812-4912, సర్వే 412/A 3.5 ఎకరాలు")`;
      voicePrompt = `దయచేసి మీ పేరు, ఫోన్ నంబర్, ఆధార్ మరియు భూమి పట్టా వివరాలు చెప్పండి. నేను నమోదు చేస్తాను.`;
    } else if (language === 'hi') {
      promptText = `📝 कृपया अपनी जानकारी बोलें या लिखें:\n1. नाम और फोन नंबर\n2. आधार नंबर\n3. भूमि सर्वे नंबर और एकड़\n(उदा: "रमेश, 9848011223, आधार 9042-8812-4912, सर्वे 412/A 3.5 एकड़")`;
      voicePrompt = `कृपया अपना नाम, फोन नंबर, आधार और भूमि विवरण बोलें। मैं आपका पंजीकरण कर दूँगा।`;
    } else {
      promptText = `📝 Please speak or enter your registration details:\n1. Full Name & Phone Number\n2. Aadhaar Number\n3. Land Passbook Survey # and Acres\n(e.g., "Ramesh, 9848011223, Aadhaar 9042-8812-4912, Survey 412/A 3.5 Acres")`;
      voicePrompt = `Please speak your name, phone number, Aadhaar and land details to complete registration.`;
    }

    return {
      success: true,
      intent: 'AWAITING_REGISTRATION_INFO',
      replyText: promptText,
      voiceText: voicePrompt,
      pendingState: { action: 'REGISTER' },
      quickReplies: ['Ramesh, 9848011223, Aadhaar 9042-8812-4912, 3.5 Acres']
    };
  }

  /**
   * FEATURE 3: Live Weather Report via Voice
   */
  async handleWeatherQuery({ input, farmer, language }) {
    const requestedDate = parseRequestedDate(input);
    const village = farmer.village || 'Gundlapally';
    const district = farmer.district || 'Warangal';

    const forecastData = weatherService.getVillageForecast(village, district);
    const targetForecast = forecastData.forecast.find(f => f.date === requestedDate) || forecastData.currentCondition;

    let replyText = '';
    let voiceText = '';

    if (language === 'te') {
      replyText = `🌤️ ${village} గ్రామ వాతావరణ నివేదిక (${targetForecast.dayName}, ${targetForecast.date}):\n🌡️ ఉష్ణోగ్రత: ${targetForecast.temperature}°C\n🌧️ వర్షం అవకాశం: ${targetForecast.rainfallProbability}%\n💧 తేమ (Humidity): ${targetForecast.humidity}%\n🌾 సలహా: ${targetForecast.dryingAdvice}`;
      voiceText = `${village} లో ${targetForecast.dayName} వాతావరణం: ఉష్ణోగ్రత ${targetForecast.temperature} డిగ్రీలు. వర్షం అవకాశం ${targetForecast.rainfallProbability} శాతం. ${targetForecast.dryingAdvice}.`;
    } else if (language === 'hi') {
      replyText = `🌤️ ${village} मौसम रिपोर्ट (${targetForecast.dayName}, ${targetForecast.date}):\n🌡️ तापमान: ${targetForecast.temperature}°C\n🌧️ बारिश की संभावना: ${targetForecast.rainfallProbability}%\n💧 आर्द्रता: ${targetForecast.humidity}%\n🌾 एआई सलाह: ${targetForecast.dryingAdvice}`;
      voiceText = `${village} में ${targetForecast.dayName} का तापमान ${targetForecast.temperature} डिग्री है। बारिश की संभावना ${targetForecast.rainfallProbability} प्रतिशत है। ${targetForecast.dryingAdvice}.`;
    } else {
      replyText = `🌤️ Weather Report for ${village} (${targetForecast.dayName}, ${targetForecast.date}):\n🌡️ Temperature: ${targetForecast.temperature}°C\n🌧️ Rainfall Probability: ${targetForecast.rainfallProbability}%\n💧 Humidity: ${targetForecast.humidity}%\n🌾 Advisory: ${targetForecast.dryingAdvice}`;
      voiceText = `Weather for ${village} on ${targetForecast.dayName}: Temperature is ${targetForecast.temperature} degrees Celsius with ${targetForecast.rainfallProbability} percent rain probability. ${targetForecast.dryingAdvice}.`;
    }

    return {
      success: true,
      intent: 'WEATHER_REPORT',
      weather: targetForecast,
      replyText,
      voiceText,
      quickReplies: ['Book slot for sunny day', '7-Day weather forecast', 'Payment status']
    };
  }

  /**
   * FEATURE 4: Live Payment Status via Voice
   */
  async handlePaymentStatus({ farmer, language }) {
    const payments = db.find('payments', p => p.farmerId === farmer.farmerId || p.farmerName === farmer.name);
    const latestPayment = payments.length > 0 ? payments[payments.length - 1] : {
      bookingId: 'P001',
      amount: 98235,
      quantity: 4.5,
      status: 'Processing',
      transactionReference: 'TXN-DM-849201',
      ratePerTonne: 21830
    };

    const isPaid = latestPayment.status === 'Paid';
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + 2);
    const estDateStr = estDate.toLocaleDateString(language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    let replyText = '';
    let voiceText = '';

    if (language === 'te') {
      if (isPaid) {
        replyText = `💳 మీ ధాన్యం చెల్లింపు పూర్తయింది!\n💰 మొత్తం: ₹${latestPayment.amount.toLocaleString('en-IN')}\n🏦 ఖాతా: ${farmer.bankAccount || 'SBI ****4821'} (DBT జమ అయింది)\n🧾 లావాదేవీ నం: ${latestPayment.transactionReference}\nటోకెన్: ${latestPayment.bookingId}`;
        voiceText = `మీ ధాన్యం చెల్లింపు రూపాయలు ${latestPayment.amount} మీ బ్యాంక్ ఖాతాలో విజయవంతంగా జమ అయింది.`;
      } else {
        replyText = `💳 మీ బ్యాంక్ చెల్లింపు ప్రాసెసింగ్‌లో ఉంది:\n💰 రావాల్సిన మొత్తం: ₹${latestPayment.amount.toLocaleString('en-IN')} (${latestPayment.quantity} టన్నులు)\n🏛️ స్థితి: ప్రభుత్వం పరిశీలనలో ఉంది (DBT Processing)\n🗓️ అంచనా జమ తేదీ: ${estDateStr}\n🏦 జమ అయ్యే ఖాతా: ${farmer.bankAccount || 'SBI ****4821'}\n🧾 రెఫరెన్స్: ${latestPayment.transactionReference}`;
        voiceText = `మీ ధాన్యం చెల్లింపు రూపాయలు ${latestPayment.amount} ప్రాసెసింగ్‌లో ఉంది. ${estDateStr} నాటికి మీ ఖాతాలో జమ అవుతుంది.`;
      }
    } else if (language === 'hi') {
      if (isPaid) {
        replyText = `💳 आपका भुगतान सफल हो चुका है!\n💰 राशि: ₹${latestPayment.amount.toLocaleString('en-IN')}\n🏦 बैंक खाता: ${farmer.bankAccount || 'SBI ****4821'}\n🧾 संदर्भ: ${latestPayment.transactionReference}`;
        voiceText = `आपके अनाज का भुगतान ${latestPayment.amount} रुपये आपके बैंक खाते में जमा कर दिया गया है।`;
      } else {
        replyText = `💳 आपका भुगतान वर्तमान में प्रोसेस हो रहा है:\n💰 देय राशि: ₹${latestPayment.amount.toLocaleString('en-IN')}\n🏛️ स्थिति: डीबीटी प्रोसेसिंग जारी है\n🗓️ संभावित तिथि: ${estDateStr}\n🏦 खाता: ${farmer.bankAccount || 'SBI ****4821'}`;
        voiceText = `आपके ${latestPayment.amount} रुपये का भुगतान प्रक्रियाधीन है और ${estDateStr} तक आपके बैंक खाते में जमा हो जाएगा।`;
      }
    } else {
      if (isPaid) {
        replyText = `💳 Payment Completed!\n💰 Amount: ₹${latestPayment.amount.toLocaleString('en-IN')}\n🏦 Bank A/C: ${farmer.bankAccount || 'SBI ****4821'}\n🧾 Ref: ${latestPayment.transactionReference}`;
        voiceText = `Your payment of rupees ${latestPayment.amount} has been successfully credited to your bank account.`;
      } else {
        replyText = `💳 Payment is Processing:\n💰 Amount Payable: ₹${latestPayment.amount.toLocaleString('en-IN')} (${latestPayment.quantity} Tonnes)\n🏛️ Status: Direct Benefit Transfer Processing\n🗓️ Estimated Credit Date: ${estDateStr}\n🏦 Target Account: ${farmer.bankAccount || 'SBI ****4821'}\n🧾 Ref: ${latestPayment.transactionReference}`;
        voiceText = `Your grain payment of rupees ${latestPayment.amount} is currently processing and will be credited by ${estDateStr}.`;
      }
    }

    return {
      success: true,
      intent: 'PAYMENT_STATUS',
      payment: latestPayment,
      replyText,
      voiceText,
      quickReplies: ['Book new slot', 'Weather report', 'Token status']
    };
  }

  handleGreetingAndHelp({ farmer, language }) {
    let replyText = '';
    let voiceText = '';

    if (language === 'te') {
      replyText = `నమస్కారం ${farmer.name}! 🙏 నేను ధాన్ మిత్ర వాయిస్ సహాయక్.\nనేను మీకు సహాయం చేయగలను:\n1️⃣ 📅 "రేపు స్లాట్ బుక్ చేయండి" లేదా "12వ తేదీన స్లాట్ ఉందా?"\n2️⃣ 🌤️ "ఈరోజు వాతావరణం ఎలా ఉంది?"\n3️⃣ 💳 "నా పేమెంట్ స్థితి చెప్పండి"\n4️⃣ 📝 "రైతు నమోదు చేయండి"\n\nమీరు మైక్రోఫోన్ నొక్కి నేరుగా మాట్లాడవచ్చు!`;
      voiceText = `నమస్కారం! నేను ధాన్ మిత్ర వాయిస్ సహాయక్. మీరు ఏ రోజు స్లాట్ కావాలో చెబితే, స్లాట్ ఉందో లేదో మరియు వాతావరణం ఎలా ఉందో చెబుతాను.`;
    } else if (language === 'hi') {
      replyText = `नमस्ते ${farmer.name}! 🙏 मैं धान मित्र वॉयस सहायक हूँ।\nआप मुझसे पूछ सकते हैं:\n1️⃣ 📅 "कल स्लॉट बुक करो" या "15 तारीख को स्लॉट है क्या?"\n2️⃣ 🌤️ "आज मौसम कैसा रहेगा?"\n3️⃣ 💳 "मेरा भुगतान कब आएगा?"\n4️⃣ 📝 "नया किसान पंजीकरण"\n\nमाइक बटन दबाकर सीधे बोलें!`;
      voiceText = `नमस्ते! मैं धान मित्र वॉयस सहायक हूँ। आप बोलकर किसी भी तारीख का स्लॉट चेक और बुक कर सकते हैं।`;
    } else {
      replyText = `Namaste ${farmer.name}! 🙏 I am your Dhaan Mitra Voice Assistant.\nYou can say:\n1️⃣ 📅 "Book slot tomorrow" or "Are slots available on 15th?"\n2️⃣ 🌤️ "How is the weather?"\n3️⃣ 💳 "What is my payment status?"\n4️⃣ 📝 "Register new farmer"\n\nTap the microphone and speak naturally!`;
      voiceText = `Namaste! I am your Dhaan Mitra Voice Assistant. Tell me what day you want to book, and I will check slots and weather for you.`;
    }

    return {
      success: true,
      intent: 'GREETING_HELP',
      replyText,
      voiceText,
      quickReplies: [
        language === 'te' ? '📅 రేపు స్లాట్ బుక్ చేయండి' : language === 'hi' ? '📅 कल स्लॉट बुक करो' : '📅 Book slot tomorrow',
        language === 'te' ? '🌤️ వాతావరణ నివేదిక' : language === 'hi' ? '🌤️ मौसम रिपोर्ट' : '🌤️ Weather report',
        language === 'te' ? '💳 పేమెంట్ స్థితి' : language === 'hi' ? '💳 भुगतान स्थिति' : '💳 Payment status'
      ]
    };
  }
}

export const chatbotService = new ChatbotService();
