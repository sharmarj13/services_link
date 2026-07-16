"use client";

import React, { useState, useEffect, use } from "react";
import TechnicianLayout from "@/components/TechnicianLayout";
import { FiRotateCcw, FiCheckCircle, FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import Link from "next/link";
import { apiFetch } from "@/lib/apiFetch";
import { API_BASE_URL } from "@/config";
import { useRouter } from "next/navigation";

interface NoticeDetail {
  id: string;
  noticeType: string;
  priority: string;
  description: string;
  evidencePhotoUrls: string[];
  actionRequired: boolean;
  workRequestId: string;
  workRequestTitle: string;
  siteName: string;
  createdAt: string;
}

export default function NoticeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNoticeDetails = async () => {
      if (!resolvedParams?.id) return;
      try {
        const res = await apiFetch(`/api/safety-notices/${resolvedParams.id}`);
        if (res.ok) {
          const data = await res.json();
          // Map relative photo URLs to absolute
          const mappedPhotos = (data.evidencePhotoUrls || []).map((url: string) =>
            url.startsWith("http") ? url : `${API_BASE_URL}${url}`
          );
          setNotice({
            ...data,
            evidencePhotoUrls: mappedPhotos,
          });
        }
      } catch (err) {
        console.error("Failed to fetch safety notice detail:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNoticeDetails();
  }, [resolvedParams]);

  if (isLoading) {
    return (
      <TechnicianLayout title="Notice & Notify" subtitle="Loading notice details...">
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D12031]" />
        </div>
      </TechnicianLayout>
    );
  }

  if (!notice) {
    return (
      <TechnicianLayout title="Notice & Notify" subtitle="Notice not found">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center shadow-sm max-w-2xl mx-auto mt-6">
          <FiAlertCircle className="mx-auto text-red-500 mb-3" size={40} />
          <p className="text-gray-600 font-bold">Safety notice details could not be found or has been resolved.</p>
          <button
            onClick={() => router.push("/technician/notice-notify")}
            className="mt-4 px-6 py-2.5 bg-[#D12031] text-white font-bold rounded-xl text-sm"
          >
            Back to Board
          </button>
        </div>
      </TechnicianLayout>
    );
  }

  return (
    <TechnicianLayout title="Notice & Notify" subtitle={`Manage Notice & Notify for job #${notice.workRequestId.substring(0, 8)}`}>
      {/* Back link */}
      <div className="mb-4">
        <Link href="/technician/notice-notify" className="inline-flex items-center gap-1.5 text-[14px] font-bold text-gray-500 hover:text-[#D12031] transition-colors">
          <FiArrowLeft size={16} />
          Back to Notices
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-10 max-w-7xl">
        {/* Header */}
        <div className="bg-[#D12031] px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <FiRotateCcw size={18} className="sm:w-5 sm:h-5" />
            <h2 className="text-[16px] sm:text-[18px] font-bold truncate pr-2">Notice &amp; Notify Detail</h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
          {/* Associated Job */}
          <div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-1">Associated Job</h3>
            <p className="text-[14px] text-gray-700 font-semibold">
              {notice.workRequestTitle} <span className="text-gray-400 font-normal">({notice.siteName})</span>
            </p>
          </div>

          {/* Notice Type */}
          <div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-1">Notice Type</h3>
            <p className="text-[14px] text-gray-600 font-medium">{notice.noticeType}</p>
          </div>

          {/* Priority Level */}
          <div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-1">Priority Level</h3>
            <span className="inline-block text-[11px] font-bold text-red-700 bg-red-50 py-0.5 px-2.5 rounded-md border border-red-200 mt-1">
              {notice.priority.toUpperCase()}
            </span>
          </div>

          {/* Detailed Description */}
          <div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-2">Detailed Description</h3>
            <p className="text-[13px] text-gray-600 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-150 max-w-3xl">
              {notice.description}
            </p>
          </div>

          {/* Evidence Photos */}
          {notice.evidencePhotoUrls && notice.evidencePhotoUrls.length > 0 && (
            <div>
              <h3 className="text-[14px] font-bold text-gray-900 mb-3">Evidence Photos</h3>
              <div className="flex flex-wrap gap-3">
                {notice.evidencePhotoUrls.map((src, i) => {
                  const filename = src.substring(src.lastIndexOf("/") + 1);
                  return (
                    <div key={i} className="relative w-[110px] h-[90px] rounded-xl overflow-hidden border border-gray-200 shadow-sm shrink-0">
                      <img src={src} alt="Evidence" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1 px-1.5 text-center">
                        <p className="text-[9px] text-white font-medium truncate">
                          {filename}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Client Approval Required status */}
          <div className="pt-2">
            <h3 className="text-[15px] font-bold text-gray-900 mb-3">Client Approval Requirement</h3>
            <div className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-white shadow-sm max-w-3xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[14px] font-bold text-gray-900">Required Action Status</h4>
                <div className="flex items-center gap-1.5 text-[#D12031]">
                  <FiCheckCircle size={15} strokeWidth={2.5} />
                  <span className="text-[13px] sm:text-[14px] font-bold">
                    {notice.actionRequired ? "Action Required" : "No Action Required"}
                  </span>
                </div>
              </div>
              <p className="text-[13px] text-gray-500 font-medium">
                {notice.actionRequired 
                  ? "This warning requires the customer to review and authorize the recommended work before technician can proceed." 
                  : "This safety warning has been broadcasted as an informative observation. No client authorization is required to continue."}
              </p>
            </div>
          </div>

        </div>
      </div>
    </TechnicianLayout>
  );
}
