"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import CustomerLayout from "@/components/CustomerLayout";
import { FiRotateCcw, FiArrowLeft, FiPlus } from "react-icons/fi";

/* ── Types ── */
type Priority = "High" | "Medium" | "Low";

interface NoticeDetail {
  id: string;
  noticeType: string;
  priority: Priority;
  description: string;
  evidencePhotos: string[];
  approvalSummary: string;
  sentDate: string;
  sentTime: string;
}

/* ── Mock Data ── */
const NOTICES: NoticeDetail[] = [
  {
    id: "1",
    noticeType: "Maintenance Issue",
    priority: "High",
    description:
      "HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance",
    evidencePhotos: [
      "/images/onbording-background.png",
      "/images/onbording-background.png",
      "/images/onbording-background.png",
    ],
    approvalSummary:
      "Authorized reinforcement of secondary fan housing including parts and labor.",
    sentDate: "Oct 24, 2023",
    sentTime: "14:45",
  },
  {
    id: "2",
    noticeType: "Safety Concern",
    priority: "Medium",
    description:
      "HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance",
    evidencePhotos: [
      "/images/onbording-background.png",
      "/images/onbording-background.png",
      "/images/onbording-background.png",
    ],
    approvalSummary:
      "Authorized reinforcement of secondary fan housing including parts and labor.",
    sentDate: "Oct 25, 2023",
    sentTime: "10:30",
  },
  {
    id: "3",
    noticeType: "Maintenance Issue",
    priority: "Low",
    description:
      "HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance",
    evidencePhotos: [
      "/images/onbording-background.png",
      "/images/onbording-background.png",
      "/images/onbording-background.png",
    ],
    approvalSummary:
      "Authorized reinforcement of secondary fan housing including parts and labor.",
    sentDate: "Oct 26, 2023",
    sentTime: "09:00",
  },
  {
    id: "4",
    noticeType: "Routine Inspection",
    priority: "Medium",
    description:
      "HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance",
    evidencePhotos: [
      "/images/onbording-background.png",
      "/images/onbording-background.png",
      "/images/onbording-background.png",
    ],
    approvalSummary:
      "Authorized reinforcement of secondary fan housing including parts and labor.",
    sentDate: "Oct 27, 2023",
    sentTime: "11:20",
  },
  {
    id: "5",
    noticeType: "Emergency Alert",
    priority: "High",
    description:
      "HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance",
    evidencePhotos: [
      "/images/onbording-background.png",
      "/images/onbording-background.png",
      "/images/onbording-background.png",
    ],
    approvalSummary:
      "Authorized reinforcement of secondary fan housing including parts and labor.",
    sentDate: "Oct 28, 2023",
    sentTime: "07:45",
  },
  {
    id: "6",
    noticeType: "Maintenance Issue",
    priority: "Low",
    description:
      "HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance",
    evidencePhotos: [
      "/images/onbording-background.png",
      "/images/onbording-background.png",
      "/images/onbording-background.png",
    ],
    approvalSummary:
      "Authorized reinforcement of secondary fan housing including parts and labor.",
    sentDate: "Oct 30, 2023",
    sentTime: "15:00",
  },
];

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const notice = NOTICES.find((n) => n.id === params?.id) ?? NOTICES[0];

  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected">("pending");

  return (
    <CustomerLayout
      title="Notice & Notify"
      subtitle="Manage your Notice & Notify and track their progress"
    >
      {/* ── Back button ── */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#D12031] font-bold text-[13px] mb-5 hover:text-[#a81828] transition-colors cursor-pointer border-none bg-transparent p-0"
      >
        <FiArrowLeft size={16} />
        Back to Notice &amp; Notify
      </button>

      {/* ── Main Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Red Header */}
        <div className="bg-[#D12031] px-6 py-5 flex items-center gap-3">
          <FiRotateCcw size={20} className="text-white shrink-0" />
          <h2 className="text-white text-[18px] font-bold tracking-wide">
            Notice &amp; Notify History
          </h2>
        </div>

        {/* Body */}
        <div className="px-8 py-8 space-y-6">

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
            <p className="text-[13.5px] text-gray-500 font-medium">
              {notice.priority}
            </p>
          </div>

          {/* Detailed Description */}
          <div>
            <p className="text-[14px] font-bold text-gray-900 mb-2">
              Detailed Description
            </p>
            <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
              {notice.description}
            </p>
          </div>

          {/* Evidence Photos */}
          <div>
            <p className="text-[14px] font-bold text-gray-900 mb-3">
              Evidence Photos
            </p>
            <div className="flex items-start gap-3 flex-wrap">
              {/* Photo thumbnails */}
              {notice.evidencePhotos.map((src, i) => (
                <div
                  key={i}
                  className="relative w-[110px] h-[90px] rounded-xl overflow-hidden shadow-sm shrink-0"
                >
                  <Image
                    src={src}
                    alt={`Evidence ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                  {/* Filename bar at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/55 py-1 px-1.5 text-center">
                    <p className="text-[9px] text-white font-medium truncate">
                      Pipe.jpg
                    </p>
                  </div>
                </div>
              ))}

              {/* View All button */}
              <button className="w-[110px] h-[90px] rounded-xl border-2 border-[#D12031] bg-[#fff5f5] hover:bg-red-50 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0">
                <div className="w-7 h-7 rounded-full bg-[#D12031] flex items-center justify-center">
                  <FiPlus size={16} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[11px] font-bold text-[#D12031]">
                  View All
                </span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 w-full" />

          {/* Client Approval */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[14px] font-bold text-gray-900">
                Client Approval
              </p>
              <p className="text-[12px] text-gray-400 font-medium">
                Sent: {notice.sentDate} • {notice.sentTime}
              </p>
            </div>

            {/* Approval card */}
            <div className="border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
              {/* Left – summary text */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900 mb-1">
                  Approval Summary
                </p>
                <p className="text-[12.5px] text-gray-500 font-medium leading-relaxed">
                  {notice.approvalSummary}
                </p>
              </div>

              {/* Right – action buttons */}
              <div className="flex items-center gap-3 shrink-0">
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
                  {approvalStatus === "approved" ? "Approved ✓" : "Approved"}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </CustomerLayout>
  );
}
