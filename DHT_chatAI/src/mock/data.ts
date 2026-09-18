import { 
  Conversation, 
  CannedResponse, 
  FAQItem, 
  KnowledgeDocument, 
  UserProfile,
  BotNode
} from '../types';

export const currentUser: UserProfile = {
  id: 'usr_001',
  name: 'Đinh Văn Hiếu',
  email: 'hieu.dinh@chatai.vn',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'admin',
  companyName: 'DHT AI Solution Corp',
  plan: 'Enterprise'
};

export const cannedResponses: CannedResponse[] = [
  {
    id: 'cr_1',
    shortcut: '/chao',
    title: 'Chào mừng khách hàng',
    content: 'Dạ xin chào Anh/Chị! Em là chuyên viên hỗ trợ của DHT AI. Em có thể hỗ trợ thông tin gì cho mình hôm nay ạ?',
    category: 'chao_hoi'
  },
  {
    id: 'cr_2',
    shortcut: '/baogia',
    title: 'Báo giá dịch vụ Chatbot AI',
    content: 'Dạ hiện tại DHT AI đang có 3 gói ưu đãi: Gói Starter (499k/tháng), Gói Pro (1.490k/tháng tích hợp Fanpage + Zalo OA) và Gói Enterprise (theo quy mô). Em xin phép gửi bảng so sánh chi tiết ngay cho mình nhé ạ!',
    category: 'bao_gia'
  },
  {
    id: 'cr_3',
    shortcut: '/zalo',
    title: 'Hướng dẫn kết nối Zalo OA',
    content: 'Để liên kết Zalo OA, Anh/Chị chỉ cần vào mục Cài đặt Kênh -> Chọn Zalo OA -> Đăng nhập tài khoản Quản trị viên và xác nhận cấp quyền Webhook là hệ thống tự động đồng bộ ngay ạ.',
    category: 'ho_tro'
  },
  {
    id: 'cr_4',
    shortcut: '/baohanh',
    title: 'Chính sách SLA & Hỗ trợ 24/7',
    content: 'DHT AI cam kết thời gian uptime hệ thống 99.9%, dữ liệu sao lưu hàng ngày và đội ngũ kỹ thuật trực hỗ trợ 24/7 qua Hotline kỹ thuật và nhóm Zalo riêng ạ.',
    category: 'chinh_sach'
  }
];

