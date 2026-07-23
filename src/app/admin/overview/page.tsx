"use client";

import { apiFetch } from "@/lib/apiFetch";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiClipboard,
  FiClock,
  FiAlertCircle,
  FiArrowUpRight,
  FiTrendingUp,
  FiUsers,
  FiActivity,
  FiCalendar,
  FiChevronDown,
} from "react-icons/fi";
import AdminLayout from "@/components/AdminLayout";
import { API_BASE_URL } from "@/config";

function formatTimeAgo(dateString?: string) {
  if (!dateString) return "Recently";
  const now = new Date();
  const past = new Date(dateString);
  const diffInMs = now.getTime() - past.getTime();
  if (isNaN(diffInMs)) return "Recently";
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  if (diffInMins < 1) return "Just now";
  if (diffInMins < 60) return `${diffInMins} mins ago`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours} hrs ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}

function getCurrentRangeText(scope: string) {
  const now = new Date();
  if (scope === "All Time") return "Lifetime Activity";
  if (scope === "This Month") {
    return now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  if (scope === "This Week") {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startStr = startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endStr = endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `Current Week (${startStr} - ${endStr})`;
  }
  return scope;
}

export default function AdminOverviewPage() {
  const [timeScope, setTimeScope] = useState("This Month");
  const [hoveredPie, setHoveredPie] = useState<number | null>(null);
  const [hoveredLinePoint, setHoveredLinePoint] = useState<number | null>(null);

  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/admin/dashboard/stats?scope=${encodeURIComponent(timeScope)}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setStatsData(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [timeScope]);

  // Dynamic stats
  const stats = statsData ? {
    total: statsData.total,
    active: statsData.active,
    techs: statsData.techs,
    pending: statsData.pending
  } : { total: 0, active: 0, techs: 0, pending: 0 };

  // Data for Line Chart: Weekly request trend
  const rawLineData = statsData?.weeklyTrend?.length > 0 
    ? statsData.weeklyTrend 
    : [
        { label: "Mon", val: 0 }, { label: "Tue", val: 0 }, { label: "Wed", val: 0 },
        { label: "Thu", val: 0 }, { label: "Fri", val: 0 }, { label: "Sat", val: 0 }, { label: "Sun", val: 0 }
      ];

  const yAxisMax = Math.max(...rawLineData.map((d: any) => Number(d.val)), 10);
  const lineData = rawLineData.map((d: any, i: number) => ({
    label: d.label,
    val: Number(d.val),
    x: 40 + i * (360 / Math.max(rawLineData.length - 1, 1)), // spread evenly across 400 width
    y: 170 - (Number(d.val) / yAxisMax) * 130,
  }));

  // Data for Donut Chart: Request status distribution
  const statusColors: Record<string, string> = {
    'completed': '#10B981', 'in_progress': '#D12031', 'pending': '#F59E0B', 'cancelled': '#6B7280'
  };
  const rawPieData = statsData?.statusDist || [];
  const totalPieVal = rawPieData.reduce((acc: number, d: any) => acc + Number(d.val), 0) || 1;
  let currentOffset = 0;
  
  const pieData = rawPieData.length > 0 ? rawPieData.map((d: any) => {
    const percent = Math.round((Number(d.val) / totalPieVal) * 100);
    const dasharray = `${percent} ${100 - percent}`;
    const dashoffset = -currentOffset;
    currentOffset += percent;
    return {
      label: d.label.charAt(0).toUpperCase() + d.label.slice(1).replace('_', ' '),
      val: Number(d.val),
      color: statusColors[d.label] || '#9CA3AF',
      percent,
      dasharray,
      dashoffset
    };
  }) : [{ label: "No Data", val: 0, color: "#e5e7eb", percent: 100, dasharray: "100 0", dashoffset: 0 }];

  // Data for Bar Chart: Requests by department
  const barData = statsData?.departments?.length > 0 
    ? statsData.departments.map((d: any) => ({ label: d.label, val: Number(d.val) }))
    : [{ label: "General", val: 0 }];

  const maxBarVal = Math.max(...barData.map((d: any) => d.val), 1);

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Comprehensive dashboard and real-time operations overview"
    >
      <div className="max-w-7xl pb-2 space-y-8 animate-[fadeIn_0.3s_ease]">

        {/* 📅 Date/Time Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#D12031]/10 rounded-lg text-[#D12031]">
              <FiCalendar size={18} />
            </span>
            <div>
              <div className="text-xs text-gray-500 font-semibold">Current Overview Range</div>
              <div className="text-sm font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
                {getCurrentRangeText(timeScope)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const url = `${API_BASE_URL}/api/admin/export?type=csv`;
                window.open(url, "_blank");
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors border border-gray-200 shadow-sm"
            >
              <FiClipboard size={16} /> Export CSV
            </button>
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
        </div>

        {/* 📊 Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Requests */}
          <div className="bg-white rounded-2xl border border-gray-200 border-b-[4px] border-b-blue-600 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[13px] font-bold text-gray-500">Total Work Requests</span>
                {loading ? (
                  <div className="h-9 w-16 bg-gray-200 rounded-lg animate-pulse mt-2" />
                ) : (
                  <div className="text-[32px] font-black text-gray-900 leading-tight mt-2">
                    {stats.total}
                  </div>
                )}
              </div>
              <span className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <FiClipboard size={18} />
              </span>
            </div>
            <div className="flex items-center gap-1 mt-4 text-[11px] text-gray-500 font-semibold">
              <FiTrendingUp className="text-blue-600" />
              <span>Real-time overall requests</span>
            </div>
          </div>

          {/* Card 2: Active */}
          <div className="bg-white rounded-2xl border border-gray-200 border-b-[4px] border-b-[#D12031] p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[13px] font-bold text-gray-500">Active</span>
                {loading ? (
                  <div className="h-9 w-16 bg-gray-200 rounded-lg animate-pulse mt-2" />
                ) : (
                  <div className="text-[32px] font-black text-gray-900 leading-tight mt-2">
                    {stats.active}
                  </div>
                )}
              </div>
              <span className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-[#D12031] shrink-0">
                <FiClock size={18} />
              </span>
            </div>
            <div className="flex items-center gap-1 mt-4 text-[11px] text-gray-500 font-semibold">
              <FiActivity className="text-[#D12031]" />
              <span>Current active operations</span>
            </div>
          </div>

          {/* Card 3: Technicians Online */}
          <div className="bg-white rounded-2xl border border-gray-200 border-b-[4px] border-b-emerald-600 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[13px] font-bold text-gray-500">Technicians</span>
                {loading ? (
                  <div className="h-9 w-16 bg-gray-200 rounded-lg animate-pulse mt-2" />
                ) : (
                  <div className="text-[32px] font-black text-gray-900 leading-tight mt-2">
                    {stats.techs}
                  </div>
                )}
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
                {loading ? (
                  <div className="h-9 w-16 bg-gray-200 rounded-lg animate-pulse mt-2" />
                ) : (
                  <div className="text-[32px] font-black text-gray-900 leading-tight mt-2">
                    {String(stats.pending).padStart(2, "0")}
                  </div>
                )}
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
                <text x="30" y="44" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end">{yAxisMax}</text>
                <text x="30" y="94" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end">{Math.round(yAxisMax * 0.66)}</text>
                <text x="30" y="144" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end">{Math.round(yAxisMax * 0.33)}</text>
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
                  d={`M ${lineData[0].x} 170 L ${lineData.map((d: any) => `${d.x} ${d.y}`).join(" L ")} L ${lineData[lineData.length - 1].x} 170 Z`}
                  fill="url(#areaGradient)"
                />

                {/* Path Line */}
                <path
                  d={lineData.map((d: any, i: number) => `${i === 0 ? "M" : "L"} ${d.x} ${d.y}`).join(" ")}
                  fill="none"
                  stroke="#D12031"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points & Value Labels (Always visible without hover) */}
                {lineData.map((d: any, i: number) => (
                  <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredLinePoint(i)} onMouseLeave={() => setHoveredLinePoint(null)}>
                    {/* Always visible count label above data point */}
                    <text
                      x={d.x}
                      y={d.y - 9}
                      fill="#D12031"
                      fontSize="9.5"
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      {d.val}
                    </text>

                    {/* Pulsing Outer Circle on Hover */}
                    <circle
                      cx={d.x}
                      cy={d.y}
                      r={hoveredLinePoint === i ? 9 : 0}
                      fill="#D12031"
                      opacity="0.25"
                      className="transition-all duration-200"
                    />
                    {/* Solid Inner Circle */}
                    <circle
                      cx={d.x}
                      cy={d.y}
                      r={hoveredLinePoint === i ? 4.5 : 3.5}
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
                {lineData.map((d: any, i: number) => (
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

                {/* Dynamic Segments */}
                {pieData.map((p: any, idx: number) => (
                  <circle
                    key={idx}
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="transparent"
                    stroke={p.color}
                    strokeWidth={hoveredPie === idx ? "5.5" : "4.5"}
                    strokeDasharray={p.dasharray}
                    strokeDashoffset={p.dashoffset}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredPie(idx)}
                    onMouseLeave={() => setHoveredPie(null)}
                  />
                ))}
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
              {pieData.map((p: any, idx: number) => (
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
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="space-y-2 animate-pulse">
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 rounded w-24" />
                      <div className="h-3 bg-gray-200 rounded w-16" />
                    </div>
                    <div className="h-4.5 bg-gray-200 rounded-lg w-full" />
                  </div>
                ))
              ) : (
                barData.map((b: any, idx: number) => {
                  const percent = (b.val / maxBarVal) * 100;
                  return (
                    <div
                      key={idx}
                      className="space-y-1.5 cursor-pointer group"
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
                })
              )}
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
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="p-4.5 flex gap-3 animate-pulse">
                    <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                ))
              ) : (
                ((statsData?.recentActivities && statsData.recentActivities.length > 0) 
                  ? statsData.recentActivities.map((act: any) => ({
                      text: act.text,
                      time: formatTimeAgo(act.createdAt),
                      role: act.role || "admin"
                    }))
                  : [
                      { text: "No recent activity log recorded yet", time: "Just now", role: "admin" }
                    ]
                ).map((item: any, idx: number) => (
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
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
