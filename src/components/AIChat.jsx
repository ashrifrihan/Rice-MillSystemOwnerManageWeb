import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, BotIcon, UserIcon } from 'lucide-react';

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([{
    id: Date.now(),
    sender: 'ai',
    text: "Hello! I'm your Rice Mill Assistant. Ask me anything about your sales, stock, loans, or deliveries.",
    timestamp: new Date()
  }]);

  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = e => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      let response = '';
      const text = message.toLowerCase();
      if (text.includes('rice type') && text.includes('sold')) {
        response = 'Premium Basmati Rice was your best-selling product last month with 12,450 kg sold, generating Rs.1,058,250.';
      } else if (text.includes('loan') && text.includes('pending')) {
        response = 'You currently have Rs.3,45,600 in outstanding loans across 8 customers. Largest outstanding: Rs.78,500 from Sharma Foods Ltd.';
      } else if (text.includes('driver') && text.includes('fastest')) {
        response = 'Rajesh Kumar completed the most deliveries last month, averaging 1.2 hours per delivery (15% faster than the team).';
      } else {
        response = "I'm analyzing your business data. Please ask about sales, stock, loans, or deliveries for quick insights.";
      }

      const aiMessage = {
        id: Date.now(),
        sender: 'ai',
        text: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-5 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-110"
      >
        <BotIcon className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-indigo-600 px-4 py-3 text-white flex justify-between items-center">
        <h3 className="text-lg font-bold">AI Assistant</h3>
        <button 
          onClick={() => setIsOpen(false)} 
          className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
        >
          &times;
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3/4 rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-indigo-100 text-gray-800' : 'bg-gray-100 text-gray-800'} shadow-sm`}>
              <div className="flex items-center mb-1">
                {msg.sender === 'ai' 
                  ? <BotIcon className="h-4 w-4 mr-1 text-indigo-600" /> 
                  : <UserIcon className="h-4 w-4 mr-1 text-gray-600" />
                }
                <span className="text-xs text-gray-500">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Ask about sales, stock, loans, or deliveries..."
          className="flex-1 rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
        />
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
