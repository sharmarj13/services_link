"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FiUser,
  FiMapPin,
  FiBriefcase,
  FiCalendar,
  FiFileText,
  FiCpu,
  FiPhone,
  FiMail,
  FiMessageSquare,
  FiBell,
  FiArrowLeft,
  FiRotateCcw,
  FiX,
  FiAlertCircle
} from "react-icons/fi";
import TechnicianLayout from "@/components/TechnicianLayout";

interface JobDetail {
  id: string;
  title: string;
  status: string;
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
  priority?: string;
  duration?: string;
  unit?: string;
  quantity?: string;
  category?: string;
  ppeUsed?: string[];
  additionalNotes?: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
}

interface Notice {
  jobId: string;
  noticeType: string;
  priority: string;
  description: string;
  actionRequired: boolean;
  date: string;
  time: string;
}

const MOCK_JOBS_DETAILS: Record<string, JobDetail> = {
  "99402": {
    id: "99402",
    title: "HVAC Compressor Maintenance",
    status: "Work in Progress",
    customer: "Maurice Maldonado",
    siteLocation: "Warehouse D, Bay 14",
    department: "Maintenance & Ops",
    scheduleDate: "Oct 24, 08:00 AM",
    poNumber: "#PO-882910",
    assetId: "HVAC-UNIT-04",
    scopeOfWork: "Diagnose the network issue, inspect switches and cabling, identify the root cause, and restore connectivity. Test the network after repairs and provide a completion report.",
    contactName: "James Brennan",
    contactRole: "Facility Manager",
    contactInitials: "JB",
    attachments: [
      "/images/warehouse_map.svg",
      "/images/warehouse_map.svg",
      "/images/warehouse_map.svg"
    ]
  },
  "99410": {
    id: "99410",
    title: "HVAC Compressor Maintenance",
    status: "Completed",
    customer: "Maurice Maldonado",
    siteLocation: "Warehouse D, Bay 14",
    department: "Maintenance & Ops",
    scheduleDate: "Oct 24, 08:00 AM",
    poNumber: "#PO-882910",
    assetId: "HVAC-UNIT-04",
    scopeOfWork: "Diagnose the network issue, inspect switches and cabling, identify the root cause, and restore connectivity. Test the network after repairs and provide a completion report.",
    contactName: "James Brennan",
    contactRole: "Facility Manager",
    contactInitials: "JB",
    attachments: [],
    workType: "Routine",
    priority: "Medium",
    duration: "30 Minute",
    unit: "Select unit",
    quantity: "0.00",
    category: "Cleaning",
    ppeUsed: ["Safety Glasses", "Face Respirator", "Boots"],
    additionalNotes: "HVAC Compressor Maintenance HVAC Compressor Maintenance",
    beforePhotos: ["/images/warehouse_map.svg", "/images/warehouse_map.svg"],
    afterPhotos: ["/images/warehouse_map.svg", "/images/warehouse_map.svg"]
  },
  "99408": {
    id: "99408",
    title: "Routine Safety Inspection",
    status: "Assigned",
    customer: "Maurice Maldonado",
    siteLocation: "Main Assembly Floor",
    department: "Safety & Compliance",
    scheduleDate: "Oct 25, 10:00 AM",
    poNumber: "#PO-882915",
    assetId: "SAFE-ZONE-01",
    scopeOfWork: "Perform a comprehensive safety walk of the main assembly line. Check fire exits, eye-wash stations, and verify all safety guard rails are in place and secure.",
    contactName: "Sarah Connor",
    contactRole: "Safety Director",
    contactInitials: "SC",
    attachments: [
      "/images/warehouse_map.svg"
    ]
  },
  "99412": {
    id: "99412",
    title: "Calibration Check: Unit 7",
    status: "Assigned",
    customer: "Maurice Maldonado",
    siteLocation: "Lab Section 1",
    department: "Quality Assurance",
    scheduleDate: "Oct 26, 02:00 PM",
    poNumber: "#PO-882920",
    assetId: "QA-UNIT-07",
    scopeOfWork: "Calibrate sensory equipment on Unit 7. Record baseline readings, adjust threshold limits, and run verification cycles according to ISO specifications.",
    contactName: "Bruce Banner",
    contactRole: "QA Manager",
    contactInitials: "BB",
    attachments: [
      "/images/warehouse_map.svg",
      "/images/warehouse_map.svg"
    ]
  }
};

