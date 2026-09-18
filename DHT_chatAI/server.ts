import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import crypto from 'crypto';

// Import Types & Mock Data
import { 
  initialConversations, 
  sampleMessages, 
  cannedResponses, 
  sampleFAQs, 
  sampleKnowledgeDocs, 
  initialBotNodes, 
  analyticsData,
  currentUser as mockUser
} from './src/mock/data';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 1. KẾT NỐI CƠ SỞ DỮ LIỆU MONGODB
// ==========================================
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dht_chatai';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`✅ [MongoDB] Kết nối cơ sở dữ liệu thành công: ${conn.connection.host}`);
  } catch (error: any) {
    console.warn(`⚠️ [MongoDB] Chưa thể kết nối tới MongoDB (${error.message}). Tự động kích hoạt bộ nhớ In-Memory Fallback.`);
  }
};
connectDB();

// ==========================================
// 2. MONGODB SCHEMAS & MODELS
// ==========================================
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  role: { type: String, enum: ['admin', 'agent', 'supervisor'], default: 'agent' },
  companyName: { type: String, default: 'DHT AI Solution Corp' },
  plan: { type: String, enum: ['Starter', 'Pro', 'Enterprise'], default: 'Pro' },
  isOnline: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const ConversationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.Mixed, required: true },
  channel: { type: String, enum: ['website', 'facebook', 'zalo'], required: true },
  status: { type: String, enum: ['pending', 'bot_active', 'assigned', 'resolved'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  assignedAgent: { type: mongoose.Schema.Types.Mixed },
  isBotHandling: { type: Boolean, default: true },
  unreadCount: { type: Number, default: 0 },
  lastMessage: { type: mongoose.Schema.Types.Mixed },
  rating: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });
const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);

const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  conversationId: { type: String, required: true, index: true },
  sender: { type: String, enum: ['user', 'bot', 'agent'], required: true },
  senderName: String,
  senderAvatar: String,
  content: { type: String, required: true },
  timestamp: String,
  status: { type: String, enum: ['sending', 'sent', 'delivered', 'seen'], default: 'sent' },
  cards: [mongoose.Schema.Types.Mixed],
  quickReplies: [mongoose.Schema.Types.Mixed],
  attachments: [mongoose.Schema.Types.Mixed],
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

// ==========================================
// 3. BỘ NHỚ IN-MEMORY DỰ PHÒNG (FALLBACK)
// ==========================================
let inMemoryUsers: any[] = [
  {
    id: 'usr_001',
    name: 'Đinh Văn Hiếu',
    email: 'admin@chatai.vn',
    password: hashPassword('admin123456'),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'admin',
    companyName: 'DHT AI Solution Corp',
    plan: 'Enterprise',
    isOnline: true
  },
  {
    id: 'usr_002',
    name: 'Nguyễn CSKH',
    email: 'agent.hieu@chatai.vn',
    password: hashPassword('agent123456'),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'agent',
    companyName: 'DHT AI Solution Corp',
    plan: 'Pro',
    isOnline: true
  }
];

let inMemoryOtps: Record<string, { otp: string; expiresAt: number }> = {
  'admin@chatai.vn': { otp: '888999', expiresAt: Date.now() + 3600000 }
};

let inMemoryConversations = [...initialConversations];
let inMemoryMessages: Record<string, any[]> = { ...sampleMessages };
let inMemoryCanned = [...cannedResponses];
let inMemoryFAQs = [...sampleFAQs];
let inMemoryDocs = [...sampleKnowledgeDocs];
let inMemoryBotNodes = [...initialBotNodes];
let inMemoryBotConfig = {
  botName: 'DHT AI Assistant',
  tone: 'friendly',
  temperature: 0.3,
  systemPrompt: 'Bạn là trợ lý ảo AI của DHT AI Solution Corp hỗ trợ Website, Facebook Messenger và Zalo OA.'
};

