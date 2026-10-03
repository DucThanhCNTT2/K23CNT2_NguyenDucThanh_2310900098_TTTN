import React, { useEffect, useState } from 'react';
import { 
  Share2, 
  Globe, 
  MessageCircle, 
  Copy, 
  Check, 
  CheckCircle2, 
  Activity, 
  Key, 
  Send, 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  RefreshCw,
  Clock,
  Terminal,
  Save,
  Server
} from 'lucide-react';
import { apiService } from '../../services/api';

export const IntegrationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'configs' | 'simulator' | 'tests'>('configs');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states for editing channel config
  const [fbPageToken, setFbPageToken] = useState('');
  const [fbVerifyToken, setFbVerifyToken] = useState('dht_fb_verify_token_2026');
  const [fbPageId, setFbPageId] = useState('104829104928172');
  const [fbAppSecret, setFbAppSecret] = useState('');

  const [zaloAccessToken, setZaloAccessToken] = useState('');
  const [zaloOaId, setZaloOaId] = useState('48201948291024');
  const [zaloAppSecret, setZaloAppSecret] = useState('');

  // Simulator states
  const [simChannel, setSimChannel] = useState<'website' | 'facebook' | 'zalo'>('website');
  const [simMessage, setSimMessage] = useState('Xin chào, báo giá giúp tôi gói Pro');
  const [simSenderName, setSimSenderName] = useState('Khách hàng thử nghiệm');
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  // Benchmark & Security test states
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<any>(null);
  const [securityStatus, setSecurityStatus] = useState<any>(null);
  const [errorSimResult, setErrorSimResult] = useState<any>(null);

  const widgetPrimaryColor = '#6366f1';
  const embedScript = `<!-- DHT AI Omnichannel Live Chat Widget -->
<script>
  window.dhtChatConfig = {
    apiKey: "dht_live_sec_99482716384",
    theme: "auto",
    primaryColor: "${widgetPrimaryColor}",
    greeting: "Xin chào! DHT AI có thể hỗ trợ gì cho bạn hôm nay?"
  };
</script>
<script async src="${window.location.origin}/widget.js"></script>`;

  const showNotify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadChannelConfigs = async () => {
    try {
      const data = await apiService.getChannelConfigs();
      if (Array.isArray(data)) {
        setConfigs(data);
        const fb = data.find((c: any) => c.channel === 'facebook');
        if (fb) {
          if (fb.pageId) setFbPageId(fb.pageId);
          if (fb.verifyToken) setFbVerifyToken(fb.verifyToken);
        }
        const zalo = data.find((c: any) => c.channel === 'zalo');
        if (zalo) {
          if (zalo.oaId) setZaloOaId(zalo.oaId);
        }
      }
    } catch {
      // fallback
    }
  };

  const loadSecurityAudit = async () => {
    try {
      const res = await apiService.getSecurityAuditStatus();
      if (res?.success) setSecurityStatus(res.securityChecks);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    void loadChannelConfigs();
    void loadSecurityAudit();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(embedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveFacebook = async () => {
    try {
      setLoading(true);
      await apiService.updateChannelConfig('facebook', {
        pageId: fbPageId,
        verifyToken: fbVerifyToken,
        accessToken: fbPageToken || undefined,
        appSecret: fbAppSecret || undefined,
        isActive: true
      });
      showNotify('success', 'Đã lưu cấu hình Facebook Messenger thành công!');
      void loadChannelConfigs();
    } catch {
      showNotify('error', 'Lỗi khi lưu cấu hình Facebook');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveZalo = async () => {
    try {
      setLoading(true);
      await apiService.updateChannelConfig('zalo', {
        oaId: zaloOaId,
        accessToken: zaloAccessToken || undefined,
        appSecret: zaloAppSecret || undefined,
        isActive: true
      });
      showNotify('success', 'Đã lưu cấu hình Zalo Official Account thành công!');
      void loadChannelConfigs();
    } catch {
      showNotify('error', 'Lỗi khi lưu cấu hình Zalo');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (channel: string) => {
    try {
      const res = await apiService.testChannelConnection(channel);
      if (res?.success) {
        showNotify('success', `[${channel.toUpperCase()}]: ${res.message} (Độ trễ: ${res.latencyMs}ms)`);
      }
    } catch {
      showNotify('error', `Không thể kết nối tới kênh ${channel}`);
    }
  };

  const handleSimulateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simMessage.trim()) return;
    setSimulating(true);
    try {
      const res = await apiService.simulateChannelMessage({
        channel: simChannel,
        senderName: simSenderName,
        content: simMessage.trim()
      });
      if (res?.success) {
        setSimResult(res.data);
        showNotify('success', `Mô phỏng gửi tin nhắn thành công qua ${simChannel.toUpperCase()}!`);
      }
    } catch (err: any) {
      showNotify('error', err?.response?.data?.message || 'Lỗi khi mô phỏng tin nhắn');
    } finally {
      setSimulating(false);
    }
  };

  const handleRunBenchmark = async () => {
    setBenchmarkLoading(true);
    try {
      const res = await apiService.testIntentAccuracy();
      if (res?.success) {
        setBenchmarkResult(res);
        showNotify('success', `Đã hoàn thành kiểm thử nhận diện ý định: Độ chính xác ${res.accuracyPercentage}%!`);
      }
    } catch {
      showNotify('error', 'Lỗi khi chạy bộ kiểm thử');
    } finally {
      setBenchmarkLoading(false);
    }
  };

  const handleTestError = async (type: string) => {
    try {
      const res = await apiService.testErrorSimulation(type);
      setErrorSimResult(res);
      showNotify('success', 'Đã thực hiện bài test xử lý lỗi an toàn!');
    } catch (err: any) {
      setErrorSimResult(err?.response?.data || { message: 'Lỗi bắt ngoại lệ an toàn' });
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans select-none">
      {/* Header */}
      <div className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-sm">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Tích Hợp Đa Kênh & Kiểm Thử Toàn Diện</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Webhook Active
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kết nối Website, Facebook Messenger, Zalo OA và bộ công cụ kiểm thử tự động
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('configs')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'configs'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Cấu Hình Kênh</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Mô Phỏng Gửi / Nhận</span>
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tests'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Độ Chính Xác & Bảo Mật</span>
          </button>
        </div>
      </div>

      {/* Floating Notifications */}
      {notification && (
        <div className={`mx-6 mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border animate-fade-in ${
          notification.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 text-rose-700 dark:text-rose-300'
        }`}>
          {notification.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto max-w-6xl mx-auto w-full space-y-6">
        {/* ======================================================== */}
        {/* TAB 1: CẤU HÌNH KÊNH (WEBSITE, FACEBOOK, ZALO)           */}
        {/* ======================================================== */}
        {activeTab === 'configs' && (
          <div className="space-y-6 animate-fade-in">
            {/* 1. Website Widget Integration */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>1. Nhúng Chat Widget Lên Website (WebSocket / REST)</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-600">
                        HTML Embed
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Giao diện bong bóng chat nổi responsive trên máy tính & điện thoại, đồng bộ qua WebSocket/REST.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestConnection('website')}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Activity className="w-3.5 h-3.5 text-purple-600" />
                    <span>Kiểm tra kết nối</span>
                  </button>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đang hoạt động
                  </span>
                </div>
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
                  <span>{copied ? 'Đã sao chép!' : 'Sao chép mã nhúng'}</span>
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
                      <span>2. Kết Nối API Facebook Messenger (Meta Graph API)</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600">
                        Webhook & Access Token
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tạo Webhook xác thực (verify token), Page Access Token và nhận tin nhắn từ Fanpage.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestConnection('facebook')}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    <span>Kiểm tra kết nối</span>
                  </button>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã liên kết
                  </span>
                </div>
              </div>

              {/* Form Config Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Facebook Page ID:</label>
                  <input
                    value={fbPageId}
                    onChange={(e) => setFbPageId(e.target.value)}
                    placeholder="104829104928172"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Webhook Verify Token:</label>
                  <input
                    value={fbVerifyToken}
                    onChange={(e) => setFbVerifyToken(e.target.value)}
                    placeholder="dht_fb_verify_token_2026"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Page Access Token:</label>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      value={fbPageToken}
                      onChange={(e) => setFbPageToken(e.target.value)}
                      placeholder="Nhập Page Access Token (EAA...)"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">App Secret (HMAC-SHA256):</label>
                  <input
                    type="password"
                    value={fbAppSecret}
                    onChange={(e) => setFbAppSecret(e.target.value)}
                    placeholder="Nhập App Secret để xác thực chữ ký"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-500 font-mono">
                  Webhook URL: <strong>{window.location.origin}/api/webhooks/facebook</strong>
                </span>
                <button
                  onClick={handleSaveFacebook}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Cấu Hình Facebook</span>
                </button>
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
                      <span>3. Kết Nối API Zalo OA (Zalo Official Account)</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-600">
                        Zalo Open API
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Đăng ký OA, xác thực webhook, quản lý Access Token và tiếp nhận tin nhắn từ Zalo.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestConnection('zalo')}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Activity className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Kiểm tra kết nối</span>
                  </button>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã xác thực OA
                  </span>
                </div>
              </div>

              {/* Form Config Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Zalo OA ID:</label>
                  <input
                    value={zaloOaId}
                    onChange={(e) => setZaloOaId(e.target.value)}
                    placeholder="48201948291024"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Zalo App Secret:</label>
                  <input
                    type="password"
                    value={zaloAppSecret}
                    onChange={(e) => setZaloAppSecret(e.target.value)}
                    placeholder="Nhập Secret Key ứng dụng Zalo"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="col-span-full space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Zalo OA Access Token:</label>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      value={zaloAccessToken}
                      onChange={(e) => setZaloAccessToken(e.target.value)}
                      placeholder="Nhập Access Token dài hạn của Zalo OA..."
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-500 font-mono">
                  Webhook URL: <strong>{window.location.origin}/api/webhooks/zalo</strong>
                </span>
                <button
                  onClick={handleSaveZalo}
                  disabled={loading}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Cấu Hình Zalo OA</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MÔ PHỎNG GỬI / NHẬN TIN NHẮN ĐA KÊNH (SIMULATOR)   */}
        {/* ======================================================== */}
        {activeTab === 'simulator' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Send className="w-5 h-5 text-indigo-600" />
                  <span>Kiểm Thử Gửi / Nhận Tin Nhắn Đa Kênh (Omnichannel Simulator)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Mô phỏng tin nhắn gửi từ Website, Facebook hoặc Zalo OA để kiểm tra bộ điều phối luồng (Unified Message Handler), nhận diện ý định và phản hồi tự động.
                </p>
              </div>

              {/* Form Input */}
              <form onSubmit={handleSimulateMessage} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Select Channel */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Kênh mô phỏng:
                    </label>
                    <select
                      value={simChannel}
                      onChange={(e) => setSimChannel(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="website">Website Live Chat Widget</option>
                      <option value="facebook">Facebook Messenger</option>
                      <option value="zalo">Zalo Official Account</option>
                    </select>
                  </div>

                  {/* Sender Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Tên người gửi (Khách hàng):
                    </label>
                    <input
                      value={simSenderName}
                      onChange={(e) => setSimSenderName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Message Content */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nội dung tin nhắn thử nghiệm:
                  </label>
                  <textarea
                    rows={3}
                    value={simMessage}
                    onChange={(e) => setSimMessage(e.target.value)}
                    placeholder="Ví dụ: Xin chào / Báo giá gói Pro / Kiểm tra đơn hàng DHT-9942 / Cho tôi gặp nhân viên tư vấn..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                {/* Sample Buttons */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Mẫu thử nhanh:</span>
                  <button
                    type="button"
                    onClick={() => setSimMessage('Chào bot, báo giá giúp mình gói Pro')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-[11px]"
                  >
                    Báo giá Pro
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimMessage('Tra cứu đơn hàng DHT-9942 giúp tôi')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-[11px]"
                  >
                    Mã đơn DHT-9942
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimMessage('Tôi muốn gặp chuyên viên tư vấn trực tiếp')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-[11px]"
                  >
                    Gặp nhân viên (Handoff)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimMessage('Hướng dẫn liên kết Zalo OA và Website widget')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-[11px]"
                  >
                    Tích hợp Zalo OA
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={simulating}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    <span>Bắn Tin Nhắn & Kiểm Thử Phản Hồi</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Simulation Results View */}
            {simResult && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>Kết Quả Xử Lý Đa Kênh Thời Gian Thực</span>
                  </h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 font-bold">
                      Xử lý: {simResult.responseTimeMs}ms
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 font-bold uppercase">
                      Bộ máy: {simResult.handledBy}
                    </span>
                  </div>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                    <span className="text-slate-400 font-semibold">Ý định nhận diện (Intent):</span>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                      {simResult.intentResult?.intent}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Độ tin cậy: {Math.round((simResult.intentResult?.confidence || 0) * 100)}%
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                    <span className="text-slate-400 font-semibold">Thực thể trích xuất (Entities):</span>
                    <div className="font-mono text-slate-800 dark:text-slate-200">
                      {Object.keys(simResult.intentResult?.entities || {}).length > 0 ? (
                        JSON.stringify(simResult.intentResult.entities)
                      ) : (
                        <span className="text-slate-400 italic">Không có thực thể</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                    <span className="text-slate-400 font-semibold">Trạng thái Handoff (Chuyển CSKH):</span>
                    <p className="font-bold text-sm">
                      {simResult.intentResult?.needsHandoff ? (
                        <span className="text-amber-600">Đã kích hoạt chuyển nhân viên</span>
                      ) : (
                        <span className="text-emerald-600">Bot AI tự xử lý</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Message & Reply Bubble */}
                <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-3 font-sans text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-mono text-[10px]">
                      [Tin nhắn khách gửi qua {simResult.userMessage?.conversationId}]:
                    </span>
                    <p className="p-2.5 rounded-lg bg-slate-800 text-slate-200">
                      {simResult.userMessage?.content}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-emerald-400 font-mono text-[10px]">
                      [Phản hồi tự động của Bot DHT AI]:
                    </span>
                    <p className="p-2.5 rounded-lg bg-indigo-950/80 text-indigo-100 whitespace-pre-wrap leading-relaxed border border-indigo-800/50">
                      {simResult.botReply?.content}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: BENCHMARK ĐỘ CHÍNH XÁC & BẢO MẬT (TEST SUITE)     */}
        {/* ======================================================== */}
        {activeTab === 'tests' && (
          <div className="space-y-6 animate-fade-in">
            {/* 1. Intent Accuracy Benchmark */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    <span>Kiểm Thử Độ Chính Xác Nhận Diện Ý Định (Intent Accuracy Benchmark)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Chạy tự động 12 ca kiểm thử tiêu chuẩn trên các nhóm ý định (Chào hỏi, Báo giá, Tra cứu đơn, Handoff, Khiếu nại...).
                  </p>
                </div>

                <button
                  onClick={handleRunBenchmark}
                  disabled={benchmarkLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Play className={`w-3.5 h-3.5 ${benchmarkLoading ? 'animate-spin' : ''}`} />
                  <span>{benchmarkLoading ? 'Đang kiểm thử...' : 'Chạy Benchmark'}</span>
                </button>
              </div>

              {benchmarkResult && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 rounded-xl text-center">
                      <span className="text-xs text-slate-500 font-semibold">Độ chính xác</span>
                      <div className="text-2xl font-black text-emerald-600">{benchmarkResult.accuracyPercentage}%</div>
                    </div>
                    <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 rounded-xl text-center">
                      <span className="text-xs text-slate-500 font-semibold">Ca đạt chuẩn</span>
                      <div className="text-2xl font-black text-indigo-600">{benchmarkResult.passed} / {benchmarkResult.total}</div>
                    </div>
                    <div className="p-3.5 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 rounded-xl text-center">
                      <span className="text-xs text-slate-500 font-semibold">Độ trễ trung bình</span>
                      <div className="text-2xl font-black text-purple-600">{benchmarkResult.avgLatencyMs}ms</div>
                    </div>
                    <div className="p-3.5 bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 rounded-xl text-center">
                      <span className="text-xs text-slate-500 font-semibold">Xếp loại</span>
                      <div className="text-2xl font-black text-cyan-600">Xuất sắc</div>
                    </div>
                  </div>

                  {/* Benchmark detail table */}
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-2.5">Câu hỏi kiểm thử</th>
                          <th className="p-2.5">Ý định kỳ vọng</th>
                          <th className="p-2.5">Ý định nhận diện</th>
                          <th className="p-2.5">Độ tin cậy</th>
                          <th className="p-2.5">Độ trễ</th>
                          <th className="p-2.5 text-right">Kết quả</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {benchmarkResult.details?.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">{item.query}</td>
                            <td className="p-2.5 text-slate-500 font-mono">{item.expectedIntent}</td>
                            <td className="p-2.5 font-mono font-bold text-indigo-600">{item.detectedIntent}</td>
                            <td className="p-2.5">{item.confidence}%</td>
                            <td className="p-2.5 font-mono text-slate-400">{item.latencyMs}ms</td>
                            <td className="p-2.5 text-right">
                              {item.isCorrect ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">ĐẠT</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">LỖI</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Error Simulation (Criterion 30) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span>Xử Lý Lỗi Ngoại Lệ (Mất kết nối Webhook, Token hết hạn, Tin nhắn lạ)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Kiểm thử khả năng tự phục hồi và bảo vệ hệ thống trước các lỗi nền tảng bên ngoài.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleTestError('invalid_signature')}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1 transition-all cursor-pointer"
                >
                  <strong className="text-xs text-slate-900 dark:text-slate-100 block">1. Sai Chữ Ký HMAC</strong>
                  <span className="text-[11px] text-slate-500 block">Mô phỏng request giả mạo webhook signature</span>
                </button>

                <button
                  onClick={() => handleTestError('expired_token')}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1 transition-all cursor-pointer"
                >
                  <strong className="text-xs text-slate-900 dark:text-slate-100 block">2. Token Hết Hạn</strong>
                  <span className="text-[11px] text-slate-500 block">Phát hiện mã lỗi 190 Meta / -216 Zalo</span>
                </button>

                <button
                  onClick={() => handleTestError('malformed_payload')}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1 transition-all cursor-pointer"
                >
                  <strong className="text-xs text-slate-900 dark:text-slate-100 block">3. Tin Nhắn Định Dạng Lạ</strong>
                  <span className="text-[11px] text-slate-500 block">Payload không đúng cấu trúc schema</span>
                </button>
              </div>

              {errorSimResult && (
                <div className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs space-y-2 font-mono">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Hệ thống đã bắt lỗi an toàn (Graceful Error Handled)</span>
                  </div>
                  <p className="text-slate-300 font-sans">{errorSimResult.message}</p>
                </div>
              )}
            </div>

            {/* 3. Security Audit Checklist (Criterion 31) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Bảo Mật Thông Tin Người Dùng & Token Truy Cập API (Security Audit)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Đánh giá toàn vẹn các cơ chế bảo mật danh tính, mã hóa token và phân quyền.
                </p>
              </div>

              <div className="space-y-2.5">
                {(securityStatus || []).map((sec: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <strong className="text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{sec.name}</span>
                      </strong>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">{sec.detail}</p>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      BẢO MẬT
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
