import { db } from '../db.js';
import { weatherService } from './weatherService.js';
import { notificationService } from './notificationService.js';

/**
 * Advanced Multilingual Voice Chatbot Service for Dhaan Mitra
 * Features extensive colloquial keywords, robust typo handling,
 * day-specific weather forecast, and weather integration in slot availability.
 */

// Comprehensive dictionary and regex for date and relative day extraction
export function parseRequestedDate(rawText) {
  if (!rawText) return getDefaultDate();
  const text = rawText.toLowerCase().replace(/[^a-z0-9ఀ-౿ऀ-ॿ\s]/gi, ' ');
  const today = new Date();

  // 1. DAY AFTER TOMORROW (Check this BEFORE tomorrow to avoid substring collisions)
  const dayAfterTomorrowRegex = /\b(day\s*after\s*to?m(?:o|r)+o?w?|day\s*after\s*tmr?o?w?|dayafterto?m(?:o|r)+o?w?|dayaftertmor|dayaftertmrw|day\s*aftr\s*tmro|day\s*aftr\s*tmrw|day\s*after\s*kal|dat|overmorrow|ఎల్లుండి|ellundi|elundi|yalundi|yelundi|ellundhi|rendu\s*rojula\s*tarwata|parson|parso|parson\s*ka|parso\s*ka|do\s*din\s*baad)\b/i;
  if (dayAfterTomorrowRegex.test(text) || text.includes('dayaftertmor') || text.includes('dayafter') || text.includes('ellundi') || text.includes('parso')) {
    const d = new Date(today);
    d.setDate(today.getDate() + 2);
    return { date: d.toISOString().split('T')[0], dayLabel: 'Day After Tomorrow', offset: 2 };
  }

  // 2. TOMORROW
  const tomorrowRegex = /\b(to?m(?:o|r)+o?w?|tmro|tmrw|tmr|tomoro|tomorow|tommorow|tommorrow|nxt\s*day|next\s*day|రేపు|repu|repati|repatiki|repu\s*podduna|kal|kal\s*ka|kal\s*subah|agle\s*din)\b/i;
  if (tomorrowRegex.test(text) || text.includes('tmro') || text.includes('tmrw') || text.includes('repu') || text.includes('kal')) {
    const d = new Date(today);
    d.setDate(today.getDate() + 1);
    return { date: d.toISOString().split('T')[0], dayLabel: 'Tomorrow', offset: 1 };
  }

  // 3. TODAY
  const todayRegex = /\b(today|tdy|this\s*day|current\s*day|ఈరోజు|eroju|ee\s*roju|eeroju|nedu|aaj|aaj\s*ka)\b/i;
  if (todayRegex.test(text) || text.includes('eroju') || text.includes('aaj')) {
    return { date: today.toISOString().split('T')[0], dayLabel: 'Today', offset: 0 };
  }

  // 4. DAY OF THE WEEK (e.g. Monday, Tuesday, etc.)
  const weekdays = [
    { names: ['sunday', 'aadivaram', 'itwar', 'ravivar', 'ఆదివారం'], dayIndex: 0 },
    { names: ['monday', 'somavaram', 'somwar', 'సోమవారం'], dayIndex: 1 },
    { names: ['tuesday', 'mangalavaram', 'mangalwar', 'మంగళవారం'], dayIndex: 2 },
    { names: ['wednesday', 'budhavaram', 'budhwar', 'బుధవారం'], dayIndex: 3 },
    { names: ['thursday', 'guruvaram', 'guruwar', 'గురువారం'], dayIndex: 4 },
    { names: ['friday', 'shukravaram', 'shukrawar', 'శుక్రవారం'], dayIndex: 5 },
    { names: ['saturday', 'shanivaram', 'shaniwar', 'శనివారం'], dayIndex: 6 }
  ];

  for (const w of weekdays) {
    if (w.names.some(n => text.includes(n))) {
      const currentDay = today.getDay();
      let diff = w.dayIndex - currentDay;
      if (diff <= 0) diff += 7; // Next occurrence
      const d = new Date(today);
      d.setDate(today.getDate() + diff);
      const dayNameCapital = w.names[0].charAt(0).toUpperCase() + w.names[0].slice(1);
      return { date: d.toISOString().split('T')[0], dayLabel: dayNameCapital, offset: diff };
    }
  }

  // 5. ISO FORMAT YYYY-MM-DD
  const isoMatch = text.match(/\b\d{4}-\d{2}-\d{2}\b/);
  if (isoMatch) {
    return { date: isoMatch[0], dayLabel: isoMatch[0], offset: 1 };
  }

  // 6. SPECIFIC DAY NUMBER (Only when explicit calendar date indicators are present like 11th, 12 तारीख, 15వ తేదీ)
  const explicitDateMatch = text.match(/(\b\d{1,2})(?:st|nd|rd|th|వ|va|\s*తారీఖు|\s*తేదీ|\s*तारीख|\s*tareekh|\s*date)\b/i);
  if (explicitDateMatch) {
    const dayNum = parseInt(explicitDateMatch[1], 10);
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
      const diff = Math.round((d - today) / (1000 * 60 * 60 * 24));
      return { date: d.toISOString().split('T')[0], dayLabel: `${dayNum}th`, offset: diff };
    }
  }

  return getDefaultDate();
}

function getDefaultDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return { date: d.toISOString().split('T')[0], dayLabel: 'Tomorrow', offset: 1 };
}

