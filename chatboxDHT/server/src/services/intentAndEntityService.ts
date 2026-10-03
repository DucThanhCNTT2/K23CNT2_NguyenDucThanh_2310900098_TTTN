export interface ExtractedEntities {
  phone?: string;
  email?: string;
  orderCode?: string;
  plan?: 'Starter' | 'Pro' | 'Enterprise';
  channel?: 'website' | 'facebook' | 'zalo';
  keywords?: string[];
}

export type UserIntent =
  | 'greeting'
  | 'pricing'
  | 'order_lookup'
  | 'product_inquiry'
  | 'channel_integration'
  | 'technical_support'
  | 'human_handoff'
  | 'complaint'
  | 'faq'
  | 'unknown';

export interface IntentRecognitionResult {
  intent: UserIntent;
  confidence: number;
  entities: ExtractedEntities;
  matchedRuleOrFaq?: string;
  needsHandoff: boolean;
}

function normalize(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Trích xuất thực thể (Entity Extraction): SĐT, Email, Mã đơn hàng, Gói cước, Kênh tiếp nhận
 */
export function extractEntities(rawText: string): ExtractedEntities {
  const text = rawText || '';
  const entities: ExtractedEntities = {};

  // 1. Số điện thoại (VN: 10 chữ số bắt đầu bằng 03, 05, 07, 08, 09)
  const phoneMatch = text.match(/(?:(?:\+84)|0)(?:3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}\b/);
  if (phoneMatch) {
    entities.phone = phoneMatch[0];
  }

  // 2. Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    entities.email = emailMatch[0];
  }

  // 3. Mã đơn hàng (e.g. DHT-9942, DHT-101, DH1234, #101)
  const orderMatch = text.match(/\b(?:DHT-?\d+|DH\d+|#\d{3,8})\b/i);
  if (orderMatch) {
    entities.orderCode = orderMatch[0].toUpperCase();
  }

  // 4. Gói cước (Starter, Pro, Enterprise)
  const lower = text.toLowerCase();
  if (lower.includes('enterprise')) {
    entities.plan = 'Enterprise';
  } else if (lower.includes('pro')) {
    entities.plan = 'Pro';
  } else if (lower.includes('starter')) {
    entities.plan = 'Starter';
  }

  // 5. Kênh liên quan (Website, Facebook, Zalo)
  if (lower.includes('zalo') || lower.includes('zalo oa')) {
    entities.channel = 'zalo';
  } else if (lower.includes('facebook') || lower.includes('fanpage') || lower.includes('messenger')) {
    entities.channel = 'facebook';
  } else if (lower.includes('website') || lower.includes('web') || lower.includes('widget')) {
    entities.channel = 'website';
  }

  return entities;
}

/**
 * Nhận diện ý định người dùng (Intent Recognition) & trích xuất thực thể (Entity Extraction)
 */
export function recognizeIntentAndEntities(rawText: string): IntentRecognitionResult {
  const text = normalize(rawText);
  const entities = extractEntities(rawText);

  if (!text) {
    return {
      intent: 'unknown',
      confidence: 0,
      entities,
      needsHandoff: false
    };
  }

  // 1. Ý định chuyển nhân viên / Handoff
  if (
    /(gap nhan vien|gap chuyen vien|tu van vien|nguoi that|chuyen may|gap tu van|nhan vien cskh|nhan vien ho tro|tong dai vien|noi chuyen voi nguoi|tu van truc tiep)/.test(
      text
    )
  ) {
    return {
      intent: 'human_handoff',
      confidence: 0.98,
      entities,
      needsHandoff: true
    };
  }

  // 2. Ý định chào hỏi (Greeting)
  if (
    /^(chao|xin chao|hello|hi|hey|alo|good morning|hi bot|hello bot)(\s+|$)/.test(text) ||
    /(chao ban|chao ad|chao bot|xin chao)/.test(text)
  ) {
    return {
      intent: 'greeting',
      confidence: 0.96,
      entities,
      needsHandoff: false
    };
  }

  // 3. Ý định tra cứu đơn hàng (Order lookup)
  if (
    entities.orderCode ||
    /(tra cuu don|kiem tra don|tinh trang don|van chuyen|giao hang|ma don|don hang cua toi|don hang so)/.test(text)
  ) {
    return {
      intent: 'order_lookup',
      confidence: entities.orderCode ? 0.99 : 0.88,
      entities,
      needsHandoff: false
    };
  }

  // 4. Ý định hỏi giá / Gói cước (Pricing)
  if (
    /(bao gia|bang gia|gia ca|chi phi|gia bao nhieu|bao nhieu tien|goi dich vu|goi cuoc|mua ban quyen|gia starter|gia pro|gia enterprise)/.test(
      text
    )
  ) {
    return {
      intent: 'pricing',
      confidence: 0.95,
      entities,
      needsHandoff: false
    };
  }

  // 5. Ý định tích hợp kênh (Channel Integration)
  if (
    /(tich hop|ket noi|cai dat widget|nhung chat|ket noi facebook|ket noi fanpage|ket noi zalo|zalo oa|webhook|api mess|meta graph)/.test(
      text
    )
  ) {
    return {
      intent: 'channel_integration',
      confidence: 0.92,
      entities,
      needsHandoff: false
    };
  }

  // 6. Ý định hỗ trợ kỹ thuật (Technical Support)
  if (
    /(loi|khong nhan tin|mat ket noi|huong dan cai dat|cau hinh|khong hoat dong|chua tra loi|token het han)/.test(text)
  ) {
    return {
      intent: 'technical_support',
      confidence: 0.89,
      entities,
      needsHandoff: false
    };
  }

  // 7. Ý định khiếu nại (Complaint)
  if (
    /(khieu nai|phan nan|that vong|qua cham|qua te|doi tien|khong hai long|thai do)/.test(text)
  ) {
    return {
      intent: 'complaint',
      confidence: 0.91,
      entities,
      needsHandoff: true
    };
  }

  // 8. Ý định tìm hiểu sản phẩm / Tính năng (Product Inquiry)
  if (
    /(tinh nang|chuc nang|chatbot ai|rag|hoc tai lieu|ai assistant|tu dong hoa|dht chatai|phan mem|giai phap)/.test(text)
  ) {
    return {
      intent: 'product_inquiry',
      confidence: 0.85,
      entities,
      needsHandoff: false
    };
  }

  // Mặc định: Ý định ngoài kịch bản dựng sẵn -> AI LLM sẽ xử lý
  return {
    intent: 'unknown',
    confidence: 0.5,
    entities,
    needsHandoff: false
  };
}
