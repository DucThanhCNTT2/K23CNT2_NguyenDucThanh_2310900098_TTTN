import React from 'react';
import { ConversationList } from '../../components/inbox/ConversationList';
import { ChatArea } from '../../components/inbox/ChatArea';
import { CrmSidebar } from '../../components/inbox/CrmSidebar';

export const InboxPage: React.FC = () => {
  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* 1. Omnichannel Conversation List (Website, Facebook, Zalo) */}
      <ConversationList />

      {/* 2. Live Agent Console & 1-Click Switch */}
      <ChatArea />

      {/* 3. CRM Customer Profile & Omnichannel History */}
      <CrmSidebar />
    </div>
  );
};
