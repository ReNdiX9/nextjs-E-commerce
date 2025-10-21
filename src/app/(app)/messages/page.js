"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db, auth, signInWithPopup, onAuthStateChanged, googleProvider } from '@/lib/firebase';
import { useUser } from '@clerk/nextjs';
import { MessageCircle, Users, Clock, Send, Package, ExternalLink } from 'lucide-react';

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get Clerk user
  const { user: clerkUser, isLoaded } = useUser();

  // Listen for Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
      if (user) {
        loadMessages();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Don't auto-sign in to Firebase - let user do it manually

  // Load all messages and group by product
  const loadMessages = () => {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Group messages by product
      const groupedMessages = messagesData.reduce((acc, message) => {
        const productKey = message.productId || message.productName || 'general';
        if (!acc[productKey]) {
          acc[productKey] = {
            productName: message.productName || 'General Chat',
            productId: message.productId || 'general',
            messages: [],
            lastMessage: message,
            messageCount: 0
          };
        }
        acc[productKey].messages.push(message);
        acc[productKey].messageCount++;
        
        // Update lastMessage if this message is newer
        if (!acc[productKey].lastMessage || 
            message.timestamp > acc[productKey].lastMessage.timestamp) {
          acc[productKey].lastMessage = message;
        }
        
        return acc;
      }, {});
      
      setMessages(Object.values(groupedMessages));
      setLoading(false);
    });

    return unsubscribe;
  };

  // Open chat widget for specific product
  const openChat = (productId, productName) => {
    // You can either:
    // 1. Navigate to the product page with chat open
    // 2. Open a modal with ProductChatWidget
    // 3. Set state to show the chat widget
    
    // For now, let's navigate to the product page
    window.location.href = `/product/${productId}`;
  };

  // Sign in with Google
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      alert('Google authentication failed. Please check your Firebase configuration.');
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!clerkUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-8">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Please Sign In</h2>
            <p className="text-gray-500">You need to be signed in to view your messages.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-8">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Connect to Chat</h2>
            <p className="text-gray-500 mb-4">Sign in with Google to view your messages.</p>
            <button
              onClick={handleGoogleSignIn}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
            <p className="text-sm text-gray-400 mt-4">
              Or use the chat widget in the bottom right corner to start chatting first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6" />
              <h1 className="text-xl font-bold">All Messages</h1>
            </div>
          </div>

          {/* Messages List */}
          <div className="p-6">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Messages Yet</h3>
                <p className="text-gray-500">Start chatting to see your messages here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((conversation) => (
                  <div
                    key={conversation.productId}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => openChat(conversation.productId, conversation.productName)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          {/* Product Header */}
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-800 text-lg">
                              {conversation.productName}
                            </h3>
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                              {conversation.messageCount} messages
                            </span>
                          </div>
                          
                          {/* Last Message Preview */}
                          {conversation.lastMessage ? (
                            <>
                              <div className="bg-gray-50 rounded-lg p-3 mb-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm text-gray-700">
                                    {conversation.lastMessage.senderName}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {conversation.lastMessage.senderId === firebaseUser.uid ? '(You)' : ''}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-2">
                                  {conversation.lastMessage.text}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(conversation.lastMessage.timestamp)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Send className="w-3 h-3" />
                                  {formatDate(conversation.lastMessage.timestamp)}
                                </div>
                                <div className="flex items-center gap-1 text-blue-600">
                                  <ExternalLink className="w-3 h-3" />
                                  Click to continue chat
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="bg-gray-50 rounded-lg p-3 mb-2">
                              <p className="text-gray-500 text-sm">No messages yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
