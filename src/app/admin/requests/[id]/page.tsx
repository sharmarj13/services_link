"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import {
  FiRotateCcw,
  FiUser,
  FiMapPin,
  FiBriefcase,
  FiCalendar,
  FiFileText,
  FiCpu,
  FiPhoneCall,
  FiMail,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiClock,
  FiCheckCircle,
  FiArrowLeft,
  FiAlertCircle,
} from "react-icons/fi";
import AdminLayout from "@/components/AdminLayout";

interface NoticeDetail {
  id: string;
  noticeType: string;
  priority: "High" | "Medium" | "Low";
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

const MOCK_NOTICES: NoticeDetail[] = [
  {
    id: "1",
    noticeType: "Maintenance Issue",
    priority: "High",
    description: "HVAC compressor is experiencing severe temperature surges. Operation pressure exceeds safety limits by 15%. Direct inspection is required to prevent lock-out.",
    evidencePhotos: ["/images/onbording-background.png", "/images/onbording-background.png"],
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
    description: "Standing water observed in front of Main Lobby Restrooms. Slip risk is high. Janitorial team has been alerted, but warning signs must remain active.",
    evidencePhotos: ["/images/onbording-background.png"],
    approvalSummary: "Pending admin assessment.",
    sentDate: "June 19, 2026",
    sentTime: "08:30 AM",
    senderName: "Maurice Maldonado",
    senderRole: "Customer",
    jobId: "99403",
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
    description: "Flickering overhead tubes in lobby section A. Non-critical maintenance request filed to swap fixtures.",
    evidencePhotos: ["/images/onbording-background.png"],
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
    description: "Corridor exit door lock is loose and fails to latch. Building security notified. Temporary lock-out tag placed.",
    evidencePhotos: ["/images/onbording-background.png"],
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
    description: "Ventilation fan motor at Loading Dock B has failed completely, resulting in minor dust build-up. Urgent replacement needed.",
    evidencePhotos: ["/images/onbording-background.png"],
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

interface JobDetail {
  id: string;
  title: string;
  status: "Pending" | "Assigned" | "In-Progress" | "Completed" | "Active";
  customer: string;
  siteLocation: string;
  department: string;
  scheduleDate: string;
  poNumber: string;
  assetId: string;
  scopeOfWork: string;
  contactName: string;
  contactRole: string;
  contactInitials: string;
  attachments: string[];
  workType?: string;
  workType2?: string;
  priority?: string;
  duration?: string;
  unit?: string;
  quantity?: string;
  category?: string;
  ppeUsed?: string[];
  additionalNotes?: string;
  detailedDescription?: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
  assignedTechnician?: string;
}

const DEFAULT_JOB_DETAIL: JobDetail = {
  id: "99402",
  title: "HVAC Compressor Maintenance",
  status: "Assigned",
  customer: "Maurice Maldonado",
  siteLocation: "Warehouse D, Bay 14",
  department: "Maintenance & Ops",
  scheduleDate: "Oct 24, 08:00 AM",
  poNumber: "#PO-882910",
  assetId: "HVAC-UNIT-04",
  scopeOfWork:
    "Diagnose the network issue, inspect switches and cabling, identify the root cause, and restore connectivity. Test the network after repairs and provide a completion report.",
  contactName: "James Brennan",
  contactRole: "Facility Manager",
  contactInitials: "JB",
  attachments: [
    "/images/onbording-background.png",
    "/images/onbording-background.png",
    "/images/onbording-background.png",
  ],
  workType: "Routine",
  workType2: "Recyclable",
  priority: "Medium",
  duration: "30 Minute",
  unit: "Select unit",
  quantity: "0.00",
  category: "Cleaning",
  ppeUsed: ["Safety Glasses", "Face Respirator", "Boots"],
  additionalNotes: "HVAC Compressor Maintenance HVAC Compressor Maintenance",
  detailedDescription:
    "HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance HVAC Compressor Maintenance",
  beforePhotos: [
    "/images/onbording-background.png",
    "/images/onbording-background.png",
  ],
  afterPhotos: [
    "/images/onbording-background.png",
    "/images/onbording-background.png",
  ],
};

/* ─── Status badge config ─── */
const STATUS_BADGE: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  Pending: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
    label: "Assigned",
  },
  Assigned: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
    label: "Assigned",
  },
  "In-Progress": {
    bg: "bg-[#fff8e1]",
    text: "text-[#f59e0b]",
    border: "border-[#fde68a]",
    label: "Active",
  },
  Completed: {
    bg: "bg-white",
    text: "text-[#D12031]",
    border: "border-[#D12031]",
    label: "Completed",
  },
  Active: {
    bg: "bg-[#e8f5e9]",
    text: "text-[#2e7d32]",
    border: "border-[#a5d6a7]",
    label: "Active",
  },
};

export default function AdminRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobDetail>(DEFAULT_JOB_DETAIL);
  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (params?.id) {
      const id = params.id as string;
      
      // Look up notice for this jobId (mock for now until notices are fully migrated)
      const foundNotice = MOCK_NOTICES.find((n) => n.jobId === id);
      setNotice(foundNotice || null);

      const fetchJob = async () => {
        try {
          const res = await fetch(`/api/admin/work-requests/${id}`);
          if (res.ok) {
            const found = await res.json();
            let s = found.status.toLowerCase();
            if (s === "in_progress" || s === "in-progress") s = "Active";
            else if (s === "pending") s = "Assigned";
            else s = found.status;
            
            setJob({
              ...DEFAULT_JOB_DETAIL,
              id: found.id,
              title: found.title,
              status: s,
              customer: found.customer,
              siteLocation: `${found.site}, ${found.location || "Facility Area 1A"}`,
              department: found.department !== "None" ? found.department : "Maintenance & Ops",
              detailedDescription: found.description,
              scopeOfWork: found.scopeOfWork || DEFAULT_JOB_DETAIL.scopeOfWork,
              assignedTechnician: found.assignedTechnician || "Unassigned",
              category: found.category || DEFAULT_JOB_DETAIL.category,
              priority: found.priority || DEFAULT_JOB_DETAIL.priority,
            });
          } else {
            // Fallback if not found
            setJob({ ...DEFAULT_JOB_DETAIL, id, status: "Assigned", assignedTechnician: "Unassigned" });
          }
        } catch (err) {
          console.error("Failed to fetch job detail:", err);
          setJob({ ...DEFAULT_JOB_DETAIL, id, status: "Assigned", assignedTechnician: "Unassigned" });
        }
      };
      fetchJob();
    }
  }, [params]);

  const isAssigned = job.status === "Assigned" || job.status === "Pending";
  const badge = STATUS_BADGE[job.status] ?? STATUS_BADGE["Assigned"];

  return (
    <AdminLayout
      title="Work Requests"
      subtitle="Manage your work requests and track their progress"
    >
      <div className="w-full">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#D12031] font-bold text-[13px] mb-5 hover:text-[#a81828] transition-colors cursor-pointer border-none bg-transparent p-0"
        >
          <FiArrowLeft size={16} />
          Back to Requests list
        </button>

        {isAssigned ? (
          /* ══════════════ ASSIGNED LAYOUT ══════════════ */
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ── Left Column ── */}
            <div className="flex-1 flex flex-col gap-5 min-w-0">
              {/* Job Information Card */}
              <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-sm overflow-hidden">
                <div className="px-6 pt-6 pb-5">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[17px] font-bold text-gray-900">
                      Job Information
                    </h3>
                    <span
                      className={`px-4 py-1.5 rounded-full text-[12px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
                    {/* Customer */}
                    <div className="flex items-center gap-2.5">
                      <FiUser className="text-gray-400 shrink-0" size={15} />
                      <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">
                        Customer :
                      </span>
                      <span className="text-[#D12031] font-semibold text-[13px] truncate">
                        {job.customer}
                      </span>
                    </div>
                    {/* Site Location */}
                    <div className="flex items-center gap-2.5">
                      <FiMapPin className="text-gray-400 shrink-0" size={15} />
                      <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">
                        Site Location :
                      </span>
                      <span className="text-[#D12031] font-semibold text-[13px] truncate">
                        {job.siteLocation}
                      </span>
                    </div>
                    {/* Department */}
                    <div className="flex items-center gap-2.5">
                      <FiBriefcase className="text-gray-400 shrink-0" size={15} />
                      <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">
                        Department :
                      </span>
                      <span className="text-[#D12031] font-semibold text-[13px] truncate">
                        {job.department}
                      </span>
                    </div>
                    {/* Schedule Date */}
                    <div className="flex items-center gap-2.5">
                      <FiCalendar className="text-gray-400 shrink-0" size={15} />
                      <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">
                        Schedule Date :
                      </span>
                      <span className="text-[#D12031] font-semibold text-[13px] truncate">
                        {job.scheduleDate}
                      </span>
                    </div>
                    {/* PO Number */}
                    <div className="flex items-center gap-2.5">
                      <FiFileText className="text-gray-400 shrink-0" size={15} />
                      <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">
                        PO Number :
                      </span>
                      <span className="text-[#D12031] font-semibold text-[13px] truncate">
                        {job.poNumber}
                      </span>
                    </div>
                    {/* Asset ID */}
                    <div className="flex items-center gap-2.5">
                      <FiCpu className="text-gray-400 shrink-0" size={15} />
                      <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">
                        Asset ID :
                      </span>
                      <span className="text-[#D12031] font-semibold text-[13px] truncate">
                        {job.assetId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scope of Work Card */}
              <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-sm p-6">
                <h3 className="text-[16px] font-bold text-gray-900 mb-3">
                  Scope of Work
                </h3>
                <p className="text-[13.5px] text-gray-600 leading-relaxed font-medium">
                  {job.scopeOfWork}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-[#D12031] text-[#D12031] rounded-xl font-bold text-[14px] hover:bg-red-50 transition-colors cursor-pointer bg-white">
                  <FiEdit2 size={16} />
                  Edit Request
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#D12031] text-white rounded-xl font-bold text-[14px] hover:bg-[#a81828] transition-colors cursor-pointer border-none shadow-sm"
                >
                  <FiTrash2 size={16} />
                  Delete Request
                </button>
              </div>
            </div>

            {/* ── Right Column ── */}
            <div className="w-full lg:w-[310px] flex flex-col gap-5 shrink-0">
              {/* Assign Technician Card (Only shown if unassigned) */}
              {(job.assignedTechnician === "Unassigned" || !job.assignedTechnician) && (
                <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D12031]" />
                  <div className="flex items-center gap-2 mb-3">
                    <FiUser className="text-[#D12031]" size={17} />
                    <h3 className="text-[15px] font-bold text-gray-900">
                      Assign Technician
                    </h3>
                  </div>
                  <p className="text-[11px] text-gray-400 font-semibold mb-4 leading-relaxed">
                    This facility request is currently unassigned. Dispatch a technician to begin.
                  </p>
                  <div className="space-y-3">
                    <select
                      id="details-assign-tech-select"
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-955 outline-none focus:border-[#D12031]"
                    >
                      <option value="Unassigned">Select Technician...</option>
                      <option value="John Doe">John Doe</option>
                      <option value="Bob Johnson">Bob Johnson</option>
                      <option value="Sarah Connor">Sarah Connor</option>
                      <option value="Alex Mercer">Alex Mercer</option>
                    </select>
                    <button
                      onClick={() => {
                        const select = document.getElementById("details-assign-tech-select") as HTMLSelectElement;
                        const val = select.value;
                        if (val && val !== "Unassigned") {
                          // Update job status and tech
                          const updatedJob: JobDetail = {
                            ...job,
                            assignedTechnician: val,
                            status: "Active"
                          };
                          setJob(updatedJob);
                          // Persist update in requests database
                          if (typeof window !== "undefined") {
                            let reqs: Array<{ id: string; assignedTechnician?: string; status?: string }> = [];
                            const saved = localStorage.getItem("servicelink_requests");
                            if (saved) {
                              try { reqs = JSON.parse(saved); } catch {}
                            }
                            const index = reqs.findIndex((r: { id: string }) => r.id === job.id);
                            if (index !== -1) {
                              reqs[index].assignedTechnician = val;
                              reqs[index].status = "Active";
                              localStorage.setItem("servicelink_requests", JSON.stringify(reqs));
                            }
                          }
                          alert(`Technician ${val} assigned successfully. Status updated to Active.`);
                          window.location.reload();
                        } else {
                          alert("Please select a technician.");
                        }
                      }}
                      className="w-full py-2.5 bg-[#D12031] text-white rounded-xl font-bold text-xs hover:bg-[#a81828] transition-colors border-none cursor-pointer"
                    >
                      Assign Work
                    </button>
                  </div>
                </div>
              )}

              {/* Contact Details Card */}
              <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <FiUser className="text-gray-500" size={17} />
                  <h3 className="text-[15px] font-bold text-gray-900">
                    Contact Details
                  </h3>
                </div>
                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
                  <div className="w-11 h-11 rounded-full bg-[#fde8ea] flex items-center justify-center text-[#D12031] font-bold text-[14px] shrink-0">
                    {job.contactInitials}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-900">
                      {job.contactName}
                    </h4>
                    <p className="text-[12px] text-gray-500 mt-0.5 font-medium">
                      {job.contactRole}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button className="w-full py-3 bg-[#D12031] text-white rounded-xl font-bold text-[13px] flex justify-center items-center gap-2 hover:bg-[#a81828] transition-colors cursor-pointer border-none shadow-sm">
                    <FiPhoneCall size={15} />
                    Call
                  </button>
                  <button className="w-full py-3 border-2 border-[#D12031] text-[#D12031] rounded-xl font-bold text-[13px] flex justify-center items-center gap-2 hover:bg-red-50 transition-colors cursor-pointer bg-white">
                    <FiMail size={15} />
                    Email Contact
                  </button>
                </div>
              </div>

              {/* Attachments Card */}
              <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-sm p-6">
                <h3 className="text-[15px] font-bold text-gray-900 mb-4">
                  Attachments
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Add Photo Button */}
                  <button className="h-[88px] rounded-xl border-2 border-dashed border-[#D12031] flex flex-col items-center justify-center text-[#D12031] hover:bg-red-50 transition-colors cursor-pointer bg-white gap-1">
                    <div className="w-7 h-7 rounded-full bg-[#D12031] flex items-center justify-center">
                      <FiPlus size={16} className="text-white" />
                    </div>
                    <span className="text-[11px] font-semibold">Add Photo</span>
                  </button>
                  {/* Attachment thumbnails */}
                  {job.attachments.map((src, i) => (
                    <div
                      key={i}
                      className="relative h-[88px] rounded-xl overflow-hidden shadow-sm group"
                    >
                      <Image
                        src={src}
                        alt={`Attachment ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                      {/* Delete icon */}
                      <button className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#D12031] rounded-full flex items-center justify-center opacity-90 hover:opacity-100 cursor-pointer border-none">
                        <FiTrash2 size={10} className="text-white" />
                      </button>
                      {/* Filename */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/55 py-1 px-1.5">
                        <p className="text-[9px] text-white truncate text-center font-medium">
                          Warehouse_Map.png
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ══════════════ IN-PROGRESS / COMPLETED LAYOUT ══════════════ */
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ── Left Column – Job History ── */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl shadow-sm border border-[#e0e0e0] overflow-hidden">
                {/* Red Header */}
                <div className="bg-[#D12031] px-6 py-5 flex justify-between items-center">
                  <div className="flex items-center gap-2.5 text-white">
                    <FiRotateCcw size={19} />
                    <h3 className="text-[18px] font-bold tracking-wide">
                      Job History
                    </h3>
                  </div>
                  {/* Status Badge */}
                  <span
                    className={`px-5 py-1.5 rounded-full text-[12.5px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Body */}
                <div className="p-7">
                  {/* Main info grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-7 gap-x-6 mb-8">
                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Request Title
                      </p>
                      <p className="text-[13px] text-gray-550 font-medium">
                        {job.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Work Type
                      </p>
                      <p className="text-[13px] text-gray-550 font-medium">
                        {job.workType}
                      </p>
                    </div>
                    <div className="hidden md:block" />

                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Site Location
                      </p>
                      <p className="text-[13px] text-gray-550 font-medium">
                        {job.siteLocation}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Priority
                      </p>
                      <p className="text-[13px] text-gray-550 font-medium">
                        {job.priority}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Duration
                      </p>
                      <p className="text-[13px] text-gray-550 font-medium">
                        {job.duration}
                      </p>
                    </div>

                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Schedule Date
                      </p>
                      <p className="text-[13px] text-gray-550 font-medium">
                        {job.scheduleDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Work Type
                      </p>
                      <p className="text-[13px] text-gray-550 font-medium">
                        {job.workType2}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Unit
                      </p>
                      <p className="text-[13px] text-gray-550 font-medium">
                        {job.unit}
                      </p>
                    </div>

                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Department
                      </p>
                      <p className="text-[13px] text-gray-550 font-medium">
                        {job.department}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Quantity
                      </p>
                      <p className="text-[13px] text-gray-550 font-medium">
                        {job.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Category
                      </p>
                      <p className="text-[13px] text-gray-550 font-medium">
                        {job.category}
                      </p>
                    </div>
                  </div>

                  {/* PPE Used */}
                  <div className="mb-7">
                    <p className="text-[13px] font-bold text-gray-900 mb-3">
                      PPE Used
                    </p>
                    <div className="border border-red-250 rounded-xl p-4 inline-block min-w-[220px]">
                      <ul className="space-y-2.5">
                        {job.ppeUsed?.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-3 text-[13px] text-gray-600 font-medium"
                          >
                            <span className="w-2 h-2 rounded-full bg-[#D12031] shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="mb-5">
                    <p className="text-[13px] font-bold text-gray-900 mb-2">
                      Additional Notes
                    </p>
                    <p className="text-[13px] text-gray-500 font-medium">
                      {job.additionalNotes}
                    </p>
                  </div>

                  <div className="h-px bg-gray-100 w-full my-5" />

                  {/* Detailed Description */}
                  <div>
                    <p className="text-[13px] font-bold text-gray-900 mb-2">
                      Detailed Description
                    </p>
                    <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                      {job.detailedDescription}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notice & Notify Details Card */}
              {notice && (
                <div className="bg-red-50/40 border border-red-200 rounded-2xl shadow-xs p-6 relative overflow-hidden mt-6 animate-[fadeIn_0.3s_ease]">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-100/30 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6.5 h-6.5 rounded-xl bg-red-150 text-[#D12031]">
                        <FiAlertCircle size={15} />
                      </span>
                      <h3 className="text-[15px] font-black text-gray-900">
                        Notice & Notify Details
                      </h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                        notice.status === "Approved"
                          ? "bg-emerald-55/70 text-emerald-700 border-emerald-100"
                          : notice.status === "Rejected"
                          ? "bg-rose-55/70 text-rose-700 border-rose-100"
                          : "bg-amber-55/70 text-amber-700 border-amber-100"
                      }`}
                    >
                      {notice.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 pb-5 border-b border-red-150/40 text-xs font-semibold text-gray-600">
                    <div>
                      <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">Notice Type</p>
                      <p className="text-gray-800 font-bold mt-1 text-[13px]">{notice.noticeType}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">Priority Level</p>
                      <p className="text-gray-800 font-bold mt-1 text-[13px]">{notice.priority}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">Reported By</p>
                      <p className="text-gray-800 font-bold mt-1 text-[13px]">{notice.senderName} ({notice.senderRole})</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">Filing Time</p>
                      <p className="text-gray-800 font-bold mt-1 text-[13px]">{notice.sentDate} at {notice.sentTime}</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs font-semibold">
                    <div>
                      <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">Detailed Description</p>
                      <p className="text-gray-700 leading-relaxed font-semibold mt-1.5 text-[13px]">
                        {notice.description}
                      </p>
                    </div>

                    {/* Evidence Photos */}
                    {notice.evidencePhotos && notice.evidencePhotos.length > 0 && (
                      <div className="border-t border-red-150/30 pt-4">
                        <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider mb-2.5">Submitted Evidence Photos</p>
                        <div className="flex flex-wrap gap-3">
                          {notice.evidencePhotos.map((src, i) => (
                            <div key={i} className="relative w-24 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-xs bg-white">
                              <Image src={src} alt="Evidence Attachment" fill className="object-cover" />
                              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white py-0.5 text-center font-bold">
                                Attachment_{i + 1}.jpg
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notice Lifecycle Telemetry */}
                    <div className="border-t border-red-150/30 pt-4">
                      <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider mb-3">Notice Lifecycle Details</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Customer Section */}
                        <div className="bg-white border border-gray-150 rounded-xl p-4 space-y-2.5">
                          <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100">
                            <span className="w-5 h-5 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[9px]">C</span>
                            <h5 className="text-[11px] font-bold text-gray-900">Customer Review</h5>
                          </div>
                          <div className="space-y-1.5 text-[11px] text-gray-600 font-semibold">
                            <div className="flex justify-between">
                              <span>Customer:</span>
                              <span className="text-gray-900 font-bold">{notice.customerName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Date/Time:</span>
                              <span className="text-gray-900">{notice.customerSubmitDate} {notice.customerSubmitTime}</span>
                            </div>
                          </div>
                        </div>

                        {/* Technician Section */}
                        <div className="bg-white border border-gray-150 rounded-xl p-4 space-y-2.5">
                          <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100">
                            <span className="w-5 h-5 rounded-lg bg-red-50 text-[#D12031] flex items-center justify-center font-black text-[9px]">T</span>
                            <h5 className="text-[11px] font-bold text-gray-900">Technician Action</h5>
                          </div>
                          <div className="space-y-1.5 text-[11px] text-gray-600 font-semibold">
                            <div className="flex justify-between">
                              <span>Technician:</span>
                              <span className="text-gray-900 font-bold">{notice.technicianName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Review Date:</span>
                              <span className="text-gray-900">{notice.technicianApproveDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Column – Photos ── */}
            <div className="w-full lg:w-[270px] shrink-0 flex flex-col gap-5">
              {/* Before Photos */}
              <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-sm p-5">
                <h3 className="text-[14px] font-bold text-gray-900 mb-4">
                  Before Photos
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {job.beforePhotos?.map((src, i) => (
                    <div
                      key={i}
                      className="relative h-[66px] rounded-lg overflow-hidden shadow-sm"
                    >
                      <Image
                        src={src}
                        alt="Before"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/35" />
                      <div className="absolute bottom-1 left-1 right-1 text-[7px] text-white leading-tight font-medium">
                        Before
                        <br />
                        Feb week 2, 2023
                      </div>
                    </div>
                  ))}
                  <button className="h-[66px] rounded-lg bg-red-50 border border-[#D12031] flex flex-col items-center justify-center text-[#D12031] hover:bg-red-100 transition-colors cursor-pointer gap-0.5">
                    <FiPlus size={14} strokeWidth={2.5} />
                    <span className="text-[9px] font-bold">View All</span>
                  </button>
                </div>
              </div>

              {/* After Photos */}
              <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-sm p-5">
                <h3 className="text-[14px] font-bold text-gray-900 mb-4">
                  After Photos
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {job.afterPhotos?.map((src, i) => (
                    <div
                      key={i}
                      className="relative h-[66px] rounded-lg overflow-hidden shadow-sm"
                    >
                      <Image
                        src={src}
                        alt="After"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/35" />
                      <div className="absolute bottom-1 left-1 right-1 text-[7px] text-white leading-tight font-medium">
                        After
                        <br />
                        March week 2, 2023
                      </div>
                    </div>
                  ))}
                  <button className="h-[66px] rounded-lg bg-red-50 border border-[#D12031] flex flex-col items-center justify-center text-[#D12031] hover:bg-red-100 transition-colors cursor-pointer gap-0.5">
                    <FiPlus size={14} strokeWidth={2.5} />
                    <span className="text-[9px] font-bold">View All</span>
                  </button>
                </div>
              </div>

              {/* Status Progress Timeline */}
              <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-sm p-5">
                <h3 className="text-[14px] font-bold text-gray-900 mb-4">
                  Request Progress
                </h3>
                <div className="flex flex-col gap-0">
                  {/* Step 1 – Assigned */}
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                          job.status === "Pending" ||
                          job.status === "Active" ||
                          job.status === "Assigned" ||
                          job.status === "In-Progress" ||
                          job.status === "Completed"
                            ? "bg-[#D12031]"
                            : "bg-gray-200"
                        }`}
                      >
                        <FiCheckCircle
                          size={15}
                          className={
                            job.status === "Pending" ||
                            job.status === "Active" ||
                            job.status === "Assigned" ||
                            job.status === "In-Progress" ||
                            job.status === "Completed"
                              ? "text-white"
                              : "text-gray-400"
                          }
                        />
                      </div>
                      <div
                        className={`w-0.5 h-8 ${
                          job.status === "Active" ||
                          job.status === "In-Progress" ||
                          job.status === "Completed"
                            ? "bg-[#D12031]"
                            : "bg-gray-200"
                        }`}
                      />
                    </div>
                    <div className="pt-1">
                      <p
                        className={`text-[12px] font-bold ${
                          job.status === "Pending" ||
                          job.status === "Active" ||
                          job.status === "Assigned" ||
                          job.status === "In-Progress" ||
                          job.status === "Completed"
                            ? "text-[#D12031]"
                            : "text-gray-400"
                        }`}
                      >
                        Assigned
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Awaiting assignment
                      </p>
                    </div>
                  </div>

                  {/* Step 2 – Active */}
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                          job.status === "Active" ||
                          job.status === "In-Progress" ||
                          job.status === "Completed"
                            ? "bg-[#D12031]"
                            : "bg-gray-200"
                        }`}
                      >
                        <FiClock
                          size={15}
                          className={
                            job.status === "Active" ||
                            job.status === "In-Progress" ||
                            job.status === "Completed"
                              ? "text-white"
                              : "text-gray-400"
                          }
                        />
                      </div>
                      <div
                        className={`w-0.5 h-8 ${
                          job.status === "Completed"
                            ? "bg-[#D12031]"
                            : "bg-gray-200"
                        }`}
                      />
                    </div>
                    <div className="pt-1">
                      <p
                        className={`text-[12px] font-bold ${
                          job.status === "Active" ||
                          job.status === "In-Progress" ||
                          job.status === "Completed"
                            ? "text-[#D12031]"
                            : "text-gray-400"
                        }`}
                      >
                        Active
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Technician dispatched
                      </p>
                    </div>
                  </div>

                  {/* Step 3 – Completed */}
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                          job.status === "Completed"
                            ? "bg-[#D12031]"
                            : "bg-gray-200"
                        }`}
                      >
                        <FiCheckCircle
                          size={15}
                          className={
                            job.status === "Completed"
                              ? "text-white"
                              : "text-gray-400"
                          }
                        />
                      </div>
                    </div>
                    <div className="pt-1">
                      <p
                        className={`text-[12px] font-bold ${
                          job.status === "Completed"
                            ? "text-[#D12031]"
                            : "text-gray-400"
                        }`}
                      >
                        Completed
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Job finished
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════ Delete Confirm Modal ══════════════ */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl w-full max-w-[420px] overflow-hidden shadow-2xl animate-[modalSlideUp_0.22s_ease]">
            <div className="bg-[#D12031] text-white text-center py-5">
              <h2 className="text-[18px] font-bold">Delete Work Request</h2>
            </div>
            <div className="p-8 text-center">
              <p className="text-[14px] text-gray-600 font-medium leading-relaxed mb-8">
                Are you sure you want to delete &quot;
                <span className="font-bold text-gray-900">{job.title}</span>
                &quot;? This action cannot be undone and will remove all
                associated data.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition-colors cursor-pointer border-none"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    router.push("/admin/requests");
                  }}
                  className="flex-1 py-3.5 bg-[#D12031] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#a81828] transition-colors cursor-pointer border-none shadow-sm shadow-red-500/20"
                >
                  <FiTrash2 size={17} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </AdminLayout>
  );
}
