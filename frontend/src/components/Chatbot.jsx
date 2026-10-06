import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import { MessageCircle, X, Send, Sparkles, RefreshCw, Bot, User, Globe, ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';

export default function Chatbot() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const drawerRef = useRef(null);

  // GSAP smooth entrance on drawer open
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      gsap.fromTo(drawerRef.current,
        { opacity: 0, y: 25, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [isOpen]);

  // Initialize or re-render initial welcome message when language changes if no conversation started
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: t('botWelcome'),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: language === 'ta'
            ? ['உணவு வழங்குவது எப்படி?', 'தன்னார்வலராவது எப்படி?', 'உணவு பாதுகாப்பு விதிகள்', 'மாதிரி கணக்கு விவரங்கள்']
            : ['How do I donate food?', 'How to volunteer?', 'Food safety rules', 'Show demo logins']
        }
      ]);
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (userText) => {
    const textToSend = (userText || input).trim();
    if (!textToSend || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/chatbot/message', {
        message: textToSend,
        language: language
      });

      if (res.data && res.data.reply) {
        const botMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: res.data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: res.data.suggestions || []
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      console.warn('Backend chatbot endpoint offline, using smart local fallback engine:', err);
      // Resilient local fallback engine
      const fallbackReply = generateLocalReply(textToSend, language);
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: fallbackReply.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: fallbackReply.suggestions
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateLocalReply = (text, lang) => {
    const lower = text.toLowerCase();
    const isTamil = /[\u0B80-\u0BFF]/.test(text) || lang === 'ta';

    if (isTamil) {
      if (lower.includes('வழங்க') || lower.includes('தானம்') || lower.includes('உணவு')) {
        return {
          text: 'உபரி உணவு வழங்க: 1. Donor கணக்கில் உள்நுழையவும். 2. "உபரி உணவைப் பதிவிடவும்" என்பதைக் கிளிக் செய்து உணவின் பெயர், அளவு, காலாவதி நேரம் ஆகியவற்றை உள்ளிடவும். 3. 15 கி.மீ சுற்றளவிலுள்ள காப்பகங்களுக்கு தானாகப் பொருந்தும்!',
          suggestions: ['உணவு பாதுகாப்பு விதிகள்', 'மாதிரி கணக்கு விவரங்கள்']
        };
      }
      if (lower.includes('தன்னார்வலர்') || lower.includes('டெலிவரி')) {
        return {
          text: 'தன்னார்வலராகச் செயல்பட: 1. Volunteer கணக்கில் உள்நுழையவும். 2. கிடைக்கும் பணிகளைப் பார்த்து "விநியோகப் பணியை ஏற்கவும்" என்பதைத் தேர்ந்தெடுக்கவும். 3. வழிகாட்டலுடன் உணவை எடுத்துச் சென்று காப்பகத்தில் வழங்கவும்.',
          suggestions: ['மாதிரி கணக்கு விவரங்கள்', 'பாரி வள்ளல் வரலாறு']
        };
      }
      if (lower.includes('மாதிரி') || lower.includes('டெமோ') || lower.includes('login')) {
        return {
          text: 'மாதிரி கணக்குகள்:\n• Admin: admin@paari.org (admin123)\n• Donor: donor@paari.org (donor123)\n• NGO Shelter: ngo@paari.org (ngo123)\n• Volunteer: volunteer@paari.org (volunteer123)',
          suggestions: ['உணவு வழங்குவது எப்படி?', 'உணவு பாதுகாப்பு விதிகள்']
        };
      }
      return {
        text: 'பாரி உணவு மீட்புத் தளத்தில் உபரி உணவு தானம், காப்பகத்திற்கு உணவு கோருதல் மற்றும் தன்னார்வ விநியோகம் குறித்து உங்களுக்கு உதவ நான் எப்போதும் தயார்!',
        suggestions: ['உணவு வழங்குவது எப்படி?', 'மாதிரி கணக்கு விவரங்கள்', 'உணவு பாதுகாப்பு விதிகள்']
      };
    } else {
      if (lower.includes('donate') || lower.includes('food')) {
        return {
          text: 'To donate surplus food: Log in as a Donor, click "Post Food Donation", specify quantity (in kg), cooking time, and safe expiry window. Nearby shelters will be matched automatically!',
          suggestions: ['Food safety rules', 'Show demo logins']
        };
      }
      if (lower.includes('volunteer') || lower.includes('deliver')) {
        return {
          text: 'To volunteer: Sign in as a Volunteer, view available delivery jobs, click "Accept Delivery Run", and follow the real-time route to transport meals safely to the shelter.',
          suggestions: ['Show demo logins', 'How do I donate food?']
        };
      }
      if (lower.includes('demo') || lower.includes('login')) {
        return {
          text: 'Demo Logins:\n• Admin: admin@paari.org / admin123\n• Donor: donor@paari.org / donor123\n• NGO: ngo@paari.org / ngo123\n• Volunteer: volunteer@paari.org / volunteer123',
          suggestions: ['How do I donate food?', 'How to volunteer?']
        };
      }
      return {
        text: 'Welcome to PAARI! I can assist you with surplus food donations, shelter requests, volunteering, and food safety standards.',
        suggestions: ['How do I donate food?', 'How to volunteer?', 'Show demo logins']
      };
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: t('botWelcome'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: language === 'ta'
          ? ['உணவு வழங்குவது எப்படி?', 'தன்னார்வலராவது எப்படி?', 'உணவு பாதுகாப்பு விதிகள்', 'மாதிரி கணக்கு விவரங்கள்']
          : ['How do I donate food?', 'How to volunteer?', 'Food safety rules', 'Show demo logins']
      }
    ]);
  };

  const currentSuggestions = messages.length > 0 ? (messages[messages.length - 1].suggestions || []) : [];

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="PAARI AI Food Guide • Ask anything about food safety, donating, or claiming meals"
          aria-label="Open PAARI AI Food Guide"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-rich) 100%)',
            color: '#fff',
            border: '1.5px solid rgba(255,255,255,0.25)',
            borderRadius: '50px',
            padding: '13px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 12px 28px rgba(16, 61, 48, 0.35), 0 4px 10px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.94rem',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px) scale(1.025)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
        >
          <div style={{ position: 'relative', display: 'flex' }}>
            <Bot size={21} />
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '9px',
                height: '9px',
                backgroundColor: '#10B981',
                borderRadius: '50%',
                boxShadow: '0 0 0 2px #fff',
                animation: 'pulseGlow 2s infinite ease-in-out'
              }}
            />
          </div>
          <span>{language === 'ta' ? 'பாரி AI வழிகாட்டி' : 'PAARI AI Food Guide'}</span>
          <span
            style={{
              backgroundColor: 'rgba(255,255,255,0.18)',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.74rem',
              fontWeight: '700'
            }}
          >
            {language === 'ta' ? 'தமிழ்' : 'EN'}
          </span>
        </button>
      )}

      {/* Expandable Chat Drawer Window */}
      {isOpen && (
        <div
          ref={drawerRef}
          className="glass-panel"
          style={{
            width: '390px',
            maxWidth: 'calc(100vw - 32px)',
            height: '570px',
            maxHeight: 'calc(100vh - 60px)',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '24px',
            boxShadow: '0 24px 50px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(255,255,255,0.1)',
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid var(--border)'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, #1c4516 100%)',
              color: '#fff',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  padding: '8px',
                  display: 'flex'
                }}
              >
                <Bot size={20} color="#fff" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', lineHeight: 1.2 }}>
                  {language === 'ta' ? 'பாரி AI உதவியாளர்' : 'PAARI Assistant'}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#34D399',
                      display: 'inline-block'
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>
                    {t('botOnline')} • {language === 'ta' ? 'உணவு வழிகாட்டி' : 'Food Rescue AI'}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Language Switch Button */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
                title="Switch Language / மொழி மாற்றுக"
                style={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '4px 10px',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Globe size={12} />
                {language === 'en' ? 'தமிழ்' : 'EN'}
              </button>

              {/* Clear History */}
              <button
                onClick={handleClearChat}
                title={t('botClear')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.85)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex'
                }}
              >
                <RefreshCw size={15} />
              </button>

              {/* Close / Minimize */}
              <button
                onClick={() => setIsOpen(false)}
                title={t('botClose')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Stream Container */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: 'var(--bg-main, #FAF8F4)'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '100%'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                    maxWidth: '85%'
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: msg.sender === 'user' ? 'var(--accent, #E07A5F)' : 'var(--primary, #2D5A27)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '4px'
                    }}
                  >
                    {msg.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
                  </div>
                  <div
                    style={{
                      background: msg.sender === 'user' ? 'var(--primary, #2D5A27)' : '#FFFFFF',
                      color: msg.sender === 'user' ? '#FFFFFF' : '#2D3748',
                      padding: '12px 16px',
                      borderRadius:
                        msg.sender === 'user'
                          ? '18px 18px 4px 18px'
                          : '18px 18px 18px 4px',
                      boxShadow:
                        msg.sender === 'user'
                          ? '0 3px 8px rgba(45, 90, 39, 0.25)'
                          : '0 2px 6px rgba(0,0,0,0.06)',
                      fontSize: '0.88rem',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      border: msg.sender === 'user' ? 'none' : '1px solid rgba(0,0,0,0.06)'
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#8A99AD',
                    marginTop: '3px',
                    marginRight: msg.sender === 'user' ? '36px' : '0',
                    marginLeft: msg.sender === 'bot' ? '36px' : '0'
                  }}
                >
                  {msg.time}
                </span>
              </div>
            ))}

            {/* Typing Animation */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Bot size={15} />
                </div>
                <div
                  style={{
                    background: '#FFFFFF',
                    padding: '10px 16px',
                    borderRadius: '18px 18px 18px 4px',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                  }}
                >
                  <span className="animated-pulse">{t('botTyping')}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          {currentSuggestions.length > 0 && !loading && (
            <div
              style={{
                padding: '8px 14px',
                background: '#FFFFFF',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                maxHeight: '90px',
                overflowY: 'auto'
              }}
            >
              {currentSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sug)}
                  style={{
                    background: 'var(--primary-light, rgba(45, 90, 39, 0.08))',
                    border: '1px solid rgba(45, 90, 39, 0.2)',
                    color: 'var(--primary, #2D5A27)',
                    borderRadius: '20px',
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary, #2D5A27)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--primary-light, rgba(45, 90, 39, 0.08))';
                    e.currentTarget.style.color = 'var(--primary, #2D5A27)';
                  }}
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '12px 14px',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('botPlaceholder')}
              disabled={loading}
              style={{
                flex: 1,
                border: '1px solid var(--border)',
                borderRadius: '24px',
                padding: '10px 16px',
                fontSize: '0.86rem',
                outline: 'none',
                backgroundColor: 'var(--bg-main, #FAF8F4)'
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading ? 'var(--primary)' : 'rgba(0,0,0,0.1)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s ease'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
