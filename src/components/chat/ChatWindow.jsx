"use client";
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import MessageList from './message-list';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';

export default function ChatWindow({ conversationId, otherUser, onClose }) {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content, messageType = 'text', offerData = null) => {
    if (!content.trim()) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          content,
          messageType,
          offerData
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTypingStart = () => {
    if (!isTyping) {
      setIsTyping(true);
    }
  };

  const handleTypingStop = () => {
    if (isTyping) {
      setIsTyping(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-card-bg rounded-lg">
        <div className="text-text-primary">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-card-bg rounded-lg border border-card-border">
      <ChatHeader 
        otherUser={otherUser} 
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto p-4">
        <MessageList 
          messages={messages} 
          currentUserId={user?.id}
          otherUserTyping={otherUserTyping}
        />
        <div ref={messagesEndRef} />
      </div>

      <MessageInput 
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
      />
    </div>
  );
}