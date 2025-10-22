"use client";

import { useState, useEffect } from 'react';
import { Send, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, or } from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function ChatPage() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [targetUserId, setTargetUserId] = useState(null);
  const [targetUserName, setTargetUserName] = useState('');

  // Authentication setup
  useEffect(() => {
    if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded]);

  // Get target user from URL parameters
  useEffect(() => {
    const userId = searchParams.get('user');
    if (userId) {
      setTargetUserId(userId);
      setTargetUserName('User'); // We'll get the actual name from messages
    }
  }, [searchParams]);

  // Real-time messages listener
  useEffect(() => {
    if (!user) return;

    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));

      if (targetUserId) {
        // Filter messages for specific user conversation
        const conversationMessages = messagesData.filter(msg => 
          (msg.senderId === user.id && msg.recipientId === targetUserId) ||
          (msg.senderId === targetUserId && msg.recipientId === user.id)
        );
        setMessages(conversationMessages);
        
        // Get target user name from messages
        const targetMessage = messagesData.find(msg => 
          msg.senderId === targetUserId || msg.recipientId === targetUserId
        );
        if (targetMessage) {
          setTargetUserName(targetMessage.senderId === targetUserId ? targetMessage.senderName : targetMessage.recipientName);
        }
      } else {
        // Show all messages for general chat
        setMessages(messagesData);
      }
    });

    return () => unsubscribe();
  }, [user, targetUserId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        senderId: user.id,
        senderName: user.fullName || user.emailAddresses[0]?.emailAddress || 'User',
        recipientId: targetUserId || null, // Specific user or general chat
        recipientName: targetUserName || 'Everyone',
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {targetUserId ? `Chat with ${targetUserName}` : 'Live Chat'}
          </h1>
          <p className="text-gray-600">
            {targetUserId ? 'Private conversation' : 'Connect with other users in real-time'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Window */}
          <div className="lg:col-span-2">
            <Card className="w-full h-[600px] flex flex-col">
              {/* Header */}
              <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center gap-3">
                <MessageCircle className="w-6 h-6" />
                <h2 className="text-xl font-semibold">
                  {targetUserId ? `Chat with ${targetUserName}` : 'Live Chat'}
                </h2>
                <span className="ml-auto text-sm opacity-90">
                  {targetUserId ? 'Private conversation' : 'Chat with support'}
                </span>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Messages Yet</h3>
                    <p className="text-gray-600">Be the first to start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isCurrentUser = user && message.senderId === user.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isCurrentUser
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <div className={`text-xs mt-1 ${
                            isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.senderName} • {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>
          
          {/* Message List Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">Recent Messages</h2>
                  <span className="ml-auto text-sm text-gray-500">
                    {messages.length} message{messages.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg border ${
                        message.userEmail === "You"
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {message.userEmail}
                            </span>
                            {message.userEmail === "You" && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-gray-800 mb-2">{message.text}</p>
                          <div className="text-xs text-gray-500">
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