export const initialConversations: Conversation[] = [
  {
    id: 'conv_01',
    channel: 'website',
    status: 'pending',
    priority: 'high',
    isBotHandling: true,
    unreadCount: 2,
    customer: {
      id: 'cust_01',
      name: 'Nguyễn Thanh Tùng',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '0988 123 456',
      email: 'thanhtung.it@gmail.com',
      address: 'Cầu Giấy, Hà Nội',
      tags: ['Khách VIP', 'Quan tâm gói Pro', 'DN Bán lẻ'],
      notes: ['Khách cần tích hợp cả Zalo OA và Fanpage bán giày dép', 'Đang yêu cầu demo trực tiếp kịch bản tạo đơn tự động'],
      totalSpent: '12.500.000 ₫',
      channel: 'website',
      lastActive: 'Vừa xong',
      orders: [
        {
          id: 'ord_101',
          orderCode: 'DHT-9942',
          date: '10/09/2026',
          total: '4.500.000 ₫',
          status: 'completed',
          itemsSummary: 'Bản quyền AI Chatbot Pro (3 tháng)'
        }
      ],
      history: [
        { channel: 'website', timestamp: '14:20 Hôm nay', summary: 'Hỏi tính năng tự chốt đơn qua Zalo' },
        { channel: 'facebook', timestamp: '09:15 Hôm qua', summary: 'Nhắn hỏi bảng giá gói Pro' }
      ]
    },
    lastMessage: {
      id: 'msg_01_last',
      conversationId: 'conv_01',
      sender: 'user',
      content: 'Chào bot, cho mình hỏi bên bạn có hỗ trợ kết nối Zalo OA xác thực doanh nghiệp không?',
      timestamp: '14:28',
      status: 'seen'
    },
    createdAt: '2026-09-17 14:15',
    updatedAt: '2026-09-17 14:28'
  },
  {
    id: 'conv_02',
    channel: 'facebook',
    status: 'assigned',
    priority: 'medium',
    isBotHandling: false,
    unreadCount: 0,
    assignedAgent: {
      id: 'usr_001',
      name: 'Đinh Văn Hiếu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    customer: {
      id: 'cust_02',
      name: 'Trần Thị Mai Phương',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      phone: '0912 888 999',
      email: 'maiphuong.tran@fashion.vn',
      address: 'Quận 1, TP. Hồ Chí Minh',
      tags: ['Chuỗi thời trang', 'Cần tư vấn ngay'],
      notes: ['Đã bàn giao cho tư vấn viên Hiếu hỗ trợ test tích hợp catalog'],
      totalSpent: '28.000.000 ₫',
      channel: 'facebook',
      lastActive: '5 phút trước',
      orders: [
        {
          id: 'ord_102',
          orderCode: 'DHT-8812',
          date: '02/08/2026',
          total: '15.000.000 ₫',
          status: 'completed',
          itemsSummary: 'Setup trọn gói AI Omnichannel 1 năm'
        }
      ],
      history: [
        { channel: 'facebook', timestamp: '14:10 Hôm nay', summary: 'Yêu cầu nhân viên hỗ trợ cài đặt webhook' },
        { channel: 'zalo', timestamp: '04/09/2026', summary: 'Tư vấn catalog sản phẩm đa kênh' }
      ]
    },
    lastMessage: {
      id: 'msg_02_last',
      conversationId: 'conv_02',
      sender: 'agent',
      senderName: 'Đinh Văn Hiếu',
      content: 'Dạ em Hiếu đã kiểm tra webhook cho Fanpage của Chị rồi ạ, tin nhắn đang đổ về rất mượt!',
      timestamp: '14:22',
      status: 'seen'
    },
    createdAt: '2026-09-17 13:40',
    updatedAt: '2026-09-17 14:22'
  },
  {
    id: 'conv_03',
    channel: 'zalo',
    status: 'bot_active',
    priority: 'low',
    isBotHandling: true,
    unreadCount: 0,
    customer: {
      id: 'cust_03',
      name: 'Lê Hoàng Long',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      phone: '0977 333 444',
      email: 'long.le@techvina.com',
      address: 'Thanh Khê, Đà Nẵng',
      tags: ['Khách mới', 'Zalo OA'],
      notes: ['Bot đang tự động tư vấn kho tài liệu FAQ'],
      totalSpent: '0 ₫',
      channel: 'zalo',
      lastActive: '12 phút trước',
      orders: [],
      history: [
        { channel: 'zalo', timestamp: '14:05 Hôm nay', summary: 'Quan tâm tài liệu API Webhook' }
      ]
    },
    lastMessage: {
      id: 'msg_03_last',
      conversationId: 'conv_03',
      sender: 'bot',
      content: 'Bot AI DHT đã gửi tài liệu hướng dẫn cấu hình API Zalo OA vào hộp thư của bạn rồi ạ.',
      timestamp: '14:16',
      status: 'delivered'
    },
    createdAt: '2026-09-17 14:05',
    updatedAt: '2026-09-17 14:16'
  },
  {
    id: 'conv_04',
    channel: 'website',
    status: 'resolved',
    priority: 'medium',
    isBotHandling: false,
    unreadCount: 0,
    rating: {
      score: 5,
      feedback: 'Tốc độ phản hồi cực nhanh, bot trả lời thông minh như người thật!',
      createdAt: '13:50'
    },
    customer: {
      id: 'cust_04',
      name: 'Phạm Hương Ly',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      phone: '0903 555 777',
      email: 'huongly@beautycare.vn',
      address: 'Hải Châu, Đà Nẵng',
      tags: ['Spa & Thẩm mỹ', 'Đã đánh giá 5 sao'],
      notes: ['Đã hoàn tất hỗ trợ tích hợp live widget lên website wordpress'],
      totalSpent: '8.900.000 ₫',
      channel: 'website',
      lastActive: '30 phút trước',
      orders: [],
      history: [
        { channel: 'website', timestamp: '13:30 Hôm nay', summary: 'Hỗ trợ mã nhúng Widget website' }
      ]
    },
    lastMessage: {
      id: 'msg_04_last',
      conversationId: 'conv_04',
      sender: 'user',
      content: 'Cảm ơn em nhiều nha, chị cài widget lên web được rồi, đẹp lắm!',
      timestamp: '13:48',
      status: 'seen'
    },
    createdAt: '2026-09-17 13:20',
    updatedAt: '2026-09-17 13:50'
  }
];

