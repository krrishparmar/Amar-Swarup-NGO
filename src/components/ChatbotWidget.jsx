import { useState, useRef, useEffect } from 'react';
import './ChatbotWidget.css';

const botResponses = {
  English: {
    greeting: "Hi there! I'm the Amar Swarup AI Assistant. How can I help you with waste management today?",
    pickup: "You can schedule a pickup by clicking on the 'Pickups' tab or typing 'schedule'.",
    default: "I'm still learning! For now, try asking me to 'schedule a pickup'."
  },
  Hindi: {
    greeting: "नमस्ते! मैं अमर स्वरूप एआई असिस्टेंट हूं। मैं आज अपशिष्ट प्रबंधन में आपकी कैसे मदद कर सकता हूं?",
    pickup: "आप 'पिकअप' टैब पर क्लिक करके या 'पिकअप निर्धारित करें' टाइप करके पिकअप शेड्यूल कर सकते हैं।",
    default: "मैं अभी भी सीख रहा हूँ! अभी के लिए, मुझे 'पिकअप निर्धारित करें' कहने का प्रयास करें।"
  }
};

export default function ChatbotWidget({ theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('English');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: botResponses.English.greeting }
  ]);
  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setMessages([{ sender: 'bot', text: botResponses[newLang].greeting }]);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = inputVal.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputVal('');

    setTimeout(() => {
      let botReply = botResponses[language].default;
      const lower = userMsg.toLowerCase();
      if (lower.includes('schedule') || lower.includes('pickup') || lower.includes('पिकअप')) {
        botReply = botResponses[language].pickup;
      }
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 600);
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <span>🤖</span> Assistant
            </div>
            <select className="chatbot-lang-select" value={language} onChange={handleLanguageChange}>
              <option value="English">English</option>
              <option value="Hindi">हिंदी</option>
            </select>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              className="chatbot-input" 
              placeholder={language === 'English' ? "Type a message..." : "संदेश लिखें..."} 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <button type="submit" className="chatbot-send">➤</button>
          </form>
        </div>
      )}

      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
}
