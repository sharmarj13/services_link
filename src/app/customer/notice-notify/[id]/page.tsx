"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import CustomerLayout from "@/components/CustomerLayout";
import { FiRotateCcw, FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import { apiFetch } from "@/lib/apiFetch";
import { API_BASE_URL } from "@/config";

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

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    const fetchNoticeDetail = async () => {
      if (!params?.id) return;
      try {
        const res = await apiFetch(`/api/safety-notices/${params.id}`);
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
    fetchNoticeDetail();
  }, [params]);

  if (isLoading) {
    return (
      <CustomerLayout title="Notice & Notify" subtitle="Loading safety notice details...">
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D12031]" />
        </div>
      </CustomerLayout>
    );
  }

  if (!notice) {
    return (
      <CustomerLayout title="Notice & Notify" subtitle="Notice not found">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center shadow-sm">
          <FiAlertCircle className="mx-auto text-red-500 mb-3" size={40} />
          <p className="text-gray-600 font-bold">Safety notice details could not be found or has been resolved.</p>
          <button
            onClick={() => router.push("/customer/notice-notify")}
            className="mt-4 px-6 py-2.5 bg-[#D12031] text-white font-bold rounded-xl text-sm"
          >
            Back to Board
          </button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout
      title="Notice & Notify"
      subtitle={`Manage Notice & Notify for job #${notice.workRequestId.substring(0, 8)}`}
    >
      {/* ── Back button ── */}
      <button
        onClick={() => router.push("/customer/notice-notify")}
        className="flex items-center gap-2 text-[#D12031] font-bold text-[13px] mb-5 hover:text-[#a81828] transition-colors cursor-pointer border-none bg-transparent p-0"
      >
        <FiArrowLeft size={16} />
        Back to Notice &amp; Notify Board
      </button>

      {/* ── Main Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Red Header */}
        <div className="bg-[#D12031] px-6 py-5 flex items-center gap-3">
          <FiRotateCcw size={20} className="text-white shrink-0" />
          <h2 className="text-white text-[18px] font-bold tracking-wide">
            Notice &amp; Notify Detail
          </h2>
        </div>

        {/* Body */}
        <div className="px-8 py-8 space-y-6">
          {/* Job Association */}
          <div>
            <p className="text-[14px] font-bold text-gray-900 mb-1">
              Associated Job
            </p>
            <p className="text-[13.5px] text-gray-700 font-semibold">
              {notice.workRequestTitle} <span className="text-gray-400 font-normal">({notice.siteName})</span>
            </p>
          </div>

          {/* Notice Type */}
          <div>
            <p className="text-[14px] font-bold text-gray-900 mb-1">
              Notice Type
            </p>
            <p className="text-[13.5px] text-gray-500 font-medium">
              {notice.noticeType}
            </p>
          </div>

          {/* Priority Level */}
          <div>
            <p className="text-[14px] font-bold text-gray-900 mb-1">
              Priority Level
            </p>
            <span className="inline-block text-[11px] font-bold text-red-700 bg-red-50 py-0.5 px-2.5 rounded-md border border-red-200 mt-1">
              {notice.priority.toUpperCase()}
            </span>
          </div>

          {/* Detailed Description */}
          <div>
            <p className="text-[14px] font-bold text-gray-900 mb-2">
              Detailed Description
            </p>
            <p className="text-[13px] text-gray-600 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-150">
              {notice.description}
            </p>
          </div>

          {/* Evidence Photos */}
          {notice.evidencePhotoUrls && notice.evidencePhotoUrls.length > 0 && (
            <div>
              <p className="text-[14px] font-bold text-gray-900 mb-3">
                Evidence Photos
              </p>
              <div className="flex items-start gap-3 flex-wrap">
                {notice.evidencePhotoUrls.map((src, i) => {
                  const filename = src.substring(src.lastIndexOf("/") + 1);
                  return (
                    <div
                      key={i}
                      className="relative w-[110px] h-[90px] rounded-xl overflow-hidden shadow-sm border border-gray-200 shrink-0"
                    >
                      <img
                        src={src}
                        alt={`Evidence ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Filename bar at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/55 py-1 px-1.5 text-center">
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

          {/* Client Approval (Shown only if actionRequired is true) */}
          {notice.actionRequired && (
            <>
              <div className="h-px bg-gray-100 w-full" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[14px] font-bold text-gray-900">
                    Client Approval Required
                  </p>
                  <p className="text-[12px] text-gray-400 font-medium">
                    Reported: {new Date(notice.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Approval card */}
                <div className="border border-gray-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 mb-1">
                      Action Summary
                    </p>
                    <p className="text-[12.5px] text-gray-500 font-medium leading-relaxed">
                      Please authorize the recommended safety measures or maintenance actions to proceed with the work request.
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                    <button
                      onClick={() => setApprovalStatus("rejected")}
                      className={`px-5 py-2.5 rounded-xl font-bold text-[13px] border-2 transition-colors cursor-pointer ${
                        approvalStatus === "rejected"
                          ? "bg-gray-200 border-gray-300 text-gray-700"
                          : "bg-white border-[#D12031] text-[#D12031] hover:bg-red-50"
                      }`}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setApprovalStatus("approved")}
                      className={`px-5 py-2.5 rounded-xl font-bold text-[13px] border-none transition-colors cursor-pointer shadow-sm ${
                        approvalStatus === "approved"
                          ? "bg-[#2e7d32] text-white"
                          : "bg-[#D12031] hover:bg-[#a81828] text-white"
                      }`}
                    >
                      {approvalStatus === "approved" ? "Approved ✓" : "Approve Action"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </CustomerLayout>
  );
}
