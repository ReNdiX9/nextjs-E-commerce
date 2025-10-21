"use client";

import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, auth, signInAnonymously, onAuthStateChanged } from '@/lib/firebase';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen && user) {
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(messagesData.reverse());
      });

      return () => unsubscribe();
    }
  }, [isOpen, user]);

  const handleSignIn = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        timestamp: serverTimestamp(),
        userId: user.uid,
        userEmail: user.email || 'Anonymous',
        createdAt: new Date()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg"
            size="lg"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-80 h-96 bg-white rounded-lg shadow-xl border flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Live Chat</h3>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {!user ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-3">Sign in to start chatting</p>
                <Button onClick={handleSignIn} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Sign In
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-2 rounded-lg max-w-xs ${
                    message.userId === user.uid
                      ? 'bg-blue-100 ml-auto text-right'
                      : 'bg-gray-100'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.userEmail} • {message.createdAt?.toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          {user && (
            <form onSubmit={sendMessage} className="p-3 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}
