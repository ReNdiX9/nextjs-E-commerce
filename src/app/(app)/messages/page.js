"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, User, Clock, Package } from 'lucide-react';
import Link from 'next/link';

export default function MessagesPage() {
  const { user, isLoaded } = useUser();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) {
      setLoading(false);
      return;
    }

    // Get all messages where current user is either sender or recipient
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));

      // Group messages by conversation (sender-recipient pairs)
      const conversationMap = new Map();

      messagesData.forEach(message => {
        if (message.senderId === user.id || message.recipientId === user.id) {
          // Create a conversation key
          const otherUserId = message.senderId === user.id ? message.recipientId : message.senderId;
          const otherUserName = message.senderId === user.id ? message.recipientName : message.senderName;
          const conversationKey = otherUserId;

          if (!conversationMap.has(conversationKey)) {
            conversationMap.set(conversationKey, {
              otherUserId,
              otherUserName,
              lastMessage: message,
              messageCount: 0,
              unreadCount: 0
            });
          }

          const conversation = conversationMap.get(conversationKey);
          conversation.messageCount++;
          
          // Check if message is unread (sent by other user and not read)
          if (message.senderId !== user.id) {
            conversation.unreadCount++;
          }

          // Keep the most recent message
          if (message.timestamp > conversation.lastMessage.timestamp) {
            conversation.lastMessage = message;
          }
        }
      });

      // Convert to array and sort by last message time
      const conversationsList = Array.from(conversationMap.values())
        .sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);

      setConversations(conversationsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isLoaded]);

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return messageTime.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">Please sign in to view messages</h1>
          <Link href="/signin">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Messages
              </h1>
              <p className="text-gray-600 text-lg">Your conversations with buyers and sellers</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading conversations...</p>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <Card className="p-12 text-center bg-white shadow-xl border-0 rounded-2xl">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Messages Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start a conversation by messaging about a product or wait for someone to message you.
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
                Browse Products
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4">
            {conversations.map((conversation) => (
              <Card 
                key={conversation.otherUserId} 
                className="p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0 rounded-2xl cursor-pointer group"
                onClick={() => {
                  window.location.href = `/chat?user=${conversation.otherUserId}`;
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                          {conversation.otherUserName}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600 font-medium">Active</span>
                        </div>
                      </div>
                      <p className="text-gray-600 truncate max-w-md mb-2 text-sm">
                        {conversation.lastMessage.text}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {conversation.messageCount} message{conversation.messageCount !== 1 ? 's' : ''}
                          </span>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(conversation.lastMessage.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/chat?user=${conversation.otherUserId}`;
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
