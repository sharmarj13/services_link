"use client";

import React, { useState } from "react";
import { FiTool, FiCheck, FiAlertCircle, FiBell } from "react-icons/fi";
import AdminLayout from "@/components/AdminLayout";

interface NotificationItem {
  id: number;
  type: "assigned" | "completed" | "notice" | "system";
  title: string;
  description: string;
  time: string;
}

const UNREAD_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    type: "notice",
    title: "New Notice Review Required",
    description: "Technician John Doe submitted a new safety notice 'Restroom Water Spill Warning' for approval.",
    time: "2 mins ago"
  },
  {
    id: 2,
    type: "completed",
    title: "Request Marked Completed",
    description: "HVAC Compressor Maintenance at Warehouse D has been marked completed by John Doe.",
    time: "45 mins ago"
  },
  {
    id: 3,
    type: "assigned",
    title: "New Job Request Created",
    description: "Customer Maurice Maldonado created a new request 'Main Lobby Carpet Clean' for Site C.",
    time: "2 hours ago"
  }
];

const READ_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 4,
    type: "system",
    title: "System Backup Successful",
    description: "Weekly cloud backup and audit logging completed successfully.",
    time: "Yesterday"
  },
  {
    id: 5,
    type: "system",
    title: "Business Account Created",
    description: "New partner business account 'CleanCorp LLC' registered by Super Admin.",
    time: "2 days ago"
  }
];

export default function AdminNotificationsPage() {
  const [unreadNotifs, setUnreadNotifs] = useState<NotificationItem[]>(UNREAD_NOTIFICATIONS);
  const [readNotifs, setReadNotifs] = useState<NotificationItem[]>(READ_NOTIFICATIONS);

  const markAsRead = (id: number) => {
    const notif = unreadNotifs.find((n) => n.id === id);
    if (notif) {
      setUnreadNotifs((prev) => prev.filter((n) => n.id !== id));
      setReadNotifs((prev) => [notif, ...prev]);
    }
  };

  const markAllAsRead = () => {
    setReadNotifs((prev) => [...unreadNotifs, ...prev]);
    setUnreadNotifs([]);
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
            {unreadNotifs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400 text-xs font-semibold">
                No unread notifications.
              </div>
            ) : (
              unreadNotifs.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className="flex items-center gap-4 p-4.5 rounded-2xl border border-red-100 bg-red-50/10 shadow-xs transition-all hover:shadow-md cursor-pointer group"
                >
                  <div className="shrink-0 bg-white rounded-full p-2.5 shadow-xs border border-gray-150 flex items-center justify-center w-11 h-11">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13.5px] font-bold text-gray-950 truncate group-hover:text-[#D12031] transition-colors">
                      {notif.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 font-semibold leading-relaxed">
                      {notif.description}
                    </p>
                  </div>

                  <div className="shrink-0 text-[10px] font-bold text-gray-450 self-start pt-1">
                    {notif.time}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Read Section */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-bold text-gray-950">Cleared Notifications</h3>

          <div className="space-y-3">
            {readNotifs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-450 text-xs font-semibold">
                No history notifications.
              </div>
            ) : (
              readNotifs.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-center gap-4 p-4.5 rounded-2xl border border-gray-200 bg-gray-50/40 shadow-xs transition-all hover:shadow-sm"
                >
                  <div className="shrink-0 bg-white rounded-full p-2.5 shadow-xs border border-gray-150 flex items-center justify-center w-11 h-11 opacity-60">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13.5px] font-bold text-gray-900 truncate">{notif.title}</h4>
                    <p className="text-xs text-gray-450 mt-1 font-medium leading-relaxed">{notif.description}</p>
                  </div>

                  <div className="shrink-0 text-[10px] font-bold text-gray-400 self-start pt-1">
                    {notif.time}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
