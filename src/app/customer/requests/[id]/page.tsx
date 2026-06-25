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
  FiAlertCircle,
  FiTag,
} from "react-icons/fi";
import CustomerLayout from "@/components/CustomerLayout";

interface JobDetail {
  id: string;
  title: string;
  status: "Assigned" | "In-Progress" | "Completed" | "Active";
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

const HARDCODED_JOBS: Record<
  string,
  {
    title: string;
    location: string;
    priority: string;
    status: "Assigned" | "In-Progress" | "Completed" | "Active";
  }
> = {
  "99402": { title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "Assigned" },
  "99403": { title: "Lighting Fix & Bulbs Replacement", location: "Main Assembly Floor", priority: "Medium", status: "Assigned" },
  "99404": { title: "Bioreactor Calibration Check", location: "Lab Section 1", priority: "Low", status: "Assigned" },
  "99405": { title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "Assigned" },
  "99406": { title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "Low", status: "Assigned" },
  "99407": { title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "Assigned" },
  "99408": { title: "Routine Safety Inspection", location: "Main Assembly Floor", priority: "Low", status: "Assigned" },
  "99410": { title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "Completed" },
  "99411": { title: "HVAC Evaporator Fan Cleanup", location: "Facility Area 4B", priority: "Medium", status: "Completed" },
  "99412": { title: "Routine Safety Inspection", location: "Warehouse D", priority: "Low", status: "Completed" },
  "99413": { title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "Completed" },
  "99414": { title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "Low", status: "Completed" },
  "99415": { title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "Completed" },
  "99420": { title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "In-Progress" },
  "99421": { title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "Medium", status: "In-Progress" },
  "99422": { title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "Low", status: "In-Progress" },
  "99423": { title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "In-Progress" },
  "99424": { title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "Low", status: "In-Progress" },
  "99425": { title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "In-Progress" },
  "99430": { title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "Active" },
  "99431": { title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "Medium", status: "Active" },
  "99432": { title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "Low", status: "Active" },
  "99433": { title: "HVAC Compressor Maintenance", location: "Facility Area 4B", priority: "High", status: "Active" },
};

/* ─── Status badge config ─── */
const STATUS_BADGE: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  Assigned: {
    bg: "bg-[#e8f5e9]",
    text: "text-[#2e7d32]",
    border: "border-[#a5d6a7]",
    label: "Assigned",
  },
  "In-Progress": {
    bg: "bg-[#fff8e1]",
    text: "text-[#f59e0b]",
    border: "border-[#fde68a]",
    label: "In-Progress",
  },
  Completed: {
    bg: "bg-white",
    text: "text-[#D12031]",
    border: "border-[#D12031]",
    label: "Completed",
  },
  Active: {
    bg: "bg-[#e3f2fd]",
    text: "text-[#1565c0]",
    border: "border-[#90caf9]",
    label: "Active",
  },
};

