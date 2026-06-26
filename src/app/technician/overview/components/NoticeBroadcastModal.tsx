"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FiChevronDown, FiX } from "react-icons/fi";

interface NoticeBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendBroadcast: (data: {
    noticeType: string;
    priority: string;
    description: string;
    actionRequired: boolean;
  }) => void;
}

export default function NoticeBroadcastModal({
  isOpen,
  onClose,
  onSendBroadcast,
}: NoticeBroadcastModalProps) {
  const [noticeType, setNoticeType] = useState("Maintenance Issue");
  const [priority, setPriority] = useState("Low");
  const [description, setDescription] = useState("");
  const [actionRequired, setActionRequired] = useState(true);

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

  const handleSubmit = () => {
    onSendBroadcast({
      noticeType,
      priority,
      description,
      actionRequired,
    });
    // Reset state values
    setNoticeType("Maintenance Issue");
    setPriority("Low");
    setDescription("");
    setActionRequired(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-[500px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl relative">
        {/* Header */}
        <div className="pt-6 sm:pt-8 pb-3 sm:pb-4 px-5 sm:px-8 text-center shrink-0">
          <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900">Notice & Notify</h2>
          <p className="text-[12px] sm:text-[13px] text-gray-600 mt-2 font-medium leading-relaxed">
            Report a technical observation or safety concern discovered during the asset inspection.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <div className="px-5 sm:px-8 pb-6 sm:pb-8 overflow-y-auto space-y-5 sm:space-y-6">
          {/* Notice Type */}
          <div className="space-y-2">
            <label className="block text-[14px] font-medium text-gray-600">Notice Type</label>
            <div className="relative">
              <select
                value={noticeType}
                onChange={(e) => setNoticeType(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3.5 text-[15px] font-medium text-gray-800 outline-none focus:border-[#D12031] transition-colors cursor-pointer bg-white shadow-sm"
              >
                <option>Maintenance Issue</option>
                <option>Safety Hazard</option>
                <option>General Observation</option>
              </select>
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
            </div>
          </div>

          {/* Priority Level */}
          <div className="space-y-2">
            <label className="block text-[14px] font-medium text-gray-600">Priority Level</label>
            <div className="flex gap-2">
              {["Low", "Medium", "High", "Urgent"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPriority(level)}
                  className={`flex-1 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                    priority === level
                      ? "bg-[#D12031] text-white border-[#D12031] shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Description */}
          <div className="space-y-2">
            <label className="block text-[14px] font-medium text-gray-600">Detailed Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-[15px] font-medium text-gray-800 outline-none focus:border-[#D12031] transition-colors min-h-[120px] resize-y placeholder:text-gray-400 shadow-sm"
              placeholder="Describe the issue, observations, and any immediate actions taken..."
            ></textarea>
          </div>

          {/* Evidence Photos */}
          <div className="space-y-2">
            <label className="block text-[14px] font-medium text-gray-600">Evidence Photos</label>
            <div className="border-[1.5px] border-dashed border-[#D12031] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-red-50/30 transition-colors">
              <div className="text-[#D12031] mb-3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-[14px] font-medium text-gray-700">Tap to capture or upload</p>
              <p className="text-[11px] text-gray-400 font-medium mt-1">PNG, JPG</p>
            </div>

            {/* Uploaded thumbnails */}
            <div className="flex gap-3 pt-3">
              {[
                { name: "Warehouse_Map.png", img: "/images/warehouse_map.svg" },
                { name: "Site.jpg", img: "/images/warehouse_map.svg" } // Fallback to same image
              ].map((file, i) => (
                <div key={i} className="relative w-24 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <Image src={file.img} alt="Evidence" fill className="object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white px-2 py-1 truncate text-center">
                    {file.name}
                  </div>
                  <button className="absolute top-1.5 right-1.5 bg-[#D12031] text-white p-0.5 rounded-full hover:bg-[#a81828] transition-colors shadow-sm">
                    <FiX size={12} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Action Required */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-[14px] font-bold text-gray-900">Customer Action Required</p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">Does the client need to authorize further work?</p>
            </div>
            <button
              type="button"
              onClick={() => setActionRequired(!actionRequired)}
              className={`w-11 h-6 rounded-full relative transition-colors ${actionRequired ? "bg-[#D12031]" : "bg-gray-300"}`}
            >
              <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-[3px] transition-transform ${actionRequired ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-t border-gray-150 flex gap-3 sm:gap-4 shrink-0 bg-white">
          <button
            onClick={onClose}
            className="flex-[0.4] py-3 sm:py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-[13px] sm:text-[14px] rounded-xl transition-colors text-center"
          >
            Discard Draft
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 sm:py-3.5 bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[13px] sm:text-[14px] rounded-xl transition-colors text-center shadow-sm"
          >
            Submit Notice
          </button>
        </div>
      </div>
    </div>
  );
}
