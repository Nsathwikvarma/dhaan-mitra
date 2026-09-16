import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

export default function VoiceChatbotModal({ isOpen, onClose, farmer, onUpdateFarmer }) {
  const { lang, setLang, t } = useLanguage();

  const [chatLang, setChatLang] = useState(lang || 'te');

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text:
        chatLang === 'te'
          ? 'నమస్కారం! 🙏 నేను ధాన్ వాణి (DhaanVaani) వాయిస్ సహాయక్. మైక్రోఫోన్ నొక్కి మాట్లాడండి - మీ మాట పూర్తయిన తర్వాత ఆటోమేటిక్‌గా పంపబడుతుంది.'
          : chatLang === 'hi'
            ? 'नमस्ते! 🙏 मैं धानवाणी (DhaanVaani) वॉयस सहायक हूँ। माइक दबाकर बोलें - आपकी बात पूरी होने के बाद अपने आप संदेश भेजा जाएगा।'
            : 'Namaste! 🙏 I am DhaanVaani Voice Assistant. Tap microphone & speak - it will auto-send 2s after you finish talking.',
      quickReplies: [
        chatLang === 'te'
          ? '📅 రేపు స్లాట్ బుక్ చేయండి'
          : chatLang === 'hi'
            ? '📅 कल स्लॉट बुक करो'
            : '📅 Book slot tomorrow',

        chatLang === 'te'
          ? '📅 ఎల్లుండి స్లాట్ బుక్ చేయండి'
          : chatLang === 'hi'
            ? '📅 परसों स्लॉट बुक करो'
            : '📅 Book slot day after tomorrow',

        chatLang === 'te'
          ? '🌤️ రేపు వాతావరణం'
          : chatLang === 'hi'
            ? '🌤️ कल का मौसम'
            : '🌤️ Weather tomorrow',

        chatLang === 'te'
          ? '🌤️ ఎల్లుండి వాతావరణం'
          : chatLang === 'hi'
            ? '🌤️ परसों का मौसम'
            : '🌤️ Weather day after tomorrow',

        chatLang === 'te'
          ? '💳 నా పేమెంట్ స్థితి'
          : chatLang === 'hi'
            ? '💳 भुगतान स्थिति'
            : '💳 Payment status'
      ]
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingState, setPendingState] = useState(null);
  const [activeVoiceWave, setActiveVoiceWave] = useState(false);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);   // 2-second silence auto-send timer
  const transcriptRef = useRef('');       // tracks latest transcript without stale closure

  const [countdown, setCountdown] = useState(null); // "sending in Xs…" indicator

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (lang) {
      setChatLang(lang);
    }
  }, [lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isLoading]);

  /*
   * BROWSER SPEECH RECOGNITION
   */
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      setSpeechSupported(true);
      return;
    }

    const BrowserSpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!BrowserSpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const rec = new BrowserSpeechRecognition();

      rec.continuous = true;       // keep listening until we decide to stop
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
        setActiveVoiceWave(true);
      };

      rec.onresult = (event) => {
        // Accumulate full transcript across all results
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');

        setInputText(transcript);
        transcriptRef.current = transcript;

        // When last result is final → start 2-second silence countdown
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          // Reset any previous timer
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

          // Countdown display: 2 → 1 → send
          setCountdown(2);
          const tick1 = setTimeout(() => setCountdown(1), 1000);

          silenceTimerRef.current = setTimeout(() => {
            silenceTimerRef.current = null;
            clearTimeout(tick1);
            setCountdown(null);
            // Stop recognition then auto-send
            try { recognitionRef.current?.stop(); } catch (e) {}
          }, 2000);
        }
      };

      rec.onerror = (event) => {
        console.warn('Browser speech recognition error:', event?.error);
        if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
        setCountdown(null);
        setIsListening(false);
        setActiveVoiceWave(false);
      };

      rec.onend = () => {
        setIsListening(false);
        setActiveVoiceWave(false);
        if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
        setCountdown(null);
        // Auto-send whatever was captured
        const captured = transcriptRef.current.trim();
        if (captured) {
          transcriptRef.current = '';
          // Use setTimeout so state has settled before send
          setTimeout(() => handleSendMessage(captured), 50);
        }
      };

      recognitionRef.current = rec;
    } catch (error) {
      console.warn(
        'Speech recognition initialization failed:',
        error
      );

      setSpeechSupported(false);
    }

    return () => {
      if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
      if (Capacitor.isNativePlatform()) {
        TextToSpeech.stop().catch(() => {});
      }
    };
  }, []);

  /*
   * CHANGE RECOGNITION LANGUAGE
   */
  useEffect(() => {
    if (!recognitionRef.current) return;

    if (chatLang === 'te') {
      recognitionRef.current.lang = 'te-IN';
    } else if (chatLang === 'hi') {
      recognitionRef.current.lang = 'hi-IN';
    } else {
      recognitionRef.current.lang = 'en-IN';
    }
  }, [chatLang]);

  /*
   * GET TTS LANGUAGE
   */
  const getVoiceLanguage = (targetLang) => {
    if (targetLang === 'te') return 'te-IN';
    if (targetLang === 'hi') return 'hi-IN';
    return 'en-IN';
  };

  /*
   * TEXT TO SPEECH
   *
   * IMPORTANT:
   * This function is async and waits until speech finishes.
   */
  const speakText = async (text, targetLang = chatLang) => {
    if (!soundEnabled) return;

    if (!text || !text.trim()) {
      return;
    }

    const cleanText = text.trim();
    const language = getVoiceLanguage(targetLang);

    try {
      setIsSpeaking(true);

      /*
       * STOP PREVIOUS SPEECH
       */
      try {
        if (Capacitor.isNativePlatform()) {
          await TextToSpeech.stop();
        }
      } catch (error) {
        console.warn('TTS stop warning:', error);
      }

      /*
       * ANDROID NATIVE TTS
       */
      if (Capacitor.isNativePlatform()) {
        await TextToSpeech.speak({
          text: cleanText,
          lang: language,
          rate: 0.85,
          pitch: 1.0,
          volume: 1.0
        });

        /*
         * speak() completes after speech.
         */
        setIsSpeaking(false);

        return;
      }

      /*
       * BROWSER TTS
       */
      if ('speechSynthesis' in window) {
        await new Promise((resolve) => {
          try {
            window.speechSynthesis.cancel();

            const utterance =
              new SpeechSynthesisUtterance(cleanText);

            utterance.lang = language;
            utterance.rate = 0.85;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            utterance.onstart = () => {
              setIsSpeaking(true);
            };

            utterance.onend = () => {
              setIsSpeaking(false);
              resolve();
            };

            utterance.onerror = (error) => {
              console.warn(
                'Browser TTS error:',
                error
              );

              setIsSpeaking(false);
              resolve();
            };

            window.speechSynthesis.speak(utterance);
          } catch (error) {
            console.warn(
              'Browser TTS exception:',
              error
            );

            setIsSpeaking(false);
            resolve();
          }
        });

        return;
      }

      setIsSpeaking(false);
    } catch (error) {
      console.error(
        'Text-to-Speech error:',
        error
      );

      setIsSpeaking(false);
    }
  };

  /*
   * STOP SPEECH
   */
  const stopSpeech = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await TextToSpeech.stop();
      }

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (error) {
      console.warn(
        'Stopping speech failed:',
        error
      );
    }

    setIsSpeaking(false);
  };

  /*
   * MICROPHONE
   */
  const handleToggleListening = async () => {
    /*
     * ANDROID
     */
    if (Capacitor.isNativePlatform()) {
      try {
        /*
         * STOP LISTENING
         */
        if (isListening) {
          await SpeechRecognition.stop();

          setIsListening(false);
          setActiveVoiceWave(false);

          return;
        }

        /*
         * STOP BOT SPEECH BEFORE LISTENING
         */
        await stopSpeech();

        /*
         * REQUEST PERMISSION
         */
        const permission =
          await SpeechRecognition.requestPermissions();

        if (
          permission?.speechRecognition !== 'granted'
        ) {
          alert(
            'Please allow microphone and speech recognition permission.'
          );

          return;
        }

        setInputText('');
        setIsListening(true);
        setActiveVoiceWave(true);

        const language =
          chatLang === 'te'
            ? 'te-IN'
            : chatLang === 'hi'
              ? 'hi-IN'
              : 'en-IN';

        /*
         * START RECOGNITION
         */
        const result =
          await SpeechRecognition.start({
            language,
            maxResults: 1,
            partialResults: true,
            popup: false
          });

        const transcript =
          result?.matches?.[0] ||
          result?.transcript ||
          '';

        /*
         * STOP LISTENING INDICATOR
         */
        setIsListening(false);
        setActiveVoiceWave(false);

        /*
         * SEND RECOGNIZED TEXT
         */
        if (transcript.trim()) {
          setInputText(transcript);

          await handleSendMessage(
            transcript
          );
        }
      } catch (error) {
        console.error(
          'Native speech recognition error:',
          error
        );

        setIsListening(false);
        setActiveVoiceWave(false);

        alert(
          'Voice recognition failed. Please check microphone and speech recognition permissions.'
        );
      }

      return;
    }

    /*
     * BROWSER
     */
    if (!recognitionRef.current) {
      alert(
        'Speech Recognition is not supported on this browser. You can type your request below.'
      );

      return;
    }

    /*
     * STOP LISTENING
     */
    if (isListening) {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      setCountdown(null);

      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.warn('Recognition stop error:', error);
      }

      setIsListening(false);
      setActiveVoiceWave(false);

      if (inputText.trim()) {
        await handleSendMessage(inputText);
      }

      return;
    }

    /*
     * STOP BOT SPEECH
     */
    await stopSpeech();

    setInputText('');

    try {
      if (chatLang === 'te') {
        recognitionRef.current.lang = 'te-IN';
      } else if (chatLang === 'hi') {
        recognitionRef.current.lang = 'hi-IN';
      } else {
        recognitionRef.current.lang = 'en-IN';
      }

      recognitionRef.current.start();
    } catch (error) {
      console.warn(
        'Recognition start error:',
        error
      );
    }
  };

  /*
   * SEND MESSAGE
   */
  const handleSendMessage = async (
    customText = null
  ) => {
    const textToSend = (
      customText !== null
        ? customText
        : inputText
    ).trim();

    if (!textToSend || isLoading) {
      return;
    }

    /*
     * STOP LISTENING
     */
    if (
      isListening &&
      recognitionRef.current
    ) {
      try {
        recognitionRef.current.stop();
      } catch (error) {}

      setIsListening(false);
      setActiveVoiceWave(false);
    }

    /*
     * STOP CURRENT SPEECH
     */
    await stopSpeech();

    /*
     * USER MESSAGE
     */
    const userMsg = {
      sender: 'user',
      text: textToSend
    };

    setMessages((previous) => [
      ...previous,
      userMsg
    ]);

    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(
        '/api/chat/message',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: textToSend,
            language: chatLang,
            farmerId:
              farmer?.farmerId ||
              'FARM-101',
            pendingState
          })
        }
      );

      const data = await response.json();

      setIsLoading(false);

      /*
       * SUCCESS
       */
      if (data.success) {
        const responseLang = data.language || chatLang;

        // Auto-switch modal language if detected language is different
        if (responseLang && responseLang !== chatLang) {
          setChatLang(responseLang);
          setLang(responseLang);
        }

        setPendingState(
          data.pendingState || null
        );

        /*
         * REGISTRATION UPDATE
         */
        if (
          data.intent ===
            'REGISTRATION_SUCCESS' &&
          data.farmer &&
          onUpdateFarmer
        ) {
          onUpdateFarmer({
            id:
              data.farmer.id ||
              data.farmer.farmerId,

            farmerId:
              data.farmer.farmerId,

            name:
              data.farmer.name,

            phone:
              data.farmer.phone,

            village:
              data.farmer.village,

            aadhaar:
              data.farmer.aadhaar,

            bankAcc:
              data.farmer.bankAccount,

            passbook:
              data.farmer.landPassbook
          });
        }

        /*
         * BOT MESSAGE
         */
        const botMsg = {
          sender: 'bot',

          text:
            data.replyText ||
            '',

          voiceText:
            data.voiceText ||
            data.replyText ||
            '',

          intent:
            data.intent,

          available:
            data.available,

          date:
            data.date,

          dayLabel:
            data.dayLabel,

          time:
            data.time,

          quantity:
            data.quantity,

          weather:
            data.weather,

          availableSlots:
            data.availableSlots,

          booking:
            data.booking,

          tokenNo:
            data.tokenNo,

          payment:
            data.payment,

          farmerData:
            data.farmer,

          quickReplies:
            data.quickReplies || []
        };

        setMessages((previous) => [
          ...previous,
          botMsg
        ]);

        /*
         * VERY IMPORTANT:
         * WAIT FOR TTS TO FINISH IN DETECTED LANGUAGE.
         */
        if (botMsg.voiceText) {
          await speakText(
            botMsg.voiceText,
            responseLang
          );
        }
      }

      /*
       * SERVER ERROR
       */
      else {
        const responseLang = data.language || chatLang;
        const errorMsg = {
          sender: 'bot',

          text:
            data.replyText ||
            (responseLang === 'te' ? 'క్షమించండి, అర్థం కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.' : responseLang === 'hi' ? 'क्षमा करें, समझ नहीं आया। कृपया पुनः प्रयास करें।' : 'Sorry, I could not understand. Please try again.'),

          voiceText:
            data.voiceText ||
            data.replyText ||
            (responseLang === 'te' ? 'దయచేసి మళ్లీ ప్రయత్నించండి.' : responseLang === 'hi' ? 'कृपया पुनः प्रयास करें।' : 'Please try again.')
        };

        setMessages((previous) => [
          ...previous,
          errorMsg
        ]);

        await speakText(
          errorMsg.voiceText,
          responseLang
        );
      }
    } catch (error) {
      console.error(
        'Chat error:',
        error
      );

      setIsLoading(false);

      const networkError = {
        sender: 'bot',

        text:
          chatLang === 'te' ? 'నెట్‌వర్క్ సమస్య ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.' : chatLang === 'hi' ? 'नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।' : 'Network connection error. Please try again.',

        voiceText:
          chatLang === 'te' ? 'నెట్‌వర్క్ సమస్య ఏర్పడింది.' : chatLang === 'hi' ? 'नेटवर्क त्रुटि।' : 'Network connection error.'
      };

      setMessages((previous) => [
        ...previous,
        networkError
      ]);

      await speakText(
        networkError.voiceText,
        chatLang
      );
    }
  };

  /*
   * LANGUAGE CHANGE
   */
  const handleLanguageChange = async (
    newLang
  ) => {
    await stopSpeech();

    setChatLang(newLang);
    setLang(newLang);
    if (recognitionRef.current) {
      recognitionRef.current.lang = getVoiceLanguage(newLang);
    }
  };

  /*
   * SOUND TOGGLE
   */
  const handleSoundToggle = async () => {
    if (soundEnabled) {
      await stopSpeech();
      setSoundEnabled(false);
    } else {
      setSoundEnabled(true);
    }
  };

  /*
   * CLOSE
   */
  const handleClose = async () => {
    await stopSpeech();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (error) {}
    }

    setIsListening(false);
    setActiveVoiceWave(false);

    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="voice-modal-backdrop">
      <div className="voice-modal-container">

        {/* HEADER */}
        <div className="voice-modal-header">

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <div className="voice-bot-avatar">
              🌾
            </div>

            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>
                  {chatLang === 'te'
                    ? 'ధాన్ వాణి (DhaanVaani) 🎙️'
                    : chatLang === 'hi'
                      ? 'धानवाणी (DhaanVaani) 🎙️'
                      : 'DhaanVaani 🎙️'}
                </span>

                <span className="live-dot" />
              </div>

              <div
                style={{
                  fontSize: '0.68rem',
                  color: '#a7f3d0'
                }}
              >
                {chatLang === 'te'
                  ? 'స్మార్ట్ వాయిస్ స్లాట్ బుకింగ్'
                  : chatLang === 'hi'
                    ? 'स्मार्ट वॉइस स्लॉट बुकिंग'
                    : 'Smart Voice Slot Booking'}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >

            <div className="voice-lang-pills">

              <button
                className={
                  chatLang === 'te'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  handleLanguageChange('te')
                }
              >
                తెలుగు
              </button>

              <button
                className={
                  chatLang === 'hi'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  handleLanguageChange('hi')
                }
              >
                हिंदी
              </button>

              <button
                className={
                  chatLang === 'en'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  handleLanguageChange('en')
                }
              >
                EN
              </button>

            </div>

            <button
              className="voice-icon-btn"
              onClick={handleSoundToggle}
              title={
                soundEnabled
                  ? 'Mute Voice'
                  : 'Unmute Voice'
              }
            >
              {soundEnabled
                ? '🔊'
                : '🔇'}
            </button>

            <button
              className="voice-icon-btn"
              onClick={handleClose}
              title="Close Chat"
            >
              ✕
            </button>

          </div>
        </div>

        {/* MESSAGES */}
        <div className="voice-chat-messages">

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`voice-message-row ${
                msg.sender === 'user'
                  ? 'user-row'
                  : 'bot-row'
              }`}
            >

              {msg.sender === 'bot' && (
                <div className="message-bot-icon">
                  🌾
                </div>
              )}

              <div
                className={`voice-message-bubble ${
                  msg.sender === 'user'
                    ? 'user-bubble'
                    : 'bot-bubble'
                }`}
              >

                <div
                  style={{
                    whiteSpace: 'pre-line',
                    lineHeight: '1.45'
                  }}
                >
                  {msg.text}
                </div>

                {/* REPLAY VOICE */}
                {msg.sender === 'bot' &&
                  msg.voiceText && (
                    <button
                      className="replay-voice-btn"
                      onClick={() =>
                        speakText(
                          msg.voiceText,
                          chatLang
                        )
                      }
                      title="Read Aloud"
                    >
                      🔊{' '}
                      {chatLang === 'te'
                        ? 'వినండి'
                        : chatLang === 'hi'
                          ? 'सुनें'
                          : 'Listen'}
                    </button>
                  )}

                {/* SLOT CARD */}
                {msg.intent ===
                  'SLOT_AVAILABLE' &&
                  msg.available && (

                    <div className="voice-rich-card slot-card">

                      <div className="rich-card-header">

                        <span>
                          🗓️{' '}
                          {msg.dayLabel
                            ? `${msg.dayLabel} (${msg.date})`
                            : msg.date}
                        </span>

                        <span className="weather-chip">
                          {msg.weather
                            ?.rainfallProbability >
                          30
                            ? '🌧️ Rain Risk'
                            : '☀️ Optimal Sun'}
                        </span>

                      </div>

                      <div
                        style={{
                          fontSize: '0.78rem',
                          background: '#ecfdf5',
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border:
                            '1px solid #a7f3d0',
                          color: '#064e3b',
                          marginBottom: '8px'
                        }}
                      >

                        <div
                          style={{
                            fontWeight: 800
                          }}
                        >
                          🌤️{' '}
                          {msg.weather
                            ?.condition ||
                            'Clear Sunlight'}{' '}
                          •{' '}
                          {
                            msg.weather
                              ?.temperature
                          }°C
                        </div>

                        <div
                          style={{
                            fontSize: '0.72rem',
                            marginTop: '2px',
                            color: '#047857'
                          }}
                        >
                          🌧️ Rain Probability:{' '}
                          <strong>
                            {
                              msg.weather
                                ?.rainfallProbability
                            }
                            %
                          </strong>{' '}
                          • 🌾{' '}
                          {msg.weather
                            ?.dryingAdvice ||
                            'Ideal for Field Sun-Drying'}
                        </div>

                      </div>

                      {msg.availableSlots &&
                        msg.availableSlots.length >
                          0 && (

                          <div
                            style={{
                              marginBottom: '8px'
                            }}
                          >

                            <div
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                color: '#047857',
                                marginBottom: '4px'
                              }}
                            >
                              AVAILABLE TIME SLOTS:
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '4px'
                              }}
                            >

                              {msg.availableSlots.map(
                                (
                                  slot,
                                  sIdx
                                ) => (

                                  <button
                                    key={sIdx}
                                    className="slot-time-pill"
                                    onClick={() =>
                                      handleSendMessage(
                                        `Book ${slot.startTime} slot for ${
                                          msg.quantity ||
                                          4.5
                                        } tonnes`
                                      )
                                    }
                                  >
                                    ⏰{' '}
                                    {
                                      slot.startTime
                                    }
                                  </button>

                                )
                              )}

                            </div>

                          </div>

                        )}

                      <button
                        className="confirm-booking-voice-btn"
                        onClick={() =>
                          handleSendMessage(
                            chatLang === 'te'
                              ? 'స్లాట్ ఖరారు చేయండి'
                              : chatLang === 'hi'
                                ? 'बुकिंग पक्की करो'
                                : 'Confirm booking'
                          )
                        }
                      >
                        ✅{' '}
                        {chatLang === 'te'
                          ? 'ఇప్పుడే స్లాట్ బుక్ చేయండి'
                          : chatLang === 'hi'
                            ? 'अभी स्लॉट बुक करें'
                            : 'Confirm & Book Slot Now'}
                      </button>

                    </div>
                  )}

                {/* BOOKING CONFIRMED */}
                {msg.intent ===
                  'BOOKING_CONFIRMED' && (

                  <div className="voice-rich-card booking-success-card">

                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#047857'
                      }}
                    >
                      PROCUREMENT TOKEN ISSUED
                    </div>

                    <div
                      style={{
                        fontSize: '2rem',
                        fontWeight: 900,
                        color: '#064e3b',
                        margin: '4px 0'
                      }}
                    >
                      {msg.tokenNo}
                    </div>

                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: '#065f46',
                        lineHeight: '1.5'
                      }}
                    >

                      <div>
                        📍 <strong>Yard:</strong>{' '}
                        {msg.booking
                          ?.centerName ||
                          'Warangal Market Yard'}
                      </div>

                      <div>
                        📅 <strong>Date:</strong>{' '}
                        {msg.booking
                          ?.requestedDate}
                      </div>

                      <div>
                        ⏰ <strong>Slot:</strong>{' '}
                        {msg.booking
                          ?.requestedTime}
                      </div>

                    </div>

                    <div className="call-dispatched-banner">
                      <span>
                        📞 STATUS: CALL SENT
                      </span>

                      <span
                        style={{
                          fontSize: '0.7rem',
                          opacity: 0.85
                        }}
                      >
                        Voice Call Transmitted
                      </span>
                    </div>

                  </div>
                )}

                {/* WEATHER */}
                {msg.intent ===
                  'WEATHER_REPORT' &&
                  msg.weather && (

                    <div className="voice-rich-card weather-card">

                      <div
                        style={{
                          display: 'flex',
                          justifyContent:
                            'space-between',
                          alignItems: 'center'
                        }}
                      >

                        <div>

                          <div
                            style={{
                              fontSize: '1.6rem',
                              fontWeight: 900,
                              color: '#065f46'
                            }}
                          >
                            {
                              msg.weather
                                .temperature
                            }°C
                          </div>

                          <div
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: '#047857'
                            }}
                          >
                            {msg.weather
                              .condition ||
                              'Clear Sunlight'}
                          </div>

                        </div>

                        <div
                          style={{
                            fontSize: '2.5rem'
                          }}
                        >
                          {msg.weather
                            .rainfallProbability >
                          30
                            ? '🌧️'
                            : '☀️'}
                        </div>

                      </div>

                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '0.75rem',
                          background: '#ffffff',
                          padding: '6px 8px',
                          borderRadius: '8px'
                        }}
                      >

                        <div>
                          🌧️ Rain Probability:{' '}
                          <strong>
                            {
                              msg.weather
                                .rainfallProbability
                            }%
                          </strong>
                        </div>

                        <div>
                          💧 Humidity:{' '}
                          <strong>
                            {
                              msg.weather
                                .humidity
                            }%
                          </strong>
                        </div>

                        <div
                          style={{
                            color: '#047857',
                            fontWeight: 800,
                            marginTop: '2px'
                          }}
                        >
                          🌾{' '}
                          {
                            msg.weather
                              .dryingAdvice
                          }
                        </div>

                      </div>

                    </div>
                  )}

                {/* PAYMENT */}
                {msg.intent ===
                  'PAYMENT_STATUS' &&
                  msg.payment && (

                    <div className="voice-rich-card payment-card">

                      <div
                        style={{
                          display: 'flex',
                          justifyContent:
                            'space-between',
                          alignItems: 'baseline'
                        }}
                      >

                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            color: '#047857'
                          }}
                        >
                          DBT AMOUNT
                        </span>

                        <span className="payment-status-badge">
                          {msg.payment
                            .status === 'Paid'
                            ? '✅ Deposited'
                            : '⏳ DBT Processing'}
                        </span>

                      </div>

                      <div
                        style={{
                          fontSize: '1.8rem',
                          fontWeight: 900,
                          color: '#064e3b',
                          margin: '4px 0'
                        }}
                      >
                        ₹
                        {msg.payment
                          .amount
                          ?.toLocaleString(
                            'en-IN'
                          )}
                      </div>

                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#334155'
                        }}
                      >

                        <div>
                          🏛️{' '}
                          <strong>
                            Bank A/C:
                          </strong>{' '}
                          {farmer
                            ?.bankAccount ||
                            'SBI ****4821'}
                        </div>

                        <div>
                          🧾{' '}
                          <strong>
                            Ref:
                          </strong>{' '}
                          {
                            msg.payment
                              .transactionReference
                          }
                        </div>

                      </div>

                    </div>
                  )}

                {/* QUICK REPLIES */}
                {msg.quickReplies &&
                  msg.quickReplies.length >
                    0 && (

                    <div className="quick-replies-tray">

                      {msg.quickReplies.map(
                        (qr, qIdx) => (

                          <button
                            key={qIdx}
                            className="quick-reply-pill"
                            onClick={() =>
                              handleSendMessage(
                                qr
                              )
                            }
                          >
                            {qr}
                          </button>

                        )
                      )}

                    </div>
                  )}

              </div>
            </div>
          ))}

          {/* LOADING */}
          {isLoading && (

            <div className="voice-message-row bot-row">

              <div className="message-bot-icon">
                🌾
              </div>

              <div className="voice-message-bubble bot-bubble loading-dots">
                <span>●</span>{' '}
                <span>●</span>{' '}
                <span>●</span>
              </div>

            </div>
          )}

          <div ref={messagesEndRef} />

        </div>

        {/* SPEECH STATUS */}
        {(isListening || isSpeaking || countdown !== null) && (
          <div className="voice-active-indicator" style={{
            background: countdown !== null ? 'rgba(16, 185, 129, 0.25)' : undefined,
            border: countdown !== null ? '1px solid #10b981' : undefined
          }}>
            <div className="audio-wave-bars">
              <div className="wave-bar bar-1" />
              <div className="wave-bar bar-2" />
              <div className="wave-bar bar-3" />
              <div className="wave-bar bar-4" />
              <div className="wave-bar bar-5" />
            </div>

            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {countdown !== null ? (
                <span style={{ color: '#ecfdf5' }}>
                  ⏳ {chatLang === 'te' 
                    ? `సందేశం పంపుతోంది (${countdown}s)...` 
                    : chatLang === 'hi' 
                      ? `संदेश भेजा जा रहा है (${countdown}s)...` 
                      : `Auto-sending in ${countdown}s...`}
                </span>
              ) : isListening ? (
                chatLang === 'te'
                  ? 'రైతు గారు మాట్లాడండి... వింటున్నాను 🎙️'
                  : chatLang === 'hi'
                    ? 'किसान जी बोलें... सुन रहा हूँ 🎙️'
                    : 'Listening to your voice... 🎙️'
              ) : (
                chatLang === 'te'
                  ? 'ధాన్ వాణి సమాధానం చెబుతోంది... 🔊'
                  : chatLang === 'hi'
                    ? 'धानवाणी बोल रहा है... 🔊'
                    : 'DhaanVaani speaking... 🔊'
              )}
            </span>
          </div>
        )}

        {/* FOOTER */}
        <div className="voice-modal-footer">

          <button
            className={`voice-main-mic-btn ${
              isListening
                ? 'listening-pulse'
                : ''
            }`}
            onClick={
              handleToggleListening
            }
            aria-label="Toggle Microphone"
            title="Tap and Speak"
          >

            <span
              style={{
                fontSize: '1.6rem'
              }}
            >
              {isListening
                ? '⏹️'
                : '🎙️'}
            </span>

            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800
              }}
            >
              {isListening
                ? (
                    chatLang === 'te'
                      ? 'ఆపండి'
                      : chatLang === 'hi'
                        ? 'रोकें'
                        : 'Stop'
                  )
                : (
                    chatLang === 'te'
                      ? 'మాట్లాడండి'
                      : chatLang === 'hi'
                        ? 'बोलें'
                        : 'Speak'
                  )}
            </span>

          </button>

          <form
            className="voice-text-form"
            onSubmit={async (event) => {
              event.preventDefault();
              await handleSendMessage();
            }}
          >

            <input
              type="text"
              className="voice-text-input"
              value={inputText}
              onChange={(event) =>
                setInputText(
                  event.target.value
                )
              }
              placeholder={
                chatLang === 'te'
                  ? 'ఇక్కడ టైప్ చేయండి లేదా మాట్లాడండి...'
                  : chatLang === 'hi'
                    ? 'यहाँ लिखें या माइक से बोलें...'
                    : 'Type or speak your message...'
              }
            />

            <button
              type="submit"
              className="voice-send-btn"
              disabled={
                !inputText.trim() ||
                isLoading
              }
            >
              ➤
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}