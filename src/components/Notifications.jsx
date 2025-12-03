"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { IoNotifications } from "react-icons/io5";
import { IoCheckmarkDone, IoTrash } from "react-icons/io5";
import ChatWidget from "./ChatWidget";

export default function Notifications() {
  const { userId } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRecipientId, setChatRecipientId] = useState("");
  const [chatRecipientName, setChatRecipientName] = useState("");

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();

    // Poll for new notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const openChat = (senderId, senderName) => {
    setChatRecipientId(senderId);
    setChatRecipientName(senderName);
    setChatOpen(true);
  };

  if (!userId) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
        </div>
      </div>

      {notifications.length === 0 ? (
        // Empty State
        <div className="p-12 text-center bg-card-bg border border-card-border rounded-lg">
          <IoNotifications size={64} className="mx-auto text-text-secondary opacity-30 mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">No notifications yet</h3>
          <p className="text-text-secondary">When you receive offers, they'll appear here</p>
        </div>
      ) : (
        // Notifications List
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-card-bg border border-card-border rounded-lg hover:shadow-md transition-shadow ${
                !notification.read ? "ring-2 ring-blue-500/20 bg-blue-50 dark:bg-blue-950/20" : ""
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-text-primary">
                        New Offer: ${notification.offerAmount.toFixed(2)}
                      </h3>
                      {!notification.read && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">New</span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mb-3">
                      <span
                        className="font-medium text-blue-600 hover:underline cursor-pointer"
                        onClick={() => openChat(notification.senderId, notification.senderName)}
                        title="Send a message"
                      >
                        {notification.senderName}
                      </span>{" "}
                      made an offer on{" "}
                      <span className="font-medium text-text-primary">"{notification.productTitle}"</span>
                    </p>
                    <p className="text-xs text-text-secondary">
                      {new Date(notification.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification._id);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition cursor-pointer"
                        title="Mark as read"
                        aria-label="Mark as read"
                      >
                        <IoCheckmarkDone size={20} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition cursor-pointer"
                      title="Delete notification"
                      aria-label="Delete notification"
                    >
                      <IoTrash size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ChatWidget
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        recipientId={chatRecipientId}
        recipientName={chatRecipientName}
      />
    </div>
  );
}
