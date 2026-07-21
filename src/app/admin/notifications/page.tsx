"use client";

import React, { useState, useEffect } from "react";
import { FiTool, FiCheck, FiAlertCircle, FiBell } from "react-icons/fi";
import AdminLayout from "@/components/AdminLayout";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const [unreadNotifs, setUnreadNotifs] = useState<NotificationItem[]>([]);
  const [readNotifs, setReadNotifs] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data: NotificationItem[] = await res.json();
        setUnreadNotifs(data.filter((n) => !n.isRead));
        setReadNotifs(data.filter((n) => n.isRead));
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}/read`, { method: "PUT" });
      if (res.ok) {
        const notif = unreadNotifs.find((n) => n.id === id);
        if (notif) {
          setUnreadNotifs((prev) => prev.filter((n) => n.id !== id));
          setReadNotifs((prev) => [{ ...notif, isRead: true }, ...prev]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/admin/notifications/mark-all-read", { method: "POST" });
      if (res.ok) {
        setReadNotifs((prev) => [
          ...unreadNotifs.map(n => ({ ...n, isRead: true })), 
          ...prev
        ]);
        setUnreadNotifs([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "assigned":
        return <FiTool className="text-blue-500" size={20} />;
      case "completed":
        return <FiCheck className="text-emerald-500" size={22} strokeWidth={3} />;
      case "notice":
        return <FiAlertCircle className="text-amber-500" size={20} />;
      default:
        return <FiBell className="text-gray-400" size={20} />;
    }
  };

  return (
    <AdminLayout
      title="System Notifications"
      subtitle="Track real-time activities, alerts, and pending notice filings"
    >
      <div className="max-w-7xl pb-2 space-y-6">

        {/* Header toolbar */}
        {unreadNotifs.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={markAllAsRead}
              className="text-[#D12031] hover:text-[#b91c2c] text-xs font-bold transition-colors cursor-pointer border-none bg-transparent"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Unread Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span>Unread Alerts</span>
            {unreadNotifs.length > 0 && (
              <span className="bg-[#D12031] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {unreadNotifs.length}
              </span>
            )}
          </h3>

          <div className="space-y-3">
            {unreadNotifs.length === 0 && !loading && (
              <div className="p-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100">
                  <FiCheck className="text-emerald-500" size={20} />
                </div>
                <p className="text-[13px] text-gray-500 font-medium">You're all caught up!</p>
              </div>
            )}
            
            {loading && (
              <div className="p-8 text-center flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D12031]"></div>
              </div>
            )}

            {unreadNotifs.map((notif) => (
              <div
                key={notif.id}
                className="group flex gap-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md hover:border-red-200 cursor-pointer"
                onClick={() => markAsRead(notif.id)}
              >
                <div className="shrink-0 mt-1">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <h3 className="text-[14px] font-bold text-gray-900 leading-snug">
                      {notif.title}
                    </h3>
                    <span className="text-[11px] text-gray-400 font-semibold shrink-0 whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Read Section */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-bold text-gray-950">Cleared Notifications</h3>

          <div className="space-y-3">
            {readNotifs.length === 0 && !loading && (
              <div className="p-8 text-center text-[13px] text-gray-400 font-medium border-t border-gray-100">
                No past notifications
              </div>
            )}

            {readNotifs.map((notif) => (
              <div
                key={notif.id}
                className="flex gap-4 p-5 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <div className="shrink-0 mt-1 opacity-60">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <h3 className="text-[14px] font-semibold text-gray-700 leading-snug">
                      {notif.title}
                    </h3>
                    <span className="text-[11px] text-gray-400 font-medium shrink-0 whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
