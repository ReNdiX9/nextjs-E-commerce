"use client";

import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ChatWidget({ isOpen: externalIsOpen, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Use external control if provided, otherwise use internal state
  const isWidgetOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const handleClose = onClose || (() => setIsOpen(false));
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to the chat! How can I help you today?", userEmail: "Support", timestamp: new Date() }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      userEmail: "You",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
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
            {messages.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-2 rounded-lg max-w-xs ${
                    message.userEmail === "You"
                      ? 'bg-blue-100 ml-auto text-right'
                      : 'bg-gray-100'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.userEmail} • {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))
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
