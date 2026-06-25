"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import TechnicianLayout from "@/components/TechnicianLayout";
import { FiRotateCcw, FiCheckCircle } from "react-icons/fi";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

const MOCK_NOTICE_DETAIL = {
  id: "99402",
  type: "Maintenance Issue",
  priority: "Low",
  description: "HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance",
  photos: ["/images/warehouse_map.svg", "/images/warehouse_map.svg", "/images/warehouse_map.svg"],
  approvalDate: "Oct 24, 2023 • 14:45",
  approvalSummary: "Authorized reinforcement of secondary fan housing including parts and labor.",
  status: "Approved"
};

export default function NoticeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [notice, setNotice] = useState(MOCK_NOTICE_DETAIL);

  useEffect(() => {
    // In a real app, fetch notice details using params.id
    if (resolvedParams?.id) {
      setNotice({ ...MOCK_NOTICE_DETAIL, id: resolvedParams.id });
    }
  }, [resolvedParams]);

  return (
    <TechnicianLayout title="Notice & Notify" subtitle="Manage your Notice & Notify and track their progress">

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
            <h2 className="text-[16px] sm:text-[18px] font-bold truncate pr-2">Notice & Notify History</h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">

          {/* Notice Type */}
          <div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-1">Notice Type</h3>
            <p className="text-[14px] text-gray-600 font-medium">{notice.type}</p>
          </div>

          {/* Priority Level */}
          <div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-1">Priority Level</h3>
            <p className="text-[14px] text-gray-600 font-medium">{notice.priority}</p>
          </div>

          {/* Detailed Description */}
          <div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-1">Detailed Description</h3>
            <p className="text-[14px] text-gray-500 font-medium leading-relaxed max-w-3xl">
              {notice.description}
            </p>
          </div>

          {/* Evidence Photos */}
          <div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-3">Evidence Photos</h3>
            <div className="flex flex-wrap gap-3">
              {notice.photos.map((src, i) => (
                <div key={i} className="relative w-[76px] h-[76px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <Image src={src} alt="Evidence" fill className="object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white px-2 py-1 truncate text-center">
                    Pipe.jpg
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Client Approval */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-3 gap-1">
              <h3 className="text-[15px] font-bold text-gray-900">Client Approval</h3>
              <span className="text-[11px] sm:text-[12px] text-gray-500 font-medium">Sent: {notice.approvalDate}</span>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-white shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 sm:mb-2 gap-2">
                <h4 className="text-[14px] font-bold text-gray-900">Approval Summary</h4>
                <div className="flex items-center gap-1.5 text-[#D12031] bg-red-50 sm:bg-transparent px-2 py-1 sm:p-0 rounded-md sm:rounded-none w-fit">
                  <FiCheckCircle size={15} strokeWidth={2.5} />
                  <span className="text-[13px] sm:text-[14px] font-bold">{notice.status}</span>
                </div>
              </div>
              <p className="text-[13px] text-gray-500 font-medium">
                {notice.approvalSummary}
              </p>
            </div>
          </div>

        </div>

      </div>

    </TechnicianLayout>
  );
}
