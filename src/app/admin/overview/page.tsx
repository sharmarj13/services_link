"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FiClipboard,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowUpRight,
  FiTrendingUp,
  FiUsers,
  FiActivity,
  FiCalendar,
  FiChevronDown,
} from "react-icons/fi";
import AdminLayout from "@/components/AdminLayout";

export default function AdminOverviewPage() {
  const [timeScope, setTimeScope] = useState("This Month");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredPie, setHoveredPie] = useState<number | null>(null);
  const [hoveredLinePoint, setHoveredLinePoint] = useState<number | null>(null);

  // Hardcoded stats based on timeScope
  const stats = {
    "All Time": { total: 412, active: 56, techs: "9", pending: 12 },
    "This Month": { total: 142, active: 24, techs: "8", pending: 5 },
    "This Week": { total: 34, active: 11, techs: "8", pending: 2 },
  }[timeScope as "All Time" | "This Month" | "This Week"] || { total: 142, active: 24, techs: "8 / 10", pending: 5 };

  // Data for Line Chart: Weekly request trend (last 7 days)
  const lineData = [
    { label: "Mon", val: 15, x: 40, y: 140 },
    { label: "Tue", val: 28, x: 100, y: 100 },
    { label: "Wed", val: 22, x: 160, y: 120 },
    { label: "Thu", val: 38, x: 220, y: 70 },
    { label: "Fri", val: 45, x: 280, y: 50 },
    { label: "Sat", val: 12, x: 340, y: 150 },
    { label: "Sun", val: 18, x: 400, y: 130 },
  ];

  // Data for Donut Chart: Request status distribution
  const pieData = [
    { label: "Completed", val: 78, color: "#10B981", percent: 55 },
    { label: "Active", val: 42, color: "#D12031", percent: 30 },
    { label: "Assigned", val: 22, color: "#F59E0B", percent: 15 },
  ];

  // Data for Bar Chart: Requests by department
  const barData = [
    { label: "Kitchen", val: 45 },
    { label: "Lobby", val: 32 },
    { label: "Restroom", val: 58 },
    { label: "Maintenance", val: 74 },
    { label: "Bedroom", val: 22 },
  ];

  const maxBarVal = Math.max(...barData.map((d) => d.val));

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Comprehensive dashboard and real-time operations overview"
    >
      <div className="max-w-7xl pb-10 space-y-8 animate-[fadeIn_0.3s_ease]">

        {/* 📅 Date/Time Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#D12031]/10 rounded-lg text-[#D12031]">
              <FiCalendar size={18} />
            </span>
            <div>
              <div className="text-xs text-gray-500 font-semibold">Current Overview Range</div>
              <div className="text-sm font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
                {timeScope === "All Time" ? "Lifetime Activity" : timeScope === "This Month" ? "June 2026" : "Current Week (June 15 - 21)"}
              </div>
            </div>
          </div>

          <div className="relative inline-block self-start sm:self-center shrink-0">
            <select
              id="select-overview-scope"
              value={timeScope}
              onChange={(e) => setTimeScope(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-xs font-semibold text-gray-800 cursor-pointer outline-none hover:bg-gray-50 transition-colors shadow-sm focus:border-[#D12031]"
            >
              <option value="This Month">This Month</option>
              <option value="This Week">This Week</option>
              <option value="All Time">All Time</option>
            </select>
            <FiChevronDown size={14} className="text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 📊 Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Requests */}
          <div className="bg-white rounded-2xl border border-gray-200 border-b-[4px] border-b-blue-600 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[13px] font-bold text-gray-500">Total Work Requests</span>
                <div className="text-[32px] font-black text-gray-900 leading-tight mt-2">
                  {stats.total}
                </div>
              </div>
              <span className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <FiClipboard size={18} />
              </span>
            </div>
            <div className="flex items-center gap-1 mt-4 text-[11px] text-emerald-600 font-bold">
              <FiTrendingUp />
              <span>+12.4% vs last period</span>
            </div>
          </div>

          {/* Card 2: Active */}
          <div className="bg-white rounded-2xl border border-gray-200 border-b-[4px] border-b-[#D12031] p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[13px] font-bold text-gray-500">Active</span>
                <div className="text-[32px] font-black text-gray-900 leading-tight mt-2">
                  {stats.active}
                </div>
              </div>
              <span className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-[#D12031] shrink-0">
                <FiClock size={18} />
              </span>
            </div>
            <div className="flex items-center gap-1 mt-4 text-[11px] text-emerald-600 font-bold">
              <FiTrendingUp />
              <span>+4.2% vs last period</span>
            </div>
          </div>

          {/* Card 3: Technicians Online */}
          <div className="bg-white rounded-2xl border border-gray-200 border-b-[4px] border-b-emerald-600 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[13px] font-bold text-gray-500">Technicians</span>
                <div className="text-[32px] font-black text-gray-900 leading-tight mt-2">
                  {stats.techs}
                </div>
              </div>
              <span className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <FiUsers size={18} />
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-[11px] text-gray-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live tracking active</span>
            </div>
          </div>

          {/* Card 4: Pending Approvals */}
          <div className="bg-white rounded-2xl border border-gray-200 border-b-[4px] border-b-amber-500 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[13px] font-bold text-gray-500">Pending Notice Reviews</span>
                <div className="text-[32px] font-black text-gray-900 leading-tight mt-2">
                  {String(stats.pending).padStart(2, "0")}
                </div>
              </div>
              <span className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                <FiAlertCircle size={18} />
              </span>
            </div>
            <Link
              href="/admin/notice-notify"
              className="flex items-center gap-0.5 mt-4 text-[11px] text-amber-600 hover:text-amber-700 font-bold transition-colors"
            >
              <span>Review notices</span>
              <FiArrowUpRight />
            </Link>
          </div>
        </div>

        {/* 📊 Charts Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Chart 1: Weekly Requests Trend (Line Chart) */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900">Weekly Request Trend</h3>
                <p className="text-[11px] text-gray-400 font-medium">Daily work requests created over last 7 days</p>
              </div>
              <FiActivity className="text-gray-400" size={18} />
            </div>

            {/* Custom Interactive SVG Line Chart */}
            <div className="relative flex-1 min-h-[220px] flex items-center justify-center">
              <svg viewBox="0 0 440 200" className="w-full h-full">
                {/* Grid Lines */}
                <line x1="40" y1="40" x2="420" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="90" x2="420" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="140" x2="420" y2="140" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="170" x2="420" y2="170" stroke="#e2e8f0" strokeWidth="1.5" />

                {/* Y Axis Labels */}
                <text x="30" y="44" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end">50</text>
                <text x="30" y="94" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end">30</text>
                <text x="30" y="144" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end">10</text>
                <text x="30" y="174" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end">0</text>

                {/* Gradient Fill under path */}
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D12031" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#D12031" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Path Area */}
                <path
                  d={`M ${lineData[0].x} 170 L ${lineData.map((d) => `${d.x} ${d.y}`).join(" L ")} L ${lineData[lineData.length - 1].x} 170 Z`}
                  fill="url(#areaGradient)"
                />

                {/* Path Line */}
                <path
                  d={lineData.map((d, i) => `${i === 0 ? "M" : "L"} ${d.x} ${d.y}`).join(" ")}
                  fill="none"
                  stroke="#D12031"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points & Interactive hover zones */}
                {lineData.map((d, i) => (
                  <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredLinePoint(i)} onMouseLeave={() => setHoveredLinePoint(null)}>
                    {/* Pulsing Outer Circle on Hover */}
                    <circle
                      cx={d.x}
                      cy={d.y}
                      r={hoveredLinePoint === i ? 10 : 0}
                      fill="#D12031"
                      opacity="0.25"
                      className="transition-all duration-200"
                    />
                    {/* Solid Inner Circle */}
                    <circle
                      cx={d.x}
                      cy={d.y}
                      r={hoveredLinePoint === i ? 5 : 4}
                      fill="#D12031"
                      stroke="#fff"
                      strokeWidth={hoveredLinePoint === i ? 2 : 1.5}
                      className="transition-all duration-200"
                    />
                    {/* Transparent hover catcher */}
                    <circle cx={d.x} cy={d.y} r="20" fill="transparent" />
                  </g>
                ))}

                {/* X Axis Labels */}
                {lineData.map((d, i) => (
                  <text key={i} x={d.x} y="192" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">
                    {d.label}
                  </text>
                ))}
              </svg>

              {/* Tooltip Overlay */}
              {hoveredLinePoint !== null && (
                <div
                  className="absolute bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg border border-slate-700 pointer-events-none transition-all duration-150"
                  style={{
                    left: `${(lineData[hoveredLinePoint].x / 440) * 100}%`,
                    top: `${(lineData[hoveredLinePoint].y / 200) * 100 - 20}%`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <div className="text-[10px] text-slate-400 font-semibold mb-0.5">{lineData[hoveredLinePoint].label} Requests</div>
                  <div className="text-sm font-black text-[#fca5a5]">{lineData[hoveredLinePoint].val} Created</div>
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Request Status Distribution (Donut Chart) */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-gray-900">Status Distribution</h3>
              <p className="text-[11px] text-gray-400 font-medium">Breakdown of requests by state</p>
            </div>

            {/* Custom Interactive Donut Chart */}
            <div className="relative flex items-center justify-center my-6 h-[150px] w-full">
              <svg width="150" height="150" viewBox="0 0 42 42" className="transform -rotate-90">
                {/* Base Circle */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4.5" />

                {/* Segments: Completed, Active, Assigned */}
                {/* Completed (55%) */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth={hoveredPie === 0 ? "5.5" : "4.5"}
                  strokeDasharray="55 45"
                  strokeDashoffset="0"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredPie(0)}
                  onMouseLeave={() => setHoveredPie(null)}
                />

                {/* Active (30%) */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#D12031"
                  strokeWidth={hoveredPie === 1 ? "5.5" : "4.5"}
                  strokeDasharray="30 70"
                  strokeDashoffset="-55"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredPie(1)}
                  onMouseLeave={() => setHoveredPie(null)}
                />

                {/* Assigned (15%) */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth={hoveredPie === 2 ? "5.5" : "4.5"}
                  strokeDasharray="15 85"
                  strokeDashoffset="-85"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredPie(2)}
                  onMouseLeave={() => setHoveredPie(null)}
                />
              </svg>

              {/* Central Text overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-[20px] font-black text-gray-900 leading-none">
                  {hoveredPie !== null ? `${pieData[hoveredPie].percent}%` : stats.total}
                </span>
                <span className="text-[10px] text-gray-500 font-semibold mt-1">
                  {hoveredPie !== null ? pieData[hoveredPie].label : "Total Jobs"}
                </span>
              </div>
            </div>

            {/* Legend checklist */}
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-700">
              {pieData.map((p, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-colors ${hoveredPie === idx ? "bg-gray-50 border-gray-200" : "border-transparent"
                    }`}
                  onMouseEnter={() => setHoveredPie(idx)}
                  onMouseLeave={() => setHoveredPie(null)}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="truncate">{p.label}</span>
                  <span className="text-gray-400 font-bold ml-auto">{p.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 📊 Bottom Row: Bar Chart & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Chart 3: Department breakdown Bar Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col">
            <div className="mb-5">
              <h3 className="text-[16px] font-bold text-gray-900">Requests by Department</h3>
              <p className="text-[11px] text-gray-400 font-medium">Activity counts across facility areas</p>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              {barData.map((b, idx) => {
                const percent = (b.val / maxBarVal) * 100;
                return (
                  <div
                    key={idx}
                    className="space-y-1.5 cursor-pointer group"
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                      <span>{b.label}</span>
                      <span className="text-gray-900 group-hover:text-[#D12031] transition-colors">{b.val} Requests</span>
                    </div>

                    <div className="h-4.5 bg-gray-100 rounded-lg overflow-hidden border border-[#D12031]/20">
                      <div
                        className="h-full bg-[#D12031] rounded-lg transition-all duration-500 ease-out origin-left group-hover:bg-[#a81828]"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feed: Recent Operations Activity Feed */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900">Recent Operations Activity</h3>
                <p className="text-[11px] text-gray-400 font-medium">Real-time action log of staff and clients</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold animate-pulse">
                Live Feed
              </span>
            </div>

            <div className="divide-y divide-gray-100 flex-1 overflow-y-auto max-h-[300px]">
              {[
                { text: "Technician John Doe started HVAC Compressor Maintenance (#99402)", time: "10 mins ago", role: "tech" },
                { text: "Customer Alice Smith created request Routine Safety Inspection (#99408)", time: "2 hrs ago", role: "cust" },
                { text: "Technician Bob Johnson marked Laundry Duct Cleaning as completed", time: "4 hrs ago", role: "tech" },
                { text: "New Business account 'CleanCorp' added by Super Admin", time: "1 day ago", role: "admin" },
                { text: "Notice 'Safety violation warning' submitted by Admin for review", time: "1 day ago", role: "admin" },
              ].map((item, idx) => (
                <div key={idx} className="p-4.5 hover:bg-gray-50/50 transition-colors flex gap-3 text-xs font-semibold text-gray-700">
                  <span className="mt-0.5 shrink-0">
                    {item.role === "tech" ? (
                      <span className="w-6 h-6 rounded-full bg-red-50 text-[#D12031] flex items-center justify-center font-black">T</span>
                    ) : item.role === "cust" ? (
                      <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black">C</span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-black">A</span>
                    )}
                  </span>
                  <div className="space-y-1">
                    <p className="text-gray-800 font-medium leading-relaxed">{item.text}</p>
                    <span className="text-[10px] text-gray-400 font-bold block">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