export const sampleMessages: Record<string, any[]> = {
  conv_01: [
    {
      id: 'm1_1',
      conversationId: 'conv_01',
      sender: 'bot',
      content: 'Xin chào Anh Nguyễn Thanh Tùng! DHT AI rất vui được hỗ trợ Anh. Anh đang tìm kiếm giải pháp Chatbot cho kênh nào ạ?',
      timestamp: '14:15',
      status: 'seen',
      quickReplies: [
        { id: 'qr_1', label: 'Tích hợp Website', payload: 'web' },
        { id: 'qr_2', label: 'Tích hợp FB Messenger', payload: 'fb' },
        { id: 'qr_3', label: 'Tích hợp Zalo OA', payload: 'zalo' },
        { id: 'qr_4', label: 'Gặp tư vấn viên', payload: 'human' }
      ]
    },
    {
      id: 'm1_2',
      conversationId: 'conv_01',
      sender: 'user',
      content: 'Mình đang muốn xem các gói giải pháp cho chuỗi cửa hàng bán lẻ.',
      timestamp: '14:18',
      status: 'seen'
    },
    {
      id: 'm1_3',
      conversationId: 'conv_01',
      sender: 'bot',
      content: 'Dạ, DHT AI cung cấp các gói giải pháp chuyên biệt tối ưu cho doanh nghiệp bán lẻ:',
      timestamp: '14:19',
      status: 'seen',
      cards: [
        {
          id: 'card_1',
          title: 'Gói AI Omnichannel Pro',
          price: '1.490.000 ₫/tháng',
          originalPrice: '2.000.000 ₫',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=80',
          description: 'Đồng bộ Website + Facebook + Zalo OA. Huấn luyện 50 tài liệu RAG AI, không giới hạn tin nhắn.'
        },
        {
          id: 'card_2',
          title: 'Gói Doanh Nghiệp Enterprise',
          price: '3.990.000 ₫/tháng',
          originalPrice: '5.000.000 ₫',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=80',
          description: 'Hạ tầng AI riêng biệt, tự động chốt đơn và tra cứu tồn kho qua API ERP/CRM, bảo hành 99.9%.'
        }
      ]
    },
    {
      id: 'm1_4',
      conversationId: 'conv_01',
      sender: 'user',
      content: 'Chào bot, cho mình hỏi bên bạn có hỗ trợ kết nối Zalo OA xác thực doanh nghiệp không?',
      timestamp: '14:28',
      status: 'seen'
    }
  ]
};

export const sampleFAQs: FAQItem[] = [
  {
    id: 'faq_1',
    question: 'Chatbot AI có hỗ trợ phân loại tin nhắn từ Zalo OA và Facebook Messenger không?',
    answer: 'Có! Hệ thống gộp toàn bộ tin nhắn từ Website, Facebook Fanpage và Zalo OA vào một màn hình Omnichannel duy nhất, tự động nhận diện nguồn kênh và gắn nhãn tương ứng.',
    category: 'Tính năng đa kênh',
    updatedAt: '15/09/2026'
  },
  {
    id: 'faq_2',
    question: 'Làm thế nào để huấn luyện Bot bằng tài liệu doanh nghiệp?',
    answer: 'Bạn chỉ cần tải lên file PDF, DOCX, TXT hoặc nhập đường link Website. Hệ thống tự động phân tách nội dung (chunking) và huấn luyện AI Vector Database trong vòng 30 giây.',
    category: 'Huấn luyện AI',
    updatedAt: '12/09/2026'
  },
  {
    id: 'faq_3',
    question: 'Nhân viên CSKH có thể can thiệp khi Bot đang nói chuyện với khách không?',
    answer: 'Hoàn toàn được! Nhân viên chỉ cần nhấn nút "1-Click Switch" để tiếp quản ngay lập tức. Bot sẽ tự động nhường quyền và theo dõi để học hỏi.',
    category: 'Live Agent',
    updatedAt: '10/09/2026'
  },
  {
    id: 'faq_4',
    question: 'Khách hàng có bị mất lịch sử chat khi tắt trình duyệt không?',
    answer: 'Không! Live Chat Widget lưu trữ bộ nhớ LocalStorage và Cookie trên thiết bị khách hàng, đảm bảo khi tải lại trang lịch sử vẫn được giữ nguyên vẹn.',
    category: 'Live Widget',
    updatedAt: '08/09/2026'
  }
];

