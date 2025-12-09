"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useUser } from "@clerk/nextjs";

export default function ChatWidget({
  isOpen: externalIsOpen,
  onClose,
  recipientId,
  recipientName,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(false);

  // Use external control if provided, otherwise use internal state
  const isWidgetOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const handleClose = onClose || (() => setIsOpen(false));

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Authentication setup
  useEffect(() => {
    if (isLoaded && user) {
      import("@/lib/firebase").then(async ({ auth, signInAnonymously }) => {
        try {
          if (auth.currentUser === null) {
            // Try to sign in anonymously, but don't fail if it's not enabled
            await signInAnonymously(auth);
          }
          setFirebaseReady(true);
        } catch (err) {
          console.warn(
            "Firebase auth failed (this is OK if Anonymous auth is disabled):",
            err.message
          );
          setFirebaseReady(true);
        }
      });
    }
    setLoading(false);
  }, [isLoaded, user]);

  // Real-time messages listener for private conversations
  useEffect(() => {
    if (!user || !recipientId || !firebaseReady) return;

    const messagesRef = collection(db, "messages");

    // Get all messages and filter client-side to avoid index requirements
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));

      // Filter messages to only show conversation between current user and recipient
      const conversationMessages = messagesData.filter(
        (msg) =>
          (msg.senderId === user.id && msg.recipientId === recipientId) ||
          (msg.senderId === recipientId && msg.recipientId === user.id)
      );

      setMessages(conversationMessages);
    });

    return () => unsubscribe();
  }, [user, recipientId, firebaseReady]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !recipientId) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        senderId: user.id,
        senderName:
          user.fullName || user.emailAddresses[0]?.emailAddress || "User",
        recipientId: recipientId,
        recipientName: recipientName || "Recipient",
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
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
            <h3 className="font-semibold text-white">
              Chat with {recipientName}
            </h3>
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
            {!user ? (
              <div className="text-center text-gray-900">
                <p>Please sign in to use chat</p>
                <Button
                  onClick={() => (window.location.href = "/signin")}
                  className="mt-2 bg-blue-600 hover:bg-blue-700"
                >
                  Sign In
                </Button>
              </div>
            ) : loading ? (
              <div className="text-center text-gray-500">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-black">
                {recipientName
                  ? `Start a conversation with ${recipientName}`
                  : "No messages yet. Start the conversation!"}
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = user && message.senderId === user.id;
                return (
                  <div
                    key={message.id}
                    className={`p-2 rounded-lg max-w-xs ${
                      isCurrentUser
                        ? "bg-blue-400 ml-auto text-right"
                        : "bg-gray-400 text-black"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs text-black mt-1">
                      {message.senderName} •{" "}
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-3 border-t">
            <div className="flex gap-2 ">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 text-black"
              />
              <Button
                type="submit"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
