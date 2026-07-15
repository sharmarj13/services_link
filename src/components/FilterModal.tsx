"use client";

import React, { useState, useEffect } from "react";
import { FiChevronDown, FiCalendar } from "react-icons/fi";
import { apiFetch } from "@/lib/apiFetch";

export interface FilterOptions {
  department: string;
  priority: string;
  startDate: string;
  endDate: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  siteId?: string;
  currentFilters?: FilterOptions;
}

export default function FilterModal({ isOpen, onClose, onApply, siteId, currentFilters }: FilterModalProps) {
  const [departmentsList, setDepartmentsList] = useState<{id: string, name: string}[]>([]);
  const [isFetchingDepts, setIsFetchingDepts] = useState(false);

  const [department, setDepartment] = useState(currentFilters?.department || "All departments");
  const [priority, setPriority] = useState(currentFilters?.priority || "All priorities");
  const [startDate, setStartDate] = useState(currentFilters?.startDate || "");
  const [endDate, setEndDate] = useState(currentFilters?.endDate || "");

  // Fetch departments when modal opens
  useEffect(() => {
    if (isOpen && siteId) {
      const fetchDepartments = async () => {
        setIsFetchingDepts(true);
        try {
          const res = await apiFetch(`/api/sites/${siteId}/departments`);
          if (res.ok) {
            const data = await res.json();
            setDepartmentsList(data.data || []);
          }
        } catch (err) {
          console.error("Failed to fetch departments", err);
        } finally {
          setIsFetchingDepts(false);
        }
      };
      fetchDepartments();
    }
  }, [isOpen, siteId]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-[480px] overflow-hidden flex flex-col shadow-2xl relative animate-scale-up">
        {/* Header */}
        <div className="pt-6 sm:pt-8 pb-5 sm:pb-6 px-5 sm:px-8 text-center shrink-0">
          <h2 className="text-[18px] font-bold text-gray-900">Filter</h2>
          <p className="text-[13px] text-gray-500 mt-2 font-medium">
            Filter requests by department, priority, and date.
          </p>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-8 pb-6 sm:pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Department */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-600">Department</label>
              <div className="relative">
                <select 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-gray-800 outline-none focus:border-[#D12031] transition-colors cursor-pointer bg-white disabled:opacity-50" 
                  disabled={isFetchingDepts}
                >
                  {isFetchingDepts ? (
                    <option>Loading departments...</option>
                  ) : departmentsList.length === 0 ? (
                    <>
                      <option>All departments</option>
                      <option disabled>No departments found</option>
                    </>
                  ) : (
                    <>
                      <option>All departments</option>
                      {departmentsList.map(dept => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))}
                    </>
                  )}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-600">Priority</label>
              <div className="relative">
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-gray-800 outline-none focus:border-[#D12031] transition-colors cursor-pointer bg-white"
                >
                  <option>All priorities</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-600">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-[14px] font-medium text-gray-800 outline-none focus:border-[#D12031] transition-colors placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-600">End Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-[14px] font-medium text-gray-800 outline-none focus:border-[#D12031] transition-colors placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-t border-gray-100 flex gap-3 sm:gap-4 shrink-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-[14px] rounded-xl transition-colors text-center cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onApply({ department, priority, startDate, endDate });
              onClose();
            }}
            className="flex-1 py-3.5 bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[14px] rounded-xl transition-colors text-center shadow-sm cursor-pointer"
          >
            Filter
          </button>
        </div>
      </div>
    </div>
  );
}
