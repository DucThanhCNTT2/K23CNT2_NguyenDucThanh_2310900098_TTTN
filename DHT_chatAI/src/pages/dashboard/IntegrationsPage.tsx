import React, { useState } from 'react';
import { 
  Share2, 
  Globe, 
  MessageCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw,
  Key,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const IntegrationsPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [widgetPrimaryColor, setWidgetPrimaryColor] = useState('#6366f1');
  const [fbStatus, setFbStatus] = useState<'connected' | 'disconnected'>('connected');
  const [zaloStatus, setZaloStatus] = useState<'connected' | 'disconnected'>('connected');

  const embedScript = `<!-- DHT AI Omnichannel Live Chat Widget -->
<script>
  window.dhtChatConfig = {
    apiKey: "dht_live_sec_99482716384",
    theme: "auto",
    primaryColor: "${widgetPrimaryColor}",
    greeting: "Xin chào! DHT AI có thể hỗ trợ gì cho bạn hôm nay?"
  };
</script>
<script async src="https://cdn.dht-chatai.vn/widget.js"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans select-none">
      {/* Header */}
      <div className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Tích Hợp Kênh Hội Thoại (Omnichannel Integrations)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                Đang Đồng Bộ
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kết nối Website, Fanpage Facebook và Zalo Official Account về một luồng quản lý duy nhất
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full space-y-6">
        {/* 1. Website Widget Integration */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>1. Cài Đặt Live Chat Widget Lên Website</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-600">
                    HTML / JS Embed
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dán đoạn mã dưới đây vào trước thẻ <code className="text-indigo-500 font-mono">&lt;/body&gt;</code> của trang web để hiển thị bong bóng chat.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Hoạt động
            </span>
          </div>

          <div className="relative">
            <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
              {embedScript}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép mã'}</span>
            </button>
          </div>
        </div>

        {/* 2. Facebook Messenger Integration */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 fill-blue-600 dark:fill-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>2. Kết Nối Facebook Fanpage & Messenger</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600">
                    Meta Graph API
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tự động trả lời tin nhắn từ khách hàng trên Facebook Fanpage và đồng bộ về hộp thư tập trung.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã liên kết
            </span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Fanpage đang liên kết:</span>
              <strong className="text-blue-600 dark:text-blue-400">DHT AI Solution - Giải Pháp Trí Tuệ Nhân Tạo</strong>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Page ID:</span>
              <span className="font-mono text-slate-600 dark:text-slate-400">104829104928172</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Webhook Webhook Event:</span>
              <span className="text-emerald-600 font-semibold">messages, messaging_postbacks (Active)</span>
            </div>
          </div>
        </div>

        {/* 3. Zalo Official Account Integration */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-lg">
                Zalo
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>3. Tích Hợp Zalo Official Account (Zalo OA)</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-600">
                    Zalo Developer API
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tiếp nhận tin nhắn từ người dùng Zalo, gửi thông báo đơn hàng và chăm sóc khách hàng tự động.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã xác thực OA
            </span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Tên Official Account:</span>
              <strong className="text-cyan-600 dark:text-cyan-400">DHT AI Tech Support (Tài khoản Doanh nghiệp)</strong>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">OA ID:</span>
              <span className="font-mono text-slate-600 dark:text-slate-400">48201948291024</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Trạng thái Webhook:</span>
              <span className="text-emerald-600 font-semibold">Đang nhận tin nhắn thời gian thực</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
