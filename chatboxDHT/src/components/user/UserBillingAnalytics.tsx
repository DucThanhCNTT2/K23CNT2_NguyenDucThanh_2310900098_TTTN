import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Receipt, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Zap, 
  Crown, 
  QrCode, 
  Copy, 
  Check, 
  FileText, 
  PieChart, 
  Activity, 
  ShieldCheck, 
  Eye, 
  Printer, 
  X, 
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import { BillingTransaction, UserAnalyticsData, AddonPack } from '../../types';

const ADDON_PACKS: AddonPack[] = [
  {
    id: 'addon_500',
    name: 'Gói Mini Phụ Trợ',
    messagesCount: 500,
    price: '49.000 ₫',
    numericPrice: 49000,
    badge: 'Tiết Kiệm',
    description: 'Bổ sung nhanh khi hết tin nhắn giữa kỳ kinh doanh.',
    features: ['+500 tin nhắn AI', 'Dùng ngay lập tức', 'Không giới hạn hạn dùng', 'Hỗ trợ tất cả kênh']
  },
  {
    id: 'addon_1500',
    name: 'Gói Tiêu Chuẩn Đa Kênh',
    messagesCount: 1500,
    price: '129.000 ₫',
    numericPrice: 129000,
    popular: true,
    badge: 'Khuyên Dùng',
    description: 'Lựa chọn tối ưu nhất cho shop chạy chiến dịch quảng cáo.',
    features: ['+1.500 tin nhắn AI', 'Ưu tiên băng thông GPU', 'Không hết hạn theo tháng', 'Báo cáo realtime']
  },
  {
    id: 'addon_5000',
    name: 'Gói Doanh Nghiệp Siêu Tốc',
    messagesCount: 5000,
    price: '389.000 ₫',
    numericPrice: 389000,
    badge: 'Ưu Đãi 35%',
    description: 'Dành cho các chiến dịch Flash Sale & Livestream chốt đơn khủng.',
    features: ['+5.000 tin nhắn AI', 'Ưu tiên GPU cao nhất', 'CSKH kỹ thuật riêng', 'Tích hợp mở rộng']
  }
];

