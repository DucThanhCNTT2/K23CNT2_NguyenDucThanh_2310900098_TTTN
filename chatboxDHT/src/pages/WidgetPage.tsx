import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export default function WidgetPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Khởi tạo tin nhắn chào mừng ban đầu
    setMessages([
      { id: '1', sender: 'bot', content: 'Dạ xin chào! Em là trợ lý ảo DHT AI. Em có thể giải đáp mọi thắc mắc về tính năng, bảng giá hoặc hướng dẫn sử dụng 24/7 ạ.' }
    ]);
  }, []);

  // Hàm gửi tin nhắn và gọi AI thông minh
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    
    // Thêm tin nhắn của người dùng lên giao diện ngay lập tức
    const newMessages = [...messages, { id: Date.now().toString(), sender: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await apiService.sendWidgetMessage(userText);
      const reply = res?.content || "Dạ em đã ghi nhận thông tin từ Anh/Chị. Hệ thống DHT ChatAI sẵn sàng hỗ trợ Anh/Chị mọi lúc mọi nơi ạ!";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'bot', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        sender: 'bot', 
        content: "Dạ DHT ChatAI rất hân hạnh được đồng hành cùng Anh/Chị! Anh/Chị có câu hỏi nào về các gói dịch vụ hay hướng dẫn tích hợp không ạ?" 
      }]);
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
        </div>

        <div className="p-3 border-t bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            onClick={handleSend} 
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}