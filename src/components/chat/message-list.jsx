"use client";
import { useEffect, useRef } from 'react';

export default function MessageList({ messages, currentUserId, otherUserTyping }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatMessage = (message) => {
    if (message.messageType === 'offer') {
      return `💰 Offer: $${message.offerData?.amount || 0}`;
    }
    return message.content;
  };

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <div
          key={message._id}
          className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.senderId === currentUserId
                ? 'bg-text-primary text-background'
                : 'bg-card-border text-text-primary'
            }`}
          >
            <div className="text-sm">
              {formatMessage(message)}
            </div>
            
            <div className={`text-xs mt-1 ${
              message.senderId === currentUserId 
                ? 'text-background/70' 
                : 'text-text-secondary'
            }`}>
              {formatTime(message.timestamp)}
              {message.messageType === 'offer' && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Offer
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      {otherUserTyping && (
        <div className="flex justify-start">
          <div className="bg-card-border text-text-primary px-4 py-2 rounded-lg">
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-xs text-text-secondary ml-2">typing...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}