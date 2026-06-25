"use client";

import React, { useEffect } from "react";
import { FiChevronDown, FiCalendar } from "react-icons/fi";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}

export default function FilterModal({ isOpen, onClose, onApply }: FilterModalProps) {
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
                <select className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-gray-800 outline-none focus:border-[#D12031] transition-colors cursor-pointer bg-white">
                  <option>All departments</option>
                  <option>Maintenance</option>
                  <option>Plumbing</option>
                  <option>Electrical</option>
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-600">Priority</label>
              <div className="relative">
                <select className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-gray-800 outline-none focus:border-[#D12031] transition-colors cursor-pointer bg-white">
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
                  type="text"
                  placeholder="Pick a date"
                  className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-[14px] font-medium text-gray-800 outline-none focus:border-[#D12031] transition-colors placeholder:text-gray-400"
                />
                <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-600">End Date</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pick a date"
                  className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-[14px] font-medium text-gray-800 outline-none focus:border-[#D12031] transition-colors placeholder:text-gray-400"
                />
                <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-t border-gray-100 flex gap-3 sm:gap-4 shrink-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-[14px] rounded-xl transition-colors text-center"
          >
            Close
          </button>
          <button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="flex-1 py-3.5 bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[14px] rounded-xl transition-colors text-center shadow-sm"
          >
            Filter
          </button>
        </div>
      </div>
    </div>
  );
}
