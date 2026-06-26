"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiChevronDown
} from "react-icons/fi";
import TechnicianLayout from "@/components/TechnicianLayout";
import FilterModal from "@/components/FilterModal";

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
  priority: "High" | "Medium" | "Low";
  status: "Assigned" | "Completed";
}

const JOBS_DATA: JobRequest[] = [
  {
    id: "99402",
    title: "HVAC Compressor Maintenance",
    location: "Facility Area 4B",
    priority: "High",
    status: "Assigned",
  },
  {
    id: "99403",
    title: "HVAC Compressor Maintenance",
    location: "Facility Area 4B",
    priority: "Medium",
    status: "Assigned",
  },
  {
    id: "99404",
    title: "HVAC Compressor Maintenance",
    location: "Facility Area 4B",
    priority: "Low",
    status: "Assigned",
  },
  {
    id: "99405",
    title: "HVAC Compressor Maintenance",
    location: "Facility Area 4B",
    priority: "High",
    status: "Assigned",
  },
  {
    id: "99406",
    title: "HVAC Compressor Maintenance",
    location: "Facility Area 4B",
    priority: "High",
    status: "Assigned",
  },
  {
    id: "99407",
    title: "HVAC Compressor Maintenance",
    location: "Facility Area 4B",
    priority: "Low",
    status: "Assigned",
  },
  {
    id: "99410",
    title: "HVAC Compressor Maintenance",
    location: "Facility Area 4B",
    priority: "High",
    status: "Completed",
  },
  {
    id: "99411",
    title: "HVAC Compressor Maintenance",
    location: "Facility Area 4B",
    priority: "Medium",
    status: "Completed",
  },
  {
    id: "99412",
    title: "HVAC Compressor Maintenance",
    location: "Facility Area 4B",
    priority: "Low",
    status: "Completed",
  },
  {
    id: "99413",
    title: "HVAC Compressor Maintenance",
    location: "Facility Area 4B",
    priority: "High",
    status: "Completed",
  },
  {
    id: "99414",
    title: "HVAC Compressor Maintenance",
    location: "Facility Area 4B",
    priority: "High",
    status: "Completed",
  },
  {
    id: "99415",
    title: "HVAC Compressor Maintenance",
    location: "Facility Area 4B",
    priority: "Low",
    status: "Completed",
  }
];

export default function WorkRequestsPage() {
  const [activeFilter, setActiveFilter] = useState<"Assigned" | "Completed">("Assigned");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [jobsList] = useState<JobRequest[]>(JOBS_DATA);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
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
    } catch {}
  }, []);

  const handleStartJob = (id: string) => {
    // update state to simulate job start
    alert(`Starting job #${id}...`);
  };

  // Filter list by status & search query
  const filteredJobs = jobsList.filter((job) => {
    const matchesStatus = job.status === activeFilter;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.id.includes(searchQuery) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getBadgeColor = (priority: string) => {
    if (priority === "High") return "bg-[#e6f4ea] text-[#1e8e3e] border-[#ceead6]";
    if (priority === "Medium") return "bg-[#f4fce3] text-[#7cb342] border-[#dcedc8]";
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
                {(["Assigned", "Completed"] as const).map((s) => {
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
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[14px] rounded-lg transition-colors shadow-sm">
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
          <p className="text-white/90 text-[12px] font-medium mt-1">Track the status of work requests you&apos;ve submitted</p>
        </div>

        {/* White Inner Container holding the cards */}
        <div className="p-6">
          {filteredJobs.length === 0 ? (
            <div className="py-12 text-center text-gray-500 font-medium">
              No work requests found matching the filter/query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className={`border border-gray-200 border-l-[4px] rounded-xl p-6 bg-white shadow-sm flex flex-col justify-between transition-shadow hover:shadow-md ${job.status === "Completed" ? "border-l-[#2e7d32]" : "border-l-[#D12031]"
                    }`}
                >
                  {/* Top card info */}
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-[16px] font-bold text-gray-900 leading-tight">
                        {job.title}
                      </h3>
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full border shrink-0 ${getBadgeColor(job.priority)}`}>
                        {job.priority} Priority
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500 mt-2 font-medium">{job.location} • ID #{job.id}</p>
                    {job.status === "Completed" && notices.some((n: Notice) => n.jobId === job.id) && (
                      <div className="mt-3 text-[11px] font-bold text-[#D12031] bg-red-50 border border-red-200/60 rounded-lg px-2.5 py-1 inline-flex items-center gap-1 w-fit">
                        Notice & Notify Applied
                      </div>
                    )}
                  </div>

                  {/* Actions / Status */}
                  <div className="mt-8 flex items-center justify-between">
                    {/* Status check / Start action */}
                    {job.status === "Completed" ? (
                      <span className="font-bold text-[#2e7d32] text-[15px]">
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleStartJob(job.id)}
                        className="px-6 py-2.5 bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[13px] rounded-lg transition-colors shadow-sm"
                      >
                        Start Job
                      </button>
                    )}

                    {/* View Details Link */}
                    <Link
                      href={`/technician/requests/${job.id}`}
                      className="text-[#D12031] hover:text-[#a81828] font-bold text-[14px] flex items-center gap-1 transition-colors"
                    >
                      <span>View Detail</span>
                      <span className="text-[16px] mb-0.5">›</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal Overlay */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={() => console.log("Filter applied")}
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
