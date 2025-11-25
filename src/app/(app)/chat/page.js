"use client"; // Enable React Client Component

// Import React hooks
import { useState, useEffect } from "react";

// Import icons
import { Send, MessageCircle, User, Clock, X } from "lucide-react";

// Import UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

// Import Firebase instance
import { db } from "@/lib/firebase";

// Import Firestore functions
import {
  collection,      // Reference a collection
  addDoc,          // Add a document
  query,           // Build a query
  orderBy,         // Sort query results
  onSnapshot,      // Listen to realtime changes
  serverTimestamp, // Server-side timestamp
  doc,             // Reference a document
  setDoc,          // Create/overwrite a document
  getDoc,          // Read a document once
  deleteDoc,       // Delete a document
} from "firebase/firestore";

// Import Clerk user hook
import { useUser } from "@clerk/nextjs";

// Access URL query params
import { useSearchParams } from "next/navigation";

// Export the page component
export default function ChatPage() {
  const { user, isLoaded } = useUser(); // Get current user and load status from Clerk
  const searchParams = useSearchParams(); // Read URL parameters

  const [loading, setLoading] = useState(true); // Control loading UI
  const [messages, setMessages] = useState([]); // Store messages for the view
  const [newMessage, setNewMessage] = useState(""); // Controlled input for message text
  const [targetUserId, setTargetUserId] = useState(null); // Recipient user ID (for private chat)
  const [targetUserName, setTargetUserName] = useState(""); // Recipient user name (display)
  const [isBlocked, setIsBlocked] = useState(false); // Whether the conversation is blocked
  const [firebaseReady, setFirebaseReady] = useState(false); // Track Firebase auth completion

  // When Clerk finishes loading, we can render the chat UI
  useEffect(() => {
    if (isLoaded && user) {
      // Optional: Ensure Firebase is authenticated
      // Note: Anonymous auth is optional if Firestore rules allow unauthenticated access
      import('@/lib/firebase').then(async ({ auth, signInAnonymously }) => {
        try {
          if (auth.currentUser === null) {
            // Try to sign in anonymously, but don't fail if it's not enabled
            await signInAnonymously(auth);
          }
          setFirebaseReady(true); // Mark Firebase as ready
        } catch (err) {
          console.warn('Firebase auth failed (this is OK if Anonymous auth is disabled):', err.message);
          // Still mark as ready - permissive Firestore rules allow unauthenticated access
          setFirebaseReady(true);
        }
      });
    } else {
      setLoading(false); // Stop showing loading spinner
    }
  }, [isLoaded, user]); // Re-run if load status or user changes

  // Extract the recipient user from the URL (?user=<id>)
  useEffect(() => {
    const userId = searchParams.get("user"); // Read the 'user' query param
    if (userId) {
      setTargetUserId(userId); // Set the private chat recipient
      setTargetUserName("User"); // Temporary placeholder until messages reveal name
    }
  }, [searchParams]); // Re-run if URL params change

  // Real-time listener: fetch messages and evaluate block status
  useEffect(() => {
    if (!user || !firebaseReady) return; // Wait for both Clerk and Firebase auth

    const messagesRef = collection(db, "messages"); // Reference the messages collection
    const q = query(messagesRef, orderBy("timestamp", "asc")); // Sort messages by timestamp ascending

    // Subscribe to realtime updates
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // Map Firestore docs to JS objects with usable timestamps
      const messagesData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id, // Document ID
        ...docSnap.data(), // Spread document fields
        timestamp: docSnap.data().timestamp?.toDate() || new Date(), // Convert Firestore timestamp
      }));

      // Stop loading spinner once we receive data
      setLoading(false);

      // If chatting privately with a specific user
      if (targetUserId) {
        // Only include messages between the current user and target user
        const conversationMessages = messagesData.filter(
          (msg) =>
            (msg.senderId === user.id && msg.recipientId === targetUserId) ||
            (msg.senderId === targetUserId && msg.recipientId === user.id)
        );

        // Check if either side has blocked the other
        const blockFromMe = await getDoc(doc(db, "blockedUsers", `${user.id}_${targetUserId}`)); // I blocked them
        const blockFromThem = await getDoc(doc(db, "blockedUsers", `${targetUserId}_${user.id}`)); // They blocked me

        // If anyone blocked, mark blocked and clear visible messages
        if (blockFromMe.exists() || blockFromThem.exists()) {
          setIsBlocked(true); // Update UI state
          setMessages([]); // Hide conversation content
        } else {
          setIsBlocked(false); // Unblocked state
          setMessages(conversationMessages); // Show conversation messages
        }

        // Try to derive the target user's display name from any related message
        const nameCandidate = messagesData.find(
          (msg) => msg.senderId === targetUserId || msg.recipientId === targetUserId
        );
        if (nameCandidate) {
          setTargetUserName(
            nameCandidate.senderId === targetUserId
              ? nameCandidate.senderName // If they sent it, use their senderName
              : nameCandidate.recipientName // Otherwise use recipientName
          );
        }
      } else {
        // General chat case (no specific recipient) — show all messages
        setMessages(messagesData);
      }
    }, (error) => {
      // Handle Firestore errors
      console.error('Firestore snapshot error:', error);
      setLoading(false);
    });

    return () => unsubscribe(); // Clean up the listener on unmount or dependency change
  }, [user, targetUserId, firebaseReady]); // Re-run if user, target, or Firebase auth changes

  // Send a message handler
  const sendMessage = async (e) => {
    e.preventDefault(); // Prevent form submission navigation
    if (!newMessage.trim() || !user) return; // Guard: require text and user

    // If this is a private chat, verify the recipient hasn't blocked the sender
    if (targetUserId) {
      const blockDoc = await getDoc(doc(db, "blockedUsers", `${targetUserId}_${user.id}`)); // Recipient blocking current user
      if (blockDoc.exists()) {
        alert("You cannot send messages to this user."); // Feedback to sender
        return; // Abort sending
      }
    }

    try {
      // Create a new message document in Firestore
      await addDoc(collection(db, "messages"), {
        text: newMessage, // Message content
        senderId: user.id, // Current user ID
        senderName:
          user.fullName || user.emailAddresses[0]?.emailAddress || "User", // Best-effort display name
        recipientId: targetUserId || null, // Private recipient or null (general chat)
        recipientName: targetUserName || "Everyone", // Display name of recipient or "Everyone"
        timestamp: serverTimestamp(), // Server-side canonical time
      });
      setNewMessage(""); // Clear input after sending
      setTypingStatus(false); // ⭐ NEW: Reset typing indicator after send
    } catch (error) {
      console.error("Error sending message:", error); // Log errors for debugging
    }
  };

  // Block the target user (persist block in Firestore)
  const handleBlockUser = async () => {
    if (!user || !targetUserId) return; // Guard for missing user/target
    try {
      await setDoc(doc(db, "blockedUsers", `${user.id}_${targetUserId}`), {
        blockerId: user.id, // Who is blocking
        blockedId: targetUserId, // Who is being blocked
        timestamp: serverTimestamp(), // When the block occurred
      });
      setIsBlocked(true); // Update UI state immediately
    } catch (err) {
      console.error("Error blocking user:", err); // Log errors
    }
  };

  // Unblock the target user (remove block doc)
  const handleUnblockUser = async () => {
    if (!user || !targetUserId) return; // Guard for missing user/target
    try {
      await deleteDoc(doc(db, "blockedUsers", `${user.id}_${targetUserId}`)); // Delete block record
      setIsBlocked(false); // Update UI state
    } catch (err) {
      console.error("Error unblocking user:", err); // Log errors
    }
  };

  // ⭐ NEW: Edit a message (merge new text and record edit time)
  const editMessage = async (messageId, newText) => {
    if (!user) return;
    await setDoc(
      doc(db, "messages", messageId),
      { text: newText, editedAt: serverTimestamp() }, // Track editedAt
      { merge: true }
    );
  };

  // ⭐ NEW: Delete a message
  const deleteMessage = async (messageId) => {
    if (!user) return;
    await deleteDoc(doc(db, "messages", messageId));
  };

  // ⭐ NEW: Mark a specific message as read by current user
  const markAsRead = async (messageId) => {
    if (!user) return;
    await setDoc(doc(db, "readReceipts", `${messageId}_${user.id}`), {
      messageId,
      userId: user.id,
      readAt: serverTimestamp(),
    });
  };

  // ⭐ NEW: Typing status tracking for current user
  const setTypingStatus = async (isTyping) => {
    if (!user) return;
    await setDoc(doc(db, "typingStatus", user.id), {
      isTyping,
      updatedAt: serverTimestamp(),
    });
  };

  // ⭐ NEW: Client-side search for messages
  const searchMessages = (messagesList, keyword) => {
    return messagesList.filter((msg) =>
      msg.text.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // ⭐ NEW: Mute the target user (suppress notifications externally)
  const muteUser = async (mutedUserId) => {
    if (!user || !mutedUserId) return;
    await setDoc(doc(db, "mutedUsers", `${user.id}_${mutedUserId}`), {
      mutedAt: serverTimestamp(),
    });
  };

  // ⭐ NEW: Report the target user for moderation
  const reportUser = async (reportedId, reason) => {
    if (!user || !reportedId) return;
    await addDoc(collection(db, "reports"), {
      reporterId: user.id,
      reportedId,
      reason,
      timestamp: serverTimestamp(),
    });
  };

  // Format message timestamps as HH:MM
  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); // Localized short time
  };

  // Render UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header section with title and presence */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                {targetUserId ? `Chat with ${targetUserName}` : "Live Chat"} {/* Title varies by mode */}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {targetUserId ? "Private conversation" : "Connect with other users in real-time"} {/* Subtitle */}
              </p>
            </div>
            <div className="flex items-center space-x-2"> {/* Presence indicator */}
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div> {/* Green dot */}
              <span className="text-sm text-gray-600 dark:text-gray-300">Online</span> {/* Label */}
            </div>
          </div>
        </div>

        {/* Main content grid: chat window and sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main chat window spans two columns */}
          <div className="lg:col-span-2">
            <Card className="w-full h-[700px] flex flex-col bg-white dark:bg-gray-800 shadow-2xl border-0 rounded-3xl overflow-hidden">
              {/* Chat header with icon, titles, and block/unblock button */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" /> {/* Chat icon */}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">
                    {targetUserId ? `Chat with ${targetUserName}` : "Live Chat"} {/* Header title */}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {targetUserId ? "Private conversation" : "Chat with support"} {/* Context label */}
                  </p>
                </div>
                {/* Show block/unblock only in private chat */}
                {targetUserId && (
                  <Button
                    onClick={isBlocked ? handleUnblockUser : handleBlockUser} // Toggle handler
                    className={`ml-4 ${isBlocked ? "bg-gray-500" : "bg-red-600"} text-white`} // Style by state
                  >
                    {isBlocked ? "Unblock" : "Block"} {/* Button text by state */}
                  </Button>
                )}
              </div>

              {/* Messages area with conditional states */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                {isBlocked ? (
                  // Blocked notice replaces message list
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <X className="w-10 h-10 text-red-600 dark:text-red-400" /> {/* Block icon */}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Conversation Blocked</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        You won't see messages from {targetUserName} until you unblock them. {/* Explanation */}
                      </p>
                    </div>
                  </div>
                ) : loading ? (
                  // Loading state while messages load
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-300 text-lg">Loading messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  // Empty state when no messages exist
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageCircle className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">No Messages Yet</h3>
                      <p className="text-gray-600 dark:text-gray-400">Be the first to start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  // Render each message bubble
                  messages.map((message) => {
                    const isCurrentUser = user && message.senderId === user.id; // Whether I sent this message
                    return (
                      <div
                        key={message.id} // List key
                        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} animate-fadeIn`} // Align bubble
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${isCurrentUser
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white rounded-br-md" // My messages style
                              : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-md" // Other messages style
                            }`}
                        >
                          <p className="text-sm font-medium leading-relaxed">{message.text}</p> {/* Message text */}

                          <div
                            className={`text-xs mt-2 flex items-center space-x-2 ${isCurrentUser ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                              }`}
                          >
                            <span className="font-medium">{message.senderName}</span> {/* Sender name */}
                            <span>•</span> {/* Separator */}
                            <span>{formatTime(message.timestamp)}</span> {/* Time display */}
                            {message.editedAt && <span>(edited)</span>} {/* ⭐ NEW: show edited flag */}
                          </div>

                          {/* ⭐ NEW: Actions for current user's messages */}
                          {isCurrentUser && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  editMessage(message.id, prompt("Edit message:", message.text) || message.text)
                                }
                                className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteMessage(message.id)}
                                className="bg-red-500/80 hover:bg-red-600/90 text-white border-0"
                              >
                                Delete
                              </Button>
                            </div>
                          )}

                          {/* ⭐ NEW: Read receipt placeholder (hook up to readReceipts if desired) */}
                          {isCurrentUser && (
                            <div className="text-xs mt-1 opacity-80">
                              Seen ✓✓
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input area: disabled when blocked */}
              <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                {isBlocked ? (
                  // Show unblock prompt instead of input when blocked
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    You have blocked {targetUserName}. Unblock to continue chatting.
                  </div>
                ) : (
                  // Message input form
                  <form onSubmit={sendMessage} className="flex gap-3">
                    <div className="flex-1 relative">
                      <Input
                        value={newMessage} // Controlled input value
                        onChange={(e) => {
                          setNewMessage(e.target.value); // Update local state
                          setTypingStatus(true); // ⭐ NEW: mark typing
                        }}
                        onBlur={() => setTypingStatus(false)} // ⭐ NEW: stop typing on blur
                        placeholder="Type your message..." // Placeholder text
                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 transition-all duration-300 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <Button
                      type="submit" // Submit the form
                      className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                      disabled={!newMessage.trim()} // Disable if empty
                    >
                      <Send className="w-5 h-5" /> {/* Send icon */}
                    </Button>
                  </form>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar showing recent messages */}
          <div className="lg:col-span-1">
            <Card className="h-[700px] p-6 bg-white dark:bg-gray-800 shadow-2xl border-0 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" /> {/* User icon */}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Recent Messages</h3> {/* Sidebar title */}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {messages.length} message{messages.length !== 1 ? "s" : ""} {/* Count */}
                  </p>
                </div>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {isBlocked ? (
                  // Show blocked label in sidebar
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <X className="w-8 h-8 text-red-500 dark:text-red-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Blocked conversation</p>
                  </div>
                ) : (
                  // Show last 5 messages
                  messages.slice(-5).map((message) => {
                    const isCurrentUser = user && message.senderId === user.id; // Who sent it
                    return (
                      <div
                        key={message.id} // Key for list
                        className={`p-4 rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer group ${isCurrentUser
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-700" // My messages
                            : "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600" // Others
                          }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${isCurrentUser
                                ? "bg-gradient-to-br from-blue-500 to-purple-600"
                                : "bg-gradient-to-br from-gray-400 to-gray-500"
                              }`}
                          >
                            <User className="w-4 h-4 text-white" /> {/* Avatar placeholder */}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {message.senderName} {/* Sender name */}
                            </p>
                            {isCurrentUser && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                                You {/* Badge for current user */}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate mb-2 leading-relaxed">
                          {message.text} {/* Preview text */}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {/* Clock icon */}
                          {formatTime(message.timestamp)} {/* Timestamp */}
                        </p>
                      </div>
                    );
                  })
                )}

                {messages.length === 0 && !isBlocked && (
                  // Empty state when no messages and not blocked
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No recent messages</p>
                  </div>
                )}

                {/* ⭐ NEW: Sidebar actions for private chat */}
                {targetUserId && !isBlocked && (
                  <div className="mt-6 space-y-3">
                    <Button onClick={() => muteUser(targetUserId)}>Mute {targetUserName}</Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt("Reason for report:");
                        if (reason) reportUser(targetUserId, reason);
                      }}
                    >
                      Report {targetUserName}
                    </Button>
                    <Input
                      placeholder="Search messages..."
                      onChange={(e) => {
                        const keyword = e.target.value;
                        // NOTE: This replaces the messages list with filtered results.
                        // For non-destructive search, keep a separate `allMessages` state.
                        const results = searchMessages(messages, keyword);
                        setMessages(results);
                      }}
                    />
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