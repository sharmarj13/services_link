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
import NewRequestModal, { CustomerRequestDetail } from "@/app/customer/modal/NewRequestModal";

// Stepper stages
const STEP_LABELS = ["Assigned", "Started", "In-Progress", "Completed"];

export default function CustomerOverviewPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedCount, setCompletedCount] = useState(8);
  const [assignedCount, setAssignedCount] = useState(2);
  const [showToast, setShowToast] = useState(false);

  // Customer's requests
  const [requestsList, setRequestsList] = useState([
    {
      id: "99402",
      title: "HVAC Compressor Maintenance",
      location: "Facility Area 48",
      priority: "High",
      priorityStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "99408",
      title: "Routine Safety Inspection",
      location: "Main Assembly Floor",
      priority: "Low",
      priorityStyle: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ]);

  // Load user-created requests from localStorage on mount and update lists & counts
  useEffect(() => {
    try {
      const stored: CustomerRequestDetail[] = JSON.parse(localStorage.getItem("customerRequests") || "[]");
      
      const INITIAL_OVERVIEW_DATA = [
        {
          id: "99402",
          title: "HVAC Compressor Maintenance",
          location: "Facility Area 48",
          priority: "High",
          priorityStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
        },
        {
          id: "99408",
          title: "Routine Safety Inspection",
          location: "Main Assembly Floor",
          priority: "Low",
          priorityStyle: "bg-amber-50 text-amber-700 border-amber-200",
        },
      ];

      if (stored.length > 0) {
        const mapped = stored.map((r: CustomerRequestDetail) => ({
          id: r.id,
          title: r.title,
          location: r.siteLocation || r.location || "Facility Area 1A",
          priority: r.priority || "Medium",
          priorityStyle:
            r.priority === "High"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : r.priority === "Medium"
              ? "bg-lime-50 text-lime-700 border-lime-200"
              : "bg-amber-50 text-amber-700 border-amber-200",
        }));

        const storedMap = new Map(mapped.map((item) => [item.id, item]));
        
        const mergedList = INITIAL_OVERVIEW_DATA.map((job) => {
          if (storedMap.has(job.id)) {
            const edited = storedMap.get(job.id)!;
            storedMap.delete(job.id);
            return edited;
          }
          return job;
        });

        const newRequests = Array.from(storedMap.values()) as typeof INITIAL_OVERVIEW_DATA;
        setRequestsList([...newRequests, ...(mergedList as typeof INITIAL_OVERVIEW_DATA)]);

        // Compute dashboard count adjustments based on stored requests
        let extraAssigned = 0;
        let extraCompleted = 0;

        stored.forEach((r: CustomerRequestDetail) => {
          const isDefault = r.id === "99402" || r.id === "99408";
          if (!isDefault) {
            if (r.status === "Completed") {
              extraCompleted++;
            } else {
              extraAssigned++;
            }
          }
        });

        const is99402Completed = stored.some((r: CustomerRequestDetail) => r.id === "99402" && r.status === "Completed");
        const is99408Completed = stored.some((r: CustomerRequestDetail) => r.id === "99408" && r.status === "Completed");
        
        let baseAssigned = 2;
        if (is99402Completed) baseAssigned--;
        if (is99408Completed) baseAssigned--;

        setAssignedCount(baseAssigned + extraAssigned);
        setCompletedCount(8 + extraCompleted);
      }
    } catch {}
  }, []);

  const handleModalSubmit = (fullDetail: CustomerRequestDetail) => {
    const newReq = {
      id: fullDetail.id,
      title: fullDetail.title,
      location: fullDetail.siteLocation,
      priority: fullDetail.priority,
      priorityStyle:
        fullDetail.priority === "High"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : fullDetail.priority === "Medium"
          ? "bg-lime-50 text-lime-700 border-lime-200"
          : "bg-amber-50 text-amber-700 border-amber-200",
    };
    setRequestsList((prev) => [newReq, ...prev]);
    setAssignedCount((prev) => prev + 1);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  return (
    <CustomerLayout
      title="Work Overview"
      subtitle="Track all completed and ongoing work at your site"
    >
      <div className="max-w-7xl pb-10 space-y-10">
        
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
                defaultValue="All Time"
                className="appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-xs font-semibold text-gray-800 cursor-pointer outline-none hover:bg-gray-50 transition-colors shadow-sm"
              >
                <option value="All Time">All Time</option>
                <option value="This Month">This Month</option>
                <option value="This Week">This Week</option>
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
                <span className="text-[32px] font-black text-gray-900 leading-none">02</span>
                <span className="text-[11px] font-semibold text-gray-800 mb-1">All Time</span>
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
                <span className="text-[32px] font-black text-gray-900 leading-none">01</span>
                <span className="text-[11px] font-semibold text-gray-800 mb-1">Various units combined</span>
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
                <span className="text-[32px] font-black text-gray-900 leading-none">0</span>
                <span className="text-[11px] font-semibold text-gray-800 mb-1">With completed cleanings</span>
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
                {[
                  { dept: "Kitchen", cleanings: 45, waste: "182 Kg", duration: "45m" },
                  { dept: "Lobby", cleanings: 32, waste: "30 Kg", duration: "30m" },
                  { dept: "Restrooms", cleanings: 75, waste: "56 Kg", duration: "60m" },
                  { dept: "Maintenance", cleanings: 123, waste: "90 Kg", duration: "30m" },
                  { dept: "Bedroom", cleanings: 22, waste: "100 Kg", duration: "40m" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">{row.dept}</td>
                    <td className="py-4 px-6 text-center">{row.cleanings}</td>
                    <td className="py-4 px-6 text-center">{row.waste}</td>
                    <td className="py-4 px-6 text-center">{row.duration}</td>
                  </tr>
                ))}
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
            {[
              { name: "Plastic", sub: "Collected in 3200 cleanings", val: "720 kg" },
              { name: "Organic", sub: "Collected in 4200 cleanings", val: "500 kg" },
              { name: "Paper", sub: "Collected in 1870 cleanings", val: "320 kg" },
              { name: "Plastic", sub: "Collected in 3200 cleanings", val: "720 kg" },
            ].map((w, index) => (
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
            ))}
          </div>
        </div>

        {/* ⚡ MY ACTIVE JOB PANEL */}
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
                  <h4 className="text-[17px] font-bold text-gray-900">HVAC Compressor Maintenance</h4>
                  <p className="text-xs text-gray-500 font-medium">Facility Area 48 • ID #99402</p>
                </div>
                <Link
                  href="/customer/requests/99402"
                  className="self-start text-[13px] font-bold text-[#D12031] hover:text-[#b81d2c] flex items-center gap-1 transition-colors group cursor-pointer"
                >
                  View Details
                  <span className="text-[15px] transform group-hover:translate-x-1 transition-transform">›</span>
                </Link>
              </div>

              {/* Horizontal Stepper (2 steps complete: Assigned, Started) */}
              <div className="pt-2 pb-6 px-4 sm:px-12">
                <div className="relative">
                  <div className="absolute top-[17px] left-[12.5%] right-[12.5%] h-[3px] bg-gray-200 -translate-y-1/2 z-0 rounded" />
                  
                  {/* Progress Line (50% filled since 2 of 4 steps are complete) */}
                  <div
                    className="absolute top-[17px] left-[12.5%] h-[3px] bg-[#D12031] -translate-y-1/2 z-0 rounded transition-all duration-300"
                    style={{ width: "37.5%" }}
                  />

                  <div className="relative z-10 flex items-center justify-between">
                    {STEP_LABELS.map((label, index) => {
                      const completed = index <= 1; // 0 (Assigned) and 1 (Started) are checked
                      return (
                        <div key={label} className="flex flex-col items-center select-none w-1/4 relative">
                          <div
                            className={`w-[34px] h-[34px] rounded-full flex items-center justify-center outline-none z-10 ${
                              completed ? "bg-[#D12031] text-white" : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            {completed ? <FiCheck size={18} strokeWidth={3} /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />}
                          </div>

                          <span
                            className={`text-xs sm:text-[13px] font-bold mt-4 text-center ${
                              completed ? "text-gray-800" : "text-gray-400"
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
            {requestsList.map((req) => (
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
            ))}
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
