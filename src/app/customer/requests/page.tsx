"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FiSearch, FiFilter, FiDownload, FiPlus, FiChevronDown, FiCheck,
} from "react-icons/fi";
import CustomerLayout from "@/components/CustomerLayout";
import FilterModal from "@/components/FilterModal";
import NewRequestModal from "@/app/customer/modal/NewRequestModal";
import { API_BASE_URL } from "@/config";

interface SiteUserContext {
  userId: string;
  siteId: string;
}

type Status = "All" | "Assigned" | "In-Progress" | "Active" | "Completed";
type Priority = "High" | "Medium" | "Low";

interface Notice {
  jobId: string;
  noticeType: string;
  priority: string;
  description: string;
  actionRequired: boolean;
  date: string;
  time: string;
}

interface JobRequest {
  id: string;
  title: string;
  location: string;
  priority: Priority;
  status: Exclude<Status, "All">;
}

const STATUS_OPTIONS: Status[] = ["All", "Assigned", "In-Progress", "Active", "Completed"];

const PRIORITY_BADGE: Record<Priority, string> = {
  High: "bg-[#e6f4ea] text-[#1e8e3e] border-[#ceead6]",
  Medium: "bg-[#f4fce3] text-[#7cb342] border-[#dcedc8]",
  Low: "bg-[#fef7e0] text-[#f59e0b] border-[#fde68a]",
};

const STATUS_COLOR: Record<string, string> = {
  Completed: "text-[#1e8e3e]",
  Assigned: "text-[#1e8e3e]",
  "In-Progress": "text-[#84cc16]",
  Active: "text-[#2563eb]",
};

const STATUS_BORDER: Record<string, string> = {
  Completed: "border-l-[#D12031]",
  Assigned: "border-l-[#D12031]",
  "In-Progress": "border-l-[#D12031]",
  Active: "border-l-[#D12031]",
};