export default function CustomerRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobDetail>(DEFAULT_JOB_DETAIL);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* ── Edit Modal states ── */
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editPo, setEditPo] = useState("");
  const [editAsset, setEditAsset] = useState("");
  const [editScope, setEditScope] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editAdditionalNotes, setEditAdditionalNotes] = useState("");
  const [editDetailedDesc, setEditDetailedDesc] = useState("");

  /* ── Toast message state ── */
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const openEditModal = () => {
    setEditTitle(job.title);
    setEditLocation(job.siteLocation);
    setEditDept(job.department);
    setEditDate(job.scheduleDate);
    setEditPo(job.poNumber);
    setEditAsset(job.assetId);
    setEditScope(job.scopeOfWork);
    setEditPriority(job.priority || "Medium");
    setEditCategory(job.category || "Cleaning");
    setEditAdditionalNotes(job.additionalNotes || "");
    setEditDetailedDesc(job.detailedDescription || "");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editLocation.trim() || !editDept.trim() || !editDate.trim() || !editScope.trim()) {
      alert("Please fill in all required fields (Title, Site Location, Department, Schedule Date, and Scope of Work).");
      return;
    }
    const updated = {
      ...job,
      title: editTitle.trim(),
      siteLocation: editLocation.trim(),
      department: editDept.trim(),
      scheduleDate: editDate.trim(),
      poNumber: editPo.trim(),
      assetId: editAsset.trim(),
      scopeOfWork: editScope.trim(),
      priority: editPriority,
      category: editCategory,
      additionalNotes: editAdditionalNotes.trim(),
      detailedDescription: editDetailedDesc.trim(),
    };
    setJob(updated);

    // Persist edit back to localStorage
    try {
      const existing: JobDetail[] = JSON.parse(localStorage.getItem("customerRequests") || "[]");
      const idx = existing.findIndex((r) => r.id === updated.id);
      if (idx !== -1) {
        existing[idx] = updated;
      } else {
        existing.unshift(updated);
      }
      localStorage.setItem("customerRequests", JSON.stringify(existing));
    } catch {}

    setIsEditModalOpen(false);
    showToast("Work request updated successfully!");
  };

  useEffect(() => {
    if (!params?.id) return;
    const id = params.id as string;

    // 1️⃣ Check localStorage first (user-created requests)
    try {
      const stored: JobDetail[] = JSON.parse(localStorage.getItem("customerRequests") || "[]");
      const found = stored.find((r) => r.id === id);
      if (found) {
        setJob(found);
        return;
      }
    } catch {}

    // 2️⃣ Fall back to HARDCODED_JOBS or DEFAULT_JOB_DETAIL for demo/hardcoded IDs
    const hardcoded = HARDCODED_JOBS[id];
    if (hardcoded) {
      setJob({
        ...DEFAULT_JOB_DETAIL,
        id,
        title: hardcoded.title,
        siteLocation: hardcoded.location,
        priority: hardcoded.priority,
        status: hardcoded.status,
      });
    } else {
      if (id.startsWith("9942")) {
        setJob({ ...DEFAULT_JOB_DETAIL, id, status: "In-Progress" });
      } else if (id.startsWith("9941")) {
        setJob({ ...DEFAULT_JOB_DETAIL, id, status: "Completed" });
      } else if (id.startsWith("9943")) {
        setJob({ ...DEFAULT_JOB_DETAIL, id, status: "Active" });
      } else {
        setJob({ ...DEFAULT_JOB_DETAIL, id, status: "Assigned" });
      }
    }
  }, [params]);

  const isAssigned = job.status === "Assigned" || job.status === "Active";
  const badge = STATUS_BADGE[job.status] ?? STATUS_BADGE["Assigned"];

  return (
    <CustomerLayout
      title="Work Requests"
      subtitle="Manage your work requests and track their progress"
    >
      <div className="w-full">
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
                    {/* Priority */}
                    <div className="flex items-center gap-2.5">
                      <FiAlertCircle className="text-gray-400 shrink-0" size={15} />
                      <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">
                        Priority :
                      </span>
                      <span className="text-[#D12031] font-semibold text-[13px] truncate font-bold text-gray-800">
                        {job.priority || "Medium"}
                      </span>
                    </div>
                    {/* Category */}
                    <div className="flex items-center gap-2.5">
                      <FiTag className="text-gray-400 shrink-0" size={15} />
                      <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">
                        Category :
                      </span>
                      <span className="text-[#D12031] font-semibold text-[13px] truncate font-bold text-gray-800">
                        {job.category || "Cleaning"}
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

              {/* Detailed Description Card */}
              {job.detailedDescription && (
                <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-sm p-6">
                  <h3 className="text-[16px] font-bold text-gray-900 mb-3">
                    Detailed Description
                  </h3>
                  <p className="text-[13.5px] text-gray-600 leading-relaxed font-medium">
                    {job.detailedDescription}
                  </p>
                </div>
              )}

              {/* Additional Notes Card */}
              {job.additionalNotes && (
                <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-sm p-6">
                  <h3 className="text-[16px] font-bold text-gray-900 mb-3">
                    Additional Notes
                  </h3>
                  <p className="text-[13.5px] text-gray-600 leading-relaxed font-medium">
                    {job.additionalNotes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={openEditModal}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-[#D12031] text-[#D12031] rounded-xl font-bold text-[14px] hover:bg-red-50 transition-colors cursor-pointer bg-white"
                >
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
                      <p className="text-[13px] text-gray-500 font-medium">
                        {job.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Work Type
                      </p>
                      <p className="text-[13px] text-gray-500 font-medium">
                        {job.workType}
                      </p>
                    </div>
                    <div className="hidden md:block" />

                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Site Location
                      </p>
                      <p className="text-[13px] text-gray-500 font-medium">
                        {job.siteLocation}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Priority
                      </p>
                      <p className="text-[13px] text-gray-500 font-medium">
                        {job.priority}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Duration
                      </p>
                      <p className="text-[13px] text-gray-500 font-medium">
                        {job.duration}
                      </p>
                    </div>

                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Schedule Date
                      </p>
                      <p className="text-[13px] text-gray-500 font-medium">
                        {job.scheduleDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Work Type
                      </p>
                      <p className="text-[13px] text-gray-500 font-medium">
                        {job.workType2}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Unit
                      </p>
                      <p className="text-[13px] text-gray-500 font-medium">
                        {job.unit}
                      </p>
                    </div>

                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Department
                      </p>
                      <p className="text-[13px] text-gray-500 font-medium">
                        {job.department}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Quantity
                      </p>
                      <p className="text-[13px] text-gray-500 font-medium">
                        {job.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
                        Category
                      </p>
                      <p className="text-[13px] text-gray-500 font-medium">
                        {job.category}
                      </p>
                    </div>
                  </div>

                  {/* PPE Used */}
                  <div className="mb-7">
                    <p className="text-[13px] font-bold text-gray-900 mb-3">
                      PPE Used
                    </p>
                    <div className="border border-red-200 rounded-xl p-4 inline-block min-w-[220px]">
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
                      <div className="w-8 h-8 rounded-full bg-[#D12031] flex items-center justify-center shadow-sm">
                        <FiCheckCircle size={15} className="text-white" />
                      </div>
                      <div className="w-0.5 h-8 bg-[#D12031]" />
                    </div>
                    <div className="pt-1">
                      <p className="text-[12px] font-bold text-[#D12031]">
                        Assigned
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Request created
                      </p>
                    </div>
                  </div>

                  {/* Step 2 – In-Progress */}
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                          job.status === "In-Progress" ||
                          job.status === "Completed"
                            ? "bg-[#D12031]"
                            : "bg-gray-200"
                        }`}
                      >
                        <FiClock
                          size={15}
                          className={
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
                          job.status === "In-Progress" ||
                          job.status === "Completed"
                            ? "text-[#D12031]"
                            : "text-gray-400"
                        }`}
                      >
                        In-Progress
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Work in progress
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

      {/* ══════════════ Edit Request Modal ══════════════ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 overflow-y-auto py-10">
          <div className="bg-white rounded-3xl w-full max-w-[600px] overflow-hidden shadow-2xl animate-[modalSlideUp_0.22s_ease] my-auto">
            {/* Header */}
            <div className="bg-[#D12031] text-white px-6 py-5 text-center shrink-0">
              <h2 className="text-[18px] font-bold">Edit Work Request</h2>
              <p className="text-white/80 text-[12px] mt-1 font-medium">
                Modify details for Job ID #{job.id}
              </p>
            </div>

            {/* Body Form */}
            <form onSubmit={handleEditSubmit} className="p-6 sm:p-8 space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="block text-[12px] font-bold text-gray-700">Request Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                />
              </div>

              {/* Site Location + Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[12px] font-bold text-gray-700">Site Location *</label>
                  <input
                    type="text"
                    required
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[12px] font-bold text-gray-700">Department *</label>
                  <input
                    type="text"
                    required
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                  />
                </div>
              </div>

              {/* Schedule Date + PO Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[12px] font-bold text-gray-700">Schedule Date *</label>
                  <input
                    type="text"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[12px] font-bold text-gray-700">PO Number</label>
                  <input
                    type="text"
                    value={editPo}
                    onChange={(e) => setEditPo(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                  />
                </div>
              </div>

              {/* Asset ID */}
              <div className="space-y-1">
                <label className="block text-[12px] font-bold text-gray-700">Asset ID</label>
                <input
                  type="text"
                  value={editAsset}
                  onChange={(e) => setEditAsset(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                />
              </div>

              {/* Priority + Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[12px] font-bold text-gray-700">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[12px] font-bold text-gray-700">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                  >
                    <option>Cleaning</option>
                    <option>Maintenance</option>
                    <option>Safety</option>
                  </select>
                </div>
              </div>

              {/* Scope of Work */}
              <div className="space-y-1">
                <label className="block text-[12px] font-bold text-gray-700">Scope of Work *</label>
                <textarea
                  required
                  rows={3}
                  value={editScope}
                  onChange={(e) => setEditScope(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031] resize-none leading-relaxed"
                />
              </div>

              {/* Detailed Description */}
              <div className="space-y-1">
                <label className="block text-[12px] font-bold text-gray-700">Detailed Description</label>
                <textarea
                  rows={3}
                  value={editDetailedDesc}
                  onChange={(e) => setEditDetailedDesc(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031] resize-none leading-relaxed"
                />
              </div>

              {/* Additional Notes */}
              <div className="space-y-1">
                <label className="block text-[12px] font-bold text-gray-700">Additional Notes</label>
                <textarea
                  rows={2}
                  value={editAdditionalNotes}
                  onChange={(e) => setEditAdditionalNotes(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031] resize-none leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-800 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-[#D12031] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#a81828] transition-colors cursor-pointer border-none shadow-sm shadow-red-500/20"
                >
                  <FiCheckCircle size={15} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    try {
                      const existing: JobDetail[] = JSON.parse(localStorage.getItem("customerRequests") || "[]");
                      const updatedList = existing.filter((r: JobDetail) => r.id !== job.id);
                      localStorage.setItem("customerRequests", JSON.stringify(updatedList));
                    } catch {}
                    setShowDeleteModal(false);
                    router.push("/customer/requests");
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

      {/* Toast message */}
      {toastMsg && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold border border-emerald-500/20 animate-toast-in">
          <FiCheckCircle size={18} className="text-emerald-100" />
          <span>{toastMsg}</span>
        </div>
      )}

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-toast-in {
          animation: toastIn 0.3s ease forwards;
        }
      `}</style>
    </CustomerLayout>
  );
}
