"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { IoNotifications } from "react-icons/io5";
import { useRouter } from "next/navigation";

export default function Notifications() {
  const { userId } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      setLoading(true);
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
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
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    router.push(`/products/${notification.productId}`);
    setShowDropdown(false);
  };

  if (!userId) return null;

  return (
    <div className="sticky top-4 right-4 z-50">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-text-primary hover:text-blue-600 transition cursor-pointer"
        aria-label="Notifications"
      >
        <IoNotifications size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-96 bg-card-bg border border-card-border rounded-lg shadow-xl z-50 max-h-[500px] overflow-y-auto">
            <div className="p-4 border-b border-card-border flex items-center justify-between sticky top-0 bg-card-bg z-10">
              <h3 className="font-semibold text-text-primary">Notifications</h3>
              {unreadCount > 0 && <span className="text-xs text-text-secondary">{unreadCount} unread</span>}
            </div>

            {loading && notifications.length === 0 ? (
              // Show spinner only when loading AND no notifications yet
              <div className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              // Show empty state when NOT loading and no notifications
              <div className="p-8 text-center">
                <IoNotifications size={48} className="mx-auto text-text-secondary opacity-30 mb-3" />
                <p className="text-text-secondary">No notifications yet</p>
              </div>
            ) : (
              // Show notifications list
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-card-border hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors ${
                      !notification.read ? "bg-blue-50 dark:bg-blue-950/20" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary mb-1">
                          New Offer: ${notification.offerAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-text-secondary mb-1">
                          <span className="font-medium">{notification.senderName}</span> made an offer on{" "}
                          <span className="font-medium">"{notification.productTitle}"</span>
                        </p>
                        <p className="text-xs text-text-secondary mt-2">
                          {new Date(notification.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 flex-shrink-0" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
//TODO crate delete brn and check as read, also link to a chat
