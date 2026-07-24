"use client";;
import { toast } from "react-hot-toast";

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
  FiAlertCircle,
  FiCheckCircle,
  FiTag,
  FiPlus,
} from "react-icons/fi";
import TechnicianLayout from "@/components/TechnicianLayout";
import { apiFetch } from "@/lib/apiFetch";
import NoticeBroadcastModal from "@/app/technician/overview/components/NoticeBroadcastModal";
import { API_BASE_URL } from "@/config";

interface Notice {
  jobId: string;
  noticeType: string;
  priority: string;
  description: string;
  date: string;
  time: string;
  evidencePhotoUrls?: string[];
}

export default function JobDetailPage() {
  const params = useParams();
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [viewingImages, setViewingImages] = useState<string[] | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [completionPhotos, setCompletionPhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [isUploadingSidebarPhoto, setIsUploadingSidebarPhoto] = useState(false);

  const handleUploadSidebarPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !job) return;
    setIsUploadingSidebarPhoto(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        const res = await apiFetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          newUrls.push(`${API_BASE_URL}${data.url}`);
        }
      }
      if (newUrls.length > 0) {
        const updatedAfter = [...(job.afterPhotoUrls || []), ...newUrls];
        const response = await apiFetch(`/api/work-requests/${job.id}`, {
          method: "PUT",
          body: JSON.stringify({ afterPhotoUrls: updatedAfter }),
        });
        if (response.ok) {
          toast.success("Photo uploaded successfully!");
          fetchJobDetails();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload photo.");
    } finally {
      setIsUploadingSidebarPhoto(false);
    }
  };

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

      // Fetch safety notice from database
      const noticeRes = await apiFetch(`/api/work-requests/${params.id}/notices`);
      if (noticeRes.ok) {
        const noticeData = await noticeRes.json();
        if (noticeData.data && noticeData.data.length > 0) {
          const dbNotice = noticeData.data[0];
          const noticeDate = new Date(dbNotice.createdAt);
          setNotice({
            jobId: dbNotice.workRequestId,
            noticeType: dbNotice.noticeType,
            priority: dbNotice.priority,
            description: dbNotice.description,
            evidencePhotoUrls: (dbNotice.evidencePhotoUrls || []).map((url: string) =>
              url.startsWith("http") ? url : `${API_BASE_URL}${url}`
            ),
            date: noticeDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            time: noticeDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
        } else {
          setNotice(null);
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
  }, [fetchJobDetails]);

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
        toast.success("You have started the job!");
      } else {
        toast.error("Failed to start job");
      }
    } catch (e) {
      console.error(e);
      toast.error((e as any).message || "Failed to start job due to network error");
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

  const handleSendBroadcast = async (data: {
    noticeType: string;
    priority: string;
    description: string;
    evidencePhotoUrls?: string[];
  }) => {
    if (!job?.id) return;
    if (job.status === "completed") {
      toast.error("Notice & Notify cannot be broadcasted on completed jobs.");
      return;
    }
    try {
      const res = await apiFetch(`/api/work-requests/${job.id}/notices`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const dbNotice = await res.json();
        const noticeDate = new Date(dbNotice.createdAt);
        const newNotice = {
          jobId: dbNotice.workRequestId,
          noticeType: dbNotice.noticeType,
          priority: dbNotice.priority,
          description: dbNotice.description,
          evidencePhotoUrls: (dbNotice.evidencePhotoUrls || []).map((url: string) =>
            url.startsWith("http") ? url : `${API_BASE_URL}${url}`
          ),
          date: noticeDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          time: noticeDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setNotice(newNotice);
        setToastMsg("Safety Notice broadcasted successfully!");
        setTimeout(() => setToastMsg(""), 3000);
        window.dispatchEvent(new Event("storage"));
        setIsNotifyOpen(false);
      } else {
        toast.error("Failed to broadcast safety notice.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDismissNotice = async () => {
    if (!job?.id) return;
    setIsResolving(true);
    try {
      const res = await apiFetch(`/api/work-requests/${job.id}/notices`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotice(null);
        setToastMsg("Safety notice resolved and dismissed.");
        setTimeout(() => setToastMsg(""), 3000);
        window.dispatchEvent(new Event("storage"));
      } else {
        toast.error("Failed to clear safety notice.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsResolving(false);
    }
  };

  if (isLoading) {
    return (
      <TechnicianLayout
        title="Work Requests"
        subtitle="Manage your work requests and track their progress"
      >
        {/* Back Link Skeleton */}
        <div className="mb-6">
          <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Main Details Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Information Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 h-6 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mt-0.5"></div>
                    <div>
                      <div className="w-20 h-3 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scope of Work Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-3">
              <div className="flex-[1.5] h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Details Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-6"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div>
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="w-full h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="w-full h-10 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>

            {/* Attachments Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="w-24 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
              <div className="w-full h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>
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

                {notice.evidencePhotoUrls && notice.evidencePhotoUrls.length > 0 && (
                  <div className="border-t border-red-150/40 pt-4 mt-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Evidence Photos</p>
                    <div className="flex flex-wrap gap-3">
                      {notice.evidencePhotoUrls.map((url: string, idx: number) => {
                        return (
                          <div 
                            key={idx} 
                            onClick={() => setViewingImages(notice.evidencePhotoUrls!)} 
                            className="relative w-20 h-20 rounded-xl overflow-hidden border border-red-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                          >
                            <img src={url} alt="Evidence" className="absolute inset-0 w-full h-full object-cover" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column Photos */}
          <div className="lg:w-[320px] shrink-0">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[15px] font-bold text-gray-900 mb-3">Before Photos</h3>
              {beforePhotos.length === 0 ? (
                <div className="bg-gray-50/70 border border-gray-200/60 rounded-xl p-3.5 text-center mb-6">
                  <p className="text-[12px] text-gray-400 font-medium">No before photos recorded.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 mb-6">
                  {beforePhotos.map((src: string, i: number) => (
                    <div key={i} onClick={() => setViewingImages(beforePhotos)} className="relative w-[76px] h-[76px] rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                      <img src={src} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white p-1 truncate text-center">
                        Before
                      </div>
                    </div>
                  ))}
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
                </div>
              )}

              <h3 className="text-[15px] font-bold text-gray-900 mb-3">After Photos</h3>
              {afterPhotos.length === 0 ? (
                <div className="bg-gray-50/70 border border-gray-200/60 rounded-xl p-3.5 text-center">
                  <p className="text-[12px] text-gray-400 font-medium">No after photos recorded.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {afterPhotos.map((src: string, i: number) => (
                    <div key={i} onClick={() => setViewingImages(afterPhotos)} className="relative w-[76px] h-[76px] rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                      <img src={src} alt="After" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white p-1 truncate text-center">
                        After
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setViewingImages(afterPhotos)} className="w-[76px] h-[76px] rounded-xl bg-[#D12031]/10 border border-[#D12031]/30 flex flex-col items-center justify-center text-[#D12031] hover:bg-red-100 transition-colors shadow-sm cursor-pointer">
                    <span className="w-6 h-6 rounded-full bg-white text-[#D12031] border border-red-200 flex items-center justify-center mb-1 text-[14px] shadow-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </span>
                    <span className="text-[10px] font-bold">View All</span>
                  </button>
                </div>
              )}
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
                    disabled={isResolving}
                    className="text-[12px] font-bold text-[#c62828] bg-white border border-[#ffcdd2] px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {isResolving ? (
                      <>
                        <div className="w-3 h-3 border-2 border-[#c62828] border-t-transparent rounded-full animate-spin"></div>
                        Resolving...
                      </>
                    ) : (
                      "Resolve & Dismiss"
                    )}
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

                <div className="flex items-center gap-2.5">
                  <FiAlertCircle className="text-gray-500 shrink-0" />
                  <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">Priority : </span>
                  <span className="text-[#D12031] font-bold text-[13px] capitalize">{job.priority || "Medium"}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <FiTag className="text-gray-500 shrink-0" />
                  <span className="text-gray-500 text-[13px] font-medium whitespace-nowrap">Category : </span>
                  <span className="text-[#D12031] font-bold text-[13px] capitalize">{job.category || "Cleaning"}</span>
                </div>
              </div>
            </div>

            {/* Scope of Work */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-gray-900 mb-3">Scope of Work</h3>
              <p className="text-[13.5px] text-gray-600 leading-relaxed font-medium">
                {(job.scopeOfWork && job.scopeOfWork.trim() && job.scopeOfWork.trim() !== job.description?.trim())
                  ? job.scopeOfWork.trim()
                  : "Not specified"}
              </p>
            </div>

            {/* Detailed Description */}
            {job.description && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-[16px] font-bold text-gray-900 mb-3">Detailed Description</h3>
                <p className="text-[13.5px] text-gray-600 leading-relaxed font-medium">
                  {job.description}
                </p>
              </div>
            )}

            {/* Additional Notes */}
            {job.additionalNotes && job.additionalNotes !== "None" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-[16px] font-bold text-gray-900 mb-3">Additional Notes</h3>
                <p className="text-[13.5px] text-gray-600 leading-relaxed font-medium">
                  {job.additionalNotes}
                </p>
              </div>
            )}

            {/* Action buttons row */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="w-full sm:w-1/2">
                {isStarted || job.status === "in_progress" ? (
                  <button
                    type="button"
                    onClick={() => setIsCompleteModalOpen(true)}
                    className="w-full py-3.5 rounded-lg text-white font-bold text-[14px] shadow-sm transition-all text-center cursor-pointer bg-[#D12031] hover:bg-[#a81828] flex items-center justify-center gap-2"
                  >
                    <FiCheckCircle size={18} />
                    Complete Work Entry
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartJob}
                    className="w-full py-3.5 rounded-lg text-white font-bold text-[14px] shadow-sm transition-all text-center cursor-pointer bg-[#D12031] hover:bg-[#a81828]"
                  >
                    Start Job
                  </button>
                )}
              </div>

              <div className="w-full sm:w-1/2 flex gap-3">
                <Link 
                  href={`/technician/messages?chatId=${job.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-2 py-3.5 border border-[#D12031] text-[#D12031] bg-white hover:bg-red-50 font-bold text-[14px] rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  <FiMessageSquare size={16} />
                  <span>Message</span>
                </Link>

                <div className="relative group flex-1">
                  <button
                    disabled={job?.status === "completed"}
                    onClick={() => {
                      if (job?.status === "completed") return;
                      setIsNotifyOpen(true);
                    }}
                    className={`w-full flex items-center justify-center gap-2 px-2 py-3.5 border font-bold text-[14px] rounded-lg transition-colors shadow-sm ${
                      job?.status === "completed"
                        ? "border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed opacity-80"
                        : "border-[#D12031] text-[#D12031] bg-white hover:bg-red-50 cursor-pointer"
                    }`}
                  >
                    <FiBell size={16} />
                    <span>Notice & Notify</span>
                  </button>
                  {job?.status === "completed" && (
                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap z-30">
                      Notice & Notify is disabled for completed jobs
                    </div>
                  )}
                </div>
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
              </div>
            </div>

            {/* Attachments Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[16px] font-bold text-gray-900">Attachments & Proof</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Upload Photo Button */}
                <label className="h-[100px] rounded-xl border-2 border-dashed border-[#D12031] flex flex-col items-center justify-center text-[#D12031] hover:bg-red-50 transition-colors cursor-pointer bg-white gap-1">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleUploadSidebarPhoto}
                  />
                  {isUploadingSidebarPhoto ? (
                    <span className="w-4 h-4 border-2 border-[#D12031] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded-full bg-[#D12031] text-white flex items-center justify-center">
                        <FiPlus size={14} />
                      </div>
                      <span className="text-[10px] font-bold">Add Photo</span>
                    </>
                  )}
                </label>

                {referencePhotos.map((src: string, index: number) => (
                  <div
                    key={index}
                    onClick={() => setViewingImages(referencePhotos)}
                    className="group relative rounded-xl overflow-hidden bg-gray-50 h-[100px] shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={src}
                      alt={`Attachment ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm py-1 px-2 text-center text-[9px] text-white truncate">
                      Attachment #{index + 1}
                    </div>
                  </div>
                ))}
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

      {/* Complete Work Entry Modal */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border border-gray-100 my-auto">
            <div className="bg-[#D12031] px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiCheckCircle size={20} />
                <h3 className="text-[18px] font-bold">Complete Work Entry</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCompleteModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors border-none bg-transparent cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!job) return;
                if (!resolutionNotes.trim()) {
                  toast.error("Please enter resolution notes / work description.");
                  return;
                }
                setIsCompleting(true);
                try {
                  const res = await apiFetch(`/api/work-requests/${job.id}`, {
                    method: "PUT",
                    body: JSON.stringify({
                      status: "completed",
                      additionalNotes: resolutionNotes.trim(),
                      afterPhotoUrls: completionPhotos.length > 0 ? completionPhotos : null,
                    })
                  });
                  if (res.ok) {
                    toast.success("Work entry submitted & job marked as Completed!");
                    setIsCompleteModalOpen(false);
                    fetchJobDetails();
                  } else {
                    toast.error("Failed to complete job entry.");
                  }
                } catch (err) {
                  console.error(err);
                  toast.error((err as any).message || "Error submitting work entry.");
                } finally {
                  setIsCompleting(false);
                }
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Resolution Notes / Work Performed <span className="text-[#D12031]">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe the resolution, parts replaced, and test observations..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs text-gray-800 outline-none focus:border-[#D12031] focus:bg-white transition-all font-medium"
                />
              </div>

              {/* Attach Proof Photos */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Attach Proof Photos (Optional)
                </label>
                <div className="flex flex-wrap gap-2.5 items-center">
                  <label className="h-16 w-24 rounded-xl border-2 border-dashed border-[#D12031] flex flex-col items-center justify-center text-[#D12031] hover:bg-red-50 transition-colors cursor-pointer bg-white gap-0.5 shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        setIsUploadingPhoto(true);
                        try {
                          const uploadedUrls: string[] = [];
                          for (let i = 0; i < files.length; i++) {
                            const formData = new FormData();
                            formData.append("file", files[i]);
                            const res = await apiFetch("/api/upload", {
                              method: "POST",
                              body: formData,
                            });
                            if (res.ok) {
                              const data = await res.json();
                              uploadedUrls.push(`${API_BASE_URL}${data.url}`);
                            }
                          }
                          if (uploadedUrls.length > 0) {
                            setCompletionPhotos((prev) => [...prev, ...uploadedUrls]);
                            toast.success("Photo(s) attached!");
                          }
                        } catch (err) {
                          console.error(err);
                          toast.error("Failed to upload photo.");
                        } finally {
                          setIsUploadingPhoto(false);
                        }
                      }}
                    />
                    {isUploadingPhoto ? (
                      <span className="w-4 h-4 border-2 border-[#D12031] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <FiPlus size={16} />
                        <span className="text-[10px] font-bold">Add Photo</span>
                      </>
                    )}
                  </label>

                  {completionPhotos.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shadow-sm shrink-0 group">
                      <img src={url} alt="Proof" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCompletionPhotos((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] cursor-pointer border-none"
                      >
                        <FiX size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCompleting}
                  className="flex-1 py-3 bg-[#D12031] text-white rounded-xl font-bold text-xs hover:bg-[#a81828] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm border-none cursor-pointer"
                >
                  {isCompleting ? (
                    <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
                  ) : (
                    "Submit Work Entry"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