function hashPassword(pass: string): string {
  return crypto.createHash('sha256').update(pass).digest('hex');
}

function generateToken(userId: string): string {
  const payload = `${userId}:${Date.now()}`;
  return Buffer.from(payload).toString('base64');
}

const AI_API_KEY = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '';
const AI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

function buildStructuredBotReply(content: string) {
  const lower = (content || '').toLowerCase();

  if (lower.includes('giá') || lower.includes('chi phí') || lower.includes('bao nhiêu') || lower.includes('pricing')) {
    return {
      text: 'Dạ em xin gửi bảng giá dịch vụ Chatbot AI đa kênh ưu đãi nhất. DHT AI hỗ trợ tích hợp Website, Facebook Messenger và Zalo OA trong 1 nền tảng, với gói Pro bắt đầu từ 1.490.000đ/tháng.',
      cards: [{
        id: 'c1',
        title: 'Gói Pro Đa Kênh',
        price: '1.490.000 ₫/tháng',
        originalPrice: '2.200.000 ₫',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500',
        description: 'Tích hợp đầy đủ Website + FB Messenger + Zalo OA. Huấn luyện tài liệu AI không giới hạn.'
      }],
      quickReplies: [
        { id: 'qr_reg', label: 'Dùng thử 14 ngày', payload: 'trial' },
        { id: 'qr_human', label: 'Gặp tư vấn viên', payload: 'human' }
      ]
    };
  }

  if (lower.includes('zalo') || lower.includes('facebook') || lower.includes('omnichannel') || lower.includes('kênh')) {
    return {
      text: 'DHT AI hỗ trợ kết nối đồng bộ 1 chạm với Zalo Official Account và Facebook Fanpage, đồng thời quản lý mọi cuộc trò chuyện trên 1 dashboard. Nếu cần, em có thể hướng dẫn bạn cách tích hợp từng kênh.',
      quickReplies: [
        { id: 'qr_omnichannel', label: 'Tích hợp ngay', payload: 'integration' },
        { id: 'qr_human', label: 'Gặp tư vấn viên', payload: 'human' }
      ]
    };
  }

  if (lower.includes('demo') || lower.includes('dùng thử') || lower.includes('trial') || lower.includes('free')) {
    return {
      text: 'Dạ em hỗ trợ bạn đăng ký dùng thử 14 ngày miễn phí. Bạn chỉ cần cung cấp tên doanh nghiệp, email và kênh muốn tích hợp, đội ngũ DHT AI sẽ hỗ trợ setup nhanh trong vòng 24 giờ.',
      quickReplies: [
        { id: 'qr_trial', label: 'Đăng ký dùng thử', payload: 'trial' },
        { id: 'qr_human', label: 'Tư vấn ngay', payload: 'human' }
      ]
    };
  }

  if (lower.includes('xin chào') || lower.includes('hello') || lower.includes('chào')) {
    return {
      text: 'Xin chào! DHT AI rất hân hạnh được hỗ trợ bạn 24/7. Nếu cần, em có thể tư vấn về giải pháp chatbot, bảng giá, tích hợp kênh hoặc báo giá theo nhu cầu doanh nghiệp.'
    };
  }

  if (lower.includes('bot') || lower.includes('chatbot') || lower.includes('ai')) {
    return {
      text: 'Chatbot AI của DHT được thiết kế để tự trả lời khách hàng 24/7, hỗ trợ chăm sóc khách hàng, chuyển cuộc trò chuyện sang nhân viên khi cần và huấn luyện dựa trên tài liệu/FAQ của doanh nghiệp.'
    };
  }

  if (lower.includes('hỗ trợ') || lower.includes('giúp') || lower.includes('cần')) {
    return {
      text: 'Dạ, em sẵn sàng hỗ trợ. Bạn có thể cho em biết mục tiêu chính: tăng chăm sóc khách hàng, bán hàng, hoặc tích hợp chatbot trên Website/Facebook/Zalo không ạ?'
    };
  }

  return {
    text: 'Dạ DHT AI đã nhận được tin nhắn của Anh/Chị. Em có thể hỗ trợ giải pháp chatbot AI đa kênh, báo giá, hoặc hướng dẫn tích hợp Website/Facebook/Zalo cho doanh nghiệp ạ.'
  };
}

