"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiChevronDown
} from "react-icons/fi";
import TechnicianLayout from "@/components/TechnicianLayout";
import FilterModal, { FilterOptions } from "@/components/FilterModal";
import { apiFetch } from "@/lib/apiFetch";

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
  siteName?: string;
  siteId?: string;
  priority: string;
  status: string;
  assignedEmployeeId?: string;
  location?: string;
  department?: string;
  createdAt?: string;
}

export default function WorkRequestsPage() {
  const [activeFilter, setActiveFilter] = useState<"All" | "Assigned" | "In Progress" | "Completed">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const [jobsList, setJobsList] = useState<JobRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    department: "All departments",
    priority: "All priorities",
    startDate: "",
    endDate: ""
  });

  // Debounce search query to prevent spamming API on every keystroke
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch technician details and work requests
  const fetchJobs = useCallback(async (
    statusToApply: string,
    searchToApply: string,
    filtersToApply: FilterOptions
  ) => {
    setIsLoading(true);
    try {
      // 1. Fetch current user context
      let userId = currentUserId;
      if (!userId) {
        const userRes = await apiFetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          userId = userData.user?.id;
          setCurrentUserId(userId);
        }
      }

      // 2. Build URL query params based on selected filters
      const queryParams = new URLSearchParams();
      
      let backendStatus: string | undefined = undefined;
      if (statusToApply === "Assigned") backendStatus = "pending";
      else if (statusToApply === "In Progress") backendStatus = "in_progress";
      else if (statusToApply === "Completed") backendStatus = "completed";

      if (backendStatus) {
        queryParams.append("status", backendStatus);
      }

      if (searchToApply) {
        queryParams.append("search", searchToApply);
      }

      if (filtersToApply.department && filtersToApply.department !== "All departments") {
        queryParams.append("department", filtersToApply.department);
      }

      if (filtersToApply.priority && filtersToApply.priority !== "All priorities") {
        queryParams.append("priority", filtersToApply.priority.toLowerCase());
      }

      if (filtersToApply.startDate) {
        queryParams.append("startDate", filtersToApply.startDate);
      }

      if (filtersToApply.endDate) {
        queryParams.append("endDate", filtersToApply.endDate);
      }

      queryParams.append("limit", "100");

      // 3. Fetch requests with query params
      const res = await apiFetch(`/api/work-requests/tech/all-sites?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          // Filter to only show requests assigned to this tech
          const myJobs = data.data.filter((j: any) => j.assignedEmployeeId === userId);
          setJobsList(myJobs);
        }
      }
    } catch (e) {
      console.error("Failed to fetch jobs:", e);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  // Trigger refetch whenever filters or search query changes
  useEffect(() => {
    fetchJobs(activeFilter, debouncedSearchQuery, currentFilters);

    // Fetch local storage notices for alerts check
    try {
      const storedNotices: Notice[] = JSON.parse(localStorage.getItem("servicelink_notices") || "[]");
      setNotices(storedNotices);
    } catch (e) {
      console.error(e);
    }
  }, [activeFilter, debouncedSearchQuery, currentFilters, fetchJobs]);

  const handleStartJob = async (id: string) => {
    try {
      const res = await apiFetch(`/api/work-requests/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "in_progress" })
      });
      if (res.ok) {
        alert("You have successfully started this job!");
        fetchJobs(activeFilter, debouncedSearchQuery, currentFilters); // refresh list
      } else {
        alert("Failed to start job. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to start job due to network error.");
    }
  };

  const handleExport = () => {
    if (filteredJobs.length === 0) {
      alert("No data available to export");
      return;
    }
    const headers = ["ID", "Title", "Location", "Priority", "Status"];
    const rows = filteredJobs.map(job => [
      job.id,
      job.title,
      job.siteName || "N/A",
      job.priority,
      job.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `my_work_requests_${activeFilter.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter list is now handled 100% on the server side
  const filteredJobs = jobsList;

  const getBadgeColor = (priority: string) => {
    const prio = priority?.toLowerCase();
    if (prio === "high" || prio === "urgent") return "bg-[#e6f4ea] text-[#1e8e3e] border-[#ceead6]";
    if (prio === "medium") return "bg-[#f4fce3] text-[#7cb342] border-[#dcedc8]";
    return "bg-[#fef7e0] text-[#fbc02d] border-[#fff0b3]";
  };

  return (
    <TechnicianLayout
      title="Work Requests"
      subtitle="Manage your work requests and track their progress"
    >
      {/* Top Filter and Search Bar Row */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <FiSearch size={18} />
          </span>
          <input
            type="text"
            placeholder="Search work requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-[14px] text-gray-900 focus:outline-none focus:border-[#D12031] transition-colors"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Custom Status Dropdown */}
          <div className="relative z-30">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className={`flex items-center gap-2.5 bg-white border pl-4 pr-3 py-2.5 text-sm font-semibold transition-all min-w-[150px] cursor-pointer focus:outline-none ${
                dropdownOpen
                  ? "border-[#D12031] text-[#D12031] rounded-t-lg rounded-b-none"
                  : "border-gray-300 text-gray-700 rounded-lg hover:border-[#D12031]"
              }`}
            >
              <span className="flex-1 text-left">{activeFilter}</span>
              <FiChevronDown
                size={17}
                className={`transition-transform duration-200 ${
                  dropdownOpen ? "text-[#D12031] rotate-180" : "text-gray-400"
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border border-[#D12031] border-t-0 rounded-b-lg shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-50 overflow-hidden">
                {(["All", "Assigned", "In Progress", "Completed"] as const).map((s) => {
                  const isSelected = activeFilter === s;
                  return (
                    <button
                      key={s}
                      onClick={() => {
                        setActiveFilter(s);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-[11px] text-[13px] font-semibold transition-colors cursor-pointer border-none border-b border-gray-100 ${
                        isSelected
                          ? "bg-red-50/50 text-[#D12031]"
                          : "bg-white text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <span>{s}</span>
                      {isSelected && (
                        <span className="text-[#D12031] text-[15px] font-bold">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Filter button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[14px] rounded-lg transition-colors shadow-sm"
          >
            <FiFilter size={16} />
            <span>Filter</span>
          </button>

          {/* Export button */}
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[14px] rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <FiDownload size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main card list section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Red Title Banner */}
        <div className="bg-[#D12031] px-6 py-5">
          <h2 className="text-white text-[17px] font-bold">My Work Requests</h2>
          <p className="text-white/90 text-[12px] font-medium mt-1">Track the status of work requests assigned to you</p>
        </div>

        {/* White Inner Container holding the cards */}
        <div className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="border border-gray-200 border-l-[4px] border-l-gray-300 rounded-xl p-6 bg-white shadow-sm flex flex-col justify-between h-[180px] animate-pulse">
                  <div className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <div className="h-9 bg-gray-200 rounded w-24"></div>
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-12 text-center text-gray-500 font-medium">
              No work requests found matching the filter/query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredJobs.map((job) => {
                const hasNotice = notices.some((n: Notice) => n.jobId === job.id);
                const isCompleted = job.status === "completed";
                const isStarted = job.status === "in_progress";
                
                return (
                  <div
                    key={job.id}
                    className={`border border-gray-200 border-l-[4px] rounded-xl p-6 bg-white shadow-sm flex flex-col justify-between transition-shadow hover:shadow-md ${
                      isCompleted ? "border-l-[#2e7d32]" : "border-l-[#D12031]"
                    }`}
                  >
                    {/* Top card info */}
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-[16px] font-bold text-gray-900 leading-tight">
                          {job.title}
                        </h3>
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border shrink-0 capitalize ${getBadgeColor(job.priority)}`}>
                          {job.priority} Priority
                        </span>
                      </div>
                      <p className="text-[12px] text-gray-500 mt-2 font-medium">
                        {job.siteName || "Main Facility"} • ID #{job.id.substring(0,8)}
                      </p>
                      {isCompleted && hasNotice && (
                        <div className="mt-3 text-[11px] font-bold text-[#D12031] bg-red-50 border border-red-200/60 rounded-lg px-2.5 py-1 inline-flex items-center gap-1 w-fit">
                          Notice & Notify Applied
                        </div>
                      )}
                    </div>

                    {/* Actions / Status */}
                    <div className="mt-8 flex items-center justify-between">
                      {/* Status check / Start action */}
                      {isCompleted ? (
                        <span className="font-bold text-[#2e7d32] text-[15px]">
                          Completed
                        </span>
                      ) : isStarted ? (
                        <span className="font-bold text-amber-600 text-[15px]">
                          In Progress
                        </span>
                      ) : (
                        <button
                          onClick={() => handleStartJob(job.id)}
                          className="px-6 py-2.5 bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[13px] rounded-lg transition-colors shadow-sm cursor-pointer"
                        >
                          Start Job
                        </button>
                      )}

                      {/* View Details Link */}
                      <Link
                        href={`/technician/requests/${job.id}`}
                        className="text-[#D12031] hover:text-[#a81828] font-bold text-[14px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>View Detail</span>
                        <span className="text-[16px] mb-0.5">›</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal Overlay */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(appliedFilters) => {
          setCurrentFilters(appliedFilters);
          setIsFilterOpen(false);
        }}
        siteId={jobsList[0]?.siteId || ""}
        currentFilters={currentFilters}
      />

      {/* Close dropdown on outside click */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </TechnicianLayout>
  );
}
