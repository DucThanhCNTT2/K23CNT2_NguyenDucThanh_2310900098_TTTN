import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ConversationList } from '../../components/inbox/ConversationList';
import { ChatArea } from '../../components/inbox/ChatArea';
import { CrmSidebar } from '../../components/inbox/CrmSidebar';
import { apiService } from '../../services/api';

export const InboxPage: React.FC = () => {
  const { conversations, setConversations, activeConversationId, setActiveConversationId } = useApp();

  // 1. Tự động chọn cuộc hội thoại đầu tiên khi chưa chọn hội thoại nào
  useEffect(() => {
    if (!activeConversationId && conversations && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId, setActiveConversationId]);

  // 2. Khi chọn/chuyển cuộc hội thoại -> Tự động xoá số chưa đọc (unreadCount = 0) và đồng bộ DB
  useEffect(() => {
    if (!activeConversationId) return;

    const currentConv = conversations.find((c) => c.id === activeConversationId);

    // Nếu cuộc hội thoại hiện tại đang có tin nhắn chưa đọc (> 0)
    if (currentConv && currentConv.unreadCount && currentConv.unreadCount > 0) {
      // Cập nhật giao diện thời gian thực lập tức (xoá số 1, 2...)
      setConversations((prev) =>
        prev.map((item) =>
          item.id === activeConversationId ? { ...item, unreadCount: 0 } : item
        )
      );

      // Gọi API báo cho Backend cập nhật MongoDB
      void apiService.markAsRead(activeConversationId);
    }
  }, [activeConversationId, conversations, setConversations]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Cột 1: Danh sách cuộc trò chuyện */}
      <ConversationList />

      {/* Cột 2 & 3: Khung chat và Cột CRM Khách hàng */}
      {activeConversationId ? (
        <div className="flex flex-1 h-full overflow-hidden">
          <ChatArea />
          <CrmSidebar />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
          <p className="text-sm font-medium">Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu hỗ trợ.</p>
        </div>
      )}
    </div>
  );
};