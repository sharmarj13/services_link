"use client";

import React from "react";
import { User, MapPin, Calendar, Hash, Shield, Phone, Mail, MessageSquare, Bell } from "lucide-react";
import { API_BASE_URL } from "@/config";
import { useRouter } from "next/navigation";

interface JobDetailsModalProps {
  job: any;
  onClose: () => void;
  onStartJob?: (jobId: string) => void;
  onNoticeNotify?: (jobId: string) => void;
}

export default function JobDetailsModal({
  job,
  onClose,
  onStartJob,
  onNoticeNotify,
}: JobDetailsModalProps) {
  const router = useRouter();

  if (!job) return null;

  const customerName = job.customer 
    ? `${job.customer.firstName || ""} ${job.customer.lastName || ""}`.trim() 
    : (job.customerName || "Client");
  
  const customerEmail = job.customer?.email || job.customerEmail || "Not provided";
  const customerPhone = job.customer?.phone || job.customerPhone || "Not provided";
  
  const formattedDate = job.dueDate 
    ? new Date(job.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : new Date(job.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const getAbsoluteUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  };

  const beforePhotos = job.beforePhotoUrls || [];
  const afterPhotos = job.afterPhotoUrls || [];
  const referencePhotos = job.referencePhotoUrls || [];

  return (
    <div className="w-full pb-10 animate-fade-in">
      {/* Top action row (Back button) */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer border-none bg-transparent"
        >
          <span className="text-lg leading-none mb-0.5">‹</span> Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: 2/3 width */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* Job Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-start justify-between mb-8">
              <h3 className="text-[17px] font-bold text-slate-900">Job Information</h3>
              <span className={`text-[11px] font-bold border py-1.5 px-4 rounded-lg capitalize ${
                job.status === "completed" 
                  ? "text-emerald-600 border-emerald-300 bg-emerald-50"
                  : job.status === "in_progress"
                  ? "text-yellow-600 border-yellow-300 bg-yellow-50"
                  : "text-blue-600 border-blue-300 bg-blue-50"
              }`}>
                {job.status === "in_progress" ? "Work in Progress" : job.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div className="flex items-start gap-3">
                <User size={18} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[13px] font-semibold text-slate-500">Customer</div>
                  <div className="text-[13px] font-bold text-[#D12031] mt-0.5">{customerName}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[13px] font-semibold text-slate-500">Site Location</div>
                  <div className="text-[13px] font-bold text-[#D12031] mt-0.5">{job.siteName || "Main Facility"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[13px] font-semibold text-slate-500">Department</div>
                  <div className="text-[13px] font-bold text-[#D12031] mt-0.5">{job.department || "General Operations"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[13px] font-semibold text-slate-500">Schedule Date</div>
                  <div className="text-[13px] font-bold text-[#D12031] mt-0.5">{formattedDate}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Hash size={18} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[13px] font-semibold text-slate-500">PO Number</div>
                  <div className="text-[13px] font-bold text-[#D12031] mt-0.5">{job.poNumber || "#N/A"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Hash size={18} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[13px] font-semibold text-slate-500">Asset ID</div>
                  <div className="text-[13px] font-bold text-[#D12031] mt-0.5">{job.assetId || "N/A"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scope of Work Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex-1">
            <h3 className="text-[17px] font-bold text-slate-900 mb-4">Scope of Work</h3>
            <p className="text-[15px] font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
              {job.description || "No description provided."}
            </p>
          </div>

          {/* Start Job Button */}
          {job.status === "pending" && (
            <div className="pt-2">
              <button 
                onClick={() => onStartJob?.(job.id)}
                className="w-full bg-[#D12031] hover:bg-[#b81d2c] text-white font-bold text-sm py-4 rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer border-none"
              >
                Start Job
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: 1/3 width */}
        <div className="space-y-6 flex flex-col">
          {/* Contact Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <User size={20} className="text-slate-600" />
              <h3 className="text-[15px] font-bold text-slate-900">Contact Details</h3>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-full bg-red-50 text-[#D12031] flex items-center justify-center font-bold text-lg border border-red-100 shrink-0">
                {customerName.substring(0, 2).toUpperCase() || "C"}
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-bold text-slate-900 truncate">{customerName}</div>
                <div className="text-[13px] font-medium text-slate-500 mt-0.5 truncate">{customerEmail}</div>
              </div>
            </div>

            <div className="space-y-3">
              {customerPhone !== "Not provided" && (
                <a 
                  href={`tel:${customerPhone}`}
                  className="w-full flex items-center justify-center gap-2 bg-[#D12031] hover:bg-[#b81d2c] text-white font-bold text-[13px] py-3.5 rounded-xl transition-colors cursor-pointer text-center no-underline"
                >
                  <Phone size={16} /> Call Client
                </a>
              )}
              {customerEmail !== "Not provided" && (
                <a 
                  href={`mailto:${customerEmail}`}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-[#D12031] border border-[#D12031] font-bold text-[13px] py-3.5 rounded-xl transition-colors cursor-pointer text-center no-underline"
                >
                  <Mail size={16} /> Email Contact
                </a>
              )}
            </div>
          </div>

          {/* Attachments Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex-1">
            <h3 className="text-[15px] font-bold text-slate-900 mb-5">Job Attachments</h3>
            
            <div className="space-y-4">
              {/* Reference Photos */}
              {referencePhotos.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">Reference Photos</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {referencePhotos.map((url: string, i: number) => (
                      <div key={i} className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200">
                        <img src={getAbsoluteUrl(url)} alt={`Reference ${i}`} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Before Photos */}
              {beforePhotos.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">Before Work Photos</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {beforePhotos.map((url: string, i: number) => (
                      <div key={i} className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200">
                        <img src={getAbsoluteUrl(url)} alt={`Before ${i}`} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* After Photos */}
              {afterPhotos.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">After Work Photos</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {afterPhotos.map((url: string, i: number) => (
                      <div key={i} className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200">
                        <img src={getAbsoluteUrl(url)} alt={`After ${i}`} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {referencePhotos.length === 0 && beforePhotos.length === 0 && afterPhotos.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400 font-medium">
                  No reference or work photos attached yet.
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons Right Side */}
          <div className="pt-2 flex items-center gap-4">
            <button 
              onClick={() => router.push(`/technician/messages?workRequestId=${job.id}`)}
              className="flex-1 bg-white hover:bg-red-50 text-[#D12031] border border-[#D12031] font-bold text-sm py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare size={18} /> Message
            </button>
            {job.status !== "completed" && (
              <button 
                onClick={() => onNoticeNotify?.(job.id)}
                className="flex-1 bg-white hover:bg-red-50 text-[#D12031] border border-[#D12031] font-bold text-sm py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bell size={18} /> Notice &amp; Notify
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