// Extract Quantity (tonnes, tons, quintals, bags)
function extractQuantity(text) {
  if (!text) return null;
  // Tonnes / Tons / టన్నులు / टन
  const tonMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:tonnes?|tons?|tonne|ton|t|టన్నులు?|tannulu|tannu|टन|तन)\b/i);
  if (tonMatch) {
    const q = parseFloat(tonMatch[1]);
    if (!isNaN(q) && q > 0) return q;
  }
  // Quintals (1 tonne = 10 quintals)
  const qtlMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:quintals?|qtl|క్వింటాళ్ళు?|kuntalu|क्विंटल)\b/i);
  if (qtlMatch) {
    const q = parseFloat(qtlMatch[1]);
    if (!isNaN(q) && q > 0) return parseFloat((q / 10).toFixed(1));
  }
  // Bags / బస్తాలు (approx 50kg = 0.05 tonne, or 20 bags = 1 tonne)
  const bagMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:bags?|బస్తాలు?|bostalu|boralu|बोरी|थैले)\b/i);
  if (bagMatch) {
    const bags = parseFloat(bagMatch[1]);
    if (!isNaN(bags) && bags > 0) return parseFloat((bags * 0.05).toFixed(1));
  }
  // Standalone numbers following keywords
  const standaloneMatch = text.match(/(?:quantity|qty|పరిమాణం|मात्रा)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
  if (standaloneMatch) {
    const q = parseFloat(standaloneMatch[1]);
    if (!isNaN(q) && q > 0) return q;
  }
  return null;
}