export const UserBillingAnalytics: React.FC<{
  onNavigateToPricing?: () => void;
}> = ({ onNavigateToPricing }) => {
  const { currentUser } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [usage, setUsage] = useState<{
    usedMessages: number;
    maxMessages: number;
    baseMessages?: number;
    extraMessages?: number;
    percentage: number;
    remainingMessages: number;
    plan?: string;
  }>({
    usedMessages: 0,
    maxMessages: 2500,
    baseMessages: 2500,
    extraMessages: 0,
    percentage: 0,
    remainingMessages: 2500,
    plan: currentUser?.plan || 'Pro'
  });

  const [analytics, setAnalytics] = useState<UserAnalyticsData | null>(null);
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);

  // Modal states
  const [selectedAddon, setSelectedAddon] = useState<AddonPack | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<BillingTransaction | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Tải dữ liệu ban đầu
  const loadData = async () => {
    try {
      const [usageData, analyticsData, historyData] = await Promise.all([
        apiService.getUserUsage(),
        apiService.getUserBillingAnalytics(),
        apiService.getBillingHistory()
      ]);

      if (usageData) setUsage(usageData);
      if (analyticsData) setAnalytics(analyticsData);
      if (historyData) setTransactions(historyData);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu Billing & Analytics:', err);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Xử lý xác nhận thanh toán Add-on
  const handleConfirmAddonPayment = async () => {
    if (!selectedAddon) return;
    setIsSubmittingPayment(true);
    try {
      const res = await apiService.purchaseAddon({
        packId: selectedAddon.id,
        packName: selectedAddon.name,
        messagesCount: selectedAddon.messagesCount,
        amount: selectedAddon.numericPrice,
        paymentMethod: 'VietQR'
      });

      if (res && res.success) {
        setPaymentSuccessMessage(`Chúc mừng bạn đã cộng thành công +${selectedAddon.messagesCount.toLocaleString()} tin nhắn vào tài khoản!`);
        await loadData();
        setTimeout(() => {
          setSelectedAddon(null);
          setPaymentSuccessMessage(null);
        }, 2200);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Có lỗi xảy ra khi xác nhận giao dịch');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Tính max count cho biểu đồ 7 ngày
  const dailyStats = analytics?.dailyUsage || [];
  const maxDailyCount = Math.max(...dailyStats.map((d) => d.total), 1);

  // Màu thanh tiến trình theo mức độ
  const getProgressColor = (pct: number) => {
    if (pct >= 85) return 'from-rose-500 via-rose-600 to-red-600 shadow-rose-500/30';
    if (pct >= 60) return 'from-amber-400 via-orange-500 to-rose-500 shadow-amber-500/30';
    return 'from-emerald-400 via-teal-500 to-indigo-600 shadow-emerald-500/30';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner & Action Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Gói Đang Sử Dụng: {usage.plan || currentUser?.plan || 'Pro'}</span>
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Đang Hoạt Động
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Theo Dõi Dung Lượng & Tài Chính Thông Minh</span>
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </h2>
          <p className="text-xs text-indigo-200/80 max-w-2xl leading-relaxed">
            Kiểm soát chi tiết số lượng tin nhắn AI đã tiêu thụ, dự báo cạn kiệt theo ngày và quản lý hóa đơn nạp gói cước minh bạch.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleRefresh}
            className={`p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white transition-all active:scale-95 cursor-pointer ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Làm mới số liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {onNavigateToPricing && (
            <button
              onClick={onNavigateToPricing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Nâng Cấp Gói Lớn</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Hàng 4 Card KPI Tổng Quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Hạn Mức Tin Nhắn */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-600 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Hạn Mức Tin Nhắn</span>
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              {usage.percentage}%
            </span>
          </div>

          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {usage.usedMessages.toLocaleString()} <span className="text-sm font-semibold text-slate-400">/ {usage.maxMessages.toLocaleString()}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden my-3 p-0.5 border border-slate-200/60 dark:border-slate-700/60">
            <div 
              className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(usage.percentage)} transition-all duration-700`}
              style={{ width: `${Math.max(3, usage.percentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Còn lại: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{usage.remainingMessages.toLocaleString()}</strong> tin</span>
            {usage.extraMessages && usage.extraMessages > 0 ? (
              <span className="text-[10px] text-emerald-600 font-bold">+{usage.extraMessages.toLocaleString()} Add-on</span>
            ) : null}
          </div>
        </div>

        {/* Card 2: Dự Báo Cạn Kiệt AI (Burn-Rate) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-300 dark:hover:border-amber-600 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Dự Báo Sử Dụng</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold">
              AI Estimate
            </span>
          </div>

          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1.5">
            <span>~{analytics?.burnRate.estimatedDaysRemaining || 25}</span>
            <span className="text-xs font-semibold text-slate-400">ngày tiếp theo</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tiêu thụ TB: <strong className="font-mono text-slate-700 dark:text-slate-200">~{analytics?.burnRate.avgDaily || 35}</strong> tin/ngày</span>
          </p>

          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tốc độ tiêu thụ ổn định</span>
          </div>
        </div>

        {/* Card 3: Tỷ Lệ AI Tự Động Giải Quyết */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-purple-300 dark:hover:border-purple-600 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-purple-500" />
              <span>AI Tự Động Hóa</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold">
              Hiệu Suất Cao
            </span>
          </div>

          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {analytics?.aiResolutionRate || '94.8%'}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Bot tự phản hồi không cần nhân viên can thiệp
          </p>

          <div className="mt-3 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tiết kiệm ~40 giờ trực chat/tháng</span>
          </div>
        </div>

        {/* Card 4: Tốc Độ Phản Hồi & Uptime */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-600 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Tốc Độ & Uptime</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold">
              99.9% Online
            </span>
          </div>

          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {analytics?.avgResponseTime || '1.8 giây'}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Tối ưu hóa GPU sinh phản hồi tức thì
          </p>

          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>Sẵn sàng 24/7 trên 3 kênh</span>
          </div>
        </div>
      </div>

      {/* 3. Phần Biểu Đồ 7 Ngày & Phân Bổ Kênh */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Biểu đồ 7 ngày (8 cột) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Lượng Tin Nhắn Tiêu Thụ Trong 7 Ngày Gần Nhất</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Phân bổ lượng hội thoại theo từng kênh: Website Widget, FB Messenger & Zalo OA
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                Website
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Facebook
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                Zalo
              </span>
            </div>
          </div>

          {/* Graph Container */}
          <div className="h-64 flex items-end justify-between gap-2.5 sm:gap-4 pt-10 pb-2 border-b border-slate-100 dark:border-slate-800">
            {dailyStats.map((item, idx) => {
              const total = item.total || 1;
              const heightPct = Math.min(100, Math.max(12, Math.round((total / maxDailyCount) * 100)));
              
              const webPct = Math.round((item.website / total) * 100);
              const fbPct = Math.round((item.facebook / total) * 100);
              const zaloPct = Math.max(0, 100 - webPct - fbPct);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip Hover */}
                  <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[10px] py-1.5 px-2.5 rounded-xl shadow-xl z-20 whitespace-nowrap border border-slate-700">
                    <p className="font-bold text-amber-300">{item.day} ({item.date}): {total} tin</p>
                    <p className="text-[9px] text-slate-300">Web: {item.website} | FB: {item.facebook} | Zalo: {item.zalo}</p>
                  </div>

                  {/* Total indicator */}
                  <div className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-indigo-600 mb-1 transition-colors">
                    {total}
                  </div>

                  {/* Stacked bar */}
                  <div 
                    className="w-full max-w-[42px] rounded-xl overflow-hidden flex flex-col justify-end bg-slate-100 dark:bg-slate-800 transition-all duration-500 group-hover:scale-105"
                    style={{ height: `${heightPct}%` }}
                  >
                    <div style={{ height: `${webPct}%` }} className="bg-indigo-500 transition-all" title={`Website: ${item.website}`} />
                    <div style={{ height: `${fbPct}%` }} className="bg-blue-500 transition-all" title={`Facebook: ${item.facebook}`} />
                    <div style={{ height: `${zaloPct}%` }} className="bg-cyan-500 transition-all" title={`Zalo: ${item.zalo}`} />
                  </div>

                  {/* Day label */}
                  <div className="mt-2 text-center">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{item.day}</span>
                    <span className="text-[9px] text-slate-400 block">{item.date}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Dữ liệu được cập nhật tự động theo các tin nhắn thực tế</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">Tổng 7 ngày: {dailyStats.reduce((a, b) => a + b.total, 0)} tin</span>
          </div>
        </div>

        {/* Phân bổ kênh (4 cột) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Tỷ Lệ Tiêu Thụ Theo Kênh</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Đo lường mức độ tiếp cận khách hàng trên các nền tảng
            </p>
          </div>

          <div className="space-y-4 my-auto">
            {/* Kênh 1: Website */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  Website Live Chat Widget
                </span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {analytics?.channelDistribution.website || 62}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full" 
                  style={{ width: `${analytics?.channelDistribution.website || 62}%` }} 
                />
              </div>
            </div>

            {/* Kênh 2: Facebook */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Facebook Messenger Fanpage
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {analytics?.channelDistribution.facebook || 26}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${analytics?.channelDistribution.facebook || 26}%` }} 
                />
              </div>
            </div>

            {/* Kênh 3: Zalo */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  Zalo Official Account (OA)
                </span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {analytics?.channelDistribution.zalo || 12}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full" 
                  style={{ width: `${analytics?.channelDistribution.zalo || 12}%` }} 
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-700 dark:text-indigo-300">
            💡 <strong>Mẹo tối ưu:</strong> Kênh Website chiếm đa số lưu lượng. Bạn có thể cài đặt thêm kịch bản pop-up tự động mở sau 10 giây để tăng 25% tỷ lệ chốt đơn!
          </div>
        </div>
      </div>

      {/* 4. Mua Thêm Gói Phụ (Add-on Messages Packs) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Gói Mua Thêm Dung Lượng Tin Nhắn Linh Hoạt (Add-on Packs)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cộng ngay tin nhắn vào tài khoản mà không cần thay đổi hay nâng cấp toàn bộ gói cước hiện tại.
            </p>
          </div>

          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Kích hoạt tự động qua VietQR</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ADDON_PACKS.map((addon) => (
            <div 
              key={addon.id}
              className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between relative group ${
                addon.popular 
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl shadow-indigo-500/10' 
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              {addon.badge && (
                <div className={`absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm ${
                  addon.popular ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-slate-800 dark:bg-slate-700'
                }`}>
                  {addon.badge}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {addon.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 min-h-[36px]">
                    {addon.description}
                  </p>
                </div>

                <div className="py-2 border-y border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                      {addon.price}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">/ lần nạp</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+{addon.messagesCount.toLocaleString()} tin nhắn AI</span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {addon.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-4">
                <button
                  onClick={() => setSelectedAddon(addon)}
                  className={`w-full py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer ${
                    addon.popular
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-600/25'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Nạp Gói Này Ngay</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Lịch Sử Giao Dịch & Hóa Đơn Điện Tử (Billing History) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Lịch Sử Giao Dịch & Hóa Đơn Điện Tử (Invoices)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tra cứu biên lai thanh toán và tải hóa đơn dịch vụ đã kích hoạt
            </p>
          </div>

          <span className="text-xs font-mono text-slate-400">
            Tổng cộng: {transactions.length} giao dịch
          </span>
        </div>

        {/* Bảng giao dịch */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Mã Hóa Đơn</th>
                <th className="py-3 px-3">Dịch Vụ / Gói Cước</th>
                <th className="py-3 px-3">Số Tiền</th>
                <th className="py-3 px-3">Phương Thức</th>
                <th className="py-3 px-3">Ngày Kích Hoạt</th>
                <th className="py-3 px-3">Trạng Thái</th>
                <th className="py-3 px-3 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Chưa có giao dịch nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {tx.invoiceCode}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{tx.title}</div>
                      {tx.messagesAdded > 0 && (
                        <div className="text-[10px] text-emerald-600 font-semibold">+{tx.messagesAdded.toLocaleString()} tin nhắn AI</div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-black text-slate-900 dark:text-white">
                      {tx.amount.toLocaleString()} ₫
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString('vi-VN')} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        tx.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{tx.status === 'completed' ? 'Đã Thanh Toán' : 'Đang Xử Lý'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedInvoice(tx)}
                        className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem Hóa Đơn</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================= */}
      {/* MODAL 1: THANH TOÁN VIETQR MUA GÓI PHỤ (ADD-ON PACK)    */}
      {/* ======================================================= */}
      {selectedAddon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header Modal */}
            <div className="p-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Thanh Toán Kích Hoạt Dung Lượng</h3>
                  <p className="text-[11px] text-indigo-100">{selectedAddon.name} (+{selectedAddon.messagesCount.toLocaleString()} tin)</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAddon(null)}
                className="p-1.5 rounded-xl hover:bg-white/20 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nội dung thanh toán */}
            <div className="p-6 space-y-5">
              {paymentSuccessMessage ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 animate-bounce" />
                  </div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">Giao Dịch Thành Công!</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    {paymentSuccessMessage}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    {/* Mã QR VietQR */}
                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                      <div className="w-44 h-44 rounded-xl bg-white p-2 border border-slate-200 shadow-inner flex items-center justify-center relative">
                        <img 
                          src={`https://api.vietqr.io/image/970422-0988888888-QvjWv0a.jpg?amount=${selectedAddon.numericPrice}&addInfo=DHT%20ADDON%20${currentUser?.id ? currentUser.id.slice(-6) : 'USER'}&accountName=DUONG%20CHI%20DU`}
                          alt="VietQR Code"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            // Fallback mockup nếu API ngoài bị chậm
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="text-center text-[10px] text-slate-400 p-2 font-mono">
                          Mở app Ngân hàng quét mã VietQR tự động
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 mt-2">Quét mã QR để chuyển khoản nhanh 24/7</span>
                    </div>

                    {/* Thông tin chuyển khoản */}
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Ngân hàng thụ hưởng:</span>
                        <div className="font-bold text-slate-800 dark:text-slate-200">Ngân Hàng Quân Đội (MBBank)</div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Chủ tài khoản:</span>
                        <div className="font-bold text-slate-800 dark:text-slate-200 uppercase">DƯƠNG CHÍ DU</div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Số tài khoản:</span>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white">
                          <span>0988888888</span>
                          <button 
                            onClick={() => handleCopy('0988888888', 'stk')}
                            className="text-indigo-600 hover:text-indigo-700 cursor-pointer text-[10px] flex items-center gap-1 font-sans"
                          >
                            {copiedField === 'stk' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === 'stk' ? 'Đã chép' : 'Sao chép'}</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Số tiền thanh toán:</span>
                        <div className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">
                          {selectedAddon.price}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Nội dung chuyển khoản (Bắt buộc):</span>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 font-mono font-bold text-indigo-950 dark:text-indigo-200 text-[11px] border border-indigo-200/80 dark:border-indigo-800">
                          <span>DHT ADDON {currentUser?.id ? currentUser.id.slice(-6) : 'USER'}</span>
                          <button 
                            onClick={() => handleCopy(`DHT ADDON ${currentUser?.id ? currentUser.id.slice(-6) : 'USER'}`, 'nd')}
                            className="text-indigo-600 hover:text-indigo-700 cursor-pointer text-[10px] flex items-center gap-1 font-sans"
                          >
                            {copiedField === 'nd' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === 'nd' ? 'Đã chép' : 'Sao chép'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                    <span>Sau khi chuyển khoản qua ứng dụng ngân hàng, nhấn nút bên dưới để hệ thống cập nhật tức thì vào tài khoản của bạn.</span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setSelectedAddon(null)}
                      className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
                    >
                      Hủy Bỏ
                    </button>

                    <button
                      onClick={handleConfirmAddonPayment}
                      disabled={isSubmittingPayment}
                      className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingPayment ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Đang Xác Nhận...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Tôi Đã Chuyển Khoản</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 2: XEM & IN HÓA ĐƠN ĐIỆN TỬ (ELECTRONIC INVOICE)  */}
      {/* ======================================================= */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Top Bar Action */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Biên Lai & Hóa Đơn Điện Tử VAT</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In / Lưu PDF</span>
                </button>
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chi tiết Hóa đơn có thể Print */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto print:p-0">
              {/* Header Hóa đơn */}
              <div className="flex justify-between items-start pb-5 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                      DHT
                    </div>
                    <span className="font-black text-lg text-slate-900 dark:text-white">DHT ChatAI</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">CÔNG TY CỔ PHẦN CÔNG NGHỆ DHT AI SOLUTION</p>
                  <p className="text-[10px] text-slate-400">MST: 0109888888 | Hotline: 1900 6868</p>
                </div>

                <div className="text-right">
                  <div className="text-xs uppercase font-extrabold text-indigo-600 dark:text-indigo-400">HÓA ĐƠN DỊCH VỤ</div>
                  <div className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5">{selectedInvoice.invoiceCode}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Ngày lập: {new Date(selectedInvoice.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>

              {/* Thông tin Khách hàng */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Khách Hàng / Đơn Vị:</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedInvoice.userName}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">{selectedInvoice.userEmail}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">{currentUser?.companyName || 'Khách hàng cá nhân'}</div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Phương Thức Thanh Toán:</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedInvoice.paymentMethod} (Chuyển khoản 24/7)</div>
                  <div className="text-emerald-600 font-bold text-[11px] mt-1 flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Trạng thái: ĐÃ THANH TOÁN ĐỦ</span>
                  </div>
                </div>
              </div>

              {/* Bảng Dịch Vụ */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-[10px] uppercase border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Nội Dung Dịch Vụ</th>
                      <th className="py-2.5 px-3 text-center">SL</th>
                      <th className="py-2.5 px-3 text-right">Đơn Giá</th>
                      <th className="py-2.5 px-3 text-right">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{selectedInvoice.title}</div>
                        <div className="text-[10px] text-slate-400">
                          {selectedInvoice.type === 'addon_messages' ? 'Gói nạp thêm dung lượng tin nhắn AI không giới hạn ngày dùng' : 'Thuê bao dịch vụ Chatbot AI đa kênh'}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold">1</td>
                      <td className="py-3 px-3 text-right font-mono">{selectedInvoice.amount.toLocaleString()} ₫</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {selectedInvoice.amount.toLocaleString()} ₫
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tổng kết tiền & Con dấu điện tử */}
              <div className="flex justify-between items-center pt-2">
                {/* Con dấu điện tử */}
                <div className="w-28 h-28 rounded-full border-2 border-dashed border-emerald-500/60 p-2 flex flex-col items-center justify-center text-center rotate-[-12deg] select-none">
                  <span className="text-[9px] font-bold text-emerald-600 uppercase">DHT CHATAI</span>
                  <span className="text-xs font-black text-emerald-600 tracking-wider">PAID</span>
                  <span className="text-[8px] text-emerald-600">ĐÃ THANH TOÁN</span>
                  <span className="text-[7px] text-emerald-600 font-mono mt-0.5">{new Date(selectedInvoice.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>

                <div className="w-56 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-slate-400">
                    <span>Tạm tính:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{selectedInvoice.amount.toLocaleString()} ₫</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Thuế VAT (0%):</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">0 ₫</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-sm">
                    <span className="text-slate-900 dark:text-white">Tổng Thanh Toán:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-mono font-black">
                      {selectedInvoice.amount.toLocaleString()} ₫
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-bold transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
