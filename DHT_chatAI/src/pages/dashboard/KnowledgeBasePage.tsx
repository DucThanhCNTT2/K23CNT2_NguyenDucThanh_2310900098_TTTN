import React, { useState } from 'react';
import { 
  Database, 
  UploadCloud, 
  FileText, 
  Globe, 
  Plus, 
  Trash2, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  RefreshCw,
  Edit2
} from 'lucide-react';
import { sampleFAQs, sampleKnowledgeDocs } from '../../mock/data';
import { FAQItem, KnowledgeDocument } from '../../types';

export const KnowledgeBasePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'docs' | 'faqs'>('docs');
  const [faqs, setFaqs] = useState<FAQItem[]>(sampleFAQs);
  const [docs, setDocs] = useState<KnowledgeDocument[]>(sampleKnowledgeDocs);
  const [search, setSearch] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isTraining, setIsTraining] = useState(false);

  // New FAQ Modal
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'Chung' });

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaq.question || !newFaq.answer) return;
    const item: FAQItem = {
      id: 'faq_' + Date.now(),
      question: newFaq.question,
      answer: newFaq.answer,
      category: newFaq.category,
      updatedAt: 'Hôm nay'
    };
    setFaqs([item, ...faqs]);
    setNewFaq({ question: '', answer: '', category: 'Chung' });
    setShowAddFaq(false);
  };

  const handleDeleteFaq = (id: string) => {
    setFaqs(faqs.filter(f => f.id !== id));
  };

  const handleTrainUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setIsTraining(true);
    setTimeout(() => {
      const newDoc: KnowledgeDocument = {
        id: 'doc_' + Date.now(),
        name: urlInput,
        size: '380 KB',
        type: 'url',
        status: 'trained',
        trainedAt: 'Vừa xong',
        chunksCount: 84
      };
      setDocs([newDoc, ...docs]);
      setUrlInput('');
      setIsTraining(false);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTraining(true);
    setTimeout(() => {
      const newDoc: KnowledgeDocument = {
        id: 'doc_' + Date.now(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.name.endsWith('.pdf') ? 'pdf' : (file.name.endsWith('.docx') ? 'docx' : 'txt'),
        status: 'trained',
        trainedAt: 'Vừa xong',
        chunksCount: Math.floor(Math.random() * 80) + 40
      };
      setDocs([newDoc, ...docs]);
      setIsTraining(false);
    }, 1500);
  };

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(search.toLowerCase()) || 
    f.answer.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <div className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Kho Dữ Liệu Huấn Luyện AI (Knowledge Base)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold">
                RAG Vector DB
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cung cấp dữ liệu doanh nghiệp để Chatbot trả lời chính xác, thông minh và không bịa đặt
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'docs' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tài Liệu & URL ({docs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'faqs' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kho Câu Hỏi FAQ ({faqs.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto max-w-6xl mx-auto w-full space-y-6">
        {/* Tab 1: Documents & Web URL Training */}
        {activeTab === 'docs' && (
          <div className="space-y-6 animate-fade-in">
            {/* Upload Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Upload Box */}
              <div className="p-6 bg-white dark:bg-slate-900 border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 rounded-2xl text-center flex flex-col items-center justify-center relative hover:border-indigo-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                  Kéo thả hoặc Nhấn để tải tài liệu lên
                </h4>
                <p className="text-xs text-slate-400">
                  Hỗ trợ định dạng PDF, DOCX, TXT (Tối đa 25MB)
                </p>
              </div>

              {/* Web URL Crawler Box */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      Huấn luyện qua Đường Dẫn Website
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Nhập link trang chính sách, sản phẩm hoặc bài viết trên website để bot tự động trích xuất.
                  </p>
                </div>

                <form onSubmit={handleTrainUrl} className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://tencongty.vn/chinh-sach"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isTraining || !urlInput.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
                  >
                    {isTraining ? 'Đang train...' : 'Huấn luyện'}
                  </button>
                </form>
              </div>
            </div>

            {/* Documents List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Tài Liệu Đã Nạp Vào Trí Nhớ AI
                </h3>
                <span className="text-xs text-slate-400">
                  Tổng cộng: <strong className="text-indigo-600">{docs.length} nguồn tri thức</strong>
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {docs.map((doc) => (
                  <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                        {doc.type === 'url' ? <Globe className="w-5 h-5 text-indigo-500" /> : <FileText className="w-5 h-5 text-blue-500" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                          {doc.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          <span>Dung lượng: {doc.size}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                            <Layers className="w-3 h-3" />
                            {doc.chunksCount} Vector Chunks
                          </span>
                          <span>•</span>
                          <span>Huấn luyện: {doc.trainedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã sẵn sàng
                      </span>
                      <button
                        onClick={() => setDocs(docs.filter(d => d.id !== doc.id))}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: FAQ Manager */}
        {activeTab === 'faqs' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi hoặc câu trả lời FAQ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={() => setShowAddFaq(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Câu Hỏi Mới</span>
              </button>
            </div>

            {/* FAQs List */}
            <div className="space-y-3">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2 hover:border-indigo-400 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-md">
                        {faq.category}
                      </span>
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {faq.question}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-2 border-l-2 border-indigo-200 dark:border-indigo-800">
                    {faq.answer}
                  </p>

                  <div className="text-[10px] text-slate-400 text-right">
                    Cập nhật: {faq.updatedAt}
                  </div>
                </div>
              ))}
            </div>

            {/* Add FAQ Modal */}
            {showAddFaq && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-scale-up">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Thêm Câu Hỏi - Trả Lời Huấn Luyện AI
                  </h3>

                  <form onSubmit={handleAddFaq} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Danh Mục
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Báo giá, Kỹ thuật, Bảo hành..."
                        value={newFaq.category}
                        onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Câu Hỏi Của Khách Hàng
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Phí cài đặt hệ thống là bao nhiêu?"
                        value={newFaq.question}
                        onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Câu Trả Lời Chuẩn Xác
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Nhập nội dung bot sẽ trả lời cho khách..."
                        value={newFaq.answer}
                        onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddFaq(false)}
                        className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700 font-semibold"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
                      >
                        Lưu vào Tri Thức AI
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
