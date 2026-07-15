"use client";

import React, { useState, useEffect, useCallback } from "react";
import CustomerLayout from "@/components/CustomerLayout";
import { apiFetch } from "@/lib/apiFetch";
import {
  FiTool,
  FiCheck,
  FiCheckCircle,
  FiBell,
  FiAlertCircle,
  FiInfo,
  FiRefreshCw,
} from "react-icons/fi";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  workRequestId?: string | null;
  actorId?: string | null;
  actor?: {
    firstName?: string;
    lastName?: string;
  } | null;
  workRequest?: {
    title?: string;
  } | null;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

function getNotifIcon(type: string) {
  switch (type) {
    case "work_request_assigned":
      return <FiTool className="text-blue-500" size={20} />;
    case "work_request_completed":
      return <FiCheck className="text-emerald-500" size={22} strokeWidth={3} />;
    case "work_request_started":
      return <FiRefreshCw className="text-amber-500" size={20} />;
    case "work_request_updated":
      return <FiInfo className="text-purple-500" size={20} />;
    case "notice_notify":
      return <FiAlertCircle className="text-[#D12031]" size={20} />;
    default:
      return <FiBell className="text-gray-400" size={20} />;
  }
}

export default function CustomerNotificationsListPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/notifications?limit=50");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    } catch (err) {
      console.error("Error marking notification as read:", err);
      // Revert on error
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
    }
  };

  const markAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await apiFetch("/api/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  const NotifCard = ({
    notif,
    isUnread,
  }: {
    notif: Notification;
    isUnread: boolean;
  }) => (
    <div
      onClick={() => isUnread && markAsRead(notif.id)}
      className={`flex items-start gap-4 p-4 rounded-2xl border shadow-sm transition-all hover:shadow-md ${
        isUnread
          ? "border-[#e4f7db] bg-[#f8fff4] cursor-pointer"
          : "border-gray-100 bg-[#f4f5f7] cursor-default"
      }`}
    >
      <div className="shrink-0 bg-white rounded-full p-3 shadow-sm border border-gray-100 flex items-center justify-center w-12 h-12">
        {getNotifIcon(notif.type)}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-[15px] font-bold text-gray-900 truncate">
          {notif.title}
        </h4>
        <p className="text-[13px] text-gray-600 mt-0.5 whitespace-normal break-words">
          {notif.message}
        </p>
        {notif.workRequest?.title && (
          <span className="inline-block mt-2 text-[11px] font-semibold text-[#D12031] bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
            {notif.workRequest.title}
          </span>
        )}
      </div>

      <div className="shrink-0 flex flex-col items-end gap-2">
        <span className="text-[12px] font-medium text-gray-500">
          {timeAgo(notif.createdAt)}
        </span>
        {isUnread && (
          <span className="w-2.5 h-2.5 rounded-full bg-[#D12031] shrink-0" />
        )}
      </div>
    </div>
  );

  return (
    <CustomerLayout title="Notifications" subtitle="Manage your Notifications">
      <div className="max-w-7xl pb-2">
        {/* Header Actions */}
        {unread.length > 0 && (
          <div className="flex justify-end mb-6">
            <button
              onClick={markAllAsRead}
              disabled={isMarkingAll}
              className="flex items-center gap-2 text-[13px] font-bold text-[#D12031] hover:text-[#a81828] transition-colors cursor-pointer disabled:opacity-60"
            >
              <FiCheckCircle size={16} />
              {isMarkingAll ? "Marking..." : "Mark all as read"}
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-2xl bg-gray-100"
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FiBell size={28} className="text-gray-400" />
            </div>
            <h3 className="text-[16px] font-bold text-gray-700 mb-1">
              No Notifications
            </h3>
            <p className="text-[13px] text-gray-400">
              You&apos;re all caught up! New notifications will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Unread Section */}
            <div className="mb-8">
              <h3 className="text-[18px] font-bold text-gray-900 mb-4">
                Unread{" "}
                {unread.length > 0 && (
                  <span className="ml-2 text-[13px] font-bold text-white bg-[#D12031] px-2.5 py-0.5 rounded-full">
                    {unread.length}
                  </span>
                )}
              </h3>
              <div className="space-y-3">
                {unread.length === 0 ? (
                  <p className="text-gray-500 text-[14px] italic py-4">
                    No unread notifications.
                  </p>
                ) : (
                  unread.map((notif) => (
                    <NotifCard key={notif.id} notif={notif} isUnread={true} />
                  ))
                )}
              </div>
            </div>

            {/* Read Section */}
            {read.length > 0 && (
              <div>
                <h3 className="text-[18px] font-bold text-gray-900 mb-4">
                  Read
                </h3>
                <div className="space-y-3">
                  {read.map((notif) => (
                    <NotifCard key={notif.id} notif={notif} isUnread={false} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </CustomerLayout>
  );
}
