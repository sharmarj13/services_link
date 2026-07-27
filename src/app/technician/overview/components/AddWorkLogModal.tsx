"use client";

import React, { useRef, useState } from "react";
import { CheckCircle, Image as ImageIcon } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";

export interface WorkEntryForm {
  requestTitle: string;
  date: string;
  site: string;
  department: string;
  workType: string;
  workTitle: string;
  detailedDescription: string;
  ppeUsed: string[];
  category: string;
  priority: string;
  duration: string;
  wasteType: string;
  quantity: string;
  unit: string;
  additionalNotes: string;
  beforePhotos: string[];
  afterPhotos: string[];
}

export const PPE_OPTIONS = [
  "Safety Glasses",
  "Gloves",
  "Helmet",
  "Face Shield",
  "Welding Helmet",
  "Dust Mask",
  "Face Respirator",
  "Boots",
  "Ear Plugs",
  "High-Visibility Vest",
  "Safety Harness",
  "Fall Arrest System",
  "Arc Flash Suit",
  "Fire-Resistant Clothing",
  "Knee Pads",
];

export const SITES = ["Site A", "Site B", "Site C", "Site D", "Site E"];

export const REQUEST_TITLES = [
  "HVAC Compressor Maintenance",
  "Routine Safety Inspection",
  "Calibration Check: Unit 7",
  "Electrical Maintenance",
  "General Clean Up",
];

interface AddWorkLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: WorkEntryForm;
  onChange: React.Dispatch<React.SetStateAction<WorkEntryForm>>;
  onSubmit: (e: React.FormEvent) => void;
  sites?: Array<{ id: string; name: string }>;
  activeRequests?: Array<{ id: string; title: string }>;
  isSubmitting?: boolean;
}

