import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, User } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState([
    { text: "Namaste! KMCLU University AI Assistant mein aapka swagat hai. Main aapki kya madad kar sakta hoon?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/chat', { message: input });
      setMessages(prev => [...prev, { text: res.data.reply, isBot: true }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "Backend se connect nahi ho paa raha. Check kijiye ki server.js chal raha hai!", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col h-[600px] border-t-8 border-orange-600 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-orange-600 text-white flex items-center gap-3 shadow-md">
          <Bot size={32} className="bg-white text-orange-600 rounded-full p-1" />
          <div>
            <h1 className="font-bold text-lg leading-none">KMCLU CHATBOT</h1>
            <span className="text-[10px] opacity-80 uppercase tracking-widest">University Assistant</span>
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.isBot ? 'bg-white border text-gray-800 rounded-tl-none' : 'bg-orange-600 text-white rounded-tr-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-orange-600 text-xs font-bold animate-bounce">...</div>}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2 bg-gray-100 rounded-full px-4 py-1 items-center border border-gray-200 focus-within:border-orange-500 transition-all">
            <input 
              className="flex-1 bg-transparent py-2 outline-none text-gray-700"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Apna sawal likhein..."
            />
            <button onClick={handleSend} className="text-orange-600 hover:scale-110 transition-transform">
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;