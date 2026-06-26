"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiSearch, FiFilter, FiDownload, FiPlus, FiChevronDown, FiCheck,
} from "react-icons/fi";
import CustomerLayout from "@/components/CustomerLayout";
import FilterModal from "@/components/FilterModal";
import NewRequestModal, { CustomerRequestDetail } from "@/app/customer/modal/NewRequestModal";

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
  status: Omit<Status, "All">;
}

const JOBS_DATA: JobRequest[] = [
  { id: "99402", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "Assigned" },
  { id: "99403", title: "Lighting Fix & Bulbs Replacement", location: "Main Assembly Floor", priority: "Medium", status: "Assigned" },
  { id: "99404", title: "Bioreactor Calibration Check", location: "Lab Section 1", priority: "Low", status: "Assigned" },
  { id: "99405", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "Assigned" },
  { id: "99406", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "Low", status: "Assigned" },
  { id: "99407", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "Assigned" },

  { id: "99410", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "Completed" },
  { id: "99411", title: "HVAC Evaporator Fan Cleanup", location: "Facility Area 4B", priority: "Medium", status: "Completed" },
  { id: "99412", title: "Routine Safety Inspection", location: "Warehouse D", priority: "Low", status: "Completed" },
  { id: "99413", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "Completed" },
  { id: "99414", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "Low", status: "Completed" },
  { id: "99415", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "Completed" },

  { id: "99420", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "In-Progress" },
  { id: "99421", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "Medium", status: "In-Progress" },
  { id: "99422", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "Low", status: "In-Progress" },
  { id: "99423", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "In-Progress" },
  { id: "99424", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "Low", status: "In-Progress" },
  { id: "99425", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "In-Progress" },

  { id: "99430", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "Active" },
  { id: "99431", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "Medium", status: "Active" },
  { id: "99432", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "Low", status: "Active" },
  { id: "99433", title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "Active" },
];

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
  const [allJobs, setAllJobs] = useState<JobRequest[]>(JOBS_DATA);
  const [notices, setNotices] = useState<Notice[]>([]);

  /* ── Add Modal states ── */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Load user-created requests from localStorage and merge
  useEffect(() => {
    loadFromStorage();
  }, []);

  const loadFromStorage = () => {
    try {
      let storedNotices: Notice[] = JSON.parse(localStorage.getItem("servicelink_notices") || "[]");
      if (storedNotices.length === 0) {
        storedNotices = [
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
        ];
        localStorage.setItem("servicelink_notices", JSON.stringify(storedNotices));
      }
      setNotices(storedNotices);
      
      const stored: CustomerRequestDetail[] = JSON.parse(localStorage.getItem("customerRequests") || "[]");
      if (stored.length > 0) {
        const mapped: JobRequest[] = stored.map((r: CustomerRequestDetail) => ({
          id: r.id,
          title: r.title,
          location: r.siteLocation || r.location || "Facility Area 1A",
          priority: (r.priority as Priority) || "Medium",
          status: (r.status || "Assigned") as Omit<Status, "All">,
        }));
        
        // Map stored items by ID
        const storedMap = new Map(mapped.map((item) => [item.id, item]));
        
        // Merge JOBS_DATA, replacing any hardcoded item with its edited version from localStorage
        const mergedJobs = JOBS_DATA.map((job) => {
          if (storedMap.has(job.id)) {
            const edited = storedMap.get(job.id)!;
            storedMap.delete(job.id); // remove from map so we don't duplicate
            return edited;
          }
          return job;
        });
        
        // The remaining items in storedMap are new user-created requests. Add them to the beginning.
        const newRequests = Array.from(storedMap.values());
        setAllJobs([...newRequests, ...mergedJobs]);
      } else {
        setAllJobs(JOBS_DATA);
      }
    } catch {}
  };

  const handleModalSubmit = (fullDetail: CustomerRequestDetail) => {
    const newJob: JobRequest = {
      id: fullDetail.id,
      title: fullDetail.title,
      location: fullDetail.siteLocation,
      priority: fullDetail.priority as Priority,
      status: fullDetail.status as Omit<Status, "All">,
    };
    setAllJobs((prev) => [newJob, ...prev]);
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

  return (
    <CustomerLayout
      title="Work Requests"
      subtitle="Manage your work requests and track their progress"
    >
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
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-[14px] text-gray-900 focus:outline-none focus:border-[#D12031] transition-colors"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Custom Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className={`flex items-center gap-2.5 bg-white border pl-4 pr-3 py-2.5 text-sm font-semibold transition-all min-w-[150px] cursor-pointer focus:outline-none ${
                dropdownOpen
                  ? "border-[#D12031] text-[#D12031] rounded-t-lg rounded-b-none"
                  : "border-gray-300 text-gray-700 rounded-lg hover:border-[#D12031]"
              }`}
            >
              <span className="flex-1 text-left">{activeStatus}</span>
              <FiChevronDown
                size={17}
                className={`transition-transform duration-200 ${
                  dropdownOpen ? "text-[#D12031] rotate-180" : "text-gray-400"
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border border-[#D12031] border-t-0 rounded-b-lg shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-50 overflow-hidden">
                {STATUS_OPTIONS.map((s) => {
                  const isSelected = activeStatus === s;
                  return (
                    <button
                      key={s}
                      onClick={() => {
                        setActiveStatus(s);
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

          {/* Filter */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[14px] rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <FiFilter size={16} />
            <span>Filter</span>
          </button>

          {/* Export */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[14px] rounded-lg transition-colors shadow-sm cursor-pointer">
            <FiDownload size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ── Main card section ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Red banner */}
        <div className="bg-[#D12031] px-6 py-5">
          <h2 className="text-white text-[17px] font-bold">My Work Requests</h2>
          <p className="text-white/90 text-[12px] font-medium mt-1">
            Track the status of work requests you&apos;ve submitted
          </p>
        </div>

        {/* Cards */}
        <div className="p-6">
          {filteredJobs.length === 0 ? (
            <div className="py-16 text-center text-gray-400 font-medium">
              No work requests found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className={`border border-gray-200 border-l-[4px] rounded-xl p-5 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow ${
                    STATUS_BORDER[job.status as string] || "border-l-gray-300"
                  }`}
                >
                  {/* Card top */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[15px] font-bold text-gray-900 leading-snug">
                        {job.title}
                      </h3>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${PRIORITY_BADGE[job.priority]}`}
                      >
                        {job.priority} Priority
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500 mt-1.5 font-medium">
                      {job.location} • ID #{job.id}
                    </p>
                    {job.status === "Completed" && notices.some((n: Notice) => n.jobId === job.id) && (
                      <div className="mt-3 text-[11px] font-bold text-[#D12031] bg-red-50 border border-red-200/60 rounded-lg px-2.5 py-1 inline-flex items-center gap-1 w-fit">
                        Notice & Notify Applied
                      </div>
                    )}
                  </div>

                  {/* Card bottom */}
                  <div className="mt-8 flex items-center justify-between">
                    <span
                      className={`font-bold text-[15px] ${
                        STATUS_COLOR[job.status as string] || "text-gray-600"
                      }`}
                    >
                      {job.status}
                    </span>
                    <Link
                      href={`/customer/requests/${job.id}`}
                      className="text-[#D12031] hover:text-[#a81828] font-bold text-[14px] flex items-center gap-1 transition-colors"
                    >
                      <span>View Detail</span>
                      <span className="text-[17px] leading-none mb-px">›</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Floating + button ────────────────────────────── */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-40 h-16 w-16 rounded-full bg-[#D12031] hover:bg-[#a81828] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border-none outline-none"
      >
        <FiPlus size={28} />
      </button>

      {/* ── Filter Modal ────────────────────────────────── */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={() => console.log("Filter applied")}
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
          animation: toastIn 0.3s ease forwards;
        }
      `}</style>
    </CustomerLayout>
  );
}
