"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { apiFetch } from "@/lib/apiFetch";
import NoticeBroadcastModal from "@/app/technician/overview/components/NoticeBroadcastModal";

interface Notice {
  jobId: string;
  noticeType: string;
  priority: string;
  description: string;
  actionRequired: boolean;
  date: string;
  time: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [viewingImages, setViewingImages] = useState<string[] | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const fetchJobDetails = useCallback(async () => {
    if (!params?.id) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/work-requests/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setJob(data);
        if (data.status === "in_progress") {
          setIsStarted(true);
        }
      }
    } catch (e) {
      console.error("Failed to fetch job details:", e);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchJobDetails();

    // Load notice alert info from local storage
    if (params?.id && typeof params.id === "string") {
      try {
        const noticesList: Notice[] = JSON.parse(localStorage.getItem("servicelink_notices") || "[]");
        const foundNotice = noticesList.find((n: Notice) => n.jobId === params.id);
        if (foundNotice) {
          setNotice(foundNotice);
        } else {
          setNotice(null);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [params, fetchJobDetails]);

  const handleStartJob = async () => {
    if (!job) return;
    try {
      const res = await apiFetch(`/api/work-requests/${job.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "in_progress" })
      });
      if (res.ok) {
        setIsStarted(true);
        setJob((prev: any) => ({ ...prev, status: "in_progress" }));
        alert("You have started the job!");
      } else {
        alert("Failed to start job");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to start job due to network error");
    }
  };

  const handleCall = () => {
    if (!job?.customer) return;
    const phone = job.customer.phoneNumber || "123-456-7890";
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = () => {
    if (!job?.customer) return;
    window.location.href = `mailto:${job.customer.email}`;
  };

  const handleSendBroadcast = (data: {
    noticeType: string;
    priority: string;
    description: string;
    actionRequired: boolean;
  }) => {
    setIsNotifyOpen(false);
    if (!job?.id) return;
    try {
      const storedNotices = JSON.parse(localStorage.getItem("servicelink_notices") || "[]");
      const filteredNotices = storedNotices.filter((n: any) => n.jobId !== job.id);
      
      const newNotice = {
        jobId: job.id,
        ...data,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      
      filteredNotices.push(newNotice);
      localStorage.setItem("servicelink_notices", JSON.stringify(filteredNotices));

      setNotice(newNotice);

      setToastMsg("Safety Notice broadcasted successfully!");
      setTimeout(() => setToastMsg(""), 3000);
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDismissNotice = () => {
    if (!job?.id) return;
    try {
      const storedNotices = JSON.parse(localStorage.getItem("servicelink_notices") || "[]");
      const filteredNotices = storedNotices.filter((n: any) => n.jobId !== job.id);
      localStorage.setItem("servicelink_notices", JSON.stringify(filteredNotices));
      setNotice(null);
      setToastMsg("Safety notice resolved and dismissed.");
      setTimeout(() => setToastMsg(""), 3000);
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <TechnicianLayout
        title="Work Requests"
        subtitle="Manage your work requests and track their progress"
      >
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-[#D12031] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </TechnicianLayout>
    );
  }

  if (!job) {
    return (
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
        <div className="py-12 text-center text-gray-500 font-medium bg-white rounded-2xl border border-gray-150 shadow-sm">
          Work request not found.
        </div>
      </TechnicianLayout>
    );
  }

  const isCompleted = job.status === "completed";
  const customerName = job.customer ? `${job.customer.firstName} ${job.customer.lastName}` : "Unknown Customer";
  const contactName = customerName;
  const contactInitials = job.customer ? `${job.customer.firstName[0]}${job.customer.lastName[0]}`.toUpperCase() : "CU";
  const contactRole = "Customer / Requester";
  
  // Format dates
  const scheduleDate = job.dueDate
    ? new Date(job.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : job.createdAt
      ? new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "N/A";

  // Enforce fallback lists for before/after/reference attachments
  const beforePhotos = job.beforePhotoUrls || [];
  const afterPhotos = job.afterPhotoUrls || [];
  const referencePhotos = job.referencePhotoUrls || [];
  const ppeList = job.ppeUsed || [];

  if (isCompleted) {
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
                <div className="bg-white text-[#D12031] px-5 py-2 rounded-lg font-bold text-[13px] capitalize">
                  {job.status}
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
                    <p className="text-[13px] text-gray-500 mt-1 capitalize">{job.workEntry?.workType || "N/A"}</p>
                  </div>
                  <div className="hidden md:block"></div>

                  <div>
                    <p className="text-[13px] font-bold text-gray-900">Site Location</p>
                    <p className="text-[13px] text-gray-500 mt-1">{job.siteName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-900">Priority</p>
                    <p className="text-[13px] text-gray-500 mt-1 capitalize">{job.priority}</p>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-900">Duration</p>
                    <p className="text-[13px] text-gray-500 mt-1">{job.workEntry?.duration ? `${job.workEntry.duration} Minutes` : "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-[13px] font-bold text-gray-900">Schedule Date</p>
                    <p className="text-[13px] text-gray-500 mt-1">{scheduleDate}</p>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-900">Waste Material</p>
                    <p className="text-[13px] text-gray-500 mt-1 capitalize">{job.workEntry?.wasteType || "None"}</p>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-900">Unit</p>
                    <p className="text-[13px] text-gray-500 mt-1 capitalize">{job.workEntry?.wasteUnit || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-[13px] font-bold text-gray-900">Department</p>
                    <p className="text-[13px] text-gray-500 mt-1">{job.department || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-900">Quantity</p>
                    <p className="text-[13px] text-gray-500 mt-1">{job.workEntry?.wasteQuantity || "0.00"}</p>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-900">Category</p>
                    <p className="text-[13px] text-gray-500 mt-1 capitalize">{job.category}</p>
                  </div>
                </div>

                {/* PPE Used */}
                <div className="mb-8">
                  <p className="text-[14px] font-bold text-gray-900 mb-3">PPE Used</p>
                  <div className="border border-red-100 rounded-xl p-5 max-w-sm bg-slate-50">
                    {ppeList.length === 0 ? (
                      <p className="text-[12px] text-gray-400">No PPE checklists recorded.</p>
                    ) : (
                      <ul className="space-y-3">
                        {ppeList.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2.5 text-[13px] font-medium text-gray-600">
                            <span className="w-2 h-2 rounded-full bg-[#D12031]"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="mb-6">
                  <p className="text-[14px] font-bold text-gray-900 mb-2">Additional Notes</p>
                  <p className="text-[13px] text-gray-500 font-medium">
                    {job.workEntry?.notes || "No additional logs submitted."}
                  </p>
                </div>

                <div className="w-full h-px bg-gray-100 my-6"></div>

                {/* Detailed Description */}
                <div>
                  <p className="text-[14px] font-bold text-gray-900 mb-2">Detailed Description</p>
                  <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                    {job.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Notice & Notify Details Card */}
            {notice && (
              <div className="bg-red-50 border border-red-200 rounded-2xl shadow-sm p-6 relative overflow-hidden mt-6">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-100/30 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-[#D12031]">
                      <FiAlertCircle size={15} />
                    </span>
                    <h3 className="text-[16px] font-bold text-gray-900">
                      Notice & Notify Details
                    </h3>
                  </div>
                  <button
                    onClick={handleDismissNotice}
                    className="text-[12px] font-bold text-[#c62828] bg-white border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors shadow-sm relative z-10"
                  >
                    Resolve
                  </button>
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
                </div>

                <div className="border-t border-red-150/40 pt-4">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Detailed Description</p>
                  <p className="text-[13.5px] text-gray-700 leading-relaxed font-semibold mt-1">
                    {notice.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column Photos */}
          <div className="lg:w-[320px] shrink-0">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[15px] font-bold text-gray-900 mb-4">Before Photos</h3>
              <div className="flex flex-wrap gap-3 mb-8">
                {beforePhotos.map((src: string, i: number) => (
                  <div key={i} onClick={() => setViewingImages(beforePhotos)} className="relative w-[76px] h-[76px] rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                    <img src={src} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white p-1 truncate text-center">
                      Before
                    </div>
                  </div>
                ))}
                {beforePhotos.length > 0 && (
                  <button onClick={() => setViewingImages(beforePhotos)} className="w-[76px] h-[76px] rounded-xl bg-red-50 border border-red-200 flex flex-col items-center justify-center text-[#D12031] hover:bg-red-100 transition-colors shadow-sm cursor-pointer">
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
                {afterPhotos.map((src: string, i: number) => (
                  <div key={i} onClick={() => setViewingImages(afterPhotos)} className="relative w-[76px] h-[76px] rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                    <img src={src} alt="After" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white p-1 truncate text-center">
                      After
                    </div>
                  </div>
                ))}
                {afterPhotos.length > 0 && (
                  <button onClick={() => setViewingImages(afterPhotos)} className="w-[76px] h-[76px] rounded-xl bg-red-50 border border-red-200 flex flex-col items-center justify-center text-[#D12031] hover:bg-red-100 transition-colors shadow-sm cursor-pointer">
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
                <img src={src} alt="Evidence" className="absolute inset-0 w-full h-full object-contain" />
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
            {notice && (
              <div className="bg-[#ffebee]/60 border border-[#ffcdd2] rounded-2xl p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-[#D12031]">
                    <span className="w-2.5 h-2.5 bg-[#D12031] rounded-full animate-ping shrink-0" />
                    <h4 className="text-[14px] font-bold uppercase tracking-wider">⚠️ Active Safety Observation</h4>
                  </div>
                  <button
                    onClick={handleDismissNotice}
                    className="text-[12px] font-bold text-[#c62828] bg-white border border-[#ffcdd2] px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                  >
                    Resolve & Dismiss
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 pb-4 border-b border-[#ffcdd2]/50">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Notice Type</p>
                    <p className="text-[13px] font-bold text-gray-800 mt-1">{notice.noticeType}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Priority</p>
                    <span className="inline-block mt-1 text-[11.5px] font-bold bg-[#ffebee] text-[#c62828] border border-[#ffcdd2] px-2.5 py-0.5 rounded-full uppercase">
                      {notice.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reported On</p>
                    <p className="text-[13px] font-semibold text-gray-800 mt-1">{notice.date} at {notice.time}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Detailed Description</p>
                  <p className="text-[13px] text-gray-700 leading-relaxed font-semibold mt-1">
                    {notice.description}
                  </p>
                </div>
              </div>
            )}

            {/* Job Information Card */}
            <div className="bg-white border-[1.5px] border-[#D12031] rounded-2xl p-6 shadow-sm relative">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-[17px] font-bold text-gray-900">Job Information</h3>
                <span className="text-[12px] font-bold bg-[#fff8e1] text-[#fbc02d] border border-[#ffecb3] px-3 py-1 rounded-full capitalize">
                  {job.status === "in_progress" ? "In Progress" : job.status}
                </span>
              </div>

              {/* Info Grid Rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                <div className="flex items-center gap-2.5">
                  <FiUser className="text-gray-500 shrink-0" />
                  <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">Customer : </span>
                  <span className="text-[#D12031] font-bold text-[13px] truncate">{customerName}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <FiMapPin className="text-gray-500 shrink-0" />
                  <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">Site Location : </span>
                  <span className="text-[#D12031] font-bold text-[13px] truncate">{job.siteName || "N/A"}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <FiBriefcase className="text-gray-500 shrink-0" />
                  <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">Department : </span>
                  <span className="text-[#D12031] font-bold text-[13px] truncate">{job.department || "N/A"}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <FiCalendar className="text-gray-500 shrink-0" />
                  <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">Schedule Date : </span>
                  <span className="text-[#D12031] font-bold text-[13px] truncate">{scheduleDate}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <FiFileText className="text-gray-500 shrink-0" />
                  <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">PO Number : </span>
                  <span className="text-[#D12031] font-bold text-[13px] truncate">#PO-{job.id.substring(0,6).toUpperCase()}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <FiCpu className="text-gray-500 shrink-0" />
                  <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">Asset ID : </span>
                  <span className="text-[#D12031] font-bold text-[13px] truncate">REQUEST-{job.id.substring(0,4).toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Scope of Work */}
            <div className="bg-white border-[1.5px] border-[#D12031] rounded-2xl p-6 shadow-sm">
              <h3 className="text-[17px] font-bold text-gray-900 mb-4">Scope of Work</h3>
              <p className="text-[14px] text-gray-800 leading-relaxed font-medium">
                {job.scopeOfWork || job.description}
              </p>
            </div>

            {/* Action buttons row */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="w-full sm:w-1/2">
                <button
                  onClick={handleStartJob}
                  disabled={isStarted}
                  className={`w-full py-3.5 rounded-lg text-white font-bold text-[14px] shadow-sm transition-all text-center cursor-pointer ${isStarted
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#D12031] hover:bg-[#a81828]"
                    }`}
                >
                  {isStarted ? "Job in Progress" : "Start Job"}
                </button>
              </div>

              <div className="w-full sm:w-1/2 flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 px-2 py-3.5 border border-[#D12031] text-[#D12031] bg-white hover:bg-red-50 font-bold text-[14px] rounded-lg transition-colors shadow-sm cursor-pointer">
                  <FiMessageSquare size={16} />
                  <span>Message</span>
                </button>

                <button
                  onClick={() => setIsNotifyOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-2 py-3.5 border border-[#D12031] text-[#D12031] bg-white hover:bg-red-50 font-bold text-[14px] rounded-lg transition-colors shadow-sm cursor-pointer"
                >
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
                  {contactInitials}
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-gray-950">{contactName}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{contactRole}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCall}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[14px] rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  <FiPhone size={16} />
                  <span>Call</span>
                </button>
                <button
                  onClick={handleEmail}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-[#D12031] text-[#D12031] hover:bg-red-50 font-bold text-[14px] rounded-lg transition-all cursor-pointer"
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
                {referencePhotos.length === 0 ? (
                  <p className="col-span-2 text-[12px] text-gray-400">No attachments provided.</p>
                ) : (
                  referencePhotos.map((src: string, index: number) => (
                    <div
                      key={index}
                      onClick={() => setViewingImages(referencePhotos)}
                      className="group relative rounded-xl overflow-hidden bg-gray-50 h-[110px] shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={src}
                        alt={`Attachment ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm py-1 px-2 text-center text-[10px] text-white truncate">
                        Attachment #{index + 1}
                      </div>
                    </div>
                  ))
                )}

                {referencePhotos.length > 0 && (
                  <button
                    onClick={() => setViewingImages(referencePhotos)}
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
                <img src={src} alt="Evidence" className="absolute inset-0 w-full h-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Notice Broadcast Modal */}
      <NoticeBroadcastModal
        isOpen={isNotifyOpen}
        onClose={() => setIsNotifyOpen(false)}
        onSendBroadcast={handleSendBroadcast}
      />

      {/* Success Toast Notification */}
      {toastMsg && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold border border-emerald-500/20 animate-toast-in">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{toastMsg}</span>
        </div>
      )}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes toastIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-toast-in {
          animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </>
  );
}
