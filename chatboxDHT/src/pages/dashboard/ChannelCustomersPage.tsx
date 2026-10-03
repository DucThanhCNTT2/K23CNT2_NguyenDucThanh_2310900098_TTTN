import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Globe, 
  MessageCircle, 
  ExternalLink, 
  Phone, 
  Mail, 
  Tag, 
  Clock, 
  Filter, 
  RefreshCw,
  Edit3,
  Check,
  X,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { apiService } from '../../services/api';

export interface CustomerItem {
  id: string;
  channelUserId: string;
  channel: 'website' | 'facebook' | 'zalo';
  name: string;
  avatar: string;
  phone: string;
  email: string;
  address: string;
  tags: string[];
  notes: string[];
  totalSpent: string;
  lastActive: string;
  orders?: Array<{
    orderCode: string;
    date: string;
    total: string;
    status: string;
    itemsSummary: string;
  }>;
  history?: Array<{
    channel: string;
    timestamp: string;
    summary: string;
  }>;
}

export const ChannelCustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState<'all' | 'website' | 'facebook' | 'zalo'>('all');
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [mergeSecondaryId, setMergeSecondaryId] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await apiService.getChannelCustomers(activeChannel, search);
      setCustomers(data || []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCustomers();
  }, [activeChannel]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void loadCustomers();
  };

  const handleAddNote = async () => {
    if (!selectedCustomer || !newNote.trim()) return;
    try {
      const updatedNotes = [...(selectedCustomer.notes || []), newNote.trim()];
      const updated = await apiService.updateCustomer(selectedCustomer.id, { notes: updatedNotes });
      setSelectedCustomer(updated);
      setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setNewNote('');
      setIsEditingNote(false);
      showSuccess('Đã thêm ghi chú khách hàng thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật ghi chú');
    }
  };

  const handleAddTag = async () => {
    if (!selectedCustomer || !newTag.trim()) return;
    try {
      const updatedTags = [...new Set([...(selectedCustomer.tags || []), newTag.trim()])];
      const updated = await apiService.updateCustomer(selectedCustomer.id, { tags: updatedTags });
      setSelectedCustomer(updated);
      setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setNewTag('');
      showSuccess('Đã thêm nhãn khách hàng!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật thẻ');
    }
  };

  const handleMerge = async () => {
    if (!selectedCustomer || !mergeSecondaryId) return;
    try {
      const res = await apiService.mergeCustomers(selectedCustomer.id, mergeSecondaryId);
      showSuccess(res.message || 'Hợp nhất danh tính người dùng đa kênh thành công!');
      setMergeModalOpen(false);
      setMergeSecondaryId('');
      void loadCustomers();
      if (res.data) setSelectedCustomer(res.data);
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Lỗi khi hợp nhất khách hàng');
    }
  };

  const showSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // KPIs
  const totalCount = customers.length;
  const webCount = customers.filter((c) => c.channel === 'website').length;
  const fbCount = customers.filter((c) => c.channel === 'facebook').length;
  const zaloCount = customers.filter((c) => c.channel === 'zalo').length;

  return (
    <div className="dashboard-page h-full w-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans select-none">
      {/* Header */}
      <div className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Quản Lý Người Dùng Theo Từng Kênh</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 font-bold">
                Mã kênh • ID • Hồ sơ
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý danh sách khách hàng Website, Facebook Messenger và Zalo Official Account tập trung
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadCustomers()}
            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="mx-6 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => setActiveChannel('all')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeChannel === 'all'
                ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Tất Cả Kênh</span>
              <Layers className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalCount}</div>
            <span className="text-[11px] text-slate-400 font-medium">Người dùng đã ghi nhận</span>
          </div>

          <div 
            onClick={() => setActiveChannel('website')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeChannel === 'website'
                ? 'bg-white dark:bg-slate-900 border-purple-500 shadow-sm ring-2 ring-purple-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Website Live Chat</span>
              <Globe className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{webCount}</div>
            <span className="text-[11px] text-slate-400 font-medium">Khách truy cập widget</span>
          </div>

          <div 
            onClick={() => setActiveChannel('facebook')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeChannel === 'facebook'
                ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Facebook Messenger</span>
              <MessageCircle className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{fbCount}</div>
            <span className="text-[11px] text-slate-400 font-medium">Khách từ Fanpage</span>
          </div>

          <div 
            onClick={() => setActiveChannel('zalo')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeChannel === 'zalo'
                ? 'bg-white dark:bg-slate-900 border-cyan-500 shadow-sm ring-2 ring-cyan-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Zalo Official Account</span>
              <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-600 font-bold text-[10px] flex items-center justify-center">Z</span>
            </div>
            <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{zaloCount}</div>
            <span className="text-[11px] text-slate-400 font-medium">Khách từ Zalo OA</span>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hiển thị, SĐT, email hoặc ID người dùng theo kênh..."
              className="w-full pl-9 pr-24 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Tìm kiếm
            </button>
          </form>

          {/* Channel Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveChannel('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeChannel === 'all' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              Tất cả ({totalCount})
            </button>
            <button
              onClick={() => setActiveChannel('website')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeChannel === 'website' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              Website ({webCount})
            </button>
            <button
              onClick={() => setActiveChannel('facebook')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeChannel === 'facebook' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              Facebook ({fbCount})
            </button>
            <button
              onClick={() => setActiveChannel('zalo')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeChannel === 'zalo' ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              Zalo OA ({zaloCount})
            </button>
          </div>
        </div>

        {/* Customer List Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">Đang tải danh sách người dùng...</div>
          ) : customers.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Không có người dùng nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Kênh (Mã kênh)</th>
                    <th className="px-5 py-3.5">Người dùng (Tên & ID)</th>
                    <th className="px-5 py-3.5">Thông tin liên hệ</th>
                    <th className="px-5 py-3.5">Phân loại / Nhãn</th>
                    <th className="px-5 py-3.5">Hoạt động cuối</th>
                    <th className="px-5 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {customers.map((c) => {
                    const isWeb = c.channel === 'website';
                    const isFb = c.channel === 'facebook';
                    const isZalo = c.channel === 'zalo';

                    return (
                      <tr 
                        key={c.id || c.channelUserId} 
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Channel Badge */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {isWeb && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                <Globe className="w-3.5 h-3.5" />
                                <span>website</span>
                              </span>
                            )}
                            {isFb && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>facebook</span>
                              </span>
                            )}
                            {isZalo && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                                <span className="font-bold text-[10px]">Z</span>
                                <span>zalo</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* User Display Name & Channel ID */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt={c.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{c.name}</p>
                              <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate" title={`ID kênh: ${c.channelUserId}`}>
                                ID: {c.channelUserId}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact details */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
                            {c.phone ? (
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{c.phone}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Chưa có SĐT</span>
                            )}
                            {c.email && (
                              <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="truncate">{c.email}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Tags */}
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {(c.tags && c.tags.length > 0) ? (
                              c.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Chưa gắn thẻ</span>
                            )}
                          </div>
                        </td>

                        {/* Last Active */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{c.lastActive || 'Vừa xong'}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedCustomer(c)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                            >
                              Hồ sơ
                            </button>
                            <button
                              onClick={() => navigate('/dashboard/inbox')}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 transition-colors"
                            >
                              <span>Vào Chat</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedCustomer.avatar}
                    alt={selectedCustomer.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500"
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                      {selectedCustomer.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-md font-bold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                        Kênh: {selectedCustomer.channel}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ID: {selectedCustomer.channelUserId}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contact Information */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 space-y-2.5 text-xs">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Thông Tin Liên Lạc
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Số điện thoại:</span>
                  <strong className="text-slate-900 dark:text-slate-100">{selectedCustomer.phone || 'Chưa cập nhật'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email:</span>
                  <strong className="text-slate-900 dark:text-slate-100">{selectedCustomer.email || 'Chưa cập nhật'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Địa chỉ:</span>
                  <span className="text-slate-700 dark:text-slate-300">{selectedCustomer.address || 'Việt Nam'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tổng chi tiêu:</span>
                  <span className="text-emerald-600 font-bold">{selectedCustomer.totalSpent || '0 ₫'}</span>
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Thẻ Phân Loại (Tags)</span>
                  </h4>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(selectedCustomer.tags || []).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-400 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Thêm nhãn mới..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Thêm
                  </button>
                </div>
              </div>

              {/* Notes Section */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ghi Chú CSKH</span>
                  </h4>
                </div>

                <div className="space-y-1.5">
                  {(selectedCustomer.notes || []).map((note, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/50 text-slate-700 dark:text-slate-300 text-xs"
                    >
                      • {note}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Nhập ghi chú quan trọng..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors"
                  >
                    Lưu
                  </button>
                </div>
              </div>

              {/* Multi-channel merge action (Item 27) */}
              <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Đồng Bộ Danh Tính Đa Kênh (Identity Merge)</span>
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Khi một khách hàng nhắn từ cả Facebook và Zalo, gộp hồ sơ để gom toàn bộ lịch sử hội thoại về một khách hàng duy nhất.
                </p>
                <button
                  onClick={() => setMergeModalOpen(true)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  Hợp nhất với hồ sơ kênh khác
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  navigate('/dashboard/inbox');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Mở Hội Thoại Trong Hộp Thư
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-channel Merge Modal */}
      {mergeModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Hợp Nhất Danh Tính Khách Hàng Đa Kênh</span>
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Hồ sơ chính: <strong className="text-indigo-600">{selectedCustomer.name}</strong> ({selectedCustomer.channel}).
              Chọn hồ sơ kênh phụ để đồng bộ lịch sử, tags và đơn hàng vào hồ sơ này.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Chọn người dùng từ kênh khác để gộp:
              </label>
              <select
                value={mergeSecondaryId}
                onChange={(e) => setMergeSecondaryId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Chọn khách hàng cần gộp --</option>
                {customers
                  .filter((c) => c.id !== selectedCustomer.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.channel.toUpperCase()}] {c.name} - ID: {c.channelUserId} {c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setMergeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                onClick={handleMerge}
                disabled={!mergeSecondaryId}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-colors"
              >
                Xác Nhận Hợp Nhất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
