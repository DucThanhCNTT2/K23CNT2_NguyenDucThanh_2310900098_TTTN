import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation';
import { Message, IMessage } from '../models/Message';
import { Customer } from '../models/Customer';
import { emitRealtimeEvent } from '../../realtime';
import { recognizeIntentAndEntities, IntentRecognitionResult } from './intentAndEntityService';
import { generateCustomerReply, ConversationTurn } from './aiService';
import { sendFacebookMessage } from './facebookMessengerService';
import { sendZaloMessage } from './zaloService';

export interface IncomingMessagePayload {
  channel: 'website' | 'facebook' | 'zalo';
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  senderPhone?: string;
  senderEmail?: string;
  content: string;
  attachments?: any[];
  externalMsgId?: string;
}

export interface UnifiedHandlerResponse {
  success: boolean;
  conversationId: string;
  userMessage: any;
  botReply?: any;
  intentResult: IntentRecognitionResult;
  responseTimeMs: number;
  handledBy: 'bot_rule' | 'bot_ai' | 'handoff' | 'agent';
}

function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Unified Message Handler tiếp nhận tin nhắn từ mọi kênh (Website, Facebook Messenger, Zalo OA)
 */
export async function handleIncomingChannelMessage(
  payload: IncomingMessagePayload
): Promise<UnifiedHandlerResponse> {
  const startTime = Date.now();
  const { channel, senderId, senderName, senderAvatar, senderPhone, senderEmail, content, attachments } = payload;
  const conversationId = `${channel}_${senderId}`;

  // 1. Phân tích ý định (Intent Recognition) & Trích xuất thực thể (Entity Extraction)
  const intentResult = recognizeIntentAndEntities(content);

  // 2. Tìm hoặc đồng bộ thông tin Khách hàng (Customer) theo mã kênh & ID người dùng
  let customerDoc: any = null;
  const displayName = senderName || `${channel === 'facebook' ? 'Facebook' : channel === 'zalo' ? 'Zalo' : 'Web'} User ${senderId.slice(-4)}`;
  const avatar = senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

  if (mongoose.connection.readyState === 1) {
    customerDoc = await Customer.findOne({ channel, channelUserId: senderId });
    if (!customerDoc) {
      customerDoc = await Customer.create({
        channelUserId: senderId,
        channel,
        name: displayName,
        avatar,
        phone: senderPhone || intentResult.entities.phone || '',
        email: senderEmail || intentResult.entities.email || '',
        tags: intentResult.entities.plan ? [`Quan tâm ${intentResult.entities.plan}`] : [],
        notes: [],
        totalSpent: '0 ₫',
        lastActive: 'Vừa xong'
      });
    } else {
      // Cập nhật SĐT/Email nếu trích xuất được từ câu hỏi
      let needsSave = false;
      if (!customerDoc.phone && intentResult.entities.phone) {
        customerDoc.phone = intentResult.entities.phone;
        needsSave = true;
      }
      if (!customerDoc.email && intentResult.entities.email) {
        customerDoc.email = intentResult.entities.email;
        needsSave = true;
      }
      customerDoc.lastActive = 'Vừa xong';
      if (needsSave) await customerDoc.save();
    }
  }

  const customerObj = customerDoc ? customerDoc.toObject() : {
    id: senderId,
    channelUserId: senderId,
    name: displayName,
    avatar,
    phone: senderPhone || intentResult.entities.phone || '',
    email: senderEmail || intentResult.entities.email || '',
    channel
  };

  // 3. Chuẩn bị bản ghi tin nhắn người dùng (User Message)
  const userMsgId = payload.externalMsgId || `msg_${channel}_${Date.now()}`;
  const userMessage: any = {
    id: userMsgId,
    conversationId,
    sender: 'user',
    senderName: customerObj.name,
    senderAvatar: customerObj.avatar,
    content: content || '[Tệp đính kèm]',
    timestamp: formatTime(),
    status: 'delivered',
    attachments: attachments || [],
    createdAt: new Date()
  };

  // 4. Tìm hoặc tạo cuộc hội thoại (Conversation)
  let conversation: any = null;
  let history: ConversationTurn[] = [];

  if (mongoose.connection.readyState === 1) {
    // Lưu tin nhắn người dùng
    await Message.findOneAndUpdate({ id: userMsgId }, userMessage, { upsert: true });

    // Lấy các lượt chat gần nhất để làm ngữ cảnh đa lượt (Multi-turn Context)
    const prevMsgs = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    history = prevMsgs.reverse().map((m) => ({
      sender: m.sender as any,
      content: m.content
    }));

    conversation = await Conversation.findOneAndUpdate(
      { id: conversationId },
      {
        $set: {
          channel,
          customer: customerObj,
          lastMessage: userMessage,
          updatedAt: new Date()
        },
        $setOnInsert: {
          id: conversationId,
          status: 'bot_active',
          isBotHandling: true
        },
        $inc: { unreadCount: 1 }
      },
      { upsert: true, returnDocument: 'after' }
    );
  }

  // Bắn thông báo Realtime cho Web Dashboard (Socket.io)
  emitRealtimeEvent('new_message', {
    conversationId,
    message: userMessage,
    customer: customerObj,
    channel,
    status: conversation?.status || 'bot_active',
    isBotHandling: conversation?.isBotHandling ?? true,
    unreadCount: conversation?.unreadCount ?? 1
  });

  // 5. Kiểm tra nếu cuộc hội thoại đang được nhân viên hỗ trợ trực tiếp (Human Agent)
  if (conversation && conversation.isBotHandling === false) {
    const elapsed = Date.now() - startTime;
    return {
      success: true,
      conversationId,
      userMessage,
      intentResult,
      responseTimeMs: elapsed,
      handledBy: 'agent'
    };
  }

  // 6. Xử lý Chuyển tiếp nhân viên hỗ trợ (Human Handoff) khi khách yêu cầu
  let botReplyResult: { text: string; cards?: any[]; quickReplies?: any[] } = { text: '' };
  let handledBy: 'bot_rule' | 'bot_ai' | 'handoff' = 'bot_ai';

  if (intentResult.needsHandoff || intentResult.intent === 'human_handoff') {
    handledBy = 'handoff';
    if (mongoose.connection.readyState === 1 && conversation) {
      conversation.isBotHandling = false;
      conversation.status = 'assigned';
      await conversation.save();
    }

    botReplyResult = {
      text: 'Dạ, em đã chuyển tiếp cuộc trò chuyện của Anh/Chị đến đội ngũ chuyên viên hỗ trợ trực tiếp. Chuyên viên CSKH của DHT AI sẽ phản hồi hỗ trợ Anh/Chị ngay trong giây lát ạ!',
      quickReplies: [
        { id: 'qr_urgent', label: 'Cần hỗ trợ khẩn cấp', payload: 'urgent' },
        { id: 'qr_call', label: 'Để lại số điện thoại', payload: 'leave_phone' }
      ]
    };
  } else if (intentResult.intent === 'order_lookup' && intentResult.entities.orderCode) {
    // Xử lý kịch bản tra cứu đơn hàng tự động
    handledBy = 'bot_rule';
    const code = intentResult.entities.orderCode;
    botReplyResult = {
      text: `Dạ em đã kiểm tra mã đơn ${code}: Đơn hàng đang được hệ thống xử lý và đóng gói bàn giao đơn vị vận chuyển. Dự kiến giao tới Anh/Chị trong 1-2 ngày làm việc ạ!`,
      quickReplies: [
        { id: 'qr_detail', label: 'Xem chi tiết đơn', payload: code },
        { id: 'qr_human', label: 'Gặp nhân viên CSKH', payload: 'human' }
      ]
    };
  } else {
    // 7. Xử lý trả lời tự động bằng AI / LLM (Gemini RAG + Multi-turn Context)
    handledBy = 'bot_ai';
    const aiOutput = await generateCustomerReply(content, history);
    botReplyResult = {
      text: aiOutput.text,
      cards: aiOutput.cards || [],
      quickReplies: aiOutput.quickReplies || []
    };
  }

  // 8. Gửi tin nhắn phản hồi về ĐÚNG KÊNH NGUỒN của người dùng (Channel-specific dispatch)
  let deliveryStatus: 'sent' | 'failed' = 'sent';
  try {
    if (channel === 'facebook') {
      await sendFacebookMessage(senderId, botReplyResult.text, botReplyResult.quickReplies, botReplyResult.cards);
    } else if (channel === 'zalo') {
      await sendZaloMessage(senderId, botReplyResult.text, botReplyResult.quickReplies);
    }
  } catch (deliveryErr: any) {
    deliveryStatus = 'failed';
    console.warn(`⚠️ [Delivery Warning on ${channel}]:`, deliveryErr.message);
  }

  // 9. Lưu tin nhắn Bot vào Database
  const botMsgId = `bot_${channel}_${Date.now()}`;
  const botMessage: any = {
    id: botMsgId,
    conversationId,
    sender: 'bot',
    senderName: 'DHT AI',
    content: botReplyResult.text,
    timestamp: formatTime(),
    status: deliveryStatus,
    cards: botReplyResult.cards,
    quickReplies: botReplyResult.quickReplies,
    createdAt: new Date()
  };

  if (mongoose.connection.readyState === 1) {
    await Message.create(botMessage);
    await Conversation.findOneAndUpdate(
      { id: conversationId },
      {
        $set: {
          lastMessage: botMessage,
          updatedAt: new Date()
        }
      }
    );
  }

  // Bắn sự kiện realtime cho tin nhắn Bot
  emitRealtimeEvent('new_message', {
    conversationId,
    message: botMessage,
    customer: customerObj,
    channel,
    status: conversation?.status || (handledBy === 'handoff' ? 'assigned' : 'bot_active'),
    isBotHandling: handledBy === 'handoff' ? false : (conversation?.isBotHandling ?? true),
    unreadCount: conversation?.unreadCount ?? 1
  });

  const responseTimeMs = Date.now() - startTime;

  return {
    success: true,
    conversationId,
    userMessage,
    botReply: botMessage,
    intentResult,
    responseTimeMs,
    handledBy
  };
}
