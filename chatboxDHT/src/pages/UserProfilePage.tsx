import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Crown, 
  ShieldCheck, 
  Lock, 
  Camera, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Globe,
  MessageSquare,
  KeyRound,
  Upload,
  Image as ImageIcon,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200'
];

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateCurrentUser } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');

  // Form Thông tin cơ bản
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [companyName, setCompanyName] = useState(currentUser?.companyName || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || PRESET_AVATARS[0]);

  // Form Đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States thông báo & loading
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dung lượng thực tế
  const [usage, setUsage] = useState<{
    usedMessages: number;
    maxMessages: number;
    percentage: number;
    remainingMessages: number;
  }>({
    usedMessages: 0,
    maxMessages: 2500,
    percentage: 0,
    remainingMessages: 2500
  });

  // Tải dữ liệu thật từ Backend MongoDB khi mở trang
  useEffect(() => {
    const fetchRealUserData = async () => {
      try {
        const realUser = await apiService.getCurrentUser();
        if (realUser) {
          setName(realUser.name || '');
          setEmail(realUser.email || '');
          setPhone(realUser.phone || '');
          setCompanyName(realUser.companyName || '');
          if (realUser.avatar) {
            setAvatar(realUser.avatar);
          }
        }
      } catch (err) {
        console.error('Lỗi tải thông tin user thật từ server:', err);
      }
    };
void fetchRealUserData();
  }, []);

  useEffect(() => {
    const fetchUsage = async () => {
      const data = await apiService.getUserUsage();
      if (data) {
        setUsage({
          usedMessages: data.usedMessages,
          maxMessages: data.maxMessages,
          percentage: data.percentage,
          remainingMessages: data.remainingMessages
        });
      }
    };
    void fetchUsage();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setNotification({ type, message });
    toastTimerRef.current = setTimeout(() => {
      setNotification(null);
      toastTimerRef.current = null;
    }, 4000);
  };

  // Xử lý tải ảnh từ máy tính (Local File Upload)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Vui lòng chọn định dạng file ảnh hợp lệ (PNG, JPG, WebP)!');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'Kích thước ảnh tối đa là 10MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Tự động resize ảnh về kích thước chuẩn và nén nhẹ để lưu database thật tối ưu
        const canvas = document.createElement('canvas');
        const maxDim = 360;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64Url = canvas.toDataURL('image/jpeg', 0.88);
          setAvatar(base64Url);
          showToast('success', 'Đã tải ảnh từ máy lên! Nhấn "Lưu Thay Đổi Thông Tin" để hoàn tất.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Lưu thông tin cá nhân và tự động quay về trang user
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Vui lòng nhập họ và tên!');
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.updateProfile({
        name: name.trim(),
        avatar: avatar.trim(),
        phone: phone.trim(),
        companyName: companyName.trim()
      });

      if (res && res.success) {
        // Cập nhật State và LocalStorage
        updateCurrentUser({
          name: name.trim(),
          avatar: avatar.trim(),
          phone: phone.trim(),
companyName: companyName.trim()
        });

        showToast('success', 'Đã lưu thông tin thành công! Đang chuyển về trang User Portal...');

        // Tự động chuyển hướng quay về trang user sau khi lưu thành công
        setTimeout(() => {
          if (currentUser?.role === 'user') {
            navigate('/portal');
          } else {
            navigate('/dashboard/inbox');
          }
        }, 1000);
      } else {
        showToast('error', res?.message || 'Có lỗi xảy ra khi lưu thông tin');
      }
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('error', 'Vui lòng nhập mật khẩu hiện tại!');
      return;
    }
    if (newPassword.length < 6) {
      showToast('error', 'Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'Xác nhận mật khẩu mới không khớp!');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await apiService.updateProfile({
        currentPassword,
        newPassword
      });

      if (res && res.success) {
        showToast('success', 'Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast('error', res?.message || 'Đổi mật khẩu thất bại');
      }
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Mật khẩu hiện tại không chính xác');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleBack = () => {
    if (currentUser?.role === 'user') {
      navigate('/portal');
    } else {
      navigate('/dashboard/inbox');
    }
  };

  const isLocalUploadedAvatar = avatar && avatar.startsWith('data:image');

  return (
    <div className="min-h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer active:scale-95 text-slate-700 dark:text-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentUser?.role === 'user' ? 'Quay Lại Portal' : 'Quay Lại Dashboard'}</span>
          </button>
<div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-extrabold text-sm">Hồ Sơ Cá Nhân & Cài Đặt</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/pricing')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          <Crown className="w-3.5 h-3.5 text-amber-300" />
          <span>Nâng Cấp Gói</span>
        </button>
      </header>

      {/* Thông báo dạng Banner nổi */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Banner Tổng Quan */}
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-indigo-500/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar lớn */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-4 ring-white/20 shadow-2xl bg-slate-800">
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg border border-white/20 cursor-pointer active:scale-95 transition-all"
                title="Tải ảnh từ máy tính lên"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Thông tin nhanh */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-black tracking-tight">{name || 'Người Dùng'}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-extrabold uppercase tracking-wider">
                  {currentUser?.role === 'admin' ? 'Quản trị viên' : currentUser?.role === 'agent' ? 'Chuyên viên CSKH' : 'Thành viên'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Gói {currentUser?.plan || 'Pro'}</span>
                </span>
              </div>

              <p className="text-xs text-indigo-200/80">{email}</p>
              <p className="text-xs text-slate-300 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{companyName || 'DHT AI Solution Corp'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Input file ẩn phục vụ tải ảnh */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Bố cục Grid 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CỘT TRÁI: FORM CÀI ĐẶT */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tabs chuyển đổi */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
              <button
                onClick={() => setActiveTab('general')}
                className={`pb-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'general'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Thông Tin Cơ Bản</span>
              </button>
              <button
onClick={() => setActiveTab('security')}
                className={`pb-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'security'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Bảo Mật & Mật Khẩu</span>
              </button>
            </div>

            {/* TAB 1: THÔNG TIN CƠ BẢN */}
            {activeTab === 'general' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Cập Nhật Thông Tin Cá Nhân</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Thông tin này sẽ được lưu vào cơ sở dữ liệu và hiển thị trên toàn hệ thống DHT ChatAI.</p>
                </div>

                {/* KHU VỰC TẢI ẢNH TỪ MÁY & CHỌN AVATAR */}
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-indigo-500" />
                      <span>Ảnh Đại Diện (Avatar Cá Nhân)</span>
                    </label>

                    {isLocalUploadedAvatar && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Đã tải từ máy</span>
                      </span>
                    )}
                  </div>

                  {/* Nút bấm Tải ảnh từ máy lên */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer active:scale-95 transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Tải Ảnh Từ Máy Lên</span>
                    </button>

                    <span className="text-[11px] text-slate-400">
                      Hỗ trợ JPG, PNG, WebP (Tự động nén và tối ưu hiển thị)
</span>
                  </div>

                  {/* Hoặc chọn avatar mẫu có sẵn */}
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/60 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Hoặc chọn nhanh từ mẫu có sẵn:
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setAvatar(url)}
                          className={`w-11 h-11 rounded-2xl overflow-hidden transition-all p-0.5 cursor-pointer ${
                            avatar === url ? 'ring-3 ring-indigo-600 scale-105' : 'opacity-65 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hoặc dán URL */}
                  <div className="pt-1">
                    <input
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="Hoặc dán URL hình ảnh..."
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-600 transition-all font-mono"
                    />
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Họ và Tên</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập họ và tên..."
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all font-semibold"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
<label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Số Điện Thoại</span>
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ví dụ: 0988 123 456"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Email (Định danh đăng nhập)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          disabled
                          className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed font-medium"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                          Đã xác minh
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Tên Công Ty / Cửa Hàng</span>
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Nhập tên doanh nghiệp hoặc shop..."
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
/>
                    </div>
                  </div>

                  {/* Nút Lưu và quay về trang user */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400">
                      * Nhấn lưu sẽ tự động cập nhật CSDL và quay trở lại User Portal.
                    </span>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Đang lưu & chuyển trang...' : 'Lưu Thay Đổi Thông Tin'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: ĐỔI MẬT KHẨU */}
            {activeTab === 'security' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Đổi Mật Khẩu Đăng Nhập</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Nên sử dụng mật khẩu mạnh gồm chữ hoa, chữ thường, số và ký tự đặc biệt để đảm bảo an toàn.</p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Mật Khẩu Hiện Tại</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Nhập mật khẩu đang sử dụng..."
                        className="w-full px-4 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Mật Khẩu Mới</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Ít nhất 6 ký tự..."
                        className="w-full px-4 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Xác Nhận Mật Khẩu Mới</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới..."
                        className="w-full px-4 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{passwordLoading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* CỘT PHẢI: THẺ THỐNG KÊ DUNG LƯỢNG & GÓI */}
          <div className="lg:col-span-4 space-y-4">
            {/* Thẻ Gói Cước & Dung Lượng Thực Tế */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white shadow-xl border border-indigo-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[10px] font-bold text-indigo-300 flex items-center gap-1.5">
<Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Gói {currentUser?.plan || 'Pro'}</span>
                </span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Kích hoạt</span>
                </span>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-white">Dung Lượng Tin Nhắn Thực Tế</h4>
                <p className="text-xs text-indigo-200/80 mt-0.5">Số lượng tin nhắn AI đã xử lý trong chu kỳ.</p>
              </div>

              {/* Progress bar thực tế */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-indigo-200">Đã sử dụng</span>
                  <span className="text-white font-mono">{usage.usedMessages.toLocaleString()} / {usage.maxMessages.toLocaleString()}</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(2, usage.percentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-indigo-300/80">
                  <span>Còn lại: {usage.remainingMessages.toLocaleString()} tin</span>
                  <span>{usage.percentage}%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => navigate('/pricing')}
                  className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Mua Thêm Dung Lượng</span>
                </button>
              </div>
            </div>

            {/* Thẻ Kênh Kết Nối */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Kênh Hội Thoại Hỗ Trợ</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
<div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                      WEB
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-200">Website Widget</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">Sẵn sàng</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                      FB
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-200">Facebook Messenger</span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">Hỗ trợ</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold text-[10px]">
                      OA
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-200">Zalo Official Account</span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">Hỗ trợ</span>
                </div>
              </div>
            </div>

            {/* Trợ giúp nhanh */}
            <div className="p-5 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-200">
                <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Cần Hỗ Trợ Kỹ Thuật?</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                Nếu bạn cần hỗ trợ thay đổi cấu hình hoặc kích hoạt kênh Fanpage / Zalo OA riêng, hãy gửi yêu cầu trực tiếp qua trung tâm tư vấn.
              </p>
              <button
                onClick={() => navigate('/portal')}
className="w-full mt-2 py-2 rounded-xl bg-indigo-600 text-white font-bold text-[11px] shadow-sm hover:bg-indigo-700 transition-all cursor-pointer"
              >
                Nhắn Tin Với CSKH
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfilePage;