"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  FiRotateCcw,
  FiArrowLeft,
  FiFileText,
} from "react-icons/fi";
import AdminLayout from "@/components/AdminLayout";

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
  senderName: string;
  senderRole: string;
  jobId: string;
  status: "Pending" | "Approved" | "Rejected";
  customerName: string;
  customerSubmitDate: string;
  customerSubmitTime: string;
  technicianName: string;
  technicianApproveDate: string;
  technicianApproveTime: string;
}

const NOTICES: NoticeDetail[] = [
  {
    id: "1",
    noticeType: "Maintenance Issue",
    priority: "High",
    description:
      "HVAC compressor is experiencing severe temperature surges. Operation pressure exceeds safety limits by 15%. Direct inspection is required to prevent lock-out.",
    evidencePhotos: [
      "/images/onbording-background.png",
      "/images/onbording-background.png",
    ],
    approvalSummary: "Pending admin assessment and dispatch routing.",
    sentDate: "June 19, 2026",
    sentTime: "10:15 AM",
    senderName: "John Doe",
    senderRole: "Technician",
    jobId: "99402",
    status: "Pending",
    customerName: "Maurice Maldonado",
    customerSubmitDate: "June 19, 2026",
    customerSubmitTime: "10:15 AM",
    technicianName: "John Doe",
    technicianApproveDate: "Pending review",
    technicianApproveTime: "Pending review",
  },
  {
    id: "2",
    noticeType: "Safety Concern",
    priority: "Medium",
    description:
      "Standing water observed in front of Main Lobby Restrooms. Slip risk is high. Janitorial team has been alerted, but warning signs must remain active.",
    evidencePhotos: [
      "/images/onbording-background.png",
    ],
    approvalSummary: "Pending admin assessment.",
    sentDate: "June 19, 2026",
    sentTime: "08:30 AM",
    senderName: "Maurice Maldonado",
    senderRole: "Customer",
    jobId: "99408",
    status: "Pending",
    customerName: "Alice Smith",
    customerSubmitDate: "June 19, 2026",
    customerSubmitTime: "08:30 AM",
    technicianName: "Unassigned",
    technicianApproveDate: "Pending review",
    technicianApproveTime: "Pending review",
  },
  {
    id: "3",
    noticeType: "Maintenance Issue",
    priority: "Low",
    description:
      "Flickering overhead tubes in lobby section A. Non-critical maintenance request filed to swap fixtures.",
    evidencePhotos: [
      "/images/onbording-background.png",
    ],
    approvalSummary: "Approved fixture change order. Scheduled with next dispatch rotation.",
    sentDate: "June 15, 2026",
    sentTime: "09:00 AM",
    senderName: "Maurice Maldonado",
    senderRole: "Customer",
    jobId: "99411",
    status: "Approved",
    customerName: "Robert Brown",
    customerSubmitDate: "June 15, 2026",
    customerSubmitTime: "09:00 AM",
    technicianName: "Sarah Connor",
    technicianApproveDate: "June 15, 2026",
    technicianApproveTime: "10:15 AM",
  },
  {
    id: "4",
    noticeType: "Maintenance Issue",
    priority: "Medium",
    description:
      "Corridor exit door lock is loose and fails to latch. Building security notified. Temporary lock-out tag placed.",
    evidencePhotos: [
      "/images/onbording-background.png",
    ],
    approvalSummary: "Pending lock-out hardware authorization.",
    sentDate: "June 18, 2026",
    sentTime: "04:30 PM",
    senderName: "Alex Mercer",
    senderRole: "Technician",
    jobId: "99415",
    status: "Pending",
    customerName: "Emma Wilson",
    customerSubmitDate: "June 18, 2026",
    customerSubmitTime: "04:30 PM",
    technicianName: "Alex Mercer",
    technicianApproveDate: "Pending review",
    technicianApproveTime: "Pending review",
  },
  {
    id: "5",
    noticeType: "Emergency Alert",
    priority: "High",
    description:
      "Ventilation fan motor at Loading Dock B has failed completely, resulting in minor dust build-up. Urgent replacement needed.",
    evidencePhotos: [
      "/images/onbording-background.png",
    ],
    approvalSummary: "Rejected. Request was duplicate of Work Order #99415.",
    sentDate: "June 17, 2026",
    sentTime: "01:20 PM",
    senderName: "Alex Mercer",
    senderRole: "Technician",
    jobId: "99416",
    status: "Rejected",
    customerName: "Emma Wilson",
    customerSubmitDate: "June 17, 2026",
    customerSubmitTime: "01:20 PM",
    technicianName: "Alex Mercer",
    technicianApproveDate: "June 17, 2026",
    technicianApproveTime: "02:00 PM",
  },
];

