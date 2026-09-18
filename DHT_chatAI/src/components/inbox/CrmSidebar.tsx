import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Tag, 
  ShoppingBag, 
  History, 
  FileText, 
  Plus, 
  ExternalLink,
  ChevronRight,
  Globe,
  MessageCircle,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CrmSidebar: React.FC = () => {
  const { activeConversation } = useApp();
  const [newTag, setNewTag] = useState('');
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  React.useEffect(() => {
    if (activeConversation) {
      setNotes(activeConversation.customer.notes || []);
      setTags(activeConversation.customer.tags || []);
    }
  }, [activeConversation]);

  if (!activeConversation) return null;

  const customer = activeConversation.customer;

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    setTags([...tags, newTag.trim()]);
    setNewTag('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([newNote.trim(), ...notes]);
    setNewNote('');
  };

  return (
    <div className="w-80 lg:w-88 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-y-auto hidden xl:flex text-slate-800 dark:text-slate-200 select-none">
      {/* Customer Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 text-center relative bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20">
        <div className="relative inline-block mx-auto mb-3">
          <img
            src={customer.avatar}
            alt={customer.name}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-white dark:ring-slate-800 shadow-md"
          />
          <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
        </div>

        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          {customer.name}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Mã KH: {customer.id}</p>

        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            {customer.totalSpent !== '0 ₫' ? `Đã chi: ${customer.totalSpent}` : 'Khách hàng mới'}
          </span>
        </div>
      </div>

      {/* Customer Contact Details */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
        <h4 className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider mb-2">
          Thông Tin Liên Hệ
        </h4>

        <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
          <Phone className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span className="font-medium">{customer.phone}</span>
        </div>

        <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
          <Mail className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span className="truncate">{customer.email}</span>
        </div>

        <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
          <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span>{customer.address}</span>
        </div>
      </div>

      {/* Tags Manager */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>Phân Loại & Nhãn (Tags)</span>
          </h4>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {tags.map((t, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-1 rounded-lg font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              #{t}
            </span>
          ))}
        </div>

        <form onSubmit={handleAddTag} className="flex gap-1.5">
          <input
            type="text"
            placeholder="Thêm nhãn tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-1 px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Order History */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h4 className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider flex items-center gap-1 mb-2.5">
          <ShoppingBag className="w-3 h-3" />
          <span>Lịch Sử Đơn Hàng ({customer.orders.length})</span>
        </h4>

        {customer.orders.length === 0 ? (
          <p className="text-xs text-slate-400 py-1">Chưa có giao dịch đơn hàng.</p>
        ) : (
          <div className="space-y-2">
            {customer.orders.map((order) => (
              <div
                key={order.id}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-indigo-600 dark:text-indigo-400">{order.orderCode}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{order.total}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-1">{order.itemsSummary}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>{order.date}</span>
                  <span className="capitalize text-emerald-600 font-medium">Hoàn tất</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Omnichannel History Timeline */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h4 className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider flex items-center gap-1 mb-2.5">
          <History className="w-3 h-3" />
          <span>Lịch Sử Tương Tác Đa Kênh</span>
        </h4>

        <div className="space-y-3 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {customer.history.map((h, idx) => (
            <div key={idx} className="relative flex items-start gap-3 text-xs pl-5">
              <div className="absolute left-1 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900"></div>
              <div>
                <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                  {h.channel === 'website' && <Globe className="w-3 h-3 text-purple-500" />}
                  {h.channel === 'facebook' && <MessageCircle className="w-3 h-3 text-blue-500" />}
                  {h.channel === 'zalo' && <span className="text-[10px] font-bold text-cyan-500">Z</span>}
                  <span className="capitalize">{h.channel}</span>
                  <span className="text-[10px] text-slate-400 font-normal ml-1">({h.timestamp})</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{h.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Agent Notes */}
      <div className="p-4">
        <h4 className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider flex items-center gap-1 mb-2">
          <FileText className="w-3 h-3" />
          <span>Ghi Chú Nội Bộ CSKH</span>
        </h4>

        <form onSubmit={handleAddNote} className="mb-3 space-y-1.5">
          <textarea
            rows={2}
            placeholder="Thêm lưu ý đặc biệt cho khách hàng..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="w-full py-1.5 bg-slate-900 dark:bg-slate-100 hover:opacity-90 text-white dark:text-slate-900 rounded-lg text-xs font-semibold transition-opacity"
          >
            Lưu ghi chú
          </button>
        </form>

        <div className="space-y-2">
          {notes.map((note, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs"
            >
              <p>{note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
