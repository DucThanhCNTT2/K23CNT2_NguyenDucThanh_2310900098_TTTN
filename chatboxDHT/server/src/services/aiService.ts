import mongoose from 'mongoose';
import { FAQ, KnowledgeDoc } from '../models/Knowledge';

export interface BotReplyResult {
  text: string;
  cards: any[];
  quickReplies: any[];
}

function normalizeText(value: string): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function pickQuickReplies(input: string): any[] {
  const lower = input.toLowerCase();
  if (lower.includes('giá') || lower.includes('chi phí') || lower.includes('bao nhiêu')) {
    return [
      { id: 'qr_trial', label: 'Dùng thử 14 ngày', payload: 'trial' },
      { id: 'qr_price', label: 'Xem bảng giá', payload: 'pricing' },
      { id: 'qr_human', label: 'Gặp tư vấn viên', payload: 'human' }
    ];
  }
  if (lower.includes('zalo') || lower.includes('facebook') || lower.includes('fanpage') || lower.includes('tích hợp')) {
    return [
      { id: 'qr_zalo', label: 'Kết nối Zalo', payload: 'zalo' },
      { id: 'qr_fb', label: 'Kết nối Fanpage', payload: 'facebook' },
      { id: 'qr_trial', label: 'Dùng thử ngay', payload: 'trial' }
    ];
  }
  if (lower.includes('tài liệu') || lower.includes('faq') || lower.includes('knowledge') || lower.includes('rag')) {
    return [
      { id: 'qr_kb', label: 'Huấn luyện AI', payload: 'rag' },
      { id: 'qr_docs', label: 'Tải tài liệu lên', payload: 'documents' },
      { id: 'qr_human', label: 'Nhờ tư vấn kỹ thuật', payload: 'human' }
    ];
  }
  return [
    { id: 'qr_price', label: 'Báo giá', payload: 'pricing' },
    { id: 'qr_trial', label: 'Dùng thử', payload: 'trial' },
    { id: 'qr_human', label: 'Gặp nhân viên', payload: 'human' }
  ];
}

function scoreFaqMatch(input: string, faq: any): number {
  const haystack = `${faq?.question || ''} ${faq?.answer || ''}`.toLowerCase();
  const keywords = normalizeText(input).toLowerCase().split(/\s+/).filter((word) => word.length > 2);
  const matches = keywords.filter((word) => haystack.includes(word));
  return matches.length;
}

async function getKnowledgeContext(input: string): Promise<string> {
  const text = normalizeText(input);
  if (!text) return '';

  try {
    const faqMatches: any[] = [];
    if (mongoose.connection.readyState === 1) {
      const faqs = await FAQ.find({}).lean().limit(30);
      faqMatches.push(...faqs.map((faq) => ({ ...faq, score: scoreFaqMatch(text, faq) })));

      const docs = await KnowledgeDoc.find({ status: 'trained' }).lean().limit(15);
      docs.forEach((doc) => {
        if ((doc?.name || '').toLowerCase().includes(text.toLowerCase()) || !faqMatches.length) {
          faqMatches.push({
            question: `Tài liệu: ${doc.name}`,
            answer: `Tài liệu đã được huấn luyện và sẵn sàng phục vụ phản hồi liên quan đến ${doc.name}.`,
            score: 1,
            _isDoc: true
          });
        }
      });

      const top = faqMatches
        .filter((item) => item && (item.score ?? 0) > 0)
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, 6);

      if (top.length > 0) {
        return top.map((item) => `${item.question}: ${item.answer}`).join('\n');
      }
    }
  } catch {
    // falls back gracefully to general template reply
  }

  return '';
}

