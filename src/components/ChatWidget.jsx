"use client";

import { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db, auth, signInAnonymously, onAuthStateChanged } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

export default function ChatWidget({ isOpen: externalIsOpen, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Use external control if provided, otherwise use internal state
  const isWidgetOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const handleClose = onClose || (() => setIsOpen(false));
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Authentication setup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        // Sign in anonymously if no user
        signInAnonymously(auth).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, []);

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
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [user]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        userEmail: user.email || user.displayName || 'Anonymous',
        userId: user.uid,
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <>
      {/* Chat Toggle Button - only show when not externally controlled */}
      {!isWidgetOpen && externalIsOpen === undefined && (
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
      {isWidgetOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-80 h-96 bg-white rounded-lg shadow-xl border flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Live Chat</h3>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="text-center text-gray-500">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = user && message.userId === user.uid;
                return (
                  <div
                    key={message.id}
                    className={`p-2 rounded-lg max-w-xs ${
                      isCurrentUser
                        ? 'bg-blue-100 ml-auto text-right'
                        : 'bg-gray-100'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.userEmail} • {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input */}
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
        </div>
      )}
    </>
  );
}
