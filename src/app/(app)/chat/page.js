"use client";

import ChatWindow from '@/components/chat/ChatWindow';
import MessageList from '@/components/chat/message-list';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Chat</h1>
          <p className="text-gray-600">Connect with other users in real-time</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Window */}
          <div className="lg:col-span-2">
            <ChatWindow />
          </div>
          
          {/* Message List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <MessageList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
