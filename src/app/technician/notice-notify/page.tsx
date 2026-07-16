"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import TechnicianLayout from "@/components/TechnicianLayout";
import { FiChevronRight, FiAlertCircle } from "react-icons/fi";
import { apiFetch } from "@/lib/apiFetch";

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

export default function NotificationsPage() {
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

  const getBadgeStyle = (priority: string) => {
    const p = priority.toLowerCase();
    if (p === "high") {
      return "bg-red-50 text-red-700 border-red-200";
    } else if (p === "medium") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  return (
    <TechnicianLayout title="Notice & Notify" subtitle="Manage your Notice & Notify and track their progress">
      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Red Title Banner */}
        <div className="bg-[#D12031] px-6 py-5">
          <h2 className="text-white text-[17px] font-bold">Notice & Notify Board</h2>
          <p className="text-white/90 text-[12px] font-medium mt-1">
            Active warnings, delays, and critical maintenance notices reported from on-site inspections.
          </p>
        </div>

        {/* Grid Container */}
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
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="border border-gray-200 border-l-[4px] border-l-[#D12031] rounded-xl bg-white shadow-sm flex flex-col hover:shadow-md transition-shadow"
                >
                  {/* Top content */}
                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-[15px] font-bold text-gray-900 leading-tight">
                        {notice.workRequestTitle}
                      </h3>
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-md border shrink-0 ${getBadgeStyle(notice.priority)}`}>
                        {notice.priority} Priority
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500 font-medium">
                      {notice.siteName} • ID #{notice.workRequestId.substring(0, 8)}
                    </p>
                    <div className="mt-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Notice Type</span>
                      <span className="text-[12px] font-semibold text-gray-700">{notice.noticeType}</span>
                    </div>
                  </div>

                  {/* Bottom actions (View Detail) */}
                  <div className="px-5 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <span className="text-[11px] text-gray-400 font-medium">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/technician/notice-notify/${notice.id}`}
                      className="text-[#D12031] hover:text-[#a81828] font-bold text-[14px] flex items-center gap-1 transition-colors group"
                    >
                      View Detail
                      <FiChevronRight className="transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TechnicianLayout>
  );
}
