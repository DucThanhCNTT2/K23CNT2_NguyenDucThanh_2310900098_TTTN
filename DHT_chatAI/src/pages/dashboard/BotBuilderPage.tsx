import React, { useState } from 'react';
import { 
  Bot, 
  Plus, 
  Play, 
  Save, 
  Sliders, 
  Sparkles, 
  ArrowRight, 
  MessageSquare, 
  HelpCircle, 
  GitBranch, 
  UserCheck, 
  LayoutGrid, 
  Trash2, 
  Move,
  CheckCircle2
} from 'lucide-react';
import { initialBotNodes } from '../../mock/data';
import { BotNode } from '../../types';

export const BotBuilderPage: React.FC = () => {
  const [nodes, setNodes] = useState<BotNode[]>(initialBotNodes);
  const [activeTab, setActiveTab] = useState<'flow' | 'persona'>('flow');
  const [selectedNode, setSelectedNode] = useState<BotNode | null>(nodes[0]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Bot Persona Settings
  const [botConfig, setBotConfig] = useState({
    botName: 'DHT AI Assistant',
    personaRole: 'Chuyên viên tư vấn & Chăm sóc khách hàng tự động',
    tone: 'friendly', // friendly, professional, formal
    temperature: 0.3,
    systemPrompt: `Bạn là trợ lý ảo thông minh của DHT AI Solution Corp. Nhiệm vụ của bạn là tư vấn các gói giải pháp AI Đa kênh cho doanh nghiệp trên Website, Facebook và Zalo OA. Hãy luôn nhiệt tình, lễ phép, báo giá chính xác và sẵn sàng chuyển máy cho tư vấn viên CSKH khi khách hàng có yêu cầu chuyên sâu.`
  });

  const handleAddNode = (type: BotNode['type']) => {
    const newNode: BotNode = {
      id: 'node_' + Date.now(),
      type,
      title: type === 'message' ? 'Gửi tin nhắn mới' : (type === 'question' ? 'Hỏi thông tin khách' : 'Hành động mới'),
      content: 'Nội dung phản hồi hoặc điều kiện xử lý của Bot...',
      position: { x: 300 + Math.random() * 200, y: 150 + Math.random() * 100 }
    };
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode);
  };

  const handleDeleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    if (selectedNode?.id === id) setSelectedNode(null);
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <div className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Trình Dựng Kịch Bản & Cấu Hình Bot AI</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                Đang Kích Hoạt
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Thiết lập luồng hội thoại thông minh tự động hoá chăm sóc khách hàng 24/7
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tabs switch */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('flow')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'flow' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              Luồng Kịch Bản (Visual Flow)
            </button>
            <button
              onClick={() => setActiveTab('persona')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'persona' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              Tính Cách & Prompt AI
            </button>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Đã lưu thành công!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu & Áp Dụng</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab: Visual Flow Canvas */}
      {activeTab === 'flow' && (
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Flow Tool Palette */}
          <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between hidden md:flex">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Thêm Khối Xử Lý (Nodes)
              </h4>

              <div className="space-y-2">
                <button
                  onClick={() => handleAddNode('message')}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-slate-900 dark:text-slate-100">Gửi Tin Nhắn</span>
                    <span className="text-[10px] text-slate-400 font-normal">Text hoặc hình ảnh</span>
                  </div>
                </button>

                <button
                  onClick={() => handleAddNode('condition')}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-slate-900 dark:text-slate-100">Điều Kiện Phân Nhánh</span>
                    <span className="text-[10px] text-slate-400 font-normal">Phân loại từ khóa ý định</span>
                  </div>
                </button>

                <button
                  onClick={() => handleAddNode('card_carousel')}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-950 text-pink-600 flex items-center justify-center">
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-slate-900 dark:text-slate-100">Carousel Thẻ Sản Phẩm</span>
                    <span className="text-[10px] text-slate-400 font-normal">Báo giá, danh mục</span>
                  </div>
                </button>

                <button
                  onClick={() => handleAddNode('agent_transfer')}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-slate-900 dark:text-slate-100">Chuyển Tư Vấn Viên</span>
                    <span className="text-[10px] text-slate-400 font-normal">Bàn giao cho CSKH</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-300 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Mẹo Kịch Bản
              </span>
              <p className="text-[11px] leading-relaxed">
                Kéo thả các node và kết nối theo luồng từ Trigger (bắt đầu) tới Phản hồi để hoàn thiện hành trình khách hàng.
              </p>
            </div>
          </div>

          {/* Interactive Flow Canvas Area */}
          <div className="flex-1 bg-slate-100/70 dark:bg-slate-950/80 p-6 overflow-auto relative bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] bg-[size:16px_16px]">
            <div className="min-w-[1200px] min-h-[600px] relative">
              {/* Connected Lines Visual Representation */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <path d="M 280 180 C 330 180, 330 180, 380 180" stroke="url(#lineGrad)" strokeWidth="3" fill="none" strokeDasharray="6,4" />
                <path d="M 610 180 C 660 180, 660 180, 720 180" stroke="url(#lineGrad)" strokeWidth="3" fill="none" />
                <path d="M 950 160 C 1000 160, 1000 110, 1040 110" stroke="#10b981" strokeWidth="2.5" fill="none" />
                <path d="M 950 200 C 1000 200, 1000 280, 1040 280" stroke="#ec4899" strokeWidth="2.5" fill="none" />
              </svg>

              {/* Node Cards on Canvas */}
              {nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;

                let badgeColor = 'bg-indigo-100 text-indigo-700';
                if (node.type === 'trigger') badgeColor = 'bg-amber-100 text-amber-700';
                if (node.type === 'condition') badgeColor = 'bg-purple-100 text-purple-700';
                if (node.type === 'agent_transfer') badgeColor = 'bg-emerald-100 text-emerald-700';
                if (node.type === 'card_carousel') badgeColor = 'bg-pink-100 text-pink-700';

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    style={{ left: `${node.position.x}px`, top: `${node.position.y}px` }}
                    className={`absolute w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border transition-all cursor-pointer z-10 ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/30 scale-102'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeColor}`}>
                        {node.type}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(node.id);
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-3.5 space-y-1.5">
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {node.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {node.content}
                      </p>
                    </div>

                    <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex items-center justify-between text-[11px] text-slate-400">
                      <span>Đầu ra tiếp theo</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Node Inspector / Editor Panel */}
          {selectedNode && (
            <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-5 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Cấu Hình Khối Xử Lý
                </h4>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                  {selectedNode.id}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu Đề Khối
                </label>
                <input
                  type="text"
                  value={selectedNode.title}
                  onChange={(e) => {
                    const updated = { ...selectedNode, title: e.target.value };
                    setSelectedNode(updated);
                    setNodes(nodes.map(n => n.id === updated.id ? updated : n));
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nội Dung Tin Nhắn / Điều Kiện
                </label>
                <textarea
                  rows={4}
                  value={selectedNode.content || ''}
                  onChange={(e) => {
                    const updated = { ...selectedNode, content: e.target.value };
                    setSelectedNode(updated);
                    setNodes(nodes.map(n => n.id === updated.id ? updated : n));
                  }}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Kênh Áp Dụng:
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="px-2 py-1 rounded-md bg-purple-100 text-purple-700 font-medium">Website Widget</span>
                  <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 font-medium">Facebook Messenger</span>
                  <span className="px-2 py-1 rounded-md bg-cyan-100 text-cyan-700 font-medium">Zalo OA</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Persona & AI Configuration */}
      {activeTab === 'persona' && (
        <div className="flex-1 p-6 sm:p-10 max-w-4xl mx-auto overflow-y-auto w-full space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Thiết Lập Tính Cách & Chỉ Dẫn AI (Persona Prompt)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tên Định Danh Của Bot
                </label>
                <input
                  type="text"
                  value={botConfig.botName}
                  onChange={(e) => setBotConfig({ ...botConfig, botName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Giọng Điệu Giao Tiếp (Tone of Voice)
                </label>
                <select
                  value={botConfig.tone}
                  onChange={(e) => setBotConfig({ ...botConfig, tone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="friendly">Thân thiện, niềm nở và chu đáo (Đề xuất)</option>
                  <option value="professional">Chuyên nghiệp, ngắn gọn, chuẩn mực B2B</option>
                  <option value="humorous">Hài hước, năng động cho giới trẻ</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Độ Sáng Tạo AI (Temperature): <strong className="text-indigo-600">{botConfig.temperature}</strong>
                </label>
                <span className="text-[11px] text-slate-400">
                  {botConfig.temperature < 0.4 ? 'Chính xác cao theo dữ liệu' : 'Sáng tạo linh hoạt'}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={botConfig.temperature}
                onChange={(e) => setBotConfig({ ...botConfig, temperature: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                System Prompt (Chỉ dẫn hệ thống cốt lõi)
              </label>
              <textarea
                rows={5}
                value={botConfig.systemPrompt}
                onChange={(e) => setBotConfig({ ...botConfig, systemPrompt: e.target.value })}
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-mono resize-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
