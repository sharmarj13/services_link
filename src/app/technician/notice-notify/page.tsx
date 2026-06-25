"use client";

import React from "react";
import Link from "next/link";
import TechnicianLayout from "@/components/TechnicianLayout";
import { FiChevronRight } from "react-icons/fi";

const MOCK_NOTICES = [
  { id: "99402", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High" },
  { id: "99403", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "Medium" },
  { id: "99404", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "Low" },
  { id: "99405", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "Medium" },
  { id: "99406", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High" },
  { id: "99407", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "Low" },
];

export default function NotificationsPage() {
  const getBadgeStyle = (priority: string) => {
    switch (priority) {
      case "High":
      case "Urgent":
        return "bg-green-50 text-green-700 border-green-200";
      case "Medium":
        return "bg-green-50 text-green-600 border-green-200";
      case "Low":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    <TechnicianLayout title="Notice & Notify" subtitle="Manage your Notice & Notify and track their progress">

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Red Title Banner */}
        <div className="bg-[#D12031] px-6 py-5">
          <h2 className="text-white text-[17px] font-bold">Notice & Notify</h2>
          <p className="text-white/90 text-[12px] font-medium mt-1">
            Manage your Notice & Notify and track their progress
          </p>
        </div>

        {/* Grid Container */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {MOCK_NOTICES.map((notice, index) => (
              <div
                key={index}
                className="border border-gray-200 border-l-[4px] border-l-[#D12031] rounded-xl bg-white shadow-sm flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Top content */}
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-[15px] font-bold text-gray-900 leading-tight">
                      {notice.title}
                    </h3>
                    <span className={`text-[11px] font-bold px-3 py-1.5 rounded-md border shrink-0 ${getBadgeStyle(notice.priority)}`}>
                      {notice.priority} Priority
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-500 font-medium">
                    {notice.location} • ID #{notice.id}
                  </p>
                </div>

                {/* Bottom actions (View Detail) */}
                <div className="px-5 py-4 border-t border-gray-100 flex justify-end">
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
        </div>

      </div>

    </TechnicianLayout>
  );
}