export default function AddWorkLogModal({
  isOpen,
  onClose,
  formData,
  onChange,
  onSubmit,
  sites = [],
  activeRequests = [],
  isSubmitting = false,
}: AddWorkLogModalProps) {
  const [isUploading, setIsUploading] = useState<"before" | "after" | null>(null);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCheckboxChange = (ppe: string) => {
    onChange((prev) => ({
      ...prev,
      ppeUsed: prev.ppeUsed.includes(ppe)
        ? prev.ppeUsed.filter((i) => i !== ppe)
        : [...prev.ppeUsed, ppe],
    }));
  };

  const handleUploadBefore = () => {
    beforeInputRef.current?.click();
  };

  const handleUploadAfter = () => {
    afterInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(type);
    try {
      const currentPhotos = type === "before" ? (formData.beforePhotos || []) : (formData.afterPhotos || []);
      const newUrls = [...currentPhotos];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadData = new FormData();
        uploadData.append("file", file);

        const res = await apiFetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status && data.data?.url) {
            // Convert relative /uploads/ path to absolute API path for proper rendering
            const { API_BASE_URL } = require("@/config");
            const url = data.data.url;
            const absoluteUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
            newUrls.push(absoluteUrl);
          } else {
            console.error("Upload failed in response:", data.message);
          }
        } else {
          console.error("Failed to upload file:", file.name);
        }
      }

      onChange((prev) => ({
        ...prev,
        [type === "before" ? "beforePhotos" : "afterPhotos"]: newUrls,
      }));
    } catch (err) {
      console.error("Error uploading photos:", err);
    } finally {
      setIsUploading(null);
      if (e.target) {
        e.target.value = ""; // Clear file input value to allow uploading same file
      }
    }
  };

  const handleRemovePhoto = (index: number, type: "before" | "after") => {
    const currentPhotos = type === "before" ? (formData.beforePhotos || []) : (formData.afterPhotos || []);
    const updated = currentPhotos.filter((_, i) => i !== index);
    onChange((prev) => ({
      ...prev,
      [type === "before" ? "beforePhotos" : "afterPhotos"]: updated,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        id="modal-add-completed-work"
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 animate-modal-in"
      >
        {/* Modal header */}
        <div id="modal-header" className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="text-base font-bold text-slate-950 flex items-center gap-1.5">
            <CheckCircle size={18} className="text-[#D12031]" />
            Add Completed Work Log
          </span>
          <button
            id="modal-close-header"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl font-bold leading-none p-1 block cursor-pointer transition-colors border-none bg-transparent"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form
          id="modal-form"
          onSubmit={onSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* Request Title */}
          <div className="space-y-1.5">
            <label htmlFor="input-request-title" className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Request Dispatch Reference *
            </label>
            <select
              id="input-request-title"
              required
              value={formData.requestTitle}
              onChange={(e) => onChange({ ...formData, requestTitle: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 hover:border-slate-300 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
            >
              <option value="" disabled>Brief description of work needed</option>
              {activeRequests && activeRequests.length > 0 ? (
                activeRequests.map((r) => (
                  <option key={r.id} value={r.title}>{r.title}</option>
                ))
              ) : (
                REQUEST_TITLES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))
              )}
            </select>
          </div>

          {/* Date & Site */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="input-date" className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Completion Date *
              </label>
              <input
                id="input-date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => onChange({ ...formData, date: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-955 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="input-site" className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Site Zone Location *
              </label>
              <select
                id="input-site"
                required
                value={formData.site}
                onChange={(e) => onChange({ ...formData, site: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-950 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              >
                <option value="" disabled>Select site zone</option>
                {sites && sites.length > 0 ? (
                  sites.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))
                ) : (
                  SITES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Department & Work Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="input-department" className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Department / Bay Area *
              </label>
              <input
                id="input-department"
                type="text"
                required
                placeholder="e.g. Facility Area 4B"
                value={formData.department}
                onChange={(e) => onChange({ ...formData, department: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="input-worktype" className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Work Class Type *
              </label>
              <select
                id="input-worktype"
                value={formData.workType}
                onChange={(e) => onChange({ ...formData, workType: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-955 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              >
                <option>Routine</option>
                <option>Emergency</option>
                <option>Preventative</option>
              </select>
            </div>
          </div>

          {/* Work Title */}
          <div className="space-y-1.5">
            <label htmlFor="input-worktitle" className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Completed Work Brief Heading *
            </label>
            <input
              id="input-worktitle"
              type="text"
              required
              placeholder="Brief description of actions completed"
              value={formData.workTitle}
              onChange={(e) => onChange({ ...formData, workTitle: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-955 placeholder:text-slate-400 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
            />
          </div>

          {/* Detailed Description */}
          <div className="space-y-1.5">
            <label htmlFor="input-description" className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Detailed Diagnostics &amp; Summary *
            </label>
            <textarea
              id="input-description"
              required
              rows={3}
              placeholder="Provide diagnostic feedback, replacements deployed, safety parameters, etc."
              value={formData.detailedDescription}
              onChange={(e) => onChange({ ...formData, detailedDescription: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-955 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors resize-none"
            />
          </div>

          {/* PPE Selection checkboxes */}
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Personal Protective Equip. (PPE) Checklist *
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PPE_OPTIONS.map((ppe) => (
                  <label
                    key={ppe}
                    className="flex items-center gap-2 select-none cursor-pointer text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.ppeUsed.includes(ppe)}
                      onChange={() => handleCheckboxChange(ppe)}
                      className="w-4 h-4 text-[#D12031] bg-white border-slate-300 rounded focus:ring-red-500 accent-[#D12031] transition-transform duration-100 active:scale-90"
                    />
                    <span className="text-xs font-semibold">{ppe}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Category, Priority, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="input-category" className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Category Group
              </label>
              <select
                id="input-category"
                value={formData.category}
                onChange={(e) => onChange({ ...formData, category: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-950 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              >
                <option>Cleaning</option>
                <option>Maintenance</option>
                <option>Safety</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="input-priority" className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Severity Priority
              </label>
              <select
                id="input-priority"
                value={formData.priority}
                onChange={(e) => onChange({ ...formData, priority: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-955 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="input-duration" className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Duration (Minutes) *
              </label>
              <input
                id="input-duration"
                type="number"
                required
                value={formData.duration}
                onChange={(e) => onChange({ ...formData, duration: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-955 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </div>
          </div>

          {/* Waste Type, Quantity, Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="input-waste-type" className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Waste Materials
              </label>
              <input
                id="input-waste-type"
                type="text"
                placeholder="e.g. Recycled Plastics"
                value={formData.wasteType}
                onChange={(e) => onChange({ ...formData, wasteType: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-950 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="input-quantity" className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Mass Quantity
              </label>
              <input
                id="input-quantity"
                type="text"
                placeholder="0.00"
                value={formData.quantity}
                onChange={(e) => onChange({ ...formData, quantity: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-950 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="input-unit" className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Standard Unit
              </label>
              <select
                id="input-unit"
                value={formData.unit}
                onChange={(e) => onChange({ ...formData, unit: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-950 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              >
                <option value="">Select unit</option>
                <option>kg</option>
                <option>lbs</option>
                <option>tons</option>
              </select>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-1.5">
            <label htmlFor="input-notes" className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Additional Checklist Notes
            </label>
            <textarea
              id="input-notes"
              rows={2}
              placeholder="Attach warning logs, supervisor validation triggers, environmental records..."
              value={formData.additionalNotes}
              onChange={(e) => onChange({ ...formData, additionalNotes: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-950 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors resize-none"
            />
          </div>

          {/* Photos */}
          <div id="section-photo-uploads" className="space-y-1.5">
            <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Diagnostic Telemetry Verification Photos (Up to 10 each)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Before Photos Upload Card */}
              <div className="space-y-2">
                <input
                  type="file"
                  ref={beforeInputRef}
                  onChange={(e) => handleFileChange(e, "before")}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <div 
                  onClick={handleUploadBefore}
                  className="border-2 border-dashed border-red-200 hover:border-[#D12031] rounded-xl p-5 bg-red-50/10 hover:bg-red-50/20 cursor-pointer text-center flex flex-col items-center justify-center transition-all duration-150 group"
                >
                  <ImageIcon className="text-[#D12031] mb-2 scale-100 group-hover:scale-110 transition-transform" size={24} />
                  <span className="text-xs font-bold text-slate-800">
                    {isUploading === "before" ? "Uploading..." : "Before Work Photos"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium mt-1">Upload JPEG/PNG (Accepts drag and drop)</span>
                </div>
                
                {/* Before Photos Preview List */}
                {formData.beforePhotos && formData.beforePhotos.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {formData.beforePhotos.map((url, index) => (
                      <div key={index} className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 group">
                        <img src={url} alt="Before work" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index, "before")}
                          className="absolute inset-0 bg-black/55 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer text-xs"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* After Photos Upload Card */}
              <div className="space-y-2">
                <input
                  type="file"
                  ref={afterInputRef}
                  onChange={(e) => handleFileChange(e, "after")}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <div 
                  onClick={handleUploadAfter}
                  className="border-2 border-dashed border-red-200 hover:border-[#D12031] rounded-xl p-5 bg-red-50/10 hover:bg-red-50/20 cursor-pointer text-center flex flex-col items-center justify-center transition-all duration-150 group"
                >
                  <ImageIcon className="text-[#D12031] mb-2 scale-100 group-hover:scale-110 transition-transform" size={24} />
                  <span className="text-xs font-bold text-slate-800">
                    {isUploading === "after" ? "Uploading..." : `After Work Photos (${formData.afterPhotos?.length || 0}/10)`}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium mt-1">Upload JPEG/PNG (Accepts drag and drop)</span>
                </div>
                
                {/* After Photos Preview List */}
                {formData.afterPhotos && formData.afterPhotos.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {formData.afterPhotos.map((url, index) => (
                      <div key={index} className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 group">
                        <img src={url} alt="After work" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index, "after")}
                          className="absolute inset-0 bg-black/55 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer text-xs"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </form>

        {/* Modal footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <button
            id="btn-cancel-modal"
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs md:text-sm rounded-xl cursor-pointer transition-colors"
          >
            Cancel Close
          </button>
          <button
            id="btn-submit-modal"
            type="submit"
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`px-5 py-2.5 bg-[#D12031] hover:bg-[#b81d2c] text-white font-extrabold text-xs md:text-sm rounded-xl shadow-sm active:scale-[0.98] transition-colors flex items-center justify-center gap-2 min-w-[160px] ${
              isSubmitting ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isSubmitting && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            )}
            {isSubmitting ? "Submitting..." : "Confirm Submission"}
          </button>
        </div>
      </div>
    </div>
  );
}
