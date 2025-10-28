"use client";

import { useState, useEffect } from "react";
import { Send, MessageCircle, User, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [targetUserId, setTargetUserId] = useState(null);
  const [targetUserName, setTargetUserName] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);

  // Authentication setup
  useEffect(() => {
    if (isLoaded) setLoading(false);
  }, [isLoaded]);

  // Get target user from URL parameters
  useEffect(() => {
    const userId = searchParams.get("user");
    if (userId) {
      setTargetUserId(userId);
      setTargetUserName("User"); // fallback until we get actual name
    } else {
      setTargetUserId(null);
      setTargetUserName("");
      setIsBlocked(false);
    }
  }, [searchParams]);

  // Real-time messages listener + block check
  useEffect(() => {
    if (!user) return;

    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messagesData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        timestamp: docSnap.data().timestamp?.toDate() || new Date(),
      }));

      if (targetUserId) {
        // Filter conversation
        const conversationMessages = messagesData.filter(
          (msg) =>
            (msg.senderId === user.id && msg.recipientId === targetUserId) ||
            (msg.senderId === targetUserId && msg.recipientId === user.id)
        );

        // Check block status (either side)
        const blockFromMe = await getDoc(doc(db, "blockedUsers", `${user.id}_${targetUserId}`));
        const blockFromThem = await getDoc(doc(db, "blockedUsers", `${targetUserId}_${user.id}`));

        if (blockFromMe.exists() || blockFromThem.exists()) {
          setIsBlocked(true);
          setMessages([]);
        } else {
          setIsBlocked(false);
          setMessages(conversationMessages);
        }

        // Update target user name from any related message
        const targetMessage = messagesData.find(
          (msg) => msg.senderId === targetUserId || msg.recipientId === targetUserId
        );
        if (targetMessage) {
          setTargetUserName(
            targetMessage.senderId === targetUserId
              ? targetMessage.senderName
              : targetMessage.recipientName
          );
        }
      } else {
        // General chat
        setIsBlocked(false);
        setMessages(messagesData);
      }
    });

    return () => unsubscribe();
  }, [user, targetUserId]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    // Prevent sending if recipient blocked me
    if (targetUserId) {
      const blockDoc = await getDoc(doc(db, "blockedUsers", `${targetUserId}_${user.id}`));
      if (blockDoc.exists()) {
        alert("You cannot send messages to this user.");
        return;
      }
    }

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        senderId: user.id,
        senderName: user.fullName || user.emailAddresses[0]?.emailAddress || "User",
        recipientId: targetUserId || null,
        recipientName: targetUserName || "Everyone",
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Block / Unblock handlers
  const handleBlockUser = async () => {
    if (!user || !targetUserId) return;
    await setDoc(doc(db, "blockedUsers", `${user.id}_${targetUserId}`), {
      blockerId: user.id,
      blockedId: targetUserId,
      timestamp: serverTimestamp(),
    });
    setIsBlocked(true);
    setMessages([]);
  };

  const handleUnblockUser = async () => {
    if (!user || !targetUserId) return;
    await deleteDoc(doc(db, "blockedUsers", `${user.id}_${targetUserId}`));
    setIsBlocked(false);
  };

  const formatTime = (timestamp) =>
    timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {targetUserId ? `Chat with ${targetUserName}` : "Live Chat"}
              </h1>
              <p className="text-gray-600 text-lg">
                {targetUserId ? "Private conversation" : "Connect with other users in real-time"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {/* Status indicator from your team */}
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Active</span>

              {/* Block/Unblock button */}
              {targetUserId && (
                <Button
                  onClick={isBlocked ? handleUnblockUser : handleBlockUser}
                  className={`ml-4 ${isBlocked ? "bg-gray-500" : "bg-red-600"} text-white`}
                >
                  {isBlocked ? "Unblock" : "Block"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Window */}
          <div className="lg:col-span-2">
            <Card className="w-full h-[700px] flex flex-col bg-white shadow-2xl border-0 rounded-3xl overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">
                    {targetUserId ? `Chat with ${targetUserName}` : "Live Chat"}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {targetUserId ? "Private conversation" : "Chat with support"}
                  </p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                {isBlocked ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <X className="w-10 h-10 text-red-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Conversation Blocked</h3>
                      <p className="text-gray-600">
                        You won’t see messages from {targetUserName} until you unblock them.
                      </p>
                    </div>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                      <p className="text-gray-600 text-lg">Loading messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageCircle className="w-10 h-10 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">No Messages Yet</h3>
                      <p className="text-gray-600">Be the first to start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isCurrentUser = user && message.senderId === user.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} animate-fadeIn`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${isCurrentUser
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md"
                              : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
                            }`}
                        >
                          <p className="text-sm font-medium leading-relaxed">{message.text}</p>
                          <div
                            className={`text-xs mt-2 flex items-center space-x-2 ${isCurrentUser ? "text-blue-100" : "text-gray-500"
                              }`}
                          >
                            <span className="font-medium">{message.senderName}</span>
                            <span>•</span>
                            <span>{formatTime(message.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="p-6 bg-white border-t border-gray-100">
                {isBlocked ? (
                  <div className="text-center text-gray-500 py-4">
                    You have blocked {targetUserName}. Unblock to continue chatting.
                  </div>
                ) : (
                  <form onSubmit={sendMessage} className="flex gap-3">
                    <div className="flex-1 relative">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition-all duration-300 bg-gray-50 focus:bg-white"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </form>
                )}
              </div>
            </Card>
          </div>

          {/* Message List Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-[700px] p-6 bg-white shadow-2xl border-0 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Recent Messages</h3>
                  <p className="text-sm text-gray-500">
                    {messages.length} message{messages.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {messages.slice(-5).map((message) => {
                  const isCurrentUser = user && message.senderId === user.id;
                  return (
                    <div
                      key={message.id}
                      className={`p-4 rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer group ${isCurrentUser
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"
                          : "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200"
                        }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${isCurrentUser
                              ? "bg-gradient-to-br from-blue-500 to-purple-600"
                              : "bg-gradient-to-br from-gray-400 to-gray-500"
                            }`}
                        >
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {message.senderName}
                          </p>
                          {isCurrentUser && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-2 leading-relaxed">
                        {message.text}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  );
                })}
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No recent messages</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}