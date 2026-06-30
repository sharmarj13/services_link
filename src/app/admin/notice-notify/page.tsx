"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiChevronRight, FiSearch, FiBookOpen } from "react-icons/fi";
import AdminLayout from "@/components/AdminLayout";

type Priority = "High" | "Medium" | "Low";

interface Notice {
  id: string;
  title: string;
  location: string;
  jobId: string;
  priority: Priority;
  senderType: "Customer" | "Technician";
  senderName: string;
  status: "Pending" | "Approved" | "Rejected";
}

const NOTICES: Notice[] = [
  { id: "1", title: "HVAC Compressor Overheating", location: "Facility Area 4B", jobId: "99402", priority: "High", senderType: "Technician", senderName: "John Doe", status: "Pending" },
  { id: "2", title: "Water Leak Restroom Lobby", location: "Main Office Suite 12", jobId: "99403", priority: "Medium", senderType: "Customer", senderName: "Maurice Maldonado", status: "Pending" },
  { id: "3", title: "Flickering Overhead Bulbs", location: "Lobby Corridor A", jobId: "99411", priority: "Low", senderType: "Customer", senderName: "Maurice Maldonado", status: "Approved" },
  { id: "4", title: "Corridor Door Lock Broken", location: "Warehouse North Exit", jobId: "99415", priority: "Medium", senderType: "Technician", senderName: "Alex Mercer", status: "Pending" },
  { id: "5", title: "Ventilation Noise Level High", location: "Dock Loading Bay B", jobId: "99416", priority: "High", senderType: "Technician", senderName: "Alex Mercer", status: "Rejected" },
];

const PRIORITY_STYLE: Record<Priority, { bg: string; text: string; border: string }> = {
  High: { bg: "bg-red-50", text: "text-[#D12031]", border: "border-red-100" },
  Medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
  Low: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-150" },
};

export default function AdminNoticeNotifyPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [senderFilter, setSenderFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const filteredNotices = NOTICES.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.jobId.includes(searchTerm);
    const matchesSender = senderFilter === "All" || notice.senderType === senderFilter;
    const matchesPriority = priorityFilter === "All" || notice.priority === priorityFilter;

    return matchesSearch && matchesSender && matchesPriority;
  });

  return (
    <AdminLayout
      title="Notice & Notify Board"
      subtitle="Review safety filings, technician issue notices, and customer alerts"
    >
      <div className="max-w-7xl pb-2 space-y-6">

        {/* Search & Filters */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              placeholder="Search notices, senders, IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-gray-800 outline-none focus:border-[#D12031] focus:bg-white transition-all"
            />
            <FiSearch size={14} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Sender:</span>
              <select
                value={senderFilter}
                onChange={(e) => setSenderFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-800 outline-none focus:border-[#D12031]"
              >
                <option value="All">All Senders</option>
                <option value="Customer">Customers</option>
                <option value="Technician">Technicians</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-800 outline-none focus:border-[#D12031]"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notice Board Cards */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header Bar */}
          <div className="bg-[#D12031] px-6 py-4.5 flex items-center gap-2.5 text-white">
            <FiBookOpen size={18} />
            <h2 className="text-sm font-bold tracking-wide">Notice Approvals Board</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredNotices.map((notice) => {
                const badgeStyle = PRIORITY_STYLE[notice.priority];
                return (
                  <div
                    key={notice.id}
                    className="border border-gray-200 border-l-[4px] border-l-[#D12031] rounded-xl p-5 bg-white shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-[14px] font-bold text-gray-900 leading-snug">
                          {notice.title}
                        </h3>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                        >
                          {notice.priority} Priority
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-400 font-semibold mb-4">
                        {notice.location} • Job ID #{notice.jobId}
                      </p>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-2 flex items-center justify-between">
                      <div className="text-[10px] text-gray-500 font-bold">
                        Filed by: <span className="text-[#D12031]">{notice.senderName}</span> ({notice.senderType})
                        <span className={`block mt-1 font-bold ${notice.status === "Approved"
                            ? "text-emerald-600"
                            : notice.status === "Rejected"
                              ? "text-rose-600"
                              : "text-amber-500"
                          }`}>
                          Status: {notice.status}
                        </span>
                      </div>

                      <Link
                        href={`/admin/notice-notify/${notice.id}`}
                        className="text-[#D12031] hover:text-[#a81828] font-bold text-xs flex items-center gap-0.5 transition-colors"
                      >
                        Review Notice
                        <FiChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
              {filteredNotices.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500 font-semibold text-xs">
                  No notices match the selected parameters.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
