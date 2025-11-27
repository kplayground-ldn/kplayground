"use client";

import { Notification } from "@/lib/supabase";
import { X, Check, Trash2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

type NotificationDropdownProps = {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
};

export default function NotificationDropdown({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "comment":
        return <MessageCircle size={16} className="text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border-2 border-primary z-50 max-h-[80vh] flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-3 sm:p-4 border-b-2 border-primary">
        <h3 className="font-bold text-primary text-base sm:text-lg">Notifications</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-bg-secondary rounded transition-colors"
          title="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex gap-2 p-2 border-b border-primary/20">
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-primary hover:bg-bg-secondary rounded transition-colors"
            title="Mark all as read"
          >
            <Check size={14} />
            <span>Mark all read</span>
          </button>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear all notifications?")) {
                onClearAll();
              }
            }}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-danger hover:bg-danger/10 rounded transition-colors"
            title="Clear all"
          >
            <Trash2 size={14} />
            <span>Clear all</span>
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-primary/70">
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-primary/20">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={`/posts/${notification.post_id}`}
                onClick={() => {
                  if (!notification.is_read) {
                    onMarkAsRead(notification.id);
                  }
                  onClose();
                }}
                className={`block p-3 sm:p-4 hover:bg-bg-secondary transition-colors ${
                  !notification.is_read ? "bg-accent/20" : ""
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-primary">
                      <span className="font-bold">{notification.actor_username}</span>{" "}
                      {notification.content}
                    </p>
                    <p className="text-xs text-primary/60 mt-1">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-danger rounded-full" title="Unread"></div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
