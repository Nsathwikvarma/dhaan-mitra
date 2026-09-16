import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  te: {
    // App Branding & Navigation
    appTitle: 'ధాన్ మిత్ర',
    appSubtitle: 'తెలంగాణ ప్రభుత్వ స్మార్ట్ రైతు కొనుగోలు వ్యవస్థ',
    selectLang: 'మీ ప్రాధాన్య భాషను ఎంచుకోండి',
    navHome: 'హోమ్',
    navBook: 'స్లాట్ బుకింగ్',
    navPayments: 'చెల్లింపులు',
    navReports: 'నాణ్యత నివేదిక',
    grainHeapInspection: 'ధాన్యపు రాశి తనిఖీ',

    // Role Landing Page
    whoAreYou: 'మీరు ఎవరు? మీ పోర్టల్‌ను ఎంచుకోండి',
    farmerRoleTitle: 'రైతు పోర్టల్',
    farmerRoleDesc: 'స్లాట్ బుకింగ్ · చెల్లింపుల ట్రాకింగ్ · వాతావరణ హెచ్చరికలు',
    procurerRoleTitle: 'కొనుగోలుదారు పోర్టల్',
    procurerRoleDesc: 'ధాన్యం తనిఖీ · IoT తేమ కొలత · స్లాట్ ఆమోదం',
    adminRoleTitle: 'స్టేట్ అడ్మిన్ డాష్‌బోర్డ్',
    adminRoleDesc: 'రాష్ట్ర విశ్లేషణలు · DBT నిధుల విడుదల · పంట నిబంధనలు',
    telanganaGovtFoot: 'SIH 26032 · తెలంగాణ రాష్ట్ర ప్రభుత్వం కొనుగోలు వ్యవస్థ',

    // Auth Screen
    signIn: 'లాగిన్ అవ్వండి',
    registerNewFarmer: 'కొత్త రైతు నమోదు',
    phoneOrAadhaar: 'మొబైల్ నంబర్ లేదా ఆధార్ నంబర్ నమోదు చేయండి',
    sendOtpBtn: '📲 OTP ప్రమాణీకరణ పంపండి',
    enterOtp: '4-అంకెల OTP నమోదు చేయండి (డెమో: 4912)',
    verifyOtp: '🔒 OTP పరిశీలించండి',
    aadhaarSeeded: 'ఆధార్ అనుసంధానం చేయబడింది',
    farmerFullName: 'రైతు పూర్తి పేరు',
    mobilePhone: 'మొబైల్ ఫోన్ నంబర్',
    villageName: 'గ్రామం పేరు',
    aadhaarNum: '12-అంకెల ఆధార్ నంబర్',
    pattadarPassbook: 'పట్టాదార్ పాస్‌బుక్ (సర్వే నంబర్)',
    bankAccountNo: 'బ్యాంక్ ఖాతా సంఖ్య (డైరెక్ట్ DBT)',
    registerAndSeed: '📜 నమోదు & ఆధార్ వివరాలను లింక్ చేయండి',
    openDashboard: '🚜 రైతు డాష్‌బోర్డ్‌ను తెరవండి',
    continueBtn: 'కొనసాగించండి →',

    // Farmer Home Screen
    greeting: 'నమస్కారం',
    dhaanVaaniTag: 'మాట్లాడి స్లాట్ బుక్ చేసుకోండి',
    talkBtn: 'ప్రారంభించండి',
    voiceHint: 'చెప్పండి: "రేపు స్లాట్ బుక్ చేయండి", "వాతావరణం ఎలా ఉంది?", "నా పేమెంట్ స్థితి"',
    activeToken: 'యాక్టివ్ కొనుగోలు టోకెన్',
    yard: 'కొనుగోలు కేంద్రం',
    scheduledDate: 'నిర్ణయించిన తేదీ',
    slot: 'సమయం స్లాట్',
    procurementCompleted: 'కొనుగోలు పూర్తయింది',
    bookSlot: 'కొనుగోలు స్లాట్ బుకింగ్',
    weatherReport: 'గ్రామ వాతావరణ నివేదిక',
    analysisReports: 'ధాన్యం నాణ్యత నివేదిక',
    paymentTracking: 'చెల్లింపుల ట్రాకింగ్',
    reportLockedNote: '🔒 కొనుగోలు అధికారి తనిఖీ పూర్తి చేసిన తర్వాత మాత్రమే ఈ నివేదిక తెరుచుకుంటుంది.',

    // Slot Booking Screen
    selectDate: 'కొనుగోలు తేదీని ఎంచుకోండి (ఈ నెల)',
    safeSunny: 'ఎండ (సురక్షితం)',
    rainWet: 'వర్షం (తడి ప్రమాదం)',
    cropTypeAndQty: 'పంట రకం & పరిమాణం',
    quantityTonnes: 'పరిమాణం (టన్నులలో)',
    fetchWeatherBtn: '🌤️ లైవ్ వాతావరణం & AI సలహా పొందండి',
    locationWeatherReport: 'కొనుగోలు కేంద్రం వద్ద వాతావరణం',
    score: 'స్కోరు',
    rainProbability: 'వర్షం పడే అవకాశాలు',
    humidity: 'తేమ శాతం',
    yardIntake: 'యార్డ్ సామర్థ్యం',
    aiAdvice: 'AI సిఫార్సు సలహా',
    farmerDecisionNote: 'గమనిక: ధాన్యం తెచ్చే తుది నిర్ణయం మీదే.',
    confirmBooking: 'స్లాట్ బుకింగ్ ఖరారు చేయండి',
    returnHome: 'డాష్‌బోర్డ్‌కు తిరిగి వెళ్ళండి',
    bookingConfirmed: 'స్లాట్ బుకింగ్ ఖరారైంది!',
    callSentStatus: 'స్థితి: నిర్ధారణ కాల్ పంపబడింది 📞',
    callSentNote: 'రైతు మొబైల్‌కు స్వయంచాలక వాయిస్ కాల్ పంపబడింది.',

    // Payment Tracking Screen
    moneyFlowTitle: 'బ్యాంక్ ఖాతాకు ప్రత్యక్ష నగదు జమ',
    marketYard: 'మార్కెట్ యార్డ్',
    bankVault: 'బ్యాంక్ వాల్ట్',
    directDbt: 'ప్రత్యక్ష DBT బదిలీ',
    amountDue: 'మొత్తం ఆమోదించిన మొత్తం',
    mspRate: 'కనీస మద్దతు ధర (MSP)',
    expectedBankTransfer: 'అంచనా వేసిన బ్యాంక్ బదిలీ తేదీ',
    transferred: '✅ జమ చేయబడింది',
    processing: '⏳ జమ ప్రక్రియలో ఉంది',
    govtTreasurySeal: 'తెలంగాణ పౌర సరఫరాల శాఖ & వ్యవసాయ శాఖ ద్వారా ధృవీకరించబడింది',

    // Moisture & Quality Report
    moistureMapTitle: 'ధాన్యం తేమ మ్యాప్',
    heapCrossSection: 'ధాన్యపు రాశి తేమ క్రాస్ సెక్షన్',
    partsDry: 'భాగాలు ఎండినవి',
    partsWet: 'భాగాలు తడిగా ఉన్నాయి',
    allDry: '✅ 100% ఎండింది',
    fieldDryingNeeded: '⚠️ ఎండబెట్టడం అవసరం',
    sunDryingRequiredNote: 'కేంద్ర భాగంలో తేమ ఎక్కువగా ఉంది. 2-4 గంటలు ఎండబెట్టాలి.',
    grainReadyNote: 'ధాన్యపు రాశి అన్ని భాగాలలో నిర్దేశిత తేమ (≤ 14.0%) కలిగి ఉంది.',
    officialRegistry: 'అధికారిక కొనుగోలు రిజిస్ట్రీ సర్టిఫికెట్',
    storedAndVerified: 'రికార్డ్ భద్రపరచబడింది',
    registryReportId: 'రిజిస్ట్రీ నివేదిక ID',
    inspectionYard: 'తనిఖీ కేంద్రం & బే',
    netQuantity: 'నికర ధాన్యం పరిమాణం',
    vehiclePlate: 'వాహనం నంబర్',

    // Weather Screen
    clearSun: 'పూర్తి ఎండ',
    rainAlert: 'వర్షం హెచ్చరిక',
    thunderstorm: 'భారీ వర్షం / ఉరుములు',
    sevenDayForecast: '7 రోజుల గ్రామ వాతావరణ సూచన',
    bookSlotClearDay: 'ఎండ రోజున స్లాట్ బుక్ చేసుకోండి →',

    // Procurer Screen
    todaysSchedule: 'నేటి కొనుగోలు షెడ్యూల్',
    pendingInspection: 'పెండింగ్ తనిఖీలు',
    completedInspection: 'పూర్తయిన తనిఖీలు',
    inspectGrain: 'ధాన్యపు రాశిని తనిఖీ చేయండి',
    captureHeap: 'రాశి ఫోటో తీయండి',
    randomPointsGenerated: 'యాదృచ్ఛిక తేమ పాయింట్లు సిద్ధమయ్యాయి',
    vehicleLoadNo: 'వాహనం నంబర్ / బండి నంబర్',
    dryingDaysNeeded: 'ఎండబెట్టాల్సిన రోజులు (అంచనా)',
    lockedDatesNote: 'కనీస ఎండబెట్టే అవసరం వల్ల ముందస్తు తేదీలు లాక్ చేయబడ్డాయి',
    rescheduleSlot: 'మీకు అనుకూలమైన భవిష్యత్ స్లాట్ ఎంచుకోండి',
    submitApprovalBtn: '✅ ఆమోదం సమర్పించండి & రైతు డాష్‌బోర్డ్‌ను నవీకరించండి',
    bookPrioritySlotBtn: '⚡ ప్రాధాన్యత స్లాట్ బుక్ చేయండి & అప్‌డేట్ పంపండి',

    // Multi-Crop & Procurement Standards
    crop: 'పంట',
    cropType: 'పంట రకం',
    cropSelection: 'మీ పంటను ఎంచుకోండి',
    maxMoistureLimit: 'గరిష్ట అనుమతించదగిన తేమ పరిమితి',
    mspRateLabel: 'ప్రభుత్వ MSP మద్దతు ధర',
    allCrops: 'అన్ని రకాల పంటలు',

    // IoT Health, Faulty Detector & Nearby Devices
    iotDiagnostics: 'IoT సెన్సార్ ఆరోగ్య విశ్లేషణ',
    iotHealthStatus: 'IoT సెన్సార్ స్థితి',
    iotHealthy: 'సాధారణం & సిద్ధం (100% ఆపరేషనల్)',
    iotFaulty: '⚠️ లోపం గుర్తించబడింది (సరిగ్గా పనిచేయడం లేదు)',
    iotFaultBanner: '🚨 తీవ్రమైన IoT సెన్సార్ లోపం గుర్తించబడింది!',
    iotFaultWarnMsg: 'తేమ కొలత ప్రోబ్‌లో లోపం గుర్తించబడింది. తప్పుడు కొలతలను నివారించడానికి రీడింగ్ లాక్ చేయబడింది. సమీపంలోని నిరుపయోగంగా ఉన్న IoT పరికరానికి మారండి.',
    nearbyIdleDevices: '📍 సమీపంలో అందుబాటులో ఉన్న ఖాళీ IoT పరికరాలు (నిరుపయోగంలో ఉన్నవి)',
    switchToDevice: '⚡ ఈ పరికరానికి మారండి',
    deviceSwitchedSuccess: 'IoT పరికరం విజయవంతంగా మార్చబడింది! లైవ్ తనిఖీ పునఃప్రారంభించబడింది.',
    simulateFaultBtn: '🧪 IoT ప్రోబ్ లోపాన్ని పరీక్షించండి',
    restoreSensorBtn: '✨ సెన్సార్‌ను పునరుద్ధరించండి',
    idleStatus: 'ఖాళీగా ఉంది (సిద్ధం)',
    inUseStatus: 'వాడుకలో ఉంది',
    probeHealth: 'ప్రోబ్ ఆరోగ్యం',
    batteryLevel: 'బ్యాటరీ',
    signalStrength: 'సిగ్నల్',
    metersAway: 'మీటర్ల దూరంలో',
    bayLocation: 'బే స్థానం'
  },

  hi: {
    // App Branding & Navigation
    appTitle: 'धान मित्र',
    appSubtitle: 'तेलंगाना सरकार स्मार्ट खरीद और गुणवत्ता प्रणाली',
    selectLang: 'अपनी पसंदीदा भाषा चुनें',
    navHome: 'होम',
    navBook: 'स्लॉट बुकिंग',
    navPayments: 'भुगतान',
    navReports: 'गुणवत्ता रिपोर्ट',
    grainHeapInspection: 'अनाज ढेर निरीक्षण',

    // Role Landing Page
    whoAreYou: 'आप कौन हैं? अपना पोर्टल चुनें',
    farmerRoleTitle: 'किसान पोर्टल',
    farmerRoleDesc: 'स्लॉट बुक करें · भुगतान ट्रैक करें · मौसम अलर्ट',
    procurerRoleTitle: 'खरीद अधिकारी पोर्टल',
    procurerRoleDesc: 'अनाज निरीक्षण · IoT नमी परीक्षण · स्लॉट स्वीकृति',
    adminRoleTitle: 'राज्य एडमिन डैशबोर्ड',
    adminRoleDesc: 'राज्य विश्लेषण · डीबीटी भुगतान · फसल विनिर्देश',
    telanganaGovtFoot: 'SIH 26032 · तेलंगाना सरकार खरीद प्रबंधन प्रणाली',

    // Auth Screen
    signIn: 'साइन इन करें',
    registerNewFarmer: 'नया किसान पंजीकरण',
    phoneOrAadhaar: 'मोबाइल नंबर या आधार नंबर दर्ज करें',
    sendOtpBtn: '📲 ओटीपी प्रमाणीकरण भेजें',
    enterOtp: '4-अंकीय ओटीपी दर्ज करें (डेमो: 4912)',
    verifyOtp: '🔒 ओटीपी सत्यापित करें',
    aadhaarSeeded: 'आधार कार्ड सफलतापूर्वक लिंक किया गया',
    farmerFullName: 'किसान का पूरा नाम',
    mobilePhone: 'मोबाइल फ़ोन नंबर',
    villageName: 'गाँव का नाम',
    aadhaarNum: '12-अंकीय आधार संख्या',
    pattadarPassbook: 'पट्टादार पासबुक (सर्वेक्षण संख्या)',
    bankAccountNo: 'बैंक खाता संख्या (सीधा डीबीटी)',
    registerAndSeed: '📜 पंजीकरण और आधार विवरण लिंक करें',
    openDashboard: '🚜 किसान डैशबोर्ड खोलें',
    continueBtn: 'आगे बढ़ें →',

    // Farmer Home Screen
    greeting: 'नमस्ते',
    dhaanVaaniTag: 'बोलकर स्लॉट बुक करें',
    talkBtn: 'शुरू करें',
    voiceHint: 'बोलें: "कल स्लॉट बुक करो", "मौसम कैसा है?", "भुगतान स्थिति"',
    activeToken: 'सक्रिय खरीद टोकन',
    yard: 'खरीद केंद्र (मंडी)',
    scheduledDate: 'निर्धारित तिथि',
    slot: 'समय स्लॉट',
    procurementCompleted: 'खरीद पूर्ण हो चुकी है',
    bookSlot: 'खरीद स्लॉट बुक करें',
    weatherReport: 'गाँव का लाइव मौसम',
    analysisReports: 'गुणवत्ता रिपोर्ट',
    paymentTracking: 'भुगतान स्थिति ट्रैक करें',
    reportLockedNote: '🔒 खरीद अधिकारी द्वारा निरीक्षण पूरा होने के बाद ही यह रिपोर्ट खुलेगी।',

    // Slot Booking Screen
    selectDate: 'खरीद तिथि चुनें (वर्तमान माह)',
    safeSunny: 'धूप (सुरक्षित)',
    rainWet: 'बारिश (गीला जोखिम)',
    cropTypeAndQty: 'फसल का प्रकार और मात्रा',
    quantityTonnes: 'मात्रा (टन में)',
    fetchWeatherBtn: '🌤️ लाइव मौसम और एआई सलाह प्राप्त करें',
    locationWeatherReport: 'खरीद केंद्र पर मौसम रिपोर्ट',
    score: 'स्कोर',
    rainProbability: 'बारिश की संभावना',
    humidity: 'नमी प्रतिशत',
    yardIntake: 'मंडी क्षमता',
    aiAdvice: 'एआई सलाह और सिफारिश',
    farmerDecisionNote: 'नोट: अनाज लाने का अंतिम निर्णय किसान का है।',
    confirmBooking: 'स्लॉट बुकिंग की पुष्टि करें',
    returnHome: 'डैशबोर्ड पर लौटें',
    bookingConfirmed: 'बुकिंग सफलतापूर्वक पक्की हो गई!',
    callSentStatus: 'स्थिति: पुष्टिकरण कॉल भेजी गई 📞',
    callSentNote: 'किसान के मोबाइल नंबर पर स्वचालित वॉइस कॉल भेज दी गई है।',

    // Payment Tracking Screen
    moneyFlowTitle: 'बैंक खाते में सीधा धन हस्तांतरण',
    marketYard: 'मार्केट यार्ड',
    bankVault: 'बैंक वॉल्ट',
    directDbt: 'सीधा डीबीटी भुगतान',
    amountDue: 'कुल स्वीकृत राशि',
    mspRate: 'एमएसपी दर (न्यूनतम समर्थन मूल्य)',
    expectedBankTransfer: 'अनुमानित बैंक ट्रांसफर तिथि',
    transferred: '✅ जमा किया गया',
    processing: '⏳ भुगतान प्रक्रिया में',
    govtTreasurySeal: 'नागरिक आपूर्ति विभाग और कृषि विभाग तेलंगाना द्वारा सत्यापित',

    // Moisture & Quality Report
    moistureMapTitle: 'अनाज नमी मानचित्र',
    heapCrossSection: 'अनाज ढेर नमी क्रॉस-सेक्शन',
    partsDry: 'भाग सूखे हैं',
    partsWet: 'भाग गीले हैं',
    allDry: '✅ 100% सूखा',
    fieldDryingNeeded: '⚠️ सुखाना आवश्यक',
    sunDryingRequiredNote: 'ढेर के मुख्य केंद्र में नमी अधिक है। धूप में सुखाएं।',
    grainReadyNote: 'अनाज के सभी भाग सरकारी मानक नमी के अनुरूप हैं।',
    officialRegistry: 'आधिकारिक खरीद रजिस्ट्री प्रमाणपत्र',
    storedAndVerified: 'रिकॉर्ड सत्यापित एवं सुरक्षित',
    registryReportId: 'रजिस्ट्री रिपोर्ट आईडी',
    inspectionYard: 'निरीक्षण केंद्र व बे',
    netQuantity: 'शुद्ध अनाज मात्रा',
    vehiclePlate: 'वाहन नंबर',

    // Weather Screen
    clearSun: 'साफ़ धूप',
    rainAlert: 'बारिश की चेतावनी',
    thunderstorm: 'आंधी तूफान / भारी बारिश',
    sevenDayForecast: '7-दिवसीय गाँव का मौसम पूर्वानुमान',
    harvestGuidance: 'कटाई और सुखाने के लिए मार्गदर्शन',
    bookSlotClearDay: 'धूप वाले दिन स्लॉट बुक करें →',

    // Procurer Screen
    todaysSchedule: 'आज की खरीद अनुसूची',
    pendingInspection: 'लंबित निरीक्षण',
    completedInspection: 'पूर्ण निरीक्षण',
    inspectGrain: 'अनाज के ढेर का निरीक्षण करें',
    captureHeap: 'ढेर का फोटो खींचें',
    randomPointsGenerated: 'यादृच्छिक नमी बिंदु उत्पन्न किए गए',
    vehicleLoadNo: 'वाहन लोड / प्लेट नंबर',
    dryingDaysNeeded: 'आवश्यक धूप में सुखाने के दिन (अनुमान)',
    lockedDatesNote: 'नमी के कारण शुरुआती तिथियां लॉक हैं',
    rescheduleSlot: 'अपनी पसंद का भावी स्लॉट चुनें',
    submitApprovalBtn: '✅ स्वीकृति सबमिट करें और डैशबोर्ड अपडेट करें',
    bookPrioritySlotBtn: '⚡ प्राथमिकता स्लॉट बुक करें और सूचना भेजें',

    // Multi-Crop & Standards
    crop: 'फसल',
    cropType: 'फसल प्रकार',
    cropSelection: 'अपनी फसल चुनें',
    maxMoistureLimit: 'अधिकतम स्वीकार्य नमी सीमा',
    mspRateLabel: 'सरकारी एमएसपी दर',
    allCrops: 'सभी प्रकार की फसलें',

    // IoT Health, Fault Detector & Nearby Devices
    iotDiagnostics: 'IoT सेंसर स्वास्थ्य विश्लेषण',
    iotHealthStatus: 'IoT सेंसर स्थिति',
    iotHealthy: 'सामान्य और तैयार (100% क्रियाशील)',
    iotFaulty: '⚠️ सेंसर में खराबी का पता चला',
    iotFaultBanner: '🚨 गंभीर IoT सेंसर खराबी चेतावनी!',
    iotFaultWarnMsg: 'सेंसर जांच इलेक्ट्रोड में खराबी पाई गई है। गलत माप से बचने के लिए रीडिंग लॉक कर दी गई है। पास के अप्रयुक्त IoT डिवाइस पर स्विच करें।',
    nearbyIdleDevices: '📍 पास में उपलब्ध अप्रयुक्त IoT उपकरण (उपयोग के लिए तैयार)',
    switchToDevice: '⚡ इस डिवाइस से कनेक्ट करें',
    deviceSwitchedSuccess: 'IoT डिवाइस सफलतापूर्वक कनेक्ट हो गया! निरीक्षण फिर से शुरू।',
    simulateFaultBtn: '🧪 IoT सेंसर खराबी का परीक्षण करें',
    restoreSensorBtn: '✨ सेंसर सामान्य करें',
    idleStatus: 'अप्रयुक्त (तैयार)',
    inUseStatus: 'उपयोग में',
    probeHealth: 'जांच स्वास्थ्य',
    batteryLevel: 'बैटरी',
    signalStrength: 'सिग्नल',
    metersAway: 'मीटर दूरी पर',
    bayLocation: 'बे स्थान'
  },

  en: {
    // App Branding & Navigation
    appTitle: 'Dhaan Mitra',
    appSubtitle: 'Telangana Govt Smart Procurement System',
    selectLang: 'Select Preferred Language',
    navHome: 'Home',
    navBook: 'Book Slot',
    navPayments: 'Payments',
    navReports: 'Quality Reports',
    grainHeapInspection: 'Grain Heap Inspection',

    // Role Landing Page
    whoAreYou: 'Who are you? Select your portal',
    farmerRoleTitle: 'Farmer Portal',
    farmerRoleDesc: 'Book slots · Track payments · Weather alerts',
    procurerRoleTitle: 'Procurer Portal',
    procurerRoleDesc: 'Inspect grain · IoT moisture meter · Approve bookings',
    adminRoleTitle: 'State Admin Dashboard',
    adminRoleDesc: 'State analytics · DBT disbursements · Crop specs',
    telanganaGovtFoot: 'SIH 26032 · Telangana Government Procurement System',

    // Auth Screen
    signIn: 'Sign In',
    registerNewFarmer: 'Register New Farmer',
    phoneOrAadhaar: 'Enter Mobile Phone or Aadhaar Number',
    sendOtpBtn: '📲 Send OTP Authentication',
    enterOtp: 'Enter 4-Digit OTP (Demo: 4912)',
    verifyOtp: '🔒 Verify OTP',
    aadhaarSeeded: 'Aadhaar Seeded & Verified',
    farmerFullName: 'Farmer Full Name',
    mobilePhone: 'Mobile Phone Number',
    villageName: 'Village Name',
    aadhaarNum: '12-Digit Aadhaar Number',
    pattadarPassbook: 'Pattadar Passbook (Survey No.)',
    bankAccountNo: 'Bank Account No. (Direct DBT)',
    registerAndSeed: '📜 Register & Seed Aadhaar Details',
    openDashboard: '🚜 Open Farmer Dashboard',
    continueBtn: 'Continue →',

    // Farmer Home Screen
    greeting: 'Namaste',
    dhaanVaaniTag: 'Speak to Book Slot',
    talkBtn: 'Talk Now',
    voiceHint: 'Say: "Book slot tomorrow", "How is weather?", "Payment status"',
    activeToken: 'ACTIVE PROCUREMENT TOKEN',
    yard: 'Market Yard',
    scheduledDate: 'Scheduled Date',
    slot: 'Time Slot',
    procurementCompleted: 'Procurement Completed',
    bookSlot: 'Book Procurement Slot',
    weatherReport: 'Live Weather Report',
    analysisReports: 'Grain Quality Report',
    paymentTracking: 'Payment Tracking',
    reportLockedNote: '🔒 Grain Quality Report will unlock after Procurer completes Yard Inspection.',

    // Slot Booking Screen
    selectDate: 'Select Procurement Date (Current Month)',
    safeSunny: 'Sunny (Safe)',
    rainWet: 'Rain (Wet Risk)',
    cropTypeAndQty: 'CROP TYPE & QUANTITY',
    quantityTonnes: 'Quantity (in Tonnes)',
    fetchWeatherBtn: '🌤️ Fetch Live Weather & AI Advisory for Selected Date',
    locationWeatherReport: 'Procurement Yard Weather Forecast',
    score: 'Score',
    rainProbability: 'Rainfall Chances',
    humidity: 'Humidity Level',
    yardIntake: 'Yard Intake Capacity',
    aiAdvice: 'AI Advisory Recommendation',
    farmerDecisionNote: 'Note: Final decision to deliver grain rests with you.',
    confirmBooking: 'Confirm Slot Booking',
    returnHome: 'Return to Dashboard',
    bookingConfirmed: 'Slot Booking Confirmed!',
    callSentStatus: 'STATUS: CALL SENT 📞',
    callSentNote: 'Automated confirmation voice call sent by default to farmer\'s mobile.',

    // Payment Tracking Screen
    moneyFlowTitle: 'Live Money Flow to Bank Account',
    marketYard: 'Market Yard',
    bankVault: 'Bank Vault',
    directDbt: 'Direct DBT Transfer',
    amountDue: 'Total Approved Amount',
    mspRate: 'MSP Rate (Govt Mandated)',
    expectedBankTransfer: 'Expected Bank Transfer by',
    transferred: '✅ Transferred',
    processing: '⏳ Direct Transfer Processing',
    govtTreasurySeal: 'Verified by District Treasury & Agriculture Officer, Telangana',

    // Moisture & Quality Report
    moistureMapTitle: 'Grain Moisture Map',
    heapCrossSection: 'Heap Moisture Visual Cross-Section',
    partsDry: 'Parts DRY',
    partsWet: 'Parts WET',
    allDry: '✅ 100% Dry',
    fieldDryingNeeded: '⚠️ Field Drying Required',
    sunDryingRequiredNote: 'Center core contains excess moisture. Spread grain thin in sunlight for 2-4 hours.',
    grainReadyNote: 'All sections of your grain heap meet state procurement standards.',
    officialRegistry: 'Official Stored Procurement Registry',
    storedAndVerified: 'STORED & VERIFIED',
    registryReportId: 'Registry Report ID',
    inspectionYard: 'Inspection Bay & Yard',
    netQuantity: 'Recorded Net Quantity',
    vehiclePlate: 'Vehicle Plate Number',

    // Weather Screen
    clearSun: 'Clear Sun',
    rainAlert: 'Rain Warning',
    thunderstorm: 'Thunderstorm',
    sevenDayForecast: '7-Day Village Future Forecast',
    harvestGuidance: 'Harvest & Sun-Drying Guidance',
    bookSlotClearDay: 'Book Procurement Slot on Clear Sun Day →',

    // Procurer Screen
    todaysSchedule: "Today's Procurement Schedule",
    pendingInspection: 'Pending Inspection',
    completedInspection: 'Completed Inspection',
    inspectGrain: 'Inspect Grain Heap',
    captureHeap: 'Capture Heap Photo',
    randomPointsGenerated: 'Random Spot Moisture Pins Generated',
    vehicleLoadNo: 'Vehicle Load / Plate No.',
    dryingDaysNeeded: 'Required Field Sun-Drying Days (Estimate)',
    lockedDatesNote: 'Earlier dates locked due to minimum sun-drying requirement',
    rescheduleSlot: 'Select Your Preferred Future Slot',
    submitApprovalBtn: '✅ Submit Approval & Update Farmer Dashboard Live',
    bookPrioritySlotBtn: '⚡ Book Selected Priority Slot & Notify Farmer',

    // Multi-Crop & Procurement Standards
    crop: 'Crop',
    cropType: 'Crop Type',
    cropSelection: 'Select Your Crop',
    maxMoistureLimit: 'Max Allowed Moisture Cutoff',
    mspRateLabel: 'Government MSP Rate',
    allCrops: 'All Agricultural Crops',

    // IoT Health, Faulty Detector & Nearby Devices
    iotDiagnostics: 'IoT Sensor Health Diagnostics',
    iotHealthStatus: 'IoT Sensor Status',
    iotHealthy: 'Healthy & Calibrated (100% Operational)',
    iotFaulty: '⚠️ FAULTY SENSOR DETECTED',
    iotFaultBanner: '🚨 CRITICAL IOT SENSOR PROBE FAULT DETECTED!',
    iotFaultWarnMsg: 'Capacitive probe hardware electrode fault detected. Moisture readings fluctuating abnormally. Live intake readings locked for quality safety. Please switch to an available idle backup IoT device.',
    nearbyIdleDevices: '📍 Nearby Idle & Available IoT Devices (Not In Use)',
    switchToDevice: '⚡ Connect / Switch to Device',
    deviceSwitchedSuccess: 'IoT Device successfully connected! Live inspection resumed.',
    simulateFaultBtn: '🧪 Simulate IoT Sensor Fault',
    restoreSensorBtn: '✨ Restore Sensor Health',
    idleStatus: 'IDLE (Ready to Pair)',
    inUseStatus: 'In Use',
    probeHealth: 'Probe Health',
    batteryLevel: 'Battery',
    signalStrength: 'Signal',
    metersAway: 'meters away',
    bayLocation: 'Bay Location'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('dhaan_mitra_lang');
      if (saved && (saved === 'te' || saved === 'hi' || saved === 'en')) {
        return saved;
      }
    } catch (_) {}
    return 'te';
  });

  const [speakingKey, setSpeakingKey] = useState(null);

  const setLang = (newLang) => {
    const validLang = (newLang === 'en' || newLang === 'hi' || newLang === 'te') ? newLang : 'te';
    setLangState(validLang);
    try {
      localStorage.setItem('dhaan_mitra_lang', validLang);
      window.dispatchEvent(new Event('languageChange'));
    } catch (_) {}
  };

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('dhaan_mitra_lang');
        if (saved && saved !== lang && (saved === 'te' || saved === 'hi' || saved === 'en')) {
          setLangState(saved);
        }
      } catch (_) {}
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('languageChange', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('languageChange', handleStorage);
    };
  }, [lang]);

  const t = (key) => {
    return translations[lang]?.[key] || translations['te']?.[key] || translations['en']?.[key] || key;
  };

  const speakVoice = (text, customLang = null) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = customLang || lang;
      if (targetLang === 'te') utterance.lang = 'te-IN';
      else if (targetLang === 'hi') utterance.lang = 'hi-IN';
      else utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const visualVoices = {
    te: {
      slot_booking: 'స్లాట్ బుకింగ్ కోసం దీనిని నొక్కండి.',
      weather: 'వాతావరణ సమాచారం కోసం దీనిని నొక్కండి.',
      reports: 'రిపోర్ట్ చూడడానికి దీనిని నొక్కండి.',
      payments: 'చెల్లింపు వివరాల కోసం దీనిని నొక్కండి.',
      sunny_day: 'ఇది ఎండ రోజు. ధాన్యం తీసుకురావడానికి అనుకూలమైన రోజు.',
      rain_day: 'జాగ్రత్త! వర్షం పడే అవకాశం ఉంది. ఈ రోజు ధాన్యం తీసుకురావద్దు.',
      call_sent: 'మీ స్లాట్ విజయవంతంగా బుక్ అయింది. మీ ఫోన్‌కు ఆటోమేటిక్ కాల్ పంపబడింది.',
      active_token: 'యాక్టివ్ ప్రొక్యూర్‌మెంట్ టోకెన్ వివరాలు.'
    },
    hi: {
      slot_booking: 'स्लॉट बुकिंग के लिए इसे दबाएँ।',
      weather: 'मौसम की जानकारी के लिए इसे दबाएँ।',
      reports: 'रिपोर्ट देखने के लिए इसे दबाएँ।',
      payments: 'भुगतान की जानकारी के लिए इसे दबाएँ।',
      sunny_day: 'यह धूप वाला दिन है। अनाज लाने के लिए अच्छा दिन है।',
      rain_day: 'सावधान! बारिश की संभावना है। आज अनाज न लाएँ।',
      call_sent: 'आपका स्लॉट सफलतापूर्वक बुक हो गया है। आपके फोन पर स्वचालित कॉल भेजी गई है।',
      active_token: 'सक्रिय खरीद टोकन की जानकारी।'
    },
    en: {
      slot_booking: 'Click this for slot booking.',
      weather: 'Click this for weather information.',
      reports: 'Click this to view the report.',
      payments: 'Click this for payment information.',
      sunny_day: 'This is a sunny day. It is suitable for grain delivery.',
      rain_day: 'Warning! Rain is expected. Do not deliver grain today.',
      call_sent: 'Your slot has been booked successfully. An automatic call has been sent to your phone.',
      active_token: 'Active procurement token details.'
    }
  };

  const speakVisualGuide = (topicKey) => {
    setSpeakingKey(topicKey);
    const msg = visualVoices[lang]?.[topicKey] || visualVoices.te?.[topicKey] || topicKey;
    speakVoice(msg);
    setTimeout(() => {
      setSpeakingKey(null);
    }, 4500);
  };

  const speakTokenDetails = (token) => {
    if (!token) return;
    setSpeakingKey('token_' + token.tokenNo);
    let message = '';
    
    const isCompleted = token.status === 'Procurement Completed' || token.status === 'Accepted';
    const isDrying = token.status && token.status.includes('Drying');
    
    if (lang === 'te') {
      const statusText = isCompleted ? 'కొనుగోలు పూర్తయింది' : isDrying ? 'ఎండబెట్టడం అవసరం' : 'స్లాట్ ఖరారైంది';
      message = 'మీ యాక్టివ్ కొనుగోలు టోకెన్ నంబర్ ' + token.tokenNo + '. కేంద్రం: ' + token.centerName + '. తేదీ: ' + token.requestedDate + ', సమయం: ' + token.requestedTime + '. ప్రస్తుత స్థితి: ' + statusText + '.';
    } else if (lang === 'hi') {
      const statusText = isCompleted ? 'खरीद पूर्ण हो चुकी है' : isDrying ? 'धूप में सुखाना आवश्यक' : 'स्लॉट स्वीकृत';
      message = 'आपका सक्रिय खरीद टोकन नंबर ' + token.tokenNo + ' है। खरीद केंद्र: ' + token.centerName + '। निर्धारित तिथि: ' + token.requestedDate + ', समय: ' + token.requestedTime + '। वर्तमान स्थिति: ' + statusText + '।';
    } else {
      const statusText = isCompleted ? 'Procurement Completed' : isDrying ? 'Sun Drying Required' : 'Slot Confirmed';
      message = 'Active procurement token number ' + token.tokenNo + '. Yard: ' + token.centerName + '. Scheduled Date: ' + token.requestedDate + ' at ' + token.requestedTime + '. Current Status: ' + statusText + '.';
    }
    
    speakVoice(message);
    setTimeout(() => {
      setSpeakingKey(null);
    }, 6000);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, speakVoice, speakVisualGuide, speakTokenDetails, speakingKey }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);