export const sampleKnowledgeDocs: KnowledgeDocument[] = [
  {
    id: 'doc_1',
    name: 'Bao_Gia_Va_Quy_Che_Dich_Vu_2026.pdf',
    size: '2.4 MB',
    type: 'pdf',
    status: 'trained',
    trainedAt: '15/09/2026 09:30',
    chunksCount: 142
  },
  {
    id: 'doc_2',
    name: 'Chinh_Sach_Bao_Hanh_Va_Doi_Tra_Hang.docx',
    size: '1.1 MB',
    type: 'docx',
    status: 'trained',
    trainedAt: '14/09/2026 14:10',
    chunksCount: 68
  },
  {
    id: 'doc_3',
    name: 'https://dht-chatai.vn/huong-dan-tich-hop-api',
    size: '450 KB',
    type: 'url',
    status: 'trained',
    trainedAt: '16/09/2026 18:22',
    chunksCount: 95
  }
];

export const initialBotNodes: BotNode[] = [
  {
    id: 'node_1',
    type: 'trigger',
    title: 'Khách mở Chat Widget',
    content: 'Kích hoạt khi khách hàng truy cập website hoặc nhắn tin qua FB/Zalo',
    position: { x: 50, y: 120 }
  },
  {
    id: 'node_2',
    type: 'message',
    title: 'Gửi tin nhắn chào mừng & Menu',
    content: 'Chào mừng Anh/Chị đến với DHT AI! Mời chọn dịch vụ quan tâm.',
    position: { x: 380, y: 120 }
  },
  {
    id: 'node_3',
    type: 'condition',
    title: 'Phân nhánh nhu cầu',
    content: 'Kiểm tra từ khóa: "Báo giá", "Tư vấn kỹ thuật", "Khiếu nại"',
    position: { x: 720, y: 120 }
  },
  {
    id: 'node_4',
    type: 'agent_transfer',
    title: 'Chuyển Tư Vấn Viên (CSKH)',
    content: 'Tự động gán cho Agent đang rảnh và gửi thông báo khẩn',
    position: { x: 1040, y: 50 }
  },
  {
    id: 'node_5',
    type: 'card_carousel',
    title: 'Hiển thị Thẻ Báo Giá',
    content: 'Gửi Carousel gói Starter, Pro, Enterprise có nút đăng ký',
    position: { x: 1040, y: 220 }
  }
];

export const analyticsData = {
  kpis: {
    totalConversations: '3,842',
    activeSessions: '28',
    botResolutionRate: '84.6%',
    avgResponseTime: '8.4s',
    csatScore: '4.85 / 5.0'
  },
  channelBreakdown: [
    { name: 'Website Widget', count: 1840, percentage: 48, color: '#8b5cf6' },
    { name: 'Facebook Messenger', count: 1250, percentage: 32, color: '#3b82f6' },
    { name: 'Zalo Official Account', count: 752, percentage: 20, color: '#06b6d4' }
  ],
  dailyStats: [
    { day: 'Thứ 2', website: 240, facebook: 180, zalo: 95 },
    { day: 'Thứ 3', website: 290, facebook: 210, zalo: 120 },
    { day: 'Thứ 4', website: 320, facebook: 190, zalo: 110 },
    { day: 'Thứ 5', website: 350, facebook: 240, zalo: 145 },
    { day: 'Thứ 6', website: 410, facebook: 280, zalo: 160 },
    { day: 'Thứ 7', website: 280, facebook: 190, zalo: 115 },
    { day: 'Chủ Nhật', website: 210, facebook: 160, zalo: 85 }
  ],
  ratingBreakdown: [
    { stars: 5, count: 2180, percentage: 82 },
    { stars: 4, count: 380, percentage: 14 },
    { stars: 3, count: 60, percentage: 2.5 },
    { stars: 2, count: 25, percentage: 1 },
    { stars: 1, count: 12, percentage: 0.5 }
  ]
};