export default function CustomerRequestsPage() {
  const [activeStatus, setActiveStatus] = useState<Status>("Assigned");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [allJobs, setAllJobs] = useState<JobRequest[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  /* ── Modal states ── */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [userContext, setUserContext] = useState<SiteUserContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const mapStatus = (backendStatus: string): Exclude<Status, "All"> => {
    switch (backendStatus) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In-Progress";
      case "started":
        return "Active";
      case "assigned":
      case "pending":
      default:
        return "Assigned";
    }
  };

  const mapPriority = (backendPriority: string): Priority => {
    if (backendPriority === "high") return "High";
    if (backendPriority === "low") return "Low";
    return "Medium";
  };

  const fetchWorkRequests = useCallback(async (siteId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sites/${siteId}/work-requests`, {
        credentials: "include",
      });
      if (response.ok) {
        const obj = await response.json();
        const list = obj.data || [];
        const mapped = list.map((r: Record<string, unknown>) => ({
          id: r.id as string,
          title: r.title as string,
          location: (r.location as string) || "Facility Area 1A",
          priority: mapPriority((r.priority as string) || ""),
          status: mapStatus((r.status as string) || ""),
        }));
        setAllJobs(mapped);
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to sync work requests from the server.");
    }
  }, []);

  useEffect(() => {
    const initPage = async () => {
      try {
        const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: "include",
        });
        if (!meRes.ok) {
          setError("Failed to load user session.");
          setIsLoading(false);
          return;
        }
        const meData = await meRes.json();
        const siteId = meData.user?.siteUser?.siteId;
        if (!siteId) {
          setError("No site assigned to user context.");
          setIsLoading(false);
          return;
        }

        setUserContext({
          userId: meData.user.id,
          siteId,
        });

        await fetchWorkRequests(siteId);

        // Load static notices fallback
        setNotices([
          {
            jobId: "99410",
            noticeType: "Maintenance Issue",
            priority: "High",
            description: "Found a refrigerant gas leak at the evaporator coil joints. Pressure levels are below threshold. Recommended immediate evacuation and solder-seal of joint pipes.",
            actionRequired: true,
            date: "Jun 24, 2026",
            time: "11:30 AM"
          },
          {
            jobId: "99411",
            noticeType: "Safety Hazard",
            priority: "Urgent",
            description: "Exposed high-voltage wiring detected behind the fan control panel. Insulation has deteriorated. Panel is locked out, but needs urgent cable replacement.",
            actionRequired: true,
            date: "Jun 25, 2026",
            time: "09:45 AM"
          }
        ]);
      } catch (err) {
        console.error("Init requests page error:", err);
        setError("Database server is offline or unreachable.");
      } finally {
        setIsLoading(false);
      }
    };
    initPage();
  }, [fetchWorkRequests]);

  const handleModalSubmit = async () => {
    if (userContext?.siteId) {
      await fetchWorkRequests(userContext.siteId);
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const filteredJobs = allJobs.filter((job) => {
    const matchesStatus = activeStatus === "All" || job.status === activeStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.id.includes(q) ||
      job.location.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <CustomerLayout title="Work Requests" subtitle="Loading work requests...">
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <svg className="animate-spin h-10 w-10 text-[#D12031]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-bold text-gray-500">Syncing live requests database...</span>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout
      title="Work Requests"
      subtitle="Manage your work requests and track their progress"
    >
      {error && (
        <div className="bg-red-50 text-red-750 text-[13px] font-semibold px-4 py-2.5 rounded-xl border border-red-100 mb-5 text-center leading-normal">
          {error}
        </div>
      )}

      {/* ── Top toolbar ─────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <FiSearch size={17} />
          </span>
          <input
            type="text"
            placeholder="Search work requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 outline-none focus:border-[#D12031] transition-all"
          />
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2.5 self-end lg:self-center">
          {/* Status filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center justify-between gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all select-none cursor-pointer"
            >
              <span>Status: {activeStatus}</span>
              <FiChevronDown size={14} className="text-gray-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setActiveStatus(status);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4.5 py-3 text-xs font-semibold border-none cursor-pointer transition-colors ${
                      activeStatus === status
                        ? "bg-red-50 text-[#D12031]"
                        : "text-gray-750 hover:bg-gray-50"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
          >
            <FiFilter size={15} />
            <span>Filter</span>
          </button>

          <button className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer">
            <FiDownload size={15} />
            <span>Export</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-[#D12031] hover:bg-[#b81d2c] text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-red-500/10 cursor-pointer border-none"
          >
            <FiPlus size={15} />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* ── Notices (Issues list) ────────────────────────── */}
      {notices.length > 0 && activeStatus === "All" && (
        <div className="space-y-4 mb-6">
          {notices.map((n, idx) => (
            <div
              key={idx}
              className="bg-[#fffbeb] border border-[#fef3c7] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-[#b45309] bg-[#fef3c7] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {n.noticeType}
                  </span>
                  <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {n.priority}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700 leading-relaxed max-w-3xl">
                  {n.description}
                </p>
                <div className="text-[11px] text-gray-400 font-semibold pt-1">
                  Posted on {n.date} at {n.time} • Job ID #{n.jobId}
                </div>
              </div>
              {n.actionRequired && (
                <button className="self-start md:self-center px-4.5 py-2.5 bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-bold rounded-xl transition-colors border-none cursor-pointer shrink-0">
                  Request Action
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Requests grid/feed ──────────────────────────── */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className={`border border-gray-200 border-l-[4px] ${STATUS_BORDER[job.status] || "border-l-gray-300"} rounded-2xl p-5 sm:p-6 bg-white shadow-xs hover:shadow-md transition-shadow relative`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3 pr-8">
                  <h4 className="text-[16px] font-bold text-gray-900 leading-tight">
                    {job.title}
                  </h4>
                </div>

                <div className="text-[12px] text-gray-450 font-semibold">
                  {job.location} • ID #{job.id}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${PRIORITY_BADGE[job.priority]}`}>
                    {job.priority} Priority
                  </span>
                  <span className={`text-[11px] font-extrabold flex items-center gap-1.5 ${STATUS_COLOR[job.status] || "text-gray-500"}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {job.status}
                  </span>
                </div>
              </div>

              <Link
                href={`/customer/requests/${job.id}`}
                className="absolute right-5 bottom-5 text-[#D12031] hover:text-[#b81d2c] text-sm font-bold flex items-center gap-0.5"
              >
                View <span className="text-[16px] mb-0.5">›</span>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl p-6">
          <div className="text-gray-400 font-bold text-base">No work requests found matching search or filters.</div>
          <p className="text-gray-500 text-xs mt-2 max-w-sm mx-auto font-medium leading-relaxed">
            Try resetting your status filters or typing another query, or click New Request to create a request!
          </p>
        </div>
      )}

      {/* ── Filter Modal ───────────────────────────────────── */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={() => setIsFilterOpen(false)}
      />

      {/* Close dropdown on outside click */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}

      {/* ══════════════ NEW WORK REQUEST MODAL ══════════════ */}
      <NewRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        siteId={userContext?.siteId || ""}
      />

      {/* ── Success Toast ────────────────────────────────── */}
      {showToast && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold border border-emerald-500/20 animate-toast-in">
          <FiCheck size={18} className="text-emerald-100" strokeWidth={3} />
          <span>Work Request submitted successfully!</span>
        </div>
      )}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-toast-in {
          animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </CustomerLayout>
  );
}