export default function AdminNoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [notice, setNotice] = useState<NoticeDetail | null>(null);

  useEffect(() => {
    if (params?.id) {
      const activeNotice = NOTICES.find((n) => n.id === params.id) || NOTICES[0];
      setNotice(activeNotice);
    }
  }, [params]);

  if (!notice) {
    return (
      <AdminLayout title="Notice Details" subtitle="Loading notice...">
        <div className="text-center py-10 font-semibold text-gray-500">Loading details...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={`Notice Review #${notice.id}`}
      subtitle="Examine safety notifications and view lifecycle details with custom resolutions"
    >
      <div className="max-w-7xl pb-10 space-y-6">
        
        {/* Back Link */}
        <button
          onClick={() => router.push("/admin/notice-notify")}
          className="flex items-center gap-1.5 text-xs font-bold text-[#D12031] hover:underline cursor-pointer border-none bg-transparent p-0"
        >
          <FiArrowLeft size={15} />
          <span>Back to Notice board</span>
        </button>

        {/* Notice Info Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-[#D12031] px-6 py-4.5 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <FiRotateCcw size={17} />
              <h3 className="text-sm font-bold tracking-wide">Notice Filing History</h3>
            </div>
            
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                notice.status === "Approved"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : notice.status === "Rejected"
                  ? "bg-rose-50 text-rose-700 border-rose-100"
                  : "bg-amber-50 text-amber-700 border-amber-100"
              }`}
            >
              {notice.status}
            </span>
          </div>

          {/* Details Body */}
          <div className="p-7 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Notice Type</p>
                <p className="text-xs font-bold text-gray-800">{notice.noticeType}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Priority</p>
                <p className="text-xs font-bold text-gray-800">{notice.priority} Priority</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Filer Profile</p>
                <p className="text-xs font-bold text-gray-800">{notice.senderName} ({notice.senderRole})</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Linked Job ID</p>
                <p className="text-xs font-bold text-[#D12031]">#{notice.jobId}</p>
              </div>
            </div>

            <div className="h-px bg-gray-150" />

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-2">Detailed Description</h4>
              <p className="text-xs text-gray-650 leading-relaxed font-semibold">{notice.description}</p>
            </div>

            {/* Photos */}
            {notice.evidencePhotos && notice.evidencePhotos.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-900 mb-3">Submitted Evidence Photos</h4>
                
                <div className="flex flex-wrap gap-3">
                  {notice.evidencePhotos.map((src, i) => (
                    <div key={i} className="relative w-28 h-20 rounded-xl overflow-hidden border border-gray-200">
                      <Image src={src} alt="Evidence" fill className="object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] py-0.5 text-center font-bold">
                        Attachment_{i+1}.jpg
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="h-px bg-gray-150" />

            {/* Filer & Approver Timeline Details (Notice Lifecycle Telemetry) */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <FiFileText className="text-[#D12031]" size={16} />
                <h4 className="text-xs font-bold text-gray-950">Notice Lifecycle Telemetry</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Customer Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">C</span>
                    <h5 className="text-xs font-bold text-gray-900">Customer Submission</h5>
                  </div>
                  <div className="space-y-2 text-xs font-semibold text-gray-600">
                    <div className="flex justify-between">
                      <span>Customer Name:</span>
                      <span className="text-gray-900">{notice.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Filing Date:</span>
                      <span className="text-gray-900">{notice.customerSubmitDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Filing Time:</span>
                      <span className="text-gray-900">{notice.customerSubmitTime}</span>
                    </div>
                  </div>
                </div>

                {/* Technician Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <span className="w-5 h-5 rounded-full bg-red-50 text-[#D12031] flex items-center justify-center font-black text-[10px]">T</span>
                    <h5 className="text-xs font-bold text-gray-900">Technician Review Details</h5>
                  </div>
                  <div className="space-y-2 text-xs font-semibold text-gray-600">
                    <div className="flex justify-between">
                      <span>Technician Name:</span>
                      <span className="text-gray-900">{notice.technicianName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Action Status:</span>
                      <span className={`font-bold ${
                        notice.status === "Approved" ? "text-emerald-600" : notice.status === "Rejected" ? "text-rose-600" : "text-amber-600"
                      }`}>{notice.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verification Date:</span>
                      <span className="text-gray-900">{notice.technicianApproveDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verification Time:</span>
                      <span className="text-gray-900">{notice.technicianApproveTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
