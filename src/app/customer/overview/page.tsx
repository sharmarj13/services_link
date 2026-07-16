"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiPlus,
  FiCheck,
  FiClock,
  FiChevronDown,
  FiLayers,
  FiBookOpen,
} from "react-icons/fi";
import CustomerLayout from "@/components/CustomerLayout";
import NewRequestModal from "@/app/customer/modal/NewRequestModal";
import { API_BASE_URL } from "@/config";

interface RequestItem {
  id: string;
  title: string;
  location: string;
  priority: string;
  status: string;
  priorityStyle: string;
}

interface DeptItem {
  department: string;
  completedCleanings: number;
  totalWasteQuantity?: number;
  wasteCollected?: number;
  avgDuration?: number;
}

interface WasteItem {
  name: string;
  sub: string;
  val: string;
}

interface UserContext {
  userId: string;
  siteId: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Stepper stages
const STEP_LABELS = ["Assigned", "Started", "In-Progress", "Completed"];

export default function CustomerOverviewPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [assignedCount, setAssignedCount] = useState(0);
  const [showToast, setShowToast] = useState(false);

  // Dynamic state loaded from APIs
  const [requestsList, setRequestsList] = useState<RequestItem[]>([]);
  const [activeJob, setActiveJob] = useState<RequestItem | null>(null);
  
  // Analytics
  const [totalCleanings, setTotalCleanings] = useState(0);
  const [totalWaste, setTotalWaste] = useState("0 kg");
  const [activeDepts, setActiveDepts] = useState(0);
  const [departmentsData, setDepartmentsData] = useState<DeptItem[]>([]);
  const [wasteTypesData, setWasteTypesData] = useState<WasteItem[]>([]);
  
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all");