// Extract preferred time slot from informal speech (e.g., "tmro 11", "11 o clock", "11 am", "11:00", "11 baje", "11 gantalu")
function extractTimeSlot(text) {
  if (!text) return null;
  const lower = text.toLowerCase();

  // Explicit or standalone 11 (e.g., "tmro 11", "11 o clock", "11am", "at 11", "11:00")
  if (/\b(11\s*am|11:00|11\s*o'?\s*clock|11\s*oclock|11\s*గంట|11\s*baje|11\s*ki|11\s*ku|at\s*11|for\s*11|\b11\b)/i.test(lower)) {
    // Only treat standalone "11" as time if not explicitly saying "11th" or "11 tareekh"
    if (!/\b11\s*(?:st|nd|rd|th|వ|తారీఖు|తేదీ|तारीख|tareekh|date)\b/i.test(lower)) {
      return '11:00 AM - 12:00 PM';
    }
  }

  // 8 AM
  if (/\b(8\s*am|08:00|8:00|8\s*o'?\s*clock|8\s*oclock|8\s*గంట|8\s*baje|at\s*8|for\s*8|\b8\b)/i.test(lower)) {
    if (!/\b8\s*(?:st|nd|rd|th|వ|తారీఖు|తేదీ|तारीख|tareekh|date)\b/i.test(lower)) {
      return '08:00 AM - 09:00 AM';
    }
  }

  // 9 AM
  if (/\b(9\s*am|09:00|9:00|9\s*o'?\s*clock|9\s*oclock|9\s*గంట|9\s*baje|at\s*9|for\s*9|\b9\b)/i.test(lower)) {
    if (!/\b9\s*(?:st|nd|rd|th|వ|తారీఖు|తేదీ|तारीख|tareekh|date)\b/i.test(lower)) {
      return '09:00 AM - 10:00 AM';
    }
  }

  // 10 AM
  if (/\b(10\s*am|10:00|10\s*o'?\s*clock|10\s*oclock|10\s*గంట|10\s*baje|at\s*10|for\s*10|\b10\b)/i.test(lower)) {
    if (!/\b10\s*(?:st|nd|rd|th|వ|తారీఖు|తేదీ|तारीख|tareekh|date)\b/i.test(lower)) {
      return '10:00 AM - 11:00 AM';
    }
  }

  // 12 PM (Noon)
  if (/\b(12\s*pm|12:00|12\s*o'?\s*clock|12\s*oclock|12\s*గంట|12\s*baje|at\s*12|for\s*12|\b12\b)/i.test(lower)) {
    if (!/\b12\s*(?:st|nd|rd|th|వ|తారీఖు|తేదీ|तारीख|tareekh|date)\b/i.test(lower)) {
      return '12:00 PM - 01:00 PM';
    }
  }

  // 1 PM
  if (/\b(1\s*pm|01:00|1:00|1\s*o'?\s*clock|1\s*oclock|1\s*గంట|1\s*baje|at\s*1|for\s*1|\b1\b)/i.test(lower)) {
    if (!/\b1\s*(?:st|nd|rd|th|వ|తారీఖు|తేదీ|तारीख|tareekh|date)\b/i.test(lower)) {
      return '01:00 PM - 02:00 PM';
    }
  }

  // 2 PM
  if (/\b(2\s*pm|02:00|2:00|2\s*o'?\s*clock|2\s*oclock|2\s*గంట|2\s*baje|at\s*2|for\s*2|\b2\b)/i.test(lower)) {
    if (!/\b2\s*(?:st|nd|rd|th|వ|తారీఖు|తేదీ|तारीख|tareekh|date)\b/i.test(lower)) {
      return '02:00 PM - 03:00 PM';
    }
  }

  // 3 PM
  if (/\b(3\s*pm|03:00|3:00|3\s*o'?\s*clock|3\s*oclock|3\s*గంట|3\s*baje|at\s*3|for\s*3|\b3\b)/i.test(lower)) {
    if (!/\b3\s*(?:st|nd|rd|th|వ|తారీఖు|తేదీ|तारीख|tareekh|date)\b/i.test(lower)) {
      return '03:00 PM - 04:00 PM';
    }
  }

  return null;
}

export function detectLanguage(text, fallbackLang = 'te') {
  if (!text) return fallbackLang || 'te';

  // 1. Unicode Script Detection (highest precedence)
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  if (/[\u0900-\u097F]/.test(text)) return 'hi';

  const lower = text.toLowerCase();

  // 2. Distinctive Language Markers (Telugu vs Hindi)
  const teluguMarkers = [
    'repu', 'repati', 'repatiki', 'ellundi', 'elundi', 'eroju', 'eeroju', 'nedu', 
    'gantalu', 'gantaku', 'ganta', 'cheyandi', 'chudandi', 'chesuko', 'cheyyandi',
    'vatavaranam', 'vathavaranam', 'varsham', 'vaana', 'paisalu', 'dabulu', 'dabbulu', 
    'vachinda', 'kuntalu', 'bostalu', 'tannulu', 'namaskaram', 'undha', 'undi'
  ];

  const hindiMarkers = [
    'kal', 'parso', 'parson', 'aaj', 'baje', 'karo', 'karein', 'kardo', 'dekho', 'batao',
    'mausam', 'barish', 'barsat', 'paise', 'rupaye', 'rupya', 'aaya', 'aayega', 'khata', 
    'bheejo', 'shukriya', 'namaste', 'hai', 'kya', 'chahiye', 'karna'
  ];

  const teScore = teluguMarkers.filter(k => new RegExp(`\\b${k}\\b`, 'i').test(lower)).length;
  const hiScore = hindiMarkers.filter(k => new RegExp(`\\b${k}\\b`, 'i').test(lower)).length;

  if (teScore > hiScore && teScore > 0) return 'te';
  if (hiScore > teScore && hiScore > 0) return 'hi';

  // 3. Pure English phrase detection
  const englishMarkers = [
    'tomorrow', 'yesterday', 'today', 'weather', 'forecast', 'payment', 'status',
    'please', 'how', 'what', 'when', 'where', 'morning', 'afternoon', 'evening',
    'confirm', 'check', 'book', 'booking', 'tonnes', 'tons'
  ];
  const enScore = englishMarkers.filter(k => new RegExp(`\\b${k}\\b`, 'i').test(lower)).length;
  if (enScore > 0) return 'en';

  return (fallbackLang === 'te' || fallbackLang === 'hi' || fallbackLang === 'en') ? fallbackLang : 'te';
}

export class ChatbotService {
  async processMessage({ text = '', language = 'te', farmerId = 'FARM-101', pendingState = null }) {
    const input = text.trim();
    const lower = input.toLowerCase();
    
    // Auto-detect script so Telugu questions ALWAYS get Telugu responses
    const effectiveLang = detectLanguage(input, language === 'visual' ? 'te' : (language || 'te'));

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

    // ----------------------------------------------------------------------
    // 1. REGISTRATION INTENT (Large Vocabulary)
    // ----------------------------------------------------------------------
    const regKeywords = [
      'register', 'registration', 'registraion', 'signup', 'sign up', 'new farmer',
      'నమోదు', 'రైతు నమోదు', 'namodu', 'పంజికరణ్', 'పట్టా', 'కొత్త రైతు',
      'पंजीकरण', 'नया किसान', 'रजिस्टर'
    ];
    if (pendingState?.action === 'REGISTER' || regKeywords.some(k => lower.includes(k))) {
      return this.handleRegistration({ input, farmer, language: effectiveLang, pendingState });
    }

    // ----------------------------------------------------------------------
    // 2. PAYMENT STATUS INTENT (Large Vocabulary)
    // ----------------------------------------------------------------------
    const paymentKeywords = [
      'payment', 'paymnt', 'pymnt', 'money', 'amount', 'bank', 'dbt', 'subsidy',
      'balance', 'paisa', 'paise', 'cash', 'account', 'credit',
      'పేమెంట్', 'చెల్లింపు', 'పైసలు', 'డబ్బులు', 'ఖాతా', 'ఖాతాలో', 'రాలేదు', 'వచ్చిందా', 'స్థితి',
      'भुगतान', 'पैसे', 'रुपये', 'खाते', 'खाता', 'आया क्या', 'कब आएगा', 'स्थिति'
    ];
    if (paymentKeywords.some(k => lower.includes(k))) {
      return this.handlePaymentStatus({ farmer, language: effectiveLang });
    }

    // ----------------------------------------------------------------------
    // 3. CONFIRM BOOKING INTENT
    // ----------------------------------------------------------------------
    const confirmKeywords = [
      'confirm', 'yes', 'book it', 'confirm booking', 'ok book', 'sure', 'proceed',
      'ఖరారు', 'ఖరారు చేయండి', 'చేయండి', 'హా', 'అవును', 'బుక్ చేయండి', 'ఓకే చేయండి',
      'हाँ', 'पक्का', 'बुक करो', 'कर दो', 'कन्फर्म', 'हाँ बुक करो'
    ];
    if (confirmKeywords.some(k => lower.includes(k)) && (pendingState?.action === 'AWAITING_BOOKING_CONFIRM' || pendingState?.date)) {
      return this.handleBookingConfirmation({ input, farmer, language: effectiveLang, pendingState });
    }

    // ----------------------------------------------------------------------
    // 4. WEATHER FORECAST INTENT (When not asking to book a slot)
    // ----------------------------------------------------------------------
    const weatherKeywords = [
      'weather', 'wether', 'weathr', 'wethr', 'forecast', 'forecate', 'forecaste', 'forcast', 'forecost',
      'temperature', 'temp', 'rain', 'rainfall', 'rainy', 'raining', 'sun', 'sunny', 'sunshine', 'cloud', 'cloudy', 'humidity',
      'వాతావరణం', 'వాతావరణ', 'vatavaranam', 'vathavaranam', 'vaathavaranam', 'వర్షం', 'varsham', 'వాన', 'vana', 'vaana', 'ఎండ', 'yenda', 'enda', 'తేమ',
      'मौसम', 'mausam', 'mosam', 'बारिश', 'barish', 'barsat', 'धूप', 'dhoop', 'dhup', 'बादल'
    ];

    const isExplicitWeather = weatherKeywords.some(k => lower.includes(k));
    const isSlotQuery = lower.includes('slot') || lower.includes('slott') || lower.includes('స్లాట్') || lower.includes('స్లాట్లు') || lower.includes('स्लॉट') || lower.includes('బుక్') || lower.includes('book');

    if (isExplicitWeather && !isSlotQuery) {
      return this.handleWeatherQuery({ input, farmer, language: effectiveLang });
    }

    // ----------------------------------------------------------------------
    // 5. SLOT AVAILABILITY & DIRECT BOOKING INTENT (With Integrated Weather!)
    // ----------------------------------------------------------------------
    if (isSlotQuery || isExplicitWeather || lower.includes('tmro') || lower.includes('tomorrow') || lower.includes('dayafter') || lower.includes('repu') || lower.includes('ellundi') || lower.includes('kal') || lower.includes('parso')) {
      return this.handleSlotCheckAndBooking({ input, farmer, language: effectiveLang, pendingState });
    }

    // ----------------------------------------------------------------------
    // 6. DEFAULT / GREETING / HELP
    // ----------------------------------------------------------------------
    return this.handleGreetingAndHelp({ farmer, language: effectiveLang });
  }

  /**
   * FEATURE 1: Check Slot Availability on Specified Day WITH Integrated Weather & Quantity
   */
  async handleSlotCheckAndBooking({ input, farmer, language, pendingState }) {
    const dateInfo = parseRequestedDate(input);
    const targetDate = dateInfo.date || pendingState?.date;
    const dayLabel = dateInfo.dayLabel || 'Tomorrow';
    const detectedQty = extractQuantity(input) || pendingState?.quantity;
    const detectedTime = extractTimeSlot(input) || pendingState?.selectedTime;

    const centerId = 'PROC-001';
    const center = db.findOne('procurementCenters', c => c.id === centerId) || {
      name: 'Warangal Agricultural Market Yard',
      dailyCapacity: 100.0,
      district: 'Warangal'
    };

    // Get date-specific weather forecast!
    const weather = weatherService.getWeather(center.district || 'Warangal', targetDate);
    const isRainRisk = weather.rainfallProbability > 30;

    // Query available slots
    let existingSlots = db.find('slots', s => s.centerId === centerId && s.date === targetDate);
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
    const availableTimeList = availableSlots.slice(0, 4).map(s => s.startTime).join(', ');

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
        replyText = `క్షమించండి, ${formattedDisplayDate} (${dayLabel}) తేదీన అన్ని స్లాట్లు నిండిపోయాయి. దయచేసి వేరే రోజు ఎంచుకోండి.`;
        voiceText = `క్షమించండి, ${formattedDisplayDate} నాడు స్లాట్లు ఖాళీగా లేవు. దయచేసి వేరే తేదీని అడగండి.`;
      } else if (language === 'hi') {
        replyText = `माफ़ कीजिए, ${formattedDisplayDate} (${dayLabel}) को सभी स्लॉट भर चुके हैं।`;
        voiceText = `माफ़ कीजिए, ${formattedDisplayDate} को स्लॉट उपलब्ध नहीं हैं।`;
      } else {
        replyText = `Sorry, no slots are available on ${formattedDisplayDate} (${dayLabel}). All capacity is booked.`;
        voiceText = `Sorry, slots are not available on ${formattedDisplayDate}. Please choose another day.`;
      }

      return {
        success: true,
        intent: 'SLOT_CHECK',
        available: false,
        language,
        date: targetDate,
        dayLabel,
        replyText,
        voiceText,
        slots: [],
        weather,
        quickReplies: [
          language === 'te' ? 'రేపటి స్లాట్లు తనిఖీ చేయండి' : language === 'hi' ? 'कल के स्लॉट चेक करें' : 'Check tomorrow slots',
          language === 'te' ? 'ఎల్లుండి స్లాట్లు' : language === 'hi' ? 'परसों के स्लॉट' : 'Check day after tomorrow',
          language === 'te' ? 'వాతావరణ నివేదిక' : language === 'hi' ? 'मौसम रिपोर्ट' : 'Weather forecast'
        ]
      };
    }

    // SLOTS ARE AVAILABLE -> ALWAYS STATE THE WEATHER FORECAST ON THAT DAY!
    const timeHighlight = detectedTime ? detectedTime : `సమయాలు: ${availableTimeList}`;
    const timeHighlightEn = detectedTime ? `the ${detectedTime} slot` : `available times (${availableTimeList})`;
    const timeHighlightHi = detectedTime ? `${detectedTime} का स्लॉट` : `उपलब्ध समय: ${availableTimeList}`;

    if (language === 'te') {
      const weatherDesc = isRainRisk 
        ? `వర్షం పడే అవకాశం ${weather.rainfallProbability}% ఉంది (జాగ్రత్త: ధాన్యం తడవకుండా కప్పండి).` 
        : `వాతావరణం ఎండగా ఉంటుంది ☀️ (వర్షం అవకాశం ${weather.rainfallProbability}% మాత్రమే, ఎండబెట్టడానికి అనుకూలం).`;

      if (detectedTime) {
        replyText = `అవును! ${formattedDisplayDate} (${dayLabel}) నాడు ఉదయం ${detectedTime} స్లాట్ అందుబాటులో ఉంది!\n🌤️ ఆ రోజు వాతావరణం: ${weather.condition}, ఉష్ణోగ్రత ${weather.temperature}°C, ${weatherDesc}\n⚖️ మీ ధాన్యం పరిమాణం: ${finalQuantity} టన్నులు.\n\nఈ సమయం మీకు సమ్మతమేనా? బుకింగ్ ఖరారు చేయమంటారా? ("బుక్ చేయండి" అని చెప్పండి).`;
        voiceText = `అవును! ${dayLabel} ${formattedDisplayDate} నాడు ${detectedTime.split(' - ')[0]} స్లాట్ అందుబాటులో ఉంది. ఆ రోజు వాతావరణం: ఉష్ణోగ్రత ${weather.temperature} డిగ్రీలు, ${weatherDesc} మీ ${finalQuantity} టన్నుల బుకింగ్ ఖరారు చేయమంటారా? బుక్ చేయండి అని చెప్పండి.`;
      } else if (hasQuantity) {
        replyText = `అవును! ${formattedDisplayDate} (${dayLabel}) నాడు స్లాట్లు అందుబాటులో ఉన్నాయి!\n⏰ అందుబాటులో ఉన్న సమయాలు: ${availableTimeList}.\n🌤️ ఆ రోజు వాతావరణం: ${weather.condition}, ఉష్ణోగ్రత ${weather.temperature}°C, ${weatherDesc}\n⚖️ మీ ధాన్యం పరిమాణం: ${finalQuantity} టన్నులు.\n\nఈ సమయం మీకు సమ్మతమేనా? బుకింగ్ ఖరారు చేయమంటారా? ("బుక్ చేయండి" అని చెప్పండి).`;
        voiceText = `అవును! ${dayLabel} ${formattedDisplayDate} నాడు స్లాట్లు అందుబాటులో ఉన్నాయి. అందుబాటులో ఉన్న సమయాలు ${availableTimeList}. ఆ రోజు వాతావరణం: ఉష్ణోగ్రత ${weather.temperature} డిగ్రీలు, ${weatherDesc} మీ ${finalQuantity} టన్నుల బుకింగ్ ఖరారు చేయమంటారా? బుక్ చేయండి అని చెప్పండి.`;
      } else {
        replyText = `అవును! ${formattedDisplayDate} (${dayLabel}) నాడు స్లాట్లు అందుబాటులో ఉన్నాయి!\n⏰ అందుబాటులో ఉన్న సమయాలు: ${availableTimeList}.\n🌤️ ఆ రోజు వాతావరణం: ${weather.condition}, ఉష్ణోగ్రత ${weather.temperature}°C, ${weatherDesc}\n\nదయచేసి మీ ధాన్యం ఎన్ని టన్నులో చెప్పి, స్లాట్ బుక్ చేయండి! (ఉదాహరణ: "4.5 టన్నులు బుక్ చేయండి")`;
        voiceText = `అవును! ${dayLabel} ${formattedDisplayDate} నాడు స్లాట్లు అందుబాటులో ఉన్నాయి. సమయాలు: ${availableTimeList}. ఆ రోజు వాతావరణం: ఉష్ణోగ్రత ${weather.temperature} డిగ్రీలు, ${weatherDesc} దయచేసి ఎన్ని టన్నులో చెప్పి, బుకింగ్ ఖరారు చేయండి.`;
      }
    } else if (language === 'hi') {
      const weatherDesc = isRainRisk 
        ? `बारिश की संभावना ${weather.rainfallProbability}% है (अनाज सुरक्षित रखें)।` 
        : `मौसम साफ़ और धूप वाला है ☀️ (बारिश केवल ${weather.rainfallProbability}%, धूप में सुखाने के लिए उत्तम)।`;

      if (detectedTime) {
        replyText = `हाँ! ${formattedDisplayDate} (${dayLabel}) को ${detectedTime} का स्लॉट उपलब्ध है!\n🌤️ उस दिन का मौसम: ${weather.condition}, तापमान ${weather.temperature}°C, ${weatherDesc}\n⚖️ मात्रा: ${finalQuantity} टन।\n\nक्या मैं आपकी बुकिंग कन्फर्म कर दूँ? (बोलें "हाँ बुक करो")।`;
        voiceText = `हाँ! ${dayLabel} ${formattedDisplayDate} को ${detectedTime.split(' - ')[0]} का स्लॉट उपलब्ध है। उस दिन मौसम: तापमान ${weather.temperature} डिग्री, ${weatherDesc} क्या मैं ${finalQuantity} टन की बुकिंग पक्की कर दूँ?`;
      } else if (hasQuantity) {
        replyText = `हाँ! ${formattedDisplayDate} (${dayLabel}) को स्लॉट उपलब्ध हैं!\n⏰ उपलब्ध समय: ${availableTimeList}.\n🌤️ उस दिन का मौसम: ${weather.condition}, तापमान ${weather.temperature}°C, ${weatherDesc}\n⚖️ मात्रा: ${finalQuantity} टन।\n\nक्या मैं आपकी बुकिंग कन्फर्म कर दूँ? (बोलें "हाँ बुक करो")।`;
        voiceText = `हाँ! ${dayLabel} ${formattedDisplayDate} को स्लॉट उपलब्ध हैं। समय: ${availableTimeList}। उस दिन मौसम: तापमान ${weather.temperature} डिग्री, ${weatherDesc} क्या मैं ${finalQuantity} टन की बुकिंग पक्की कर दूँ?`;
      } else {
        replyText = `हाँ! ${formattedDisplayDate} (${dayLabel}) को स्लॉट उपलब्ध हैं!\n⏰ उपलब्ध समय: ${availableTimeList}.\n🌤️ उस दिन का मौसम: ${weather.condition}, तापमान ${weather.temperature}°C, ${weatherDesc}\n\nकृपया अपनी अनाज मात्रा (टन) बताएं और बुकिंग की पुष्टि करें।`;
        voiceText = `हाँ! ${dayLabel} ${formattedDisplayDate} को स्लॉट उपलब्ध हैं। समय: ${availableTimeList}। मौसम: तापमान ${weather.temperature} डिग्री, ${weatherDesc} कृपया मात्रा बताएं और बुकिंग कन्फर्म करें।`;
      }
    } else {
      const weatherDesc = isRainRisk 
        ? `Rain probability is ${weather.rainfallProbability}% (keep grain covered).` 
        : `Optimal clear sunny weather ☀️ (Rain chance only ${weather.rainfallProbability}%, ideal for field drying).`;

      if (detectedTime) {
        replyText = `Yes! The ${detectedTime} slot is available on ${formattedDisplayDate} (${dayLabel})!\n🌤️ Weather on that day: ${weather.condition}, Temperature ${weather.temperature}°C, ${weatherDesc}\n⚖️ Quantity: ${finalQuantity} Tonnes.\n\nWould you like me to confirm this booking? (Say "Confirm booking").`;
        voiceText = `Yes! The ${detectedTime.split(' - ')[0]} slot is available on ${dayLabel} ${formattedDisplayDate}. Weather on that day is ${weather.condition}, temperature ${weather.temperature} degrees Celsius, ${weatherDesc} Should I confirm booking for ${finalQuantity} tonnes?`;
      } else if (hasQuantity) {
        replyText = `Yes! Slots are available on ${formattedDisplayDate} (${dayLabel})!\n⏰ Available Times: ${availableTimeList}.\n🌤️ Weather on that day: ${weather.condition}, Temperature ${weather.temperature}°C, ${weatherDesc}\n⚖️ Quantity: ${finalQuantity} Tonnes.\n\nWould you like me to confirm this booking? (Say "Confirm booking").`;
        voiceText = `Yes! Slots are available on ${dayLabel} ${formattedDisplayDate}. Open times are ${availableTimeList}. Weather on that day is ${weather.condition}, temperature ${weather.temperature} degrees Celsius, ${weatherDesc} Should I confirm booking for ${finalQuantity} tonnes?`;
      } else {
        replyText = `Yes! Slots are available on ${formattedDisplayDate} (${dayLabel})!\n⏰ Available Times: ${availableTimeList}.\n🌤️ Weather on that day: ${weather.condition}, Temperature ${weather.temperature}°C, ${weatherDesc}\n\nPlease specify your expected quantity (tonnes) and confirm to book!`;
        voiceText = `Yes! Slots are available on ${dayLabel} ${formattedDisplayDate}. Open times are ${availableTimeList}. Weather on that day is ${weather.condition}, temperature ${weather.temperature} degrees Celsius, ${weatherDesc} Please tell your expected quantity and say confirm to book.`;
      }
    }

    return {
      success: true,
      intent: 'SLOT_AVAILABLE',
      available: true,
      language,
      date: targetDate,
      dayLabel,
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
        dayLabel,
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
   * FEATURE 1 (Part 2): Execute Booking & Dispatch Confirmation Call
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
      replyText = `🎉 మీ స్లాట్ విజయవంతంగా బుక్ అయింది!\n🎫 ప్రొక్యూర్‌మెంట్ టోకెన్ నంబర్: ${tokenNo}\n📍 కేంద్రం: ${centerName}\n📅 తేదీ: ${bookingDate} | సమయం: ${bookingTime}\n⚖️ పరిమాణం: ${quantity} టన్నులు\n\n📞 మీ మొబైల్ (${farmer.phone || '+91 94401 23456'}) కు ఆటోమేటిక్ బుకింగ్ నిర్ధారణ కాల్ పంపబడుతోంది!`;
      voiceText = `మీ స్లాట్ విజయవంతంగా బుక్ అయింది. మీ టోకెన్ నంబర్ ${tokenNo}. మీ మొబైల్ కు ఇప్పుడే ఆటోమేటిక్ బుకింగ్ కాల్ వస్తుంది.`;
    } else if (language === 'hi') {
      replyText = `🎉 आपकी स्लॉट बुकिंग पक्की हो गई है!\n🎫 टोकन नंबर: ${tokenNo}\n📍 खरीद केंद्र: ${centerName}\n📅 तिथि: ${bookingDate} | समय: ${bookingTime}\n⚖️ मात्रा: ${quantity} टन\n\n📞 आपके मोबाइल (${farmer.phone || '+91 94401 23456'}) पर स्वचालित पुष्टि कॉल भेजी जा रही है!`;
      voiceText = `आपकी स्लॉट बुकिंग पक्की हो गई है। आपका टोकन नंबर ${tokenNo} है। आपके मोबाइल पर पुष्टि कॉल आ रही है।`;
    } else {
      replyText = `🎉 Booking Confirmed Successfully!\n🎫 Token Number: ${tokenNo}\n📍 Center: ${centerName}\n📅 Date: ${bookingDate} | Slot: ${bookingTime}\n⚖️ Quantity: ${quantity} Tonnes\n\n📞 An automated confirmation voice call is being sent to your phone (${farmer.phone || '+91 94401 23456'})!`;
      voiceText = `Booking confirmed! Your procurement token number is ${tokenNo}. You will receive an automated confirmation call right now.`;
    }

    return {
      success: true,
      intent: 'BOOKING_CONFIRMED',
      language,
      booking: newBooking,
      tokenNo,
      replyText,
      voiceText,
      callSent: true,
      pendingState: null,
      quickReplies: [
        language === 'te' ? 'టోకెన్ వివరాలు చూడండి' : language === 'hi' ? 'टोकन विवरण देखें' : 'Check token status',
        language === 'te' ? 'వాతావరణ నివేదిక' : language === 'hi' ? 'मौसम रिपोर्ट' : 'Weather report',
        language === 'te' ? 'పేమెంట్ స్థితి' : language === 'hi' ? 'भुगतान स्थिति' : 'Payment status'
      ]
    };
  }

  /**
   * FEATURE 3: Live Weather Report (Handles "tomorrow", "day after tomorrow", "today", specific day)
   */
  async handleWeatherQuery({ input, farmer, language }) {
    const dateInfo = parseRequestedDate(input);
    const targetDate = dateInfo.date;
    const dayLabel = dateInfo.dayLabel;

    const village = farmer.village || 'Gundlapally';
    const district = farmer.district || 'Warangal';

    const targetForecast = weatherService.getWeather(district, targetDate);

    const formattedDate = new Date(targetDate).toLocaleDateString(language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    let replyText = '';
    let voiceText = '';

    if (language === 'te') {
      replyText = `🌤️ ${village} వాతావరణ నివేదిక (${dayLabel}, ${formattedDate}):\n🌡️ ఉష్ణోగ్రత: ${targetForecast.temperature}°C (${targetForecast.condition})\n🌧️ వర్షం అవకాశం: ${targetForecast.rainfallProbability}%\n💧 తేమ (Humidity): ${targetForecast.humidity}%\n🌾 ఎండబెట్టే సలహా: ${targetForecast.dryingAdvice}`;
      voiceText = `${village} లో ${dayLabel} (${formattedDate}) వాతావరణం: ${targetForecast.condition}, ఉష్ణోగ్రత ${targetForecast.temperature} డిగ్రీలు, వర్షం అవకాశం ${targetForecast.rainfallProbability} శాతం. ${targetForecast.dryingAdvice}.`;
    } else if (language === 'hi') {
      replyText = `🌤️ ${village} मौसम रिपोर्ट (${dayLabel}, ${formattedDate}):\n🌡️ तापमान: ${targetForecast.temperature}°C (${targetForecast.condition})\n🌧️ बारिश की संभावना: ${targetForecast.rainfallProbability}%\n💧 आर्द्रता: ${targetForecast.humidity}%\n🌾 एआई सलाह: ${targetForecast.dryingAdvice}`;
      voiceText = `${village} में ${dayLabel} (${formattedDate}) का मौसम: तापमान ${targetForecast.temperature} डिग्री है, बारिश की संभावना ${targetForecast.rainfallProbability} प्रतिशत है। ${targetForecast.dryingAdvice}.`;
    } else {
      replyText = `🌤️ Weather Report for ${village} (${dayLabel}, ${formattedDate}):\n🌡️ Temperature: ${targetForecast.temperature}°C (${targetForecast.condition})\n🌧️ Rainfall Probability: ${targetForecast.rainfallProbability}%\n💧 Humidity: ${targetForecast.humidity}%\n🌾 Advisory: ${targetForecast.dryingAdvice}`;
      voiceText = `Weather for ${village} on ${dayLabel} (${formattedDate}): ${targetForecast.condition}, temperature is ${targetForecast.temperature} degrees Celsius with ${targetForecast.rainfallProbability} percent rain probability. ${targetForecast.dryingAdvice}.`;
    }

    return {
      success: true,
      intent: 'WEATHER_REPORT',
      language,
      weather: targetForecast,
      date: targetDate,
      dayLabel,
      replyText,
      voiceText,
      quickReplies: [
        language === 'te' ? `${dayLabel} స్లాట్ బుక్ చేయండి` : language === 'hi' ? `${dayLabel} स्लॉट बुक करो` : `Book slot for ${dayLabel}`,
        language === 'te' ? 'రేపటి వాతావరణం' : language === 'hi' ? 'कल का मौसम' : 'Weather for tomorrow',
        language === 'te' ? 'ఎల్లుండి వాతావరణం' : language === 'hi' ? 'परसों का मौसम' : 'Weather for day after tomorrow'
      ]
    };
  }

  /**
   * FEATURE 4: Live Payment Status
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
      language,
      payment: latestPayment,
      replyText,
      voiceText,
      quickReplies: [
        language === 'te' ? 'కొత్త స్లాట్ బుక్ చేయండి' : language === 'hi' ? 'नया स्लॉट बुक करो' : 'Book new slot',
        language === 'te' ? 'వాతావరణ నివేదిక' : language === 'hi' ? 'मौसम रिपोर्ट' : 'Weather report',
        language === 'te' ? 'టోకెన్ స్థితి' : language === 'hi' ? 'टोकन स्थिति' : 'Token status'
      ]
    };
  }

  /**
   * FEATURE 2: Farmer Registration
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
        language,
        farmer: newFarmerRecord,
        replyText,
        voiceText,
        pendingState: null,
        quickReplies: [
          language === 'te' ? 'రేపు స్లాట్ బుక్ చేయండి' : language === 'hi' ? 'कल स्लॉट बुक करो' : 'Book slot tomorrow',
          language === 'te' ? 'వాతావరణ నివేదిక' : language === 'hi' ? 'मौसम रिपोर्ट' : 'Check weather',
          language === 'te' ? 'నా వివరాలు చూడండి' : language === 'hi' ? 'मेरी जानकारी' : 'View my details'
        ]
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
      language,
      replyText: promptText,
      voiceText: voicePrompt,
      pendingState: { action: 'REGISTER' },
      quickReplies: ['Ramesh, 9848011223, Aadhaar 9042-8812-4912, 3.5 Acres']
    };
  }

  handleGreetingAndHelp({ farmer, language }) {
    let replyText = '';
    let voiceText = '';

    if (language === 'te') {
      replyText = `నమస్కారం ${farmer.name}! 🙏 నేను ధాన్ మిత్ర వాయిస్ సహాయక్.\nనేను మీకు సహాయం చేయగలను:\n1️⃣ 📅 "రేపు స్లాట్ బుక్ చేయండి" లేదా "ఎల్లుండి స్లాట్ ఉందా?"\n2️⃣ 🌤️ "రేపు వాతావరణం ఎలా ఉంది?" లేదా "ఎల్లుండి వర్షం పడుతుందా?"\n3️⃣ 💳 "నా పేమెంట్ స్థితి చెప్పండి"\n4️⃣ 📝 "రైతు నమోదు చేయండి"\n\nమైక్రోఫోన్ నొక్కి సూటిగా మాట్లాడండి!`;
      voiceText = `నమస్కారం! నేను ధాన్ మిత్ర వాయిస్ సహాయక్. మీరు ఏ రోజు స్లాట్ కావాలో లేదా వాతావరణం సమాచారం కావాలో అడగండి.`;
    } else if (language === 'hi') {
      replyText = `नमस्ते ${farmer.name}! 🙏 मैं धान मित्र वॉयस सहायक हूँ।\nआप मुझसे पूछ सकते हैं:\n1️⃣ 📅 "कल स्लॉट बुक करो" या "परसों का स्लॉट है क्या?"\n2️⃣ 🌤️ "कल मौसम कैसा रहेगा?" या "परसों बारिश होगी क्या?"\n3️⃣ 💳 "मेरा भुगतान कब आएगा?"\n4️⃣ 📝 "नया किसान पंजीकरण"\n\nमाइक बटन दबाकर सीधे बोलें!`;
      voiceText = `नमस्ते! मैं धान मित्र वॉयस सहायक हूँ। आप बोलकर किसी भी तारीख का स्लॉट या मौसम चेक कर सकते हैं।`;
    } else {
      replyText = `Namaste ${farmer.name}! 🙏 I am your Dhaan Mitra Voice Assistant.\nYou can say:\n1️⃣ 📅 "Book slot for tomorrow" or "Slots for day after tomorrow"\n2️⃣ 🌤️ "Weather forecast for tomorrow" or "Weather for day after tomorrow"\n3️⃣ 💳 "What is my payment status?"\n4️⃣ 📝 "Register new farmer"\n\nTap the microphone and speak naturally!`;
      voiceText = `Namaste! I am your Dhaan Mitra Voice Assistant. Ask me about slots or weather for tomorrow or day after tomorrow.`;
    }

    return {
      success: true,
      intent: 'GREETING_HELP',
      language,
      replyText,
      voiceText,
      quickReplies: [
        language === 'te' ? '📅 రేపు స్లాట్ బుక్ చేయండి' : language === 'hi' ? '📅 कल स्लॉट बुक करो' : '📅 Book slot tomorrow',
        language === 'te' ? '📅 ఎల్లుండి స్లాట్ బుక్ చేయండి' : language === 'hi' ? '📅 परसों स्लॉट बुक करो' : '📅 Book slot day after tomorrow',
        language === 'te' ? '🌤️ రేపు వాతావరణం' : language === 'hi' ? '🌤️ कल का मौसम' : '🌤️ Weather tomorrow',
        language === 'te' ? '🌤️ ఎల్లుండి వాతావరణం' : language === 'hi' ? '🌤️ परसों का मौसम' : '🌤️ Weather day after tomorrow'
      ]
    };
  }
}

export const chatbotService = new ChatbotService();
