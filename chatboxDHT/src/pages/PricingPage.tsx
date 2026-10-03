import React, { useState } from 'react';
import { 
  Sparkles, 
  Crown, 
  CheckCircle2, 
  QrCode, 
  ArrowLeft, 
  X, 
  Globe, 
  MessageCircle, 
  Layers, 
  Copy, 
  Check, 
  ShieldCheck, 
  Zap, 
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';

interface PlanDetail {
  id: string;
  name: string;
  channel: 'all' | 'web' | 'facebook' | 'zalo';
  channelLabel: string;
  price: string;
  numericPrice: number;
  period: string;
  description: string;
  badge?: string;
  popular?: boolean;
  color: string;
  btnColor: string;
  features: string[];
  techSpecs: {
    messageQuota: string;
    botResponseTime: string;
    ragDocs: string;
    channelsIncluded: string;
    supportLevel: string;
  };
}

const ALL_PLANS: PlanDetail[] = [
  // --- TAB 1: ĐA KÊNH TỔNG HỢP ---
  {
    id: 'omni_starter',
    name: 'Gói Starter Đa Kênh',
    channel: 'all',
    channelLabel: 'Đa Kênh Cơ Bản',
    price: '490.000 ₫',
    numericPrice: 490000,
    period: '/tháng',
    description: 'Dành cho shop nhỏ & cá nhân bắt đầu tự động hóa CSKH trên Web và Fanpage.',
    badge: 'Tiết kiệm',
    color: 'border-slate-200 dark:border-slate-800',
    btnColor: 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600',
    features: [
      '500 tin nhắn AI / tháng',
      'Tích hợp 1 Website + 1 Facebook Fanpage',
      'Huấn luyện 5 tài liệu RAG (PDF/DOCX)',
      'Kịch bản trả lời chào mừng & FAQ',
      'Hỗ trợ kỹ thuật qua Chat'
    ],
    techSpecs: {
      messageQuota: '500 tin nhắn AI / tháng',
      botResponseTime: '~ 2.5 giây',
      ragDocs: '5 tài liệu dung lượng tối đa 10MB',
      channelsIncluded: 'Website Widget + FB Messenger',
      supportLevel: 'Hỗ trợ giờ hành chính'
    }
  },
  {
    id: 'omni_pro',
    name: 'Gói Pro Đa Kênh',
    channel: 'all',
    channelLabel: 'Toàn Diện Đa Kênh',
    price: '1.490.000 ₫',
    numericPrice: 1490000,
    period: '/tháng',
    description: 'Giải pháp hoàn hảo đồng bộ Website, Facebook Messenger và Zalo OA trong 1 nền tảng.',
    badge: 'Phổ biến nhất',
    popular: true,
    color: 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10',
    btnColor: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
    features: [
      '2.500 tin nhắn AI / tháng',
      'Tích hợp đầy đủ Website + FB + Zalo OA',
      'Huấn luyện tài liệu AI không giới hạn',
      'Tư vấn viên CSKH tiếp quản thông minh',
      'Báo cáo thống kê Analytics chi tiết',
      'Hỗ trợ ưu tiên 24/7'
    ],
    techSpecs: {
      messageQuota: '2.500 tin nhắn AI / tháng (Nâng cấp thêm linh hoạt)',
      botResponseTime: '~ 1.8 giây (Ưu tiên GPU)',
ragDocs: 'Không giới hạn tài liệu huấn luyện',
      channelsIncluded: 'Website + Fanpage FB + Zalo Official Account',
      supportLevel: 'Hỗ trợ 24/7 & Kỹ thuật viên riêng'
    }
  },
  {
    id: 'omni_enterprise',
    name: 'Gói Enterprise Đa Kênh',
    channel: 'all',
    channelLabel: 'Doanh Nghiệp Lớn',
    price: '3.990.000 ₫',
    numericPrice: 3990000,
    period: '/tháng',
    description: 'Dành cho chuỗi cửa hàng, tập đoàn & thương hiệu cần tích hợp chuyên sâu và SLA cao.',
    badge: 'Doanh nghiệp',
    color: 'border-purple-500/60 shadow-purple-500/10',
    btnColor: 'bg-purple-600 hover:bg-purple-700',
    features: [
      'Không giới hạn tin nhắn AI',
      'Tích hợp CRM, ERP & Webhook tùy biến',
      'Quản lý không giới hạn Fanpage & Zalo OA',
      'Dedicated Account Manager riêng',
      'Cam kết SLA 99.9% Uptime hệ thống',
      'Hỗ trợ Fine-tune Model AI theo dữ liệu riêng'
    ],
    techSpecs: {
      messageQuota: 'Không giới hạn (Theo chính sách công bằng)',
      botResponseTime: '< 1.2 giây (Máy chủ riêng Dedicated)',
      ragDocs: 'Huấn luyện toàn diện đa nguồn dữ liệu',
      channelsIncluded: 'Tất cả các kênh & Webhook API tùy chỉnh',
      supportLevel: 'Dedicated Manager & Kỹ sư triển khai 1-1'
    }
  },

  // --- TAB 2: WEBSITE WIDGET ---
  {
    id: 'web_starter',
    name: 'Gói Web Mini AI',
    channel: 'web',
    channelLabel: 'Website Widget',
    price: '290.000 ₫',
    numericPrice: 290000,
    period: '/tháng',
    description: 'Tối ưu cho trang web cá nhân, landing page giới thiệu khóa học, dịch vụ.',
    badge: 'Web Nhẹ',
    color: 'border-slate-200 dark:border-slate-800',
    btnColor: 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600',
    features: [
      '400 tin nhắn AI / tháng',
      'Giao diện Widget nhúng 1 dòng mã (Script)',
      'Tùy chỉnh màu sắc phù hợp thương hiệu',
      'Lưu trữ lịch sử chat 30 ngày',
      'Hỗ trợ kích hoạt trong 5 phút'
    ],
    techSpecs: {
      messageQuota: '400 tin nhắn AI / tháng',
      botResponseTime: '~ 2.5 giây',
      ragDocs: '3 file tài liệu cơ bản',
      channelsIncluded: '1 Tên miền Website duy nhất',
      supportLevel: 'Hỗ trợ trực tuyến giờ làm việc'
    }
  },
  {
    id: 'web_pro',
    name: 'Gói Web Pro RAG',
    channel: 'web',
    channelLabel: 'Website Nâng Cao',
    price: '690.000 ₫',
    numericPrice: 690000,
    period: '/tháng',
    description: 'Chuyên biệt cho website thương mại điện tử & công ty cần AI hiểu sâu sản phẩm.',
    badge: 'Bán chạy',
    popular: true,
    color: 'border-indigo-500 ring-2 ring-indigo-500/20',
    btnColor: 'bg-indigo-600 hover:bg-indigo-700',
    features: [
      '1.500 tin nhắn AI / tháng',
      'Huấn luyện tài liệu thông minh RAG không giới hạn',
      'Gợi ý sản phẩm kèm hình ảnh & giá bán trực quan',
'Xóa bỏ hoàn toàn logo DHT (White-label)',
      'Chuyển tiếp CSKH khi gặp câu hỏi phức tạp'
    ],
    techSpecs: {
      messageQuota: '1.500 tin nhắn AI / tháng',
      botResponseTime: '~ 1.8 giây',
      ragDocs: 'Không giới hạn tài liệu tải lên',
      channelsIncluded: 'Tối đa 3 Tên miền Website',
      supportLevel: 'Hỗ trợ 24/7'
    }
  },
  {
    id: 'web_business',
    name: 'Gói Web Business Max',
    channel: 'web',
    channelLabel: 'E-commerce Lớn',
    price: '1.290.000 ₫',
    numericPrice: 1290000,
    period: '/tháng',
    description: 'Dành cho sàn giao dịch, website có lượng truy cập lớn cần tự động tư vấn liên tục.',
    badge: 'Tải lớn',
    color: 'border-purple-500/50',
    btnColor: 'bg-purple-600 hover:bg-purple-700',
    features: [
      '4.000 tin nhắn AI / tháng',
      'Phân quyền quản trị nhiều nhân viên CSKH',
      'Tích hợp tra cứu đơn hàng qua mã vận đơn',
      'Webhooks đồng bộ Lead về CRM',
      'Báo cáo tỷ lệ chuyển đổi khách hàng'
    ],
    techSpecs: {
      messageQuota: '4.000 tin nhắn AI / tháng',
      botResponseTime: '< 1.5 giây',
      ragDocs: 'Huấn luyện không giới hạn',
      channelsIncluded: 'Không giới hạn Subdomain & Domain',
      supportLevel: 'Hỗ trợ ưu tiên cao nhất'
    }
  },

  // --- TAB 3: FACEBOOK MESSENGER ---
  {
    id: 'fb_starter',
    name: 'Gói Fanpage Basic',
    channel: 'facebook',
    channelLabel: 'Facebook Fanpage',
    price: '390.000 ₫',
    numericPrice: 390000,
    period: '/tháng',
    description: 'Tự động phản hồi tin nhắn khách hàng trên Fanpage và tự ẩn bình luận.',
    badge: 'Cơ bản',
    color: 'border-slate-200 dark:border-slate-800',
    btnColor: 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600',
    features: [
      '600 tin nhắn AI / tháng',
      'Kết nối 1 Facebook Fanpage',
      'Tự động trả lời tin nhắn hộp thư Messenger',
      'Kịch bản chào mừng và lấy số điện thoại khách',
      'Báo thông báo khi có khách cần tư vấn'
    ],
    techSpecs: {
      messageQuota: '600 tin nhắn AI / tháng',
      botResponseTime: '~ 2.5 giây',
      ragDocs: '5 file tài liệu mẫu',
      channelsIncluded: '1 Fanpage Facebook',
      supportLevel: 'Hỗ trợ cài đặt webhook Fanpage'
    }
  },
  {
    id: 'fb_growth',
    name: 'Gói Fanpage Growth Pro',
    channel: 'facebook',
    channelLabel: 'Facebook Bán Hàng',
    price: '890.000 ₫',
    numericPrice: 890000,
    period: '/tháng',
    description: 'Chuyên gia tăng tỷ lệ chốt đơn, tự động trả lời comment & inbox đồng bộ.',
    badge: 'Chốt đơn đỉnh',
    popular: true,
    color: 'border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/10',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
    features: [
      '2.000 tin nhắn AI / tháng',
      'Kết nối tối đa 3 Fanpage cùng lúc',
      'Tự động gửi tin nhắn khi khách comment bài viết',
'Ẩn bình luận chứa số điện thoại chống cướp khách',
      'Gắn thẻ Tag phân loại khách mua hàng',
      'Báo cáo doanh số và lead hàng ngày'
    ],
    techSpecs: {
      messageQuota: '2.000 tin nhắn AI / tháng',
      botResponseTime: '~ 1.8 giây',
      ragDocs: 'Không giới hạn tài liệu kịch bản bán hàng',
      channelsIncluded: 'Tối đa 3 Fanpage',
      supportLevel: 'Hỗ trợ kỹ thuật 24/7'
    }
  },
  {
    id: 'fb_multipage',
    name: 'Gói Multi-Fanpage Enterprise',
    channel: 'facebook',
    channelLabel: 'Chuỗi Fanpage',
    price: '1.690.000 ₫',
    numericPrice: 1690000,
    period: '/tháng',
    description: 'Quản trị chuỗi nhiều chi nhánh Fanpage Facebook trên cùng 1 bảng điều khiển.',
    badge: 'Chuỗi Page',
    color: 'border-indigo-500/50',
    btnColor: 'bg-indigo-600 hover:bg-indigo-700',
    features: [
      '5.000 tin nhắn AI / tháng',
      'Kết nối lên tới 10 Fanpage Facebook',
      'Chia hội thoại thông minh cho từng nhân viên',
      'Đồng bộ tin nhắn về trang quản trị tập trung',
      'Tích hợp Facebook Pixel & Conversion API'
    ],
    techSpecs: {
      messageQuota: '5.000 tin nhắn AI / tháng',
      botResponseTime: '< 1.5 giây',
      ragDocs: 'Không giới hạn',
      channelsIncluded: '10 Fanpage Facebook',
      supportLevel: 'Kỹ sư hỗ trợ kết nối trực tiếp'
    }
  },

  // --- TAB 4: ZALO OA ---
  {
    id: 'zalo_basic',
    name: 'Gói Zalo OA Basic',
    channel: 'zalo',
    channelLabel: 'Zalo Official Account',
    price: '490.000 ₫',
    numericPrice: 490000,
    period: '/tháng',
    description: 'Chăm sóc khách hàng tự động trên Zalo OA Doanh Nghiệp uy tín.',
    badge: 'Zalo Start',
    color: 'border-slate-200 dark:border-slate-800',
    btnColor: 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600',
    features: [
      '600 tin nhắn AI / tháng',
      'Kết nối 1 tài khoản Zalo OA Doanh Nghiệp',
      'Trả lời tự động 24/7 theo tri thức AI',
      'Menu tương tác Zalo OA linh hoạt',
      'Thông báo tin nhắn mới tức thời'
    ],
    techSpecs: {
      messageQuota: '600 tin nhắn AI / tháng',
      botResponseTime: '~ 2.5 giây',
      ragDocs: '5 file tài liệu',
      channelsIncluded: '1 Zalo Official Account',
      supportLevel: 'Hỗ trợ xác thực Zalo OA'
    }
  },
  {
    id: 'zalo_pro',
    name: 'Gói Zalo OA Chuyên Nghiệp',
    channel: 'zalo',
    channelLabel: 'Zalo Doanh Nghiệp',
    price: '990.000 ₫',
    numericPrice: 990000,
    period: '/tháng',
    description: 'Tận dụng toàn bộ sức mạnh của Zalo OA để giữ chân và chăm sóc khách hàng thân thiết.',
    badge: 'Khuyên dùng',
    popular: true,
    color: 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-cyan-500/10',
    btnColor: 'bg-cyan-600 hover:bg-cyan-700',
    features: [
      '2.200 tin nhắn AI / tháng',
      'Tích hợp ZNS (Zalo Notification Service)',
'Phân loại và gán nhãn khách hàng theo mức độ quan tâm',
      'Huấn luyện tài liệu giá & khuyến mãi không giới hạn',
      'Chuyển tiếp cuộc gọi và tư vấn viên Zalo mượt mà'
    ],
    techSpecs: {
      messageQuota: '2.200 tin nhắn AI / tháng',
      botResponseTime: '~ 1.8 giây',
      ragDocs: 'Không giới hạn tài liệu',
      channelsIncluded: '1 Zalo OA Doanh Nghiệp Verified',
      supportLevel: 'Hỗ trợ 24/7'
    }
  },
  {
    id: 'zalo_enterprise',
    name: 'Gói Zalo Ecosystem Enterprise',
    channel: 'zalo',
    channelLabel: 'Hệ Sinh Thái Zalo',
    price: '2.190.000 ₫',
    numericPrice: 2190000,
    period: '/tháng',
    description: 'Dành cho các doanh nghiệp xây dựng Zalo Mini App và chiến dịch CSKH quy mô lớn.',
    badge: 'Tập đoàn',
    color: 'border-purple-500/50',
    btnColor: 'bg-purple-600 hover:bg-purple-700',
    features: [
      '6.000 tin nhắn AI / tháng',
      'Tích hợp sâu Zalo Mini App & Webhook',
      'Đồng bộ hệ thống dữ liệu khách hàng CRM',
      'Chiến dịch gửi tin nhắn CSKH định kỳ tự động',
      'Dedicated Account Manager hỗ trợ riêng'
    ],
    techSpecs: {
      messageQuota: '6.000 tin nhắn AI / tháng',
      botResponseTime: '< 1.3 giây',
      ragDocs: 'Không giới hạn',
      channelsIncluded: 'Hệ thống Zalo OA & Mini App',
      supportLevel: 'Đội ngũ chuyên gia kỹ thuật Zalo 1-1'
    }
  }
];

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'web' | 'facebook' | 'zalo'>('all');
  const [selectedPlan, setSelectedPlan] = useState<PlanDetail | null>(null);

  // States hỗ trợ copy
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [confirmedPayment, setConfirmedPayment] = useState(false);

  // Lọc các gói theo tab
  const displayedPlans = ALL_PLANS.filter((plan) => plan.channel === activeTab);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleConsult = async (planName: string) => {
    if (currentUser?.id) {
      const convId = `conv_user_${currentUser.id}`;
      await apiService.sendConversationMessage(
        convId,
        `Chào bạn! Tôi muốn đăng ký tư vấn chi tiết hơn về [${planName}]. Vui lòng gửi cho tôi thông tin ưu đãi và hướng dẫn triển khai!`,
        'user'
      );
    }
    navigate('/portal');
  };

  const handleConfirmTransfer = async () => {
    if (!selectedPlan) return;
    setConfirmedPayment(true);
    if (currentUser?.id) {
      const convId = `conv_user_${currentUser.id}`;
      await apiService.sendConversationMessage(
        convId,
`[XÁC NHẬN THANH TOÁN] Tôi đã thực hiện chuyển khoản thành công cho gói [${selectedPlan.name}] (${selectedPlan.price}). Vui lòng kiểm tra và kích hoạt tài khoản giúp tôi!`,
        'user'
      );
    }
    setTimeout(() => {
      setSelectedPlan(null);
      setConfirmedPayment(false);
      navigate('/portal');
    }, 1200);
  };

  return (
    <div className="pricing-page page-enter min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Header */}
      <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40" data-reveal>
        <button
          onClick={() => navigate(currentUser?.role === 'user' ? '/portal' : '/dashboard/inbox')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer text-slate-700 dark:text-slate-200 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay Lại {currentUser?.role === 'user' ? 'User Portal' : 'Dashboard'}</span>
        </button>

        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
          <h1 className="font-extrabold text-sm sm:text-base">Bảng Giá Dịch Vụ DHT ChatAI</h1>
        </div>

        <button
          onClick={() => navigate('/profile')}
          className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 cursor-pointer"
        >
          <span>Hồ Sơ Của Bạn</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8" data-reveal>
        {/* Banner Giới Thiệu */}
        <div className="text-center max-w-3xl mx-auto space-y-3" data-reveal>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Nâng Cấp Trợ Lý AI Chăm Sóc Khách Hàng 24/7</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Lựa Chọn Gói Dịch Vụ Phù Hợp Kênh Của Bạn
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Tối ưu chi phí và gia tăng chuyển đổi kinh doanh. Hỗ trợ kích hoạt tức thì trên Website Widget, Fanpage Facebook và Zalo Doanh Nghiệp.
          </p>
        </div>
{/* CÁC TABS KÊNH DỊCH VỤ (WEB / FACEBOOK / ZALO / TẤT CẢ ĐA KÊNH) */}
        <div className="flex justify-center">
          <div className="p-1.5 bg-slate-200/80 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 rounded-2xl flex flex-wrap items-center gap-1 shadow-inner max-w-2xl w-full">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Đa Kênh (All-in-One)</span>
            </button>

            <button
              onClick={() => setActiveTab('web')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'web'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>Website Widget</span>
            </button>

            <button
              onClick={() => setActiveTab('facebook')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'facebook'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
              <span>Facebook Fanpage</span>
            </button>

            <button
              onClick={() => setActiveTab('zalo')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'zalo'
                  ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-500" />
              <span>Zalo OA</span>
            </button>
          </div>
        </div>

        {/* DANH SÁCH CÁC GÓI (GRID 3 CỘT) */}
<div className="reveal-group grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {displayedPlans.map((plan) => (
            <div
              key={plan.id}
              className={`motion-card p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border ${plan.color} shadow-xl flex flex-col justify-between relative hover:scale-[1.01] transition-all duration-300`}
              data-reveal
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                  {plan.badge}
                </span>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {plan.channelLabel}
                  </span>
                  {!plan.popular && plan.badge && (
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-xl text-slate-900 dark:text-slate-100">{plan.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[36px]">
                  {plan.description}
                </p>

                <div className="pt-2">
                  <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{plan.period}</span>
                </div>

                {/* Danh sách tính năng */}
                <ul className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nút hành động Mua & Tư Vấn */}
              <div className="mt-8 space-y-2 pt-2">
                <button
                  onClick={() => { void handleConsult(plan.name); }}
                  className={`w-full py-3 rounded-2xl text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-95 ${plan.btnColor}`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Gửi yêu cầu tư vấn gói</span>
</button>

                <button
                  onClick={() => handleConsult(plan.name)}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Nhắn Tin CSKH Tư Vấn Thêm</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cam kết dịch vụ */}
        <div className="p-6 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">Kích Hoạt Sau Đối Soát</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Dung lượng chỉ được cấp sau khi thanh toán được xác nhận.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">Cam Kết SLA 99.9%</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Hạ tầng đám mây tốc độ cao, đảm bảo không bỏ lỡ tin nhắn khách.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">Hỗ Trợ Kỹ Thuật 24/7</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Kỹ sư đồng hành hỗ trợ cấu hình bot và tích hợp miễn phí.</p>
            </div>
          </div>
        </div>
      </main>

      {/* ==================================================== */}
      {/* MODAL CHI TIẾT GÓI + MÃ QR CHUYỂN KHOẢN VIETQR      */}
      {/* ==================================================== */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
<div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative space-y-6 my-8">
            
            {/* Nút Đóng Modal */}
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Modal */}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold uppercase">
                  {selectedPlan.channelLabel}
                </span>
                <span className="text-xs text-slate-400">Mã gói: <strong className="font-mono text-slate-600 dark:text-slate-300">{selectedPlan.id}</strong></span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {selectedPlan.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedPlan.description}
              </p>
            </div>

            {/* Nội dung 2 cột: Cột Trái Chi tiết thông số - Cột Phải Quét mã QR */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* CỘT TRÁI: CHI TIẾT THÔNG SỐ KỸ THUẬT */}
              <div className="md:col-span-6 space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-xs">
                <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Thông Số Dịch Vụ</span>
                </h4>

                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Dung lượng tin nhắn:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPlan.techSpecs.messageQuota}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Tốc độ phản hồi:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{selectedPlan.techSpecs.botResponseTime}</span>
                  </div>
<div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Tài liệu RAG FAQ:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPlan.techSpecs.ragDocs}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Kênh áp dụng:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedPlan.techSpecs.channelsIncluded}</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 dark:text-slate-400">Hỗ trợ kỹ thuật:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedPlan.techSpecs.supportLevel}</span>
                  </div>
                </div>

                <div className="pt-2 text-center bg-indigo-50 dark:bg-indigo-950/60 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Tổng thanh toán (1 tháng):</div>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{selectedPlan.price}</div>
                </div>
              </div>

              {/* CỘT PHẢI: MÃ QR VIETQR VÀ THÔNG TIN TÀI KHOẢN */}
              <div className="md:col-span-6 space-y-3 flex flex-col items-center">
                {/* Khung chứa mã QR VietQR */}
                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border-2 border-indigo-500/30 shadow-lg flex flex-col items-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&da…}|DHT%20${selectedPlan.id.toUpperCase()}%20${currentUser?.id ? currentUser.id.slice(-6) : 'USER'}|transfer_p2p`}
                    alt="VietQR Chuyển Khoản"
                    className="w-40 h-40 object-contain rounded-xl"
                  />
                  <span className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                    <QrCode className="w-3 h-3 text-indigo-500" />
                    <span>Quét qua App ngân hàng bất kỳ</span>
                  </span>
                </div>

                {/* Thông tin chuyển khoản 1-Click Copy */}
                <div className="w-full space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400">Số tài khoản (MBBank):</span>
<p className="font-mono font-bold text-slate-800 dark:text-slate-200">0988888888</p>
                    </div>
                    <button
                      onClick={() => handleCopy('0988888888', 'stk')}
                      className="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-slate-100 rounded-lg text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 border border-slate-200 dark:border-slate-600 cursor-pointer"
                    >
                      {copiedField === 'stk' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'stk' ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400">Nội dung chuyển khoản:</span>
                      <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">
                        DHT {selectedPlan.id.toUpperCase()} {currentUser?.id ? currentUser.id.slice(-6) : 'USER'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(`DHT ${selectedPlan.id.toUpperCase()} ${currentUser?.id ? currentUser.id.slice(-6) : 'USER'}`, 'nd')}
                      className="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-slate-100 rounded-lg text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 border border-slate-200 dark:border-slate-600 cursor-pointer"
                    >
                      {copiedField === 'nd' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'nd' ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Nút Hoàn tất */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleConfirmTransfer}
                disabled={confirmedPayment}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/25 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{confirmedPayment ? 'Đang gửi thông báo đến CSKH...' : 'Tôi Đã Chuyển Khoản ➔ Báo CSKH Kích Hoạt'}</span>
              </button>

              <button
                onClick={() => {
                  setSelectedPlan(null);
void handleConsult(selectedPlan.name);
                }}
                className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all cursor-pointer"
              >
                Cần Tư Vấn Thêm
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;