async function generateCustomerReply(content: string) {
  const fallback = buildStructuredBotReply(content);

  if (!AI_API_KEY) {
    return fallback;
  }

  try {
    const response = await fetch(`${AI_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`
      },
      body: JSON.stringify({
        model: AI_MODEL,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'Bạn là DHT AI Assistant, hỗ trợ khách hàng doanh nghiệp Việt Nam. Trả lời ngắn gọn, chuyên nghiệp, thân thiện, tập trung vào giải pháp chatbot AI, bảng giá, tích hợp Website/Facebook/Zalo, và chuyển người nếu cần. Luôn viết bằng tiếng Việt.'
          },
          {
            role: 'user',
            content
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json() as any;
    const replyText = data?.choices?.[0]?.message?.content?.trim();

    if (!replyText) {
      throw new Error('AI response empty');
    }

    return {
      text: String(replyText).replace(/```/g, '').trim(),
      quickReplies: fallback.quickReplies,
      cards: fallback.cards
    };
  } catch (error: any) {
    console.warn('[AI Reply] Fallback to rule-based response:', error.message);
    return fallback;
  }
}

// ==========================================
// 4. API NHÓM XÁC THỰC (AUTHENTICATION APIS)
// ==========================================

// [POST] /api/auth/register (hoặc /signup): Đăng ký tài khoản doanh nghiệp mới
app.post(['/api/auth/register', '/api/auth/signup'], async (req: Request, res: Response) => {
  try {
    const { companyName, fullName, email, phone, password, channels } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu!' });
    }

    const emailLower = email.toLowerCase().trim();

    // Check existing
    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ email: emailLower });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email này đã được đăng ký trên hệ thống!' });
      }

      const newUser = await User.create({
        name: fullName,
        email: emailLower,
        password: hashPassword(password),
        companyName: companyName || 'Doanh Nghiệp Mới',
        plan: 'Pro',
        role: 'admin'
      });

      const token = generateToken(newUser._id.toString());
      return res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công! Tặng kèm 14 ngày dùng thử Pro.',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          companyName: newUser.companyName,
          plan: newUser.plan
        }
      });
    }

    // In-memory check
    const existingMemory = inMemoryUsers.find(u => u.email === emailLower);
    if (existingMemory) {
      return res.status(400).json({ success: false, message: 'Email này đã được đăng ký!' });
    }

    const newMemUser = {
      id: 'usr_' + Date.now(),
      name: fullName,
      email: emailLower,
      password: hashPassword(password),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'admin',
      companyName: companyName || 'Doanh Nghiệp Mới',
      plan: 'Pro',
      isOnline: true,
      channels: channels || ['website', 'facebook', 'zalo']
    };
    inMemoryUsers.push(newMemUser);

    const token = generateToken(newMemUser.id);
    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản doanh nghiệp thành công!',
      token,
      user: {
        id: newMemUser.id,
        name: newMemUser.name,
        email: newMemUser.email,
        role: newMemUser.role,
        companyName: newMemUser.companyName,
        plan: newMemUser.plan
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// [POST] /api/auth/login: Đăng nhập hệ thống
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mật khẩu!' });
    }

    const emailLower = email.toLowerCase().trim();
    const hashedPassword = hashPassword(password);

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: emailLower });
      if (!user || user.password !== hashedPassword) {
        return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác!' });
      }

      const token = generateToken(user._id.toString());
      return res.json({
        success: true,
        message: 'Đăng nhập thành công!',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          companyName: user.companyName,
          plan: user.plan
        }
      });
    }

    // In-memory fallback
    const user = inMemoryUsers.find(u => u.email === emailLower);
    if (!user || user.password !== hashedPassword) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác!' });
    }

    const token = generateToken(user.id);
    return res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        companyName: user.companyName,
        plan: user.plan
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// [POST] /api/auth/logout: Đăng xuất an toàn
app.post('/api/auth/logout', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Đăng xuất thành công. Phiên làm việc đã kết thúc.'
  });
});

// [POST] /api/auth/forget-password: Gửi mã OTP khôi phục mật khẩu
app.post('/api/auth/forget-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email tài khoản!' });
  }

  const emailLower = email.toLowerCase().trim();
  const generatedOtp = '888999'; // OTP mã xác thực mặc định demo hoặc ngẫu nhiên
  inMemoryOtps[emailLower] = {
    otp: generatedOtp,
    expiresAt: Date.now() + 15 * 60 * 1000 // 15 phút
  };

  console.log(`🔑 [OTP Reset Password] Đã gửi mã OTP: ${generatedOtp} tới email: ${emailLower}`);

  return res.json({
    success: true,
    message: `Mã xác thực OTP gồm 6 chữ số đã được gửi tới ${email}.`,
    demoOtp: generatedOtp
  });
});

// [POST] /api/auth/verify-otp: Xác thực mã OTP
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const emailLower = (email || '').toLowerCase().trim();

  const record = inMemoryOtps[emailLower];
  if (!record || record.otp !== String(otp).trim() || Date.now() > record.expiresAt) {
    return res.status(400).json({ success: false, message: 'Mã OTP không hợp lệ hoặc đã hết hạn!' });
  }

  return res.json({
    success: true,
    message: 'Xác thực OTP thành công. Mời bạn nhập mật khẩu mới.'
  });
});

// [POST] /api/auth/reset-password: Đặt lại mật khẩu mới
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin email hoặc mật khẩu mới!' });
    }

    const emailLower = email.toLowerCase().trim();
    const hashed = hashPassword(newPassword);

    if (mongoose.connection.readyState === 1) {
      await User.findOneAndUpdate({ email: emailLower }, { password: hashed });
    }

    inMemoryUsers = inMemoryUsers.map(u => u.email === emailLower ? { ...u, password: hashed } : u);
    delete inMemoryOtps[emailLower];

    return res.json({
      success: true,
      message: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay bằng mật khẩu mới.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// [GET] /api/auth/me: Lấy thông tin tài khoản hiện tại
app.get('/api/auth/me', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: mockUser
  });
});

// [PATCH] /api/auth/status: Bật/Tắt trạng thái CSKH Online/Offline
app.patch('/api/auth/status', (req: Request, res: Response) => {
  const { isOnline } = req.body;
  return res.json({
    success: true,
    isOnline: Boolean(isOnline),
    message: isOnline ? 'CSKH đang trực tuyến' : 'CSKH tạm vắng'
  });
});

// ==========================================
// 5. API HỘP THƯ TẬP TRUNG & CSKH CONSOLE
// ==========================================

// [GET] /api/conversations: Lấy danh sách hội thoại đa kênh (Web, FB, Zalo)
app.get('/api/conversations', async (req: Request, res: Response) => {
  try {
    const { channel, status, search } = req.query;

    if (mongoose.connection.readyState === 1) {
      let query: any = {};
      if (channel && channel !== 'all') query.channel = channel;
      if (status && status !== 'all') query.status = status;

      let list = await Conversation.find(query).sort({ updatedAt: -1 });
      if (list.length === 0 && inMemoryConversations.length > 0) {
        await Conversation.insertMany(inMemoryConversations as any);
        list = await Conversation.find(query).sort({ updatedAt: -1 });
      }
      return res.json({ success: true, count: list.length, data: list });
    }

    let list = inMemoryConversations;
    if (channel && channel !== 'all') list = list.filter(c => c.channel === channel);
    if (status && status !== 'all') list = list.filter(c => c.status === status);
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(c => 
        c.customer.name.toLowerCase().includes(q) || 
        c.lastMessage.content.toLowerCase().includes(q) ||
        c.customer.phone.includes(q)
      );
    }
    return res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// [GET] /api/conversations/:id/messages: Luồng tin nhắn
app.get('/api/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      let msgs = await Message.find({ conversationId: id }).sort({ createdAt: 1 });
      if (msgs.length === 0 && inMemoryMessages[id]) {
        await Message.insertMany(inMemoryMessages[id] as any);
        msgs = await Message.find({ conversationId: id }).sort({ createdAt: 1 });
      }
      return res.json({ success: true, data: msgs });
    }

    const msgs = inMemoryMessages[id] || [];
    return res.json({ success: true, data: msgs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// [POST] /api/conversations/:id/messages: Gửi tin nhắn mới
app.post('/api/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sender, senderName, content, cards, quickReplies, attachments } = req.body;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: 'msg_' + Date.now(),
      conversationId: id,
      sender: sender || 'agent',
      senderName: senderName || 'Đinh Văn Hiếu',
      content,
      timestamp: time,
      status: 'sent',
      cards,
      quickReplies,
      attachments,
      createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      await Message.create(newMsg);
      await Conversation.findOneAndUpdate(
        { id },
        { lastMessage: newMsg, updatedAt: new Date() }
      );
    }

    if (!inMemoryMessages[id]) inMemoryMessages[id] = [];
    inMemoryMessages[id].push(newMsg);

    inMemoryConversations = inMemoryConversations.map(c => 
      c.id === id ? { ...c, lastMessage: newMsg as any, updatedAt: 'Vừa xong' } : c
    );

    if (sender === 'user' || sender === 'customer') {
      const aiReply = await generateCustomerReply(String(content || ''));
      const botReplyMessage = {
        id: 'msg_ai_' + Date.now(),
        conversationId: id,
        sender: 'bot',
        senderName: 'DHT AI Assistant',
        content: aiReply.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'seen',
        cards: aiReply.cards,
        quickReplies: aiReply.quickReplies,
        createdAt: new Date()
      };

      if (mongoose.connection.readyState === 1) {
        await Message.create(botReplyMessage);
      }

      inMemoryMessages[id] = [...(inMemoryMessages[id] || []), botReplyMessage];
      inMemoryConversations = inMemoryConversations.map(c => 
        c.id === id ? { ...c, lastMessage: botReplyMessage as any, updatedAt: 'Vừa xong' } : c
      );

      return res.status(201).json({ success: true, data: { userMessage: newMsg, botReply: botReplyMessage } });
    }

    return res.status(201).json({ success: true, data: newMsg });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// [POST] /api/conversations/:id/toggle-bot: 1-Click Switch can thiệp / tiếp quản Bot AI ⇄ CSKH
app.post('/api/conversations/:id/toggle-bot', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let nextBotState = false;

    if (mongoose.connection.readyState === 1) {
      const conv = await Conversation.findOne({ id });
      if (conv) {
        nextBotState = !conv.isBotHandling;
        conv.isBotHandling = nextBotState;
        conv.status = nextBotState ? 'bot_active' : 'assigned';
        await conv.save();
      }
    }

    inMemoryConversations = inMemoryConversations.map(c => {
      if (c.id === id) {
        nextBotState = !c.isBotHandling;
        return {
          ...c,
          isBotHandling: nextBotState,
          status: nextBotState ? 'bot_active' : 'assigned'
        };
      }
      return c;
    });

    return res.json({
      success: true,
      isBotHandling: nextBotState,
      status: nextBotState ? 'bot_active' : 'assigned',
      message: nextBotState ? '🤖 Bot AI đã được kích hoạt xử lý tự động' : '👨‍💼 Tư vấn viên CSKH đã tiếp quản cuộc trò chuyện'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// [PATCH] /api/conversations/:id/status: Cập nhật trạng thái hội thoại
app.patch('/api/conversations/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (mongoose.connection.readyState === 1) {
      await Conversation.findOneAndUpdate({ id }, { status });
    }

    inMemoryConversations = inMemoryConversations.map(c => c.id === id ? { ...c, status } : c);
    return res.json({ success: true, message: `Đã cập nhật trạng thái thành: ${status}` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// [POST] /api/conversations/:id/rating: Đánh giá chất lượng hỗ trợ (CSAT)
app.post('/api/conversations/:id/rating', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { score, feedback } = req.body;

    const rating = {
      score: Number(score) || 5,
      feedback: feedback || 'Rất hài lòng',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (mongoose.connection.readyState === 1) {
      await Conversation.findOneAndUpdate({ id }, { rating, status: 'resolved' });
    }

    inMemoryConversations = inMemoryConversations.map(c => 
      c.id === id ? { ...c, rating, status: 'resolved' } : c
    );

    return res.json({ success: true, data: rating, message: 'Cảm ơn đánh giá phản hồi của bạn!' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 6. API LIVE CHAT WIDGET PHÍA KHÁCH HÀNG
// ==========================================

// [GET] /api/widget/config: Cấu hình giao diện widget cho khách
app.get('/api/widget/config', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      botName: 'DHT AI Assistant',
      primaryColor: '#6366f1',
      greeting: 'Xin chào! DHT AI rất hân hạnh được hỗ trợ bạn 24/7.',
      quickReplies: [
        { id: 'wqr_1', label: 'Xem bảng giá', payload: 'price' },
        { id: 'wqr_2', label: 'Tích hợp FB & Zalo', payload: 'omnichannel' },
        { id: 'wqr_3', label: 'Gặp tư vấn viên', payload: 'human' }
      ]
    }
  });
});

// [POST] /api/widget/send: Khách gửi tin nhắn -> AI Bot tự động phân tích & trả lời
app.post('/api/widget/send', async (req: Request, res: Response) => {
  const { content } = req.body;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const aiReply = await generateCustomerReply(String(content || ''));

  const botMessage = {
    id: 'wm_bot_' + Date.now(),
    conversationId: 'widget_client',
    sender: 'bot',
    senderName: 'DHT AI Assistant',
    content: aiReply.text,
    timestamp: time,
    status: 'seen',
    cards: aiReply.cards,
    quickReplies: aiReply.quickReplies
  };

  return res.json({ success: true, data: botMessage });
});

// ==========================================
// 7. API TIN NHẮN MẪU (CANNED RESPONSES)
// ==========================================

app.get('/api/canned-responses', (_req: Request, res: Response) => {
  return res.json({ success: true, data: inMemoryCanned });
});

app.post('/api/canned-responses', (req: Request, res: Response) => {
  const { shortcut, title, content, category } = req.body;
  const newItem = {
    id: 'cr_' + Date.now(),
    shortcut: shortcut.startsWith('/') ? shortcut : '/' + shortcut,
    title,
    content,
    category: category || 'chao_hoi'
  };
  inMemoryCanned.push(newItem);
  return res.status(201).json({ success: true, data: newItem });
});

// ==========================================
// 8. API QUẢN TRỊ KỊCH BẢN (BOT BUILDER)
// ==========================================

app.get('/api/bot/flow', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      nodes: inMemoryBotNodes,
      config: inMemoryBotConfig
    }
  });
});

app.post('/api/bot/flow', (req: Request, res: Response) => {
  const { nodes, config } = req.body;
  if (nodes) inMemoryBotNodes = nodes;
  if (config) inMemoryBotConfig = { ...inMemoryBotConfig, ...config };

  return res.json({
    success: true,
    message: 'Đã lưu kịch bản kịch bản và Persona AI thành công!',
    data: { nodes: inMemoryBotNodes, config: inMemoryBotConfig }
  });
});

// ==========================================
// 9. API TRI THỨC HUẤN LUYỆN AI & FAQ (RAG)
// ==========================================

app.get('/api/knowledge/faqs', (_req: Request, res: Response) => {
  return res.json({ success: true, data: inMemoryFAQs });
});

app.post('/api/knowledge/faqs', (req: Request, res: Response) => {
  const { question, answer, category } = req.body;
  const newFaq = {
    id: 'faq_' + Date.now(),
    question,
    answer,
    category: category || 'Chung',
    updatedAt: 'Hôm nay'
  };
  inMemoryFAQs.unshift(newFaq);
  return res.status(201).json({ success: true, data: newFaq });
});

app.delete('/api/knowledge/faqs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  inMemoryFAQs = inMemoryFAQs.filter(f => f.id !== id);
  return res.json({ success: true, message: 'Đã xóa FAQ' });
});

app.get('/api/knowledge/docs', (_req: Request, res: Response) => {
  return res.json({ success: true, data: inMemoryDocs });
});

app.post('/api/knowledge/docs', (req: Request, res: Response) => {
  const { name, size, type } = req.body;
  const newDoc = {
    id: 'doc_' + Date.now(),
    name,
    size: size || '1.2 MB',
    type: type || 'pdf',
    status: 'trained',
    trainedAt: 'Vừa xong',
    chunksCount: Math.floor(Math.random() * 80) + 40
  };
  inMemoryDocs.unshift(newDoc);
  return res.status(201).json({ success: true, data: newDoc, message: 'Huấn luyện tài liệu RAG thành công!' });
});

// ==========================================
// 10. API WEBHOOKS FACEBOOK & ZALO OA
// ==========================================

app.get('/api/webhooks/facebook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || 'dht_ai_messenger_verify_token_2026';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ [Facebook Webhook] Xác thực Meta Webhook thành công!');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

app.post('/api/webhooks/facebook', (req: Request, res: Response) => {
  const body = req.body;
  if (body.object === 'page') {
    body.entry?.forEach((entry: any) => {
      const event = entry.messaging?.[0];
      if (event?.message?.text) {
        console.log(`💬 [FB Messenger Webhook] Nhận tin nhắn: "${event.message.text}"`);
      }
    });
    return res.status(200).send('EVENT_RECEIVED');
  }
  return res.sendStatus(404);
});

app.post('/api/webhooks/zalo', (req: Request, res: Response) => {
  const body = req.body;
  console.log(`📱 [Zalo OA Webhook] Nhận sự kiện ${body.event_name} từ khách hàng`);
  return res.status(200).json({ error: 0, message: 'Success' });
});

// ==========================================
// 11. API BÁO CÁO & THỐNG KÊ (ANALYTICS)
// ==========================================

app.get('/api/analytics', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: analyticsData
  });
});

// ==========================================
// 12. HEALTH CHECK ENDPOINT
// ==========================================

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'MongoDB Connected' : 'In-Memory Fallback Active',
    channels: ['website', 'facebook_messenger', 'zalo_oa'],
    routes: [
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/logout',
      '/api/auth/forget-password',
      '/api/auth/verify-otp',
      '/api/auth/reset-password',
      '/api/auth/me',
      '/api/conversations',
      '/api/widget/send',
      '/api/canned-responses',
      '/api/bot/flow',
      '/api/knowledge/faqs',
      '/api/analytics'
    ]
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 [DHT ChatAI Backend Server] Sẵn sàng tại http://localhost:${PORT}`);
  console.log(`🔐 [Auth APIs]: POST /api/auth/register | POST /api/auth/login`);
  console.log(`💬 [Omnichannel APIs]: GET /api/conversations | POST /toggle-bot`);
  console.log(`📡 [Health Check]: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

export default app;
