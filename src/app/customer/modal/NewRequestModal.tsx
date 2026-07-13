"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiCalendar, FiTrash2, FiCheck } from "react-icons/fi";
import { HiOutlineUpload } from "react-icons/hi";
import { API_BASE_URL } from "@/config";

export interface CustomerRequestDetail {
  id: string;
  title: string;
  status: string;
  customer: string;
  siteLocation: string;
  department: string;
  scheduleDate: string;
  poNumber: string;
  assetId: string;
  scopeOfWork: string;
  detailedDescription: string;
  contactName: string;
  contactRole: string;
  contactInitials: string;
  attachments: string[];
  workType: string;
  workType2: string;
  priority: string;
  duration: string;
  unit: string;
  quantity: string;
  category: string;
  ppeUsed: string[];
  additionalNotes: string;
  beforePhotos: string[];
  afterPhotos: string[];
  location?: string;
}

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (createdRequest: any) => void;
  siteId: string;
}

export default function NewRequestModal({ isOpen, onClose, onSubmit, siteId }: NewRequestModalProps) {
  const [reqTitle, setReqTitle] = useState("");
  const [detailedDesc, setDetailedDesc] = useState("");
  const [scopeOfWork, setScopeOfWork] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [siteLocation, setSiteLocation] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("Cleaning");
  const [department, setDepartment] = useState("None");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handlePhotoUpload = () => {
    // Simulated upload - matching the design
    setUploadedPhotos((prev) => [...prev, "/images/onbording-background.png"]);
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const resetForm = () => {
    setReqTitle("");
    setDetailedDesc("");
    setScopeOfWork("");
    setAdditionalNotes("");
    setSiteLocation("");
    setDueDate("");
    setPriority("Medium");
    setCategory("Cleaning");
    setDepartment("None");
    setUploadedPhotos([]);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!reqTitle.trim()) {
      setError("Request Title is required.");
      return;
    }
    if (!detailedDesc.trim()) {
      setError("Detailed Description is required.");
      return;
    }
    if (!siteId) {
      setError("User Site ID is not initialized. Please refresh and try again.");
      return;
    }

    setIsLoading(true);

    try {
      const resolvedLocation =
        siteLocation.trim() ||
        (department !== "None" ? `${department} Floor` : "Facility Area 1A");

      const response = await fetch(`${API_BASE_URL}/api/work-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          siteId: siteId,
          title: reqTitle.trim(),
          description: detailedDesc.trim(),
          category: category.toLowerCase(),
          priority: priority.toLowerCase(),
          dueDate: dueDate ? new Date(dueDate) : undefined,
          scopeOfWork: scopeOfWork.trim() || detailedDesc.trim(),
          referencePhotoUrls: uploadedPhotos.length > 0 ? uploadedPhotos : null,
          location: resolvedLocation,
          department: department !== "None" ? department : "General",
          additionalNotes: additionalNotes.trim()
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        setError(errData.message || "Failed to create work request. Check details.");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      onSubmit(data);
      resetForm();
      onClose();
    } catch (err) {
      console.error("Submit request error:", err);
      setError("Server connection failed. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 my-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 text-center shrink-0">
          <h3 className="text-[20px] font-bold text-gray-900">New Work Request</h3>
          <p className="text-[13px] text-gray-550 mt-1 font-medium">
            Fill out the form below to submit a new work request.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 text-red-750 text-[13px] font-semibold px-4 py-2.5 rounded-xl border border-red-100 text-center leading-normal">
            {error}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Request Title */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-gray-700">
              Request Title <span className="text-[#D12031] font-black">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Brief description of work needed"
              value={reqTitle}
              onChange={(e) => setReqTitle(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#D12031] focus:ring-1 focus:ring-[#D12031] transition-all"
            />
          </div>

          {/* Site Location */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-gray-700">
              Site Location
            </label>
            <input
              type="text"
              placeholder="e.g. Warehouse D, Bay 14"
              value={siteLocation}
              onChange={(e) => setSiteLocation(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#D12031] focus:ring-1 focus:ring-[#D12031] transition-all"
            />
          </div>

          {/* Detailed Description */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-gray-700">
              Detailed Description <span className="text-[#D12031] font-black">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide detailed description of the work to be completed..."
              value={detailedDesc}
              onChange={(e) => setDetailedDesc(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-950 outline-none focus:border-[#D12031] focus:ring-1 focus:ring-[#D12031] transition-all resize-none"
            />
          </div>

          {/* Scope of Work */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-gray-700">
              Scope of Work
            </label>
            <textarea
              rows={3}
              placeholder="Describe the full scope of work..."
              value={scopeOfWork}
              onChange={(e) => setScopeOfWork(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-955 outline-none focus:border-[#D12031] focus:ring-1 focus:ring-[#D12031] transition-all resize-none"
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-gray-700">
              Additional Notes
            </label>
            <textarea
              rows={2}
              placeholder="Any additional notes or special instructions..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-955 outline-none focus:border-[#D12031] focus:ring-1 focus:ring-[#D12031] transition-all resize-none"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-gray-700">
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-955 outline-none focus:border-[#D12031] focus:ring-1 focus:ring-[#D12031] transition-all"
              />
              <FiCalendar size={16} className="text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Priority & Work Category Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[13px] font-bold text-gray-700">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-955 outline-none focus:border-[#D12031] focus:ring-1 focus:ring-[#D12031] transition-all"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-bold text-gray-700">
                Work Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-955 outline-none focus:border-[#D12031] focus:ring-1 focus:ring-[#D12031] transition-all"
              >
                <option>Cleaning</option>
                <option>Maintenance</option>
                <option>Safety</option>
              </select>
            </div>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-gray-700">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-955 outline-none focus:border-[#D12031] focus:ring-1 focus:ring-[#D12031] transition-all"
            >
              <option>None</option>
              <option>Kitchen</option>
              <option>Lobby</option>
              <option>Restrooms</option>
              <option>Maintenance</option>
              <option>Bedroom</option>
            </select>
          </div>

          {/* Photo Upload zone */}
          <div className="space-y-2">
            <label className="block text-[13px] font-bold text-gray-700">
              Attach Reference Photos (Optional)
            </label>
            <div
              onClick={handlePhotoUpload}
              className="border-2 border-dashed border-red-200 hover:border-[#D12031] rounded-2xl p-6 bg-red-50/5 hover:bg-red-50/10 cursor-pointer text-center flex flex-col items-center justify-center transition-all group"
            >
              <HiOutlineUpload size={28} className="text-[#D12031] mb-2 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-xs font-bold text-gray-800">Click to upload or drag and drop</span>
            </div>

            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-5 gap-2.5 pt-2">
                {uploadedPhotos.map((src, i) => (
                  <div key={i} className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-xs group/item">
                    <Image src={src} alt="Uploaded" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(i)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 flex items-center justify-center text-white transition-opacity duration-150 rounded-xl border-none cursor-pointer"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={() => { resetForm(); onClose(); }}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Close
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-[#D12031] hover:bg-[#b81d2c] text-white font-extrabold text-sm rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <FiCheck size={16} strokeWidth={3} />
                Submit Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
