"use client";

import React from "react";
import Link from "next/link";
import CustomerLayout from "@/components/CustomerLayout";
import { FiChevronRight } from "react-icons/fi";

/* ── Types ── */
type Priority = "High" | "Medium" | "Low";

interface Notice {
  id: string;
  title: string;
  location: string;
  jobId: string;
  priority: Priority;
}

/* ── Mock Data ── */
const NOTICES: Notice[] = [
  { id: "1", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", jobId: "99402", priority: "High"   },
  { id: "2", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", jobId: "99402", priority: "Medium" },
  { id: "3", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", jobId: "99402", priority: "Low"    },
  { id: "4", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", jobId: "99402", priority: "Medium" },
  { id: "5", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", jobId: "99402", priority: "High"   },
  { id: "6", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", jobId: "99402", priority: "Low"    },
];

/* ── Priority badge styles ── */
const PRIORITY_STYLE: Record<Priority, { bg: string; text: string }> = {
  High:   { bg: "bg-[#e8f5e9]", text: "text-[#2e7d32]" },
  Medium: { bg: "bg-[#f9fbe7]", text: "text-[#827717]" },
  Low:    { bg: "bg-[#fffde7]", text: "text-[#f59e0b]" },
};

export default function CustomerNoticeNotifyPage() {
  return (
    <CustomerLayout
      title="Notice & Notify"
      subtitle="Manage your Notice & Notify and track their progress"
    >
      {/* ── Main Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Red Banner */}
        <div className="bg-[#D12031] px-6 py-5">
          <h2 className="text-white text-[17px] font-bold">Notice & Notify</h2>
          <p className="text-white/80 text-[12px] font-medium mt-0.5">
            Manage your Notice & Notify and track their progress
          </p>
        </div>

        {/* Grid of notice cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {NOTICES.map((notice) => {
              const badge = PRIORITY_STYLE[notice.priority];
              return (
                <div
                  key={notice.id}
                  className="border border-gray-200 border-l-4 border-l-[#D12031] rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-[15px] font-bold text-gray-900 leading-snug">
                      {notice.title}
                    </h3>
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full shrink-0 ${badge.bg} ${badge.text}`}
                    >
                      {notice.priority} Priority
                    </span>
                  </div>

                  {/* Subtitle */}
                  <p className="text-[12px] text-gray-500 font-medium mb-5">
                    {notice.location} • ID #{notice.jobId}
                  </p>

                  {/* View Detail */}
                  <div className="flex justify-end">
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
        </div>
      </div>
    </CustomerLayout>
  );
}