const DEFAULT_JOB_DETAIL: JobDetail = {
  id: "99402",
  title: "HVAC Compressor Maintenance",
  status: "Work in Progress",
  customer: "Maurice Maldonado",
  siteLocation: "Warehouse D, Bay 14",
  department: "Maintenance & Ops",
  scheduleDate: "Oct 24, 08:00 AM",
  poNumber: "#PO-882910",
  assetId: "HVAC-UNIT-04",
  scopeOfWork: "Diagnose the network issue, inspect switches and cabling, identify the root cause, and restore connectivity. Test the network after repairs and provide a completion report.",
  contactName: "James Brennan",
  contactRole: "Facility Manager",
  contactInitials: "JB",
  attachments: [
    "/images/warehouse_map.svg",
    "/images/warehouse_map.svg",
    "/images/warehouse_map.svg"
  ]
};

export default function JobDetailPage() {
  const params = useParams();
  const [job, setJob] = useState<JobDetail>(DEFAULT_JOB_DETAIL);
  const [isStarted, setIsStarted] = useState(false);
  const [viewingImages, setViewingImages] = useState<string[] | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (params?.id && typeof params.id === "string") {
      // Load notice
      try {
        let notices: Notice[] = JSON.parse(localStorage.getItem("servicelink_notices") || "[]");
        if (notices.length === 0) {
          notices = [
            {
              jobId: "99410",
              noticeType: "Maintenance Issue",
              priority: "High",
              description: "Found a refrigerant gas leak at the evaporator coil joints. Pressure levels are below threshold. Recommended immediate evacuation and solder-seal of joint pipes.",
              actionRequired: true,
              date: "Jun 24, 2026",
              time: "11:30 AM"
            },
            {
              jobId: "99411",
              noticeType: "Safety Hazard",
              priority: "Urgent",
              description: "Exposed high-voltage wiring detected behind the fan control panel. Insulation has deteriorated. Panel is locked out, but needs urgent cable replacement.",
              actionRequired: true,
              date: "Jun 25, 2026",
              time: "09:45 AM"
            }
          ];
          localStorage.setItem("servicelink_notices", JSON.stringify(notices));
        }
        const foundNotice = notices.find((n: Notice) => n.jobId === params.id);
        if (foundNotice) {
          setNotice(foundNotice);
        } else {
          setNotice(null);
        }
      } catch {}

      const found = MOCK_JOBS_DETAILS[params.id];
      if (found) {
        setJob(found);
        if (found.status === "Work in Progress") {
          setIsStarted(true);
        }
      } else {
        const completedIds = ["99410", "99411", "99412", "99413", "99414", "99415"];
        if (completedIds.includes(params.id)) {
          setJob({ ...MOCK_JOBS_DETAILS["99410"], id: params.id });
        } else {
          setJob({ ...DEFAULT_JOB_DETAIL, id: params.id });
        }
      }
    }
  }, [params]);

  const handleStartJob = () => {
    setIsStarted(true);
    setJob(prev => ({ ...prev, status: "Work in Progress" }));
    alert("You have started the job!");
  };

  const handleCall = () => {
    alert(`Calling ${job.contactName}...`);
  };

  const handleEmail = () => {
    alert(`Opening email client to contact ${job.contactName}...`);
  };



  if (job.status === "Completed") {
    return (
      <>
        <TechnicianLayout
          title="Work Requests"
          subtitle="Manage your work requests and track their progress"
        >
          <div className="mb-6">
            <Link
              href="/technician/requests"
              className="flex items-center gap-2 text-[14px] font-bold text-gray-600 hover:text-gray-900 transition-colors w-max"
            >
              <FiArrowLeft size={16} />
              <span>Back to Requests</span>
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Red Header */}
                <div className="bg-[#D12031] p-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <FiRotateCcw size={20} />
                    <h3 className="text-[18px] font-bold">Job History</h3>
                  </div>
                  <div className="bg-white text-[#D12031] px-5 py-2 rounded-lg font-bold text-[13px]">
                    Completed
                  </div>
                </div>

                <div className="p-8">
                  {/* 3 Column Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 mb-10">
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">Request Title</p>
                      <p className="text-[13px] text-gray-500 mt-1">{job.title}</p>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">Work Type</p>
                      <p className="text-[13px] text-gray-500 mt-1">{job.workType}</p>
                    </div>
                    <div className="hidden md:block"></div>

                    <div>
                      <p className="text-[13px] font-bold text-gray-900">Site Location</p>
                      <p className="text-[13px] text-gray-500 mt-1">{job.siteLocation}</p>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">Priority</p>
                      <p className="text-[13px] text-gray-500 mt-1">{job.priority}</p>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">Duration</p>
                      <p className="text-[13px] text-gray-500 mt-1">{job.duration}</p>
                    </div>

                    <div>
                      <p className="text-[13px] font-bold text-gray-900">Schedule Date</p>
                      <p className="text-[13px] text-gray-500 mt-1">{job.scheduleDate}</p>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">Work Type</p>
                      <p className="text-[13px] text-gray-500 mt-1">Recyclable</p>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">Unit</p>
                      <p className="text-[13px] text-gray-500 mt-1">{job.unit}</p>
                    </div>

                    <div>
                      <p className="text-[13px] font-bold text-gray-900">Department</p>
                      <p className="text-[13px] text-gray-500 mt-1">{job.department}</p>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">Quantity</p>
                      <p className="text-[13px] text-gray-500 mt-1">{job.quantity}</p>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">Category</p>
                      <p className="text-[13px] text-gray-500 mt-1">{job.category}</p>
                    </div>
                  </div>

                  {/* PPE Used */}
                  <div className="mb-8">
                    <p className="text-[14px] font-bold text-gray-900 mb-3">PPE Used</p>
                    <div className="border border-red-100 rounded-xl p-5 max-w-sm">
                      <ul className="space-y-3">
                        {job.ppeUsed?.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2.5 text-[13px] font-medium text-gray-600">
                            <span className="w-2 h-2 rounded-full bg-[#D12031]"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="mb-6">
                    <p className="text-[14px] font-bold text-gray-900 mb-2">Additional Notes</p>
                    <p className="text-[13px] text-gray-500 font-medium">{job.additionalNotes}</p>
                  </div>

                  <div className="w-full h-px bg-gray-100 my-6"></div>

                  {/* Detailed Description */}
                  <div>
                    <p className="text-[14px] font-bold text-gray-900 mb-2">Detailed Description</p>
                    <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                      {job.scopeOfWork}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notice & Notify Details Card */}
              {notice && (
                <div className="bg-red-50 border border-red-200 rounded-2xl shadow-sm p-6 relative overflow-hidden mt-6">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-100/30 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-[#D12031]">
                      <FiAlertCircle size={15} />
                    </span>
                    <h3 className="text-[16px] font-bold text-gray-900">
                      Notice & Notify Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-y-5 gap-x-6 mb-5">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Notice Type</p>
                      <p className="text-[13.5px] font-bold text-gray-800 mt-1">{notice.noticeType}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Priority Level</p>
                      <span className="inline-block mt-1 text-[11px] font-bold text-red-700 bg-red-100/70 py-0.5 px-2 rounded-md border border-red-200">
                        {notice.priority}
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reported On</p>
                      <p className="text-[13.5px] font-semibold text-gray-800 mt-1">{notice.date} at {notice.time}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Action Required</p>
                      <p className="text-[13.5px] font-semibold text-gray-800 mt-1">{notice.actionRequired ? "Yes (Authorization Needed)" : "No"}</p>
                    </div>
                  </div>

                  <div className="border-t border-red-150/40 pt-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Detailed Description</p>
                    <p className="text-[13.5px] text-gray-700 leading-relaxed font-semibold mt-1">
                      {notice.description}
                    </p>
                  </div>

                  {/* Evidence Photos */}
                  <div className="border-t border-[#fca5a5]/40 pt-4 mt-4 font-sans">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Evidence Photos</p>
                    <div className="flex gap-3">
                      {[
                        { name: "Warehouse_Map.png", img: "/images/warehouse_map.svg" },
                        { name: "Site.jpg", img: "/images/warehouse_map.svg" }
                      ].map((file, i) => (
                        <div key={i} className="relative w-24 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                          <Image src={file.img} alt="Evidence" fill className="object-cover" />
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white px-2 py-0.5 truncate text-center">
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column Photos */}
            <div className="lg:w-[320px] shrink-0">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-[15px] font-bold text-gray-900 mb-4">Before Photos</h3>
                <div className="flex flex-wrap gap-3 mb-8">
                  {job.beforePhotos?.map((src, i) => (
                    <div key={i} onClick={() => setViewingImages(job.beforePhotos || [])} className="relative w-[76px] h-[76px] rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                      <Image src={src} alt="Before" fill className="object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white p-1 truncate text-center">
                        Before<br />Feb week 2, 2023
                      </div>
                    </div>
                  ))}
                  {(job.beforePhotos?.length || 0) > 0 && (
                    <button onClick={() => setViewingImages(job.beforePhotos || [])} className="w-[76px] h-[76px] rounded-xl bg-red-50 border border-red-200 flex flex-col items-center justify-center text-[#D12031] hover:bg-red-100 transition-colors shadow-sm">
                      <span className="w-6 h-6 rounded-full bg-white text-[#D12031] border border-red-200 flex items-center justify-center mb-1 text-[14px] shadow-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </span>
                      <span className="text-[10px] font-bold">View All</span>
                    </button>
                  )}
                </div>

                <h3 className="text-[15px] font-bold text-gray-900 mb-4">After Photos</h3>
                <div className="flex flex-wrap gap-3">
                  {job.afterPhotos?.map((src, i) => (
                    <div key={i} onClick={() => setViewingImages(job.afterPhotos || [])} className="relative w-[76px] h-[76px] rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                      <Image src={src} alt="After" fill className="object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white p-1 truncate text-center">
                        After<br />March week 2, 2023
                      </div>
                    </div>
                  ))}
                  {(job.afterPhotos?.length || 0) > 0 && (
                    <button onClick={() => setViewingImages(job.afterPhotos || [])} className="w-[76px] h-[76px] rounded-xl bg-red-50 border border-red-200 flex flex-col items-center justify-center text-[#D12031] hover:bg-red-100 transition-colors shadow-sm">
                      <span className="w-6 h-6 rounded-full bg-white text-[#D12031] border border-red-200 flex items-center justify-center mb-1 text-[14px] shadow-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </span>
                      <span className="text-[10px] font-bold">View All</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TechnicianLayout>

        {/* Image Viewer Modal */}
        {viewingImages !== null && (
          <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
            <button
              onClick={() => setViewingImages(null)}
              className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors p-2"
            >
              <FiX size={32} />
            </button>

            <div className="w-full max-w-4xl max-h-[80vh] overflow-y-auto custom-scrollbar flex flex-wrap gap-4 justify-center">
              {viewingImages.map((src, idx) => (
                <div key={idx} className="relative w-full sm:w-[48%] h-[300px] sm:h-[400px] rounded-xl overflow-hidden bg-black/50 border border-white/10">
                  <Image src={src} alt="Evidence" fill className="object-contain" />
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <TechnicianLayout
        title="Work Requests"
        subtitle="Manage your work requests and track their progress"
      >
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/technician/requests"
            className="flex items-center gap-2 text-[14px] font-bold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft size={16} />
            <span>Back to Requests</span>
          </Link>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Job info & scope) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Information Card */}
            <div className="bg-white border-[1.5px] border-[#D12031] rounded-2xl p-6 shadow-sm relative">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-[17px] font-bold text-gray-900">Job Information</h3>
                <span className="text-[12px] font-bold bg-[#fff8e1] text-[#fbc02d] border border-[#ffecb3] px-3 py-1 rounded-full">
                  {job.status}
                </span>
              </div>

              {/* Info Grid Rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                <div className="flex items-center gap-2.5">
                  <FiUser className="text-gray-500 shrink-0" />
                  <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">Customer : </span>
                  <span className="text-[#D12031] font-bold text-[13px] truncate">{job.customer}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <FiMapPin className="text-gray-500 shrink-0" />
                  <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">Site Location : </span>
                  <span className="text-[#D12031] font-bold text-[13px] truncate">{job.siteLocation}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <FiBriefcase className="text-gray-500 shrink-0" />
                  <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">Department : </span>
                  <span className="text-[#D12031] font-bold text-[13px] truncate">{job.department}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <FiCalendar className="text-gray-500 shrink-0" />
                  <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">Schedule Date : </span>
                  <span className="text-[#D12031] font-bold text-[13px] truncate">{job.scheduleDate}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <FiFileText className="text-gray-500 shrink-0" />
                  <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">PO Number : </span>
                  <span className="text-[#D12031] font-bold text-[13px] truncate">{job.poNumber}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <FiCpu className="text-gray-500 shrink-0" />
                  <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">Asset ID : </span>
                  <span className="text-[#D12031] font-bold text-[13px] truncate">{job.assetId}</span>
                </div>
              </div>
            </div>

            {/* Scope of Work */}
            <div className="bg-white border-[1.5px] border-[#D12031] rounded-2xl p-6 shadow-sm">
              <h3 className="text-[17px] font-bold text-gray-900 mb-4">Scope of Work</h3>
              <p className="text-[14px] text-gray-800 leading-relaxed font-medium">
                {job.scopeOfWork}
              </p>
            </div>

            {/* Action buttons row */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="w-full sm:w-1/2">
                <button
                  onClick={handleStartJob}
                  disabled={isStarted}
                  className={`w-full py-3.5 rounded-lg text-white font-bold text-[14px] shadow-sm transition-all text-center ${isStarted
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#D12031] hover:bg-[#a81828]"
                    }`}
                >
                  {isStarted ? "Job in Progress" : "Start Job"}
                </button>
              </div>

              <div className="w-full sm:w-1/2 flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 px-2 py-3.5 border border-[#D12031] text-[#D12031] bg-white hover:bg-red-50 font-bold text-[14px] rounded-lg transition-colors shadow-sm">
                  <FiMessageSquare size={16} />
                  <span>Message</span>
                </button>

                <button className="flex-1 flex items-center justify-center gap-2 px-2 py-3.5 border border-[#D12031] text-[#D12031] bg-white hover:bg-red-50 font-bold text-[14px] rounded-lg transition-colors shadow-sm">
                  <FiBell size={16} />
                  <span>Notice & Notify</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (Contact & Attachments) */}
          <div className="space-y-6">
            {/* Contact Details Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <FiUser size={20} className="text-gray-500" />
                <span>Contact Details</span>
              </h3>

              {/* Profile Info */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="h-12 w-12 rounded-full bg-rose-100 text-[#D12031] font-bold text-lg flex items-center justify-center border border-rose-200">
                  {job.contactInitials}
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-gray-950">{job.contactName}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{job.contactRole}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCall}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[14px] rounded-lg transition-all shadow-sm"
                >
                  <FiPhone size={16} />
                  <span>Call</span>
                </button>
                <button
                  onClick={handleEmail}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-[#D12031] text-[#D12031] hover:bg-red-50 font-bold text-[14px] rounded-lg transition-all"
                >
                  <FiMail size={16} />
                  <span>Email Contact</span>
                </button>
              </div>
            </div>

            {/* Attachments Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-gray-900 mb-5">Attachments</h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Attachment thumbnails */}
                {job.attachments.map((src, index) => (
                  <div
                    key={index}
                    onClick={() => setViewingImages(job.attachments)}
                    className="group relative rounded-xl overflow-hidden bg-gray-50 h-[110px] shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <Image
                      src={src}
                      alt={`Attachment ${index + 1}`}
                      fill
                      sizes="150px"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    {/* File label bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm py-1 px-2 text-center text-[10px] text-white truncate">
                      Warehouse_Map.png
                    </div>
                  </div>
                ))}

                {/* View All box */}
                {(job.attachments.length > 0) && (
                  <button
                    onClick={() => setViewingImages(job.attachments)}
                    className="h-[110px] rounded-xl bg-red-50 border border-red-200 flex flex-col items-center justify-center text-[#D12031] hover:bg-red-100 transition-colors shadow-sm cursor-pointer"
                  >
                    <span className="w-8 h-8 rounded-full bg-white text-[#D12031] border border-red-200 flex items-center justify-center mb-1 text-[16px] shadow-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </span>
                    <span className="text-[12px] font-bold mt-1">View All</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </TechnicianLayout>

      {/* Image Viewer Modal */}
      {viewingImages !== null && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setViewingImages(null)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors p-2"
          >
            <FiX size={32} />
          </button>

          <div className="w-full max-w-4xl max-h-[80vh] overflow-y-auto custom-scrollbar flex flex-wrap gap-4 justify-center">
            {viewingImages.map((src, idx) => (
              <div key={idx} className="relative w-full sm:w-[48%] h-[300px] sm:h-[400px] rounded-xl overflow-hidden bg-black/50 border border-white/10">
                <Image src={src} alt="Evidence" fill className="object-contain" />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
