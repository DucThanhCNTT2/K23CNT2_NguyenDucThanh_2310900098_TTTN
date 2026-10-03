import React, { useState } from 'react';
import { apiService, type WidgetMessage } from '../services/api';

export default function WidgetPage() {
  const [messages, setMessages] = useState<WidgetMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      content: 'Dạ xin chào! Em là trợ lý ảo DHT AI. Em có thể giải đáp mọi thắc mắc về tính năng, bảng giá hoặc hướng dẫn sử dụng 24/7 ạ.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hàm gửi tin nhắn và gọi AI thông minh
  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    setInput('');
    const pendingMessage: WidgetMessage = {
      id: 'pending-user',
      sender: 'user',
      content: userText
    };
    setMessages((previous) => [...previous, pendingMessage]);
    setLoading(true);
    setError('');

    try {
      const result = await apiService.sendWidgetMessage(userText);
      if (!result) {
        setMessages((previous) => previous.filter((message) => message.id !== pendingMessage.id));
        setError('Tin nhắn chưa gửi được. Vui lòng thử lại sau giây lát.');
        return;
      }
      setMessages((previous) => [
        ...previous.filter((message) => message.id !== pendingMessage.id),
        result.userMessage,
        result.botReply
      ]);
    } catch {
      setMessages((previous) => previous.filter((message) => message.id !== pendingMessage.id));
      setError('Tin nhắn chưa gửi được. Vui lòng thử lại sau giây lát.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        <div className="bg-indigo-600 p-4 text-white font-bold flex justify-between items-center">
          <span>🤖 Live Chat (Giao diện Khách hàng)</span>
          <span className="text-xs bg-indigo-500 px-2 py-1 rounded">Online</span>
        </div>
        
        <div className="h-96 p-4 overflow-y-auto space-y-3 bg-slate-50">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                m.sender === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-xs text-slate-400 italic">Bot AI đang suy nghĩ...</div>}
          {error && <p role="status" className="text-xs text-rose-700">{error}</p>}
        </div>

        <div className="p-3 border-t bg-white flex gap-2">
          <input
            type="text"
            aria-label="Tin nhắn gửi tới DHT ChatAI"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            onClick={handleSend} 
            disabled={loading}
            aria-label="Gửi tin nhắn"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}