export function generateAdaptiveImprovisationReply(rawContent: string): BotReplyResult {
  const raw = normalizeText(rawContent);
  const lower = raw.toLowerCase();

  if (!raw) {
    return {
      text: 'Dạ em đang lắng nghe ạ! Anh/Chị cần em hỗ trợ về sản phẩm, báo giá hay tích hợp nào không ạ?',
      cards: [],
      quickReplies: pickQuickReplies(raw)
    };
  }

  if (/^(chào|xin chào|hello|hi|hey|alo|chao ban|chào bạn)/i.test(lower)) {
    return {
      text: 'Dạ em chào Anh/Chị! Em là trợ lý AI của DHT ChatAI, có thể hỗ trợ tư vấn sản phẩm, báo giá, tích hợp Website/Facebook/Zalo và hướng dẫn dùng bot 24/7 ạ.',
      cards: [],
      quickReplies: pickQuickReplies(raw)
    };
  }

  if (lower.includes('giá') || lower.includes('chi phí') || lower.includes('bao nhiêu') || lower.includes('bảng giá')) {
    return {
      text: 'Dạ em xin gửi gói phù hợp nhất cho Anh/Chị:\n\n- Starter: 499.000đ/tháng\n- Pro: 1.490.000đ/tháng\n- Enterprise: 3.990.000đ/tháng\n\nBên em còn tặng 14 ngày dùng thử miễn phí cho gói Pro. Anh/Chị muốn em tư vấn theo nhu cầu cụ thể không ạ?',
      cards: [],
      quickReplies: pickQuickReplies(raw)
    };
  }

  if (lower.includes('zalo') || lower.includes('facebook') || lower.includes('fanpage') || lower.includes('tích hợp') || lower.includes('website')) {
    return {
      text: 'Dạ DHT ChatAI hỗ trợ tích hợp đa kênh: Website, Facebook Fanpage và Zalo OA. Anh/Chị chỉ cần cài script web hoặc kết nối kênh tương ứng, hệ thống sẽ tự động trả lời khách hàng, đồng thời chuyển tay cho nhân viên khi cần ạ.',
      cards: [],
      quickReplies: pickQuickReplies(raw)
    };
  }

  if (lower.includes('ai') || lower.includes('rag') || lower.includes('tài liệu') || lower.includes('học') || lower.includes('knowledge')) {
    return {
      text: 'Dạ đúng rồi, DHT ChatAI có khả năng học từ FAQ, tài liệu và kiến thức nội bộ. Bên em có thể đẩy tài liệu lên hệ thống để bot trả lời đúng theo chính sách, sản phẩm và thông tin doanh nghiệp, không chỉ theo câu hỏi cứng ạ.',
      cards: [],
      quickReplies: pickQuickReplies(raw)
    };
  }

  return {
    text: `Dạ em đã hiểu nhu cầu của Anh/Chị về "${raw}". Với DHT ChatAI, em có thể tư vấn, trả lời tự động theo dữ liệu doanh nghiệp, hỗ trợ tích hợp đa kênh và nâng tỷ lệ chăm sóc khách hàng 24/7. Anh/Chị muốn em giải đáp cụ thể theo nhóm: báo giá, tích hợp, tài liệu AI hay kịch bản chatbot không ạ?`,
    cards: [],
    quickReplies: pickQuickReplies(raw)
  };
}

export async function generateCustomerReply(content: string): Promise<BotReplyResult> {
  const text = normalizeText(content);
  if (!text) {
    return generateAdaptiveImprovisationReply(text);
  }

  const knowledgeContext = await getKnowledgeContext(text);
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest'
    ];

    for (const modelName of candidateModels) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Bạn là trợ lý AI hỗ trợ khách hàng cho nền tảng DHT ChatAI. Hãy trả lời bằng tiếng Việt tự nhiên, rõ ràng, thân thiện và chuyên nghiệp.\n\nNếu có ngữ cảnh kiến thức sau, hãy ưu tiên dùng nó để trả lời đúng.\n--- NGỮ CẢNH ---\n${knowledgeContext || 'Không có dữ liệu tri thức cụ thể.'}\n--- CÂU HỎI ---\n${text}`
              }]
            }]
          })
        });

        clearTimeout(timeout);

        if (!response.ok) {
          continue;
        }

        const data: any = await response.json();
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (replyText) {
          return {
            text: replyText,
            cards: [],
            quickReplies: pickQuickReplies(text)
          };
        }
      } catch {
        // continue to next model fallback
      }
    }
  }

  if (knowledgeContext) {
    const knowledgeAnswer = knowledgeContext.split('\n').slice(0, 3).join(' ');
    return {
      text: `Dạ em đã tham khảo kiến thức có sẵn trong hệ thống và dựa trên dữ liệu liên quan, em thấy: ${knowledgeAnswer}. Nếu Anh/Chị muốn, em có thể giải thích thêm, tư vấn chi tiết về gói, tích hợp hoặc hướng dẫn đặt bot theo nhu cầu cụ thể ạ.`,
      cards: [],
      quickReplies: pickQuickReplies(text)
    };
  }

  return generateAdaptiveImprovisationReply(text);
}

export async function getSmartAIResponse(userMessage: string): Promise<string> {
  const reply = await generateCustomerReply(userMessage);
  return reply.text;
}
