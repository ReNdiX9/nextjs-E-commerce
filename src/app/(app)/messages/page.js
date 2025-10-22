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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Messages</h1>
          <p className="text-text-secondary">Your conversations with buyers and sellers</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading conversations...</span>
          </div>
        ) : conversations.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Messages Yet</h3>
            <p className="text-gray-600 mb-4">
              Start a conversation by messaging about a product or wait for someone to message you.
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Browse Products
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Card key={conversation.otherUserId} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-text-primary">
                          {conversation.otherUserName}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary truncate max-w-md">
                        {conversation.lastMessage.text}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          {conversation.messageCount} message{conversation.messageCount !== 1 ? 's' : ''}
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(conversation.lastMessage.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Navigate to chat with this user
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
