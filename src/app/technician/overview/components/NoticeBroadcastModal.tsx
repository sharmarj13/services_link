"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FiChevronDown, FiX } from "react-icons/fi";
import { apiFetch } from "@/lib/apiFetch";
import { API_BASE_URL } from "@/config";

interface NoticeBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendBroadcast: (data: {
    noticeType: string;
    priority: string;
    description: string;
    evidencePhotoUrls?: string[];
  }) => Promise<void>;
}

export default function NoticeBroadcastModal({
  isOpen,
  onClose,
  onSendBroadcast,
}: NoticeBroadcastModalProps) {
  const [noticeType, setNoticeType] = useState("Maintenance Issue");
  const [priority, setPriority] = useState("Low");
  const [description, setDescription] = useState("");
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newUrls: string[] = [...evidencePhotos];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await apiFetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          newUrls.push(data.url);
        } else {
          console.error("Failed to upload file:", file.name);
        }
      }
      setEvidencePhotos(newUrls);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setEvidencePhotos((prev) => prev.filter((_, i) => i !== index));
  };

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSendBroadcast({
        noticeType,
        priority,
        description,
        evidencePhotoUrls: evidencePhotos,
      });
      // Reset state values
      setNoticeType("Maintenance Issue");
      setPriority("Low");
      setDescription("");
      setEvidencePhotos([]);
      // onClose is handled in the parent when successful
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
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
              {["Low", "Medium", "High"].map((level) => (
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className="hidden"
            />
            <div 
              onClick={handleUploadClick}
              className="border-[1.5px] border-dashed border-[#D12031] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-red-50/30 transition-colors"
            >
              <div className="text-[#D12031] mb-3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-[14px] font-medium text-gray-700">
                {isUploading ? "Uploading..." : "Tap to capture or upload"}
              </p>
              <p className="text-[11px] text-gray-400 font-medium mt-1">PNG, JPG</p>
            </div>

            {/* Uploaded thumbnails */}
            {evidencePhotos.length > 0 && (
              <div className="flex gap-3 pt-3 flex-wrap">
                {evidencePhotos.map((url, i) => {
                  const fileName = url.substring(url.lastIndexOf("/") + 1);
                  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
                  return (
                    <div key={i} className="relative w-24 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                      <img src={fullUrl} alt="Evidence" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white px-2 py-1 truncate text-center">
                        {fileName}
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemovePhoto(i)}
                        className="absolute top-1.5 right-1.5 bg-[#D12031] text-white p-0.5 rounded-full hover:bg-[#a81828] transition-colors shadow-sm"
                      >
                        <FiX size={12} strokeWidth={3} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
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
            disabled={isSubmitting}
            className="flex-1 py-3 sm:py-3.5 bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[13px] sm:text-[14px] rounded-xl transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              "Submit Notice"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
