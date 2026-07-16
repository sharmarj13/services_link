"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CustomerLayout from "@/components/CustomerLayout";
import { FiChevronRight, FiAlertCircle } from "react-icons/fi";
import { apiFetch } from "@/lib/apiFetch";

/* ── Types ── */
type Priority = "High" | "Medium" | "Low";

interface Notice {
  id: string;
  noticeType: string;
  priority: string;
  description: string;
  workRequestId: string;
  workRequestTitle: string;
  siteName: string;
  createdAt: string;
}

/* ── Priority badge styles ── */
const PRIORITY_STYLE: Record<Priority, { bg: string; text: string }> = {
  High:   { bg: "bg-red-50 text-red-700 border-red-200", text: "text-red-700" },
  Medium: { bg: "bg-amber-50 text-amber-700 border-amber-200", text: "text-amber-700" },
  Low:    { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "text-emerald-700" },
};

export default function CustomerNoticeNotifyPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await apiFetch("/api/safety-notices");
        if (res.ok) {
          const resData = await res.json();
          setNotices(resData.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch notices:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotices();
  }, []);

  return (
    <CustomerLayout
      title="Notice & Notify"
      subtitle="Manage your Notice & Notify and track their progress"
    >
      {/* ── Main Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Red Banner */}
        <div className="bg-[#D12031] px-6 py-5">
          <h2 className="text-white text-[17px] font-bold">Notice & Notify Board</h2>
          <p className="text-white/80 text-[12px] font-medium mt-0.5">
            Active warnings, delays, and critical maintenance notices reported from on-site inspections.
          </p>
        </div>

        {/* Grid of notice cards */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D12031]" />
            </div>
          ) : notices.length === 0 ? (
            <div className="text-center py-12">
              <FiAlertCircle className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-500 font-medium text-sm">No active warnings or safety notices reported.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {notices.map((notice) => {
                const priorityKey = (notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1).toLowerCase()) as Priority;
                const badge = PRIORITY_STYLE[priorityKey] || PRIORITY_STYLE["Low"];
                return (
                  <div
                    key={notice.id}
                    className="border border-gray-200 border-l-4 border-l-[#D12031] rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-[15px] font-bold text-gray-900 leading-snug">
                        {notice.workRequestTitle}
                      </h3>
                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full border shrink-0 ${badge.bg}`}
                      >
                        {priorityKey} Priority
                      </span>
                    </div>

                    {/* Subtitle */}
                    <p className="text-[12px] text-gray-500 font-medium mb-3">
                      {notice.siteName} • ID #{notice.workRequestId.substring(0, 8)}
                    </p>

                    {/* Notice Type */}
                    <div className="mb-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Notice Type</span>
                      <span className="text-[12px] font-semibold text-gray-700">{notice.noticeType}</span>
                    </div>

                    {/* View Detail */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-[11px] text-gray-400 font-medium">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/customer/notice-notify/${notice.id}`}
                        className="text-[#D12031] hover:text-[#a81828] font-bold text-[13px] flex items-center gap-0.5 transition-colors"
                      >
                        View Detail
                        <FiChevronRight size={15} strokeWidth={2.5} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
