"use client";

import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, auth, signInWithPopup, onAuthStateChanged, googleProvider } from '@/lib/firebase';
import { useUser } from '@clerk/nextjs';
import { MessageCircle, X, Send, User, Package } from 'lucide-react';

export default function ProductChatWidget({ productName, productId, sellerName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Get Clerk user
  const { user: clerkUser, isLoaded } = useUser();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user);
      setUser(user);
      if (user) {
        // User is signed in, start listening to messages
        listenToMessages();
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to real-time messages for this product
  const listenToMessages = () => {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef, 
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter messages for this specific product
      const productMessages = messagesData.filter(msg => 
        msg.productId === productId || msg.productName === productName
      );
      setMessages(productMessages);
    });

    return unsubscribe;
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setLoading(true);
    try {
      // Get the best display name
      let displayName = 'Anonymous';
      if (user.displayName) {
        displayName = user.displayName;
      } else if (user.email) {
        displayName = user.email.split('@')[0]; // Use email username part
      } else if (user.isAnonymous) {
        displayName = 'Guest User';
      }

      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        senderName: displayName,
        senderId: user.uid,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        productName: productName,
        productId: productId,
        sellerName: sellerName
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        aria-label="Open chat"
      >
        <MessageCircle className="w-4 h-4" />
        Chat about {productName}
      </button>

      {/* Chat Widget Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-96 mx-4 flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-lg">Chat about this product</span>
                  <p className="text-sm opacity-90 font-medium">{productName}</p>
                  {sellerName && (
                    <p className="text-xs opacity-75">with {sellerName}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 flex flex-col">
              {!user ? (
                /* Authentication Section */
                <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-700">Chat about this product</h3>
                    <p className="text-sm text-gray-600 font-medium mt-1">{productName}</p>
                    {sellerName && (
                      <p className="text-xs text-gray-500 mt-1">with {sellerName}</p>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    Sign in to start chatting about this product
                  </p>
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google to Chat
                  </button>
                </div>
              ) : (
                <>
                  {/* Product Info Banner */}
                  <div className="bg-gray-50 border-b border-gray-200 p-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="w-4 h-4" />
                      <span>You're chatting about: <span className="font-semibold text-gray-800">{productName}</span></span>
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No messages yet. Start the conversation about {productName}!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg ${
                              message.senderId === user.uid
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs opacity-75">
                                {message.senderName}
                              </span>
                              <span className="text-xs opacity-75 ml-2">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Ask about ${productName}...`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