  // Function to load all site dashboard details
  const fetchDashboardData = async (siteId: string, filter = "all") => {
    try {
      const [statsRes, compStatsRes, requestsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/sites/${siteId}/stats`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/sites/${siteId}/comprehensive-stats?timeFilter=${filter}`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/sites/${siteId}/work-requests`, { credentials: "include" })
      ]);

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setCompletedCount(stats.completed || 0);
        setAssignedCount((stats.inProgress || 0) + (stats.pending || 0));
      }

      if (compStatsRes.ok) {
        const compStats = await compStatsRes.json();
        setTotalCleanings(compStats.timeFilterStats?.completedCleanings || compStats.totalCompletedCleanings || 0);
        setTotalWaste(`${compStats.timeFilterStats?.totalWasteQuantity || 0} kg`);
        
        const deptBreakdown = compStats.departmentBreakdown || [];
        setDepartmentsData(deptBreakdown);
        setActiveDepts(deptBreakdown.filter((d: DeptItem) => d.completedCleanings > 0).length);

        const wasteBreakdown = compStats.wasteTypeBreakdown || [];
        setWasteTypesData(wasteBreakdown.map((w: Record<string, unknown>) => ({
          name: (w.wasteType as string) || "",
          sub: `Collected in ${(w.count as number) || 0} cleanings`,
          val: `${(w.totalQuantity as number) || 0} ${(w.unit as string) || "kg"}`
        })));
      }

      if (requestsRes.ok) {
        const requestsObj = await requestsRes.json();
        const list = requestsObj.data || [];
        
        const mapped = list.map((r: Record<string, unknown>) => {
          const priority = (r.priority as string) || "";
          const status = (r.status as string) || "";
          return {
            id: r.id as string,
            title: r.title as string,
            location: (r.location as string) || "Facility Main Area",
            priority: priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : "Medium",
            status,
            priorityStyle:
              priority === "high"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : priority === "medium"
                  ? "bg-lime-50 text-lime-700 border-lime-200"
                  : "bg-amber-50 text-amber-700 border-amber-200",
          };
        });
        setRequestsList(mapped);

        // Find the active in-progress job
        const currentActive = mapped.find((r: RequestItem) => r.status === "in_progress" || r.status === "started");
        if (currentActive) {
          setActiveJob(currentActive);
        } else {
          const pendingReq = mapped.find((r: RequestItem) => r.status !== "completed");
          if (pendingReq) {
            setActiveJob(pendingReq);
          } else {
            setActiveJob(null);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard details:", err);
      setError("Failed to sync dashboard details from the server.");
    }
  };

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: "include",
        });
        if (!meResponse.ok) {
          setError("Failed to fetch user session. Please log in again.");
          setIsLoading(false);
          return;
        }
        
        const meData = await meResponse.json();
        const siteId = meData.user?.siteUser?.siteId;
        if (!siteId) {
          setError("No site assigned to this user context.");
          setIsLoading(false);
          return;
        }
        
        setUserContext({
          userId: meData.user.id,
          siteId,
          name: meData.user.firstName + " " + meData.user.lastName,
          email: meData.user.email
        });

        await fetchDashboardData(siteId);
      } catch (err) {
        console.error("Init dashboard error:", err);
        setError("Database server is offline or unreachable.");
      } finally {
        setIsLoading(false);
      }
    };

    initDashboard();
  }, []);

  const handleModalSubmit = async () => {
    if (userContext?.siteId) {
      await fetchDashboardData(userContext.siteId, timeFilter);
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  if (isLoading) {
    return (
      <CustomerLayout title="Work Overview" subtitle="Loading site dashboard...">
        <div className="max-w-7xl pb-2 space-y-10 animate-pulse mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-200/60 rounded-2xl h-[160px] w-full"></div>
            <div className="bg-gray-200/60 rounded-2xl h-[160px] w-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-200/60 rounded-xl h-[112px] w-full"></div>
            <div className="bg-gray-200/60 rounded-xl h-[112px] w-full"></div>
            <div className="bg-gray-200/60 rounded-xl h-[112px] w-full"></div>
          </div>
          <div className="bg-gray-200/60 rounded-xl h-[240px] w-full mt-8"></div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout
      title="Work Overview"
      subtitle="Track all completed and ongoing work at your site"
    >
      <div className="max-w-7xl pb-2 space-y-10">
        
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-750 text-[13px] font-semibold px-4 py-2.5 rounded-xl border border-red-100 mb-5 text-center leading-normal">
            {error}
          </div>
        )}

        {/* 📊 Completed / Assigned Request Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Completed Requests */}
          <div className="bg-white rounded-2xl border border-gray-200 border-b-[3px] border-b-[#4ade80] p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[160px]">
            <div className="flex items-start justify-between">
              <span className="text-[14px] font-bold text-gray-800">Completed Requests</span>
              <span className="w-8 h-8 rounded-full bg-[#4ade80] flex items-center justify-center shadow-sm text-white shrink-0">
                <FiCheck size={18} strokeWidth={3} />
              </span>
            </div>
            <div className="text-[52px] font-black text-gray-900 leading-none mt-8">
              {String(completedCount).padStart(2, "0")}
            </div>
          </div>

          {/* Assigned Requests */}
          <div className="bg-white rounded-2xl border border-gray-200 border-b-[3px] border-b-[#ef4444] p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[160px]">
            <div className="flex items-start justify-between">
              <span className="text-[14px] font-bold text-gray-800">Assigned Requests</span>
              <span className="w-8 h-8 rounded-full bg-[#ef4444] flex items-center justify-center shadow-sm text-white shrink-0">
                <FiClock size={16} strokeWidth={2.5} />
              </span>
            </div>
            <div className="text-[52px] font-black text-gray-900 leading-none mt-8">
              {String(assignedCount).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* 📈 Cleaning Analytics Dashboard */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-[17px] font-bold text-gray-900">
                Cleaning Analytics Dashboard
              </h3>
              <p className="text-[12px] text-gray-500 font-medium mt-1">
                Comprehensive overview of cleaning activities and waste management
              </p>
            </div>

            {/* Time Scope Dropdown */}
            <div className="relative inline-block self-start sm:self-center shrink-0">
              <select
                id="select-analytics-scope"
                value={timeFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setTimeFilter(val);
                  if (userContext?.siteId) {
                    fetchDashboardData(userContext.siteId, val);
                  }
                }}
                className="appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-xs font-semibold text-gray-800 cursor-pointer outline-none hover:bg-gray-50 transition-colors shadow-sm"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="week">This Week</option>
              </select>
              <FiChevronDown size={14} className="text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 3 Columns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            {/* Total Cleanings */}
            <div className="bg-[#eefdf3] rounded-2xl p-6 flex flex-col justify-between min-h-[130px] border-b-[4px] border-b-[#bbf7d0]">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#4ade80] flex items-center justify-center text-white shrink-0">
                  <FiCheck size={16} strokeWidth={3} />
                </span>
                <span className="text-[13px] font-bold text-gray-800">Total Cleanings</span>
              </div>
              <div className="flex items-end justify-between mt-8">
                <span className="text-[32px] font-black text-gray-900 leading-none">
                  {String(totalCleanings).padStart(2, "0")}
                </span>
                <span className="text-[11px] font-semibold text-gray-800 mb-1">
                  {timeFilter === "all" ? "All Time" : timeFilter === "month" ? "This Month" : "This Week"}
                </span>
              </div>
            </div>

            {/* Total Waste Collected */}
            <div className="bg-[#fffde3] rounded-2xl p-6 flex flex-col justify-between min-h-[130px] border-b-[4px] border-b-[#fde047]">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#facc15] flex items-center justify-center text-white shrink-0">
                  <FiLayers size={14} strokeWidth={2.5} />
                </span>
                <span className="text-[13px] font-bold text-gray-800">Total Waste Collected</span>
              </div>
              <div className="flex items-end justify-between mt-8">
                <span className="text-[32px] font-black text-gray-900 leading-none">
                  {totalWaste.split(" ")[0]}
                </span>
                <span className="text-[11px] font-semibold text-gray-800 mb-1">
                  {totalWaste.split(" ")[1] || "kg"}
                </span>
              </div>
            </div>

            {/* Departments Active */}
            <div className="bg-[#ecfccb] rounded-2xl p-6 flex flex-col justify-between min-h-[130px] border-b-[4px] border-b-[#d9f99d]">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#a3e635] flex items-center justify-center text-white shrink-0">
                  <FiBookOpen size={14} strokeWidth={2.5} />
                </span>
                <span className="text-[13px] font-bold text-gray-800">Departments Active</span>
              </div>
              <div className="flex items-end justify-between mt-8">
                <span className="text-[32px] font-black text-gray-900 leading-none">
                  {String(activeDepts).padStart(2, "0")}
                </span>
                <span className="text-[11px] font-semibold text-gray-800 mb-1">With cleanings</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🏢 Department Breakdown Table Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-[16px] font-bold text-gray-900">Department Breakdown</h3>
            <p className="text-[12px] text-gray-500 font-medium mt-1">
              Cleaning statistics and waste collection by department
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#D12031] text-white text-[13px] font-bold">
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6 text-center">Total Cleanings</th>
                  <th className="py-4 px-6 text-center">Waste Collected (Kg)</th>
                  <th className="py-4 px-6 text-center">Avg Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-[13px] text-gray-700 font-medium">
                {departmentsData.length > 0 ? (
                  departmentsData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-900">{row.department}</td>
                      <td className="py-4 px-6 text-center">{row.completedCleanings}</td>
                      <td className="py-4 px-6 text-center">{row.wasteCollected} Kg</td>
                      <td className="py-4 px-6 text-center">{row.avgDuration}m</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">
                      No department data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🗑️ Waste Type Analysis Cards */}
        <div className="bg-[#fdf2f2] rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-6">
            <FiLayers className="text-gray-600 mt-0.5 shrink-0" size={18} />
            <div>
              <h4 className="text-[15px] font-bold text-gray-900">Waste Type Analysis</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Breakdown of waste types collected during cleaning activities
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wasteTypesData.length > 0 ? (
              wasteTypesData.map((w, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-5 relative overflow-hidden flex items-center justify-between shadow-xs border border-gray-100"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#D12031]"></div>
                  <div className="min-w-0 pl-4 pr-3">
                    <div className="text-[13px] font-bold text-gray-900 truncate leading-tight">{w.name}</div>
                    <div className="text-[11px] text-gray-400 font-medium mt-1.5 leading-none">{w.sub}</div>
                  </div>
                  <div className="text-[15px] font-black text-gray-900 shrink-0">{w.val}</div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-6 text-gray-400">
                No waste type analysis data available.
              </div>
            )}
          </div>
        </div>

        {/* ⚡ MY ACTIVE JOB PANEL */}
        {activeJob ? (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="bg-[#D12031] px-6 py-5 text-white">
              <h3 className="text-[15px] font-bold tracking-wide">My Active Job</h3>
              <p className="text-[11px] text-white/90 font-medium mt-1">
                In-Progress work requests assigned to you
              </p>
            </div>

            <div className="p-6 sm:p-8">
              <div className="border-[1.5px] border-[#D12031] rounded-2xl p-6 sm:p-8 bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div className="space-y-1.5">
                    <h4 className="text-[17px] font-bold text-gray-900">{activeJob.title}</h4>
                    <p className="text-xs text-gray-500 font-medium">
                      {activeJob.location || "Facility Location"} • ID #{activeJob.id}
                    </p>
                  </div>
                  <Link
                    href={`/customer/requests/${activeJob.id}`}
                    className="self-start text-[13px] font-bold text-[#D12031] hover:text-[#b81d2c] flex items-center gap-1 transition-colors group cursor-pointer"
                  >
                    View Details
                    <span className="text-[15px] transform group-hover:translate-x-1 transition-transform">›</span>
                  </Link>
                </div>

                {/* Horizontal Stepper */}
                <div className="pt-2 pb-6 px-4 sm:px-12">
                  <div className="relative">
                    <div className="absolute top-[17px] left-[12.5%] right-[12.5%] h-[3px] bg-gray-200 -translate-y-1/2 z-0 rounded" />

                    {/* Progress Line */}
                    <div
                      className="absolute top-[17px] left-[12.5%] h-[3px] bg-[#D12031] -translate-y-1/2 z-0 rounded transition-all duration-300"
                      style={{ 
                        width: 
                          activeJob.status === "completed" ? "75%" :
                          activeJob.status === "in_progress" ? "50%" :
                          activeJob.status === "started" ? "25%" : "0%"
                      }}
                    />

                    <div className="relative z-10 flex items-center justify-between">
                      {STEP_LABELS.map((label, index) => {
                        const completed = 
                          activeJob.status === "completed" ? index <= 3 :
                          activeJob.status === "in_progress" ? index <= 2 :
                          activeJob.status === "started" ? index <= 1 : index <= 0;
                          
                        return (
                          <div key={label} className="flex flex-col items-center select-none w-1/4 relative">
                            <div
                              className={`w-[34px] h-[34px] rounded-full flex items-center justify-center outline-none z-10 ${completed ? "bg-[#D12031] text-white" : "bg-gray-200 text-gray-400"
                                }`}
                            >
                              {completed ? <FiCheck size={18} strokeWidth={3} /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />}
                            </div>

                            <span
                              className={`text-xs sm:text-[13px] font-bold mt-4 text-center ${completed ? "text-gray-800" : "text-gray-400"
                                }`}
                            >
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* 📋 MY WORK REQUESTS SECTION */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-[#D12031] px-6 py-5 flex items-center justify-between text-white">
            <div>
              <h3 className="text-[15px] font-bold tracking-wide">My Work Requests</h3>
              <p className="text-[11px] text-white/90 font-medium mt-1">
                Requests you&apos;ve submitted that are pending or in progress
              </p>
            </div>
            <Link
              href="/customer/requests"
              className="text-white hover:underline text-xs font-bold"
            >
              See All &gt;
            </Link>
          </div>

          <div className="p-6 space-y-4">
            {requestsList.filter((req) => req.status !== "completed").length > 0 ? (
              requestsList.filter((req) => req.status !== "completed").map((req) => (
                <div
                  key={req.id}
                  className="border border-gray-200 border-l-[4px] border-l-[#D12031] rounded-xl p-6 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md"
                >
                  <div>
                    <h4 className="text-[16px] font-bold text-gray-900 leading-tight">
                      {req.title}
                    </h4>
                    <p className="text-xs text-gray-500 font-semibold mt-2">
                      {req.location} • ID #{req.id}
                    </p>
                    <div className="mt-3.5 inline-block">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${req.priorityStyle}`}>
                        {req.priority} Priority
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/customer/requests/${req.id}`}
                    className="text-[#D12031] hover:text-[#a81828] font-bold text-[14px] flex items-center gap-1 self-start sm:self-center transition-colors"
                  >
                    View Detail <span className="text-[16px] mb-0.5">›</span>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 font-bold border border-dashed border-gray-200 rounded-xl">
                No work requests submitted yet. Click the + button below to create your first request!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 🔴 Floating FAB Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-40 h-16 w-16 rounded-full bg-[#D12031] hover:bg-[#a81828] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border-none outline-none"
      >
        <FiPlus size={28} />
      </button>

      {/* 📝 NEW WORK REQUEST MODAL */}
      <NewRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        siteId={userContext?.siteId || ""}
      />

      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold border border-emerald-500/20 animate-toast-in">
          <FiCheck size={18} className="text-emerald-100" />
          <span>Work Request submitted successfully!</span>
        </div>
      )}
    </CustomerLayout>
  );
}
