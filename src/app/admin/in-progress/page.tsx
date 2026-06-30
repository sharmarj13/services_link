"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FiCheck,
  FiMapPin,
  FiFilter,
  FiSearch,
} from "react-icons/fi";
import AdminLayout from "@/components/AdminLayout";

// Stepper stages
const STEP_LABELS = ["Assigned", "Active", "Completed"];

interface ActiveJob {
  id: string;
  title: string;
  site: string;
  location: string;
  technician: string;
  status: string;
  priority: string;
}

export default function AdminInProgressPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [techFilter, setTechFilter] = useState("All");

  const [activeJobsList] = useState<ActiveJob[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("servicelink_requests");
      if (saved) {
        try {
          const reqs = JSON.parse(saved);
          const active = reqs.filter((r: { status: string }) => r.status !== "Completed");
          return active.map((r: { id: string; title: string; site: string; location?: string; assignedTechnician?: string; status: string; priority: string }) => {
            let s = r.status;
            if (s === "In-Progress") s = "Active";
            if (s === "Pending") s = "Assigned";
            return {
              id: r.id,
              title: r.title,
              site: r.site,
              location: r.location || "Facility Area 1A",
              technician: r.assignedTechnician || "Unassigned",
              status: s,
              priority: r.priority,
            };
          });
        } catch { }
      }
    }
    return [
      {
        id: "99402",
        title: "HVAC Compressor Maintenance",
        site: "Site A",
        location: "Warehouse D, Bay 14",
        technician: "John Doe",
        status: "Active",
        priority: "High",
      },
      {
        id: "99408",
        title: "Routine Safety Inspection",
        site: "Site B",
        location: "Kitchen Corridor 2",
        technician: "Unassigned",
        status: "Assigned",
        priority: "Low",
      },
      {
        id: "99415",
        title: "Warehouse Ventilation Repair",
        site: "Site D",
        location: "Loading Dock B",
        technician: "Alex Mercer",
        status: "Active",
        priority: "High",
      },
    ];
  });

  const filteredJobs = activeJobsList.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.includes(searchTerm) ||
      job.technician.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTech = techFilter === "All" || job.technician === techFilter;
    return matchesSearch && matchesTech;
  });

  return (
    <AdminLayout
      title="Assigned Jobs"
      subtitle="Monitor status, active technician workflows, and project stage milestones"
    >
      <div className="max-w-7xl pb-2 space-y-6">

        {/* Search & filter bar */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <input
              type="text"
              placeholder="Search by job, tech, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-gray-800 outline-none focus:border-[#D12031] focus:bg-white transition-all"
            />
            <FiSearch size={14} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
              <FiFilter /> Filter Technician:
            </span>
            <select
              value={techFilter}
              onChange={(e) => setTechFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 outline-none focus:border-[#D12031]"
            >
              <option value="All">All Staff</option>
              <option value="John Doe">John Doe</option>
              <option value="Bob Johnson">Bob Johnson</option>
              <option value="Sarah Connor">Sarah Connor</option>
              <option value="Alex Mercer">Alex Mercer</option>
            </select>
          </div>
        </div>

        {/* Active Jobs Cards Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map((job) => {
            // Get index of current step (Assigned=0, In-Progress=1, Completed=2)
            const currentStepIdx = STEP_LABELS.indexOf(job.status);
            // Percentage of bar completion
            const percentFilled = currentStepIdx === 0 ? 0 : currentStepIdx === 1 ? 50 : 100;

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-sm transition-shadow p-5"
              >
                {/* Upper row info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[15px] font-bold text-gray-950">{job.title}</h4>
                      <span
                        className={`text-[8.5px] font-black px-2 py-0.5 rounded-md border ${job.priority === "High"
                          ? "bg-red-50 text-[#D12031] border-red-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                          }`}
                      >
                        {job.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                      <FiMapPin /> {job.location} • {job.site} • ID #{job.id}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Tech details */}
                    <div className="flex items-center gap-2 bg-gray-50 border border-[#D12031]/20 py-1.5 px-3 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-[#D12031] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {job.technician.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="text-left leading-none">
                        <span className="text-[10px] font-bold text-gray-800 block">{job.technician}</span>
                        <span className="text-[8px] font-semibold text-gray-400 block">Dispatched Technician</span>
                      </div>
                    </div>

                    <Link
                      href={`/admin/requests/${job.id}`}
                      className="bg-white hover:bg-gray-50 text-[#D12031] border-2 border-[#D12031] font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all"
                    >
                      Manage
                    </Link>
                  </div>
                </div>

                {/* Horizontal Stepper */}
                <div className="pt-2 pb-2 px-2 sm:px-6">
                  <div className="relative">
                    {/* Back line */}
                    <div className="absolute top-[15px] left-[16.7%] right-[16.7%] h-[3px] bg-gray-200 -translate-y-1/2 z-0 rounded" />

                    {/* Fill line */}
                    <div
                      className="absolute top-[15px] left-[16.7%] h-[3px] bg-[#D12031] -translate-y-1/2 z-0 rounded transition-all duration-500 ease-out"
                      style={{ width: `${percentFilled * 0.666}%` }} // Adjusted offset for 3 items
                    />

                    <div className="relative z-10 flex items-center justify-between">
                      {STEP_LABELS.map((label, index) => {
                        const isCompleted = index <= currentStepIdx;
                        const isCurrent = index === currentStepIdx;
                        return (
                          <div key={label} className="flex flex-col items-center select-none w-1/3 relative">
                            <div
                              className={`w-7.5 h-7.5 rounded-full flex items-center justify-center outline-none z-10 transition-colors duration-300 ${isCompleted
                                ? "bg-[#D12031] text-white"
                                : "bg-gray-200 text-gray-400"
                                } ${isCurrent ? "ring-4 ring-red-100" : ""}`}
                            >
                              {isCompleted ? (
                                <FiCheck size={14} strokeWidth={3} />
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              )}
                            </div>

                            <span
                              className={`text-[10px] sm:text-xs font-bold mt-3 text-center ${isCompleted ? "text-gray-800" : "text-gray-400"
                                } ${isCurrent ? "text-[#D12031] font-black" : ""}`}
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
            );
          })}
          {filteredJobs.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 font-semibold text-sm shadow-xs">
              No active jobs match the current filters.
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
