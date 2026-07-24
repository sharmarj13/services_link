"use client";;
import { toast } from "react-hot-toast";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/config";
import { apiFetch } from "@/lib/apiFetch";
import {
  FiChevronLeft,
  FiRotateCcw,
  FiUser,
  FiMapPin,
  FiBriefcase,
  FiCalendar,
  FiFileText,
  FiCpu,
  FiPhoneCall,
  FiMail,
  FiMessageSquare,
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
  siteId: string;
  title: string;
  status: "Assigned" | "In-Progress" | "Completed" | "Active";
  customer: string;
  siteLocation: string;
  department: string;
  scheduleDate: string;
  dueDate?: string | null;
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

interface Notice {
  jobId: string;
  noticeType: string;
  priority: string;
  description: string;
  actionRequired: boolean;
  date: string;
  time: string;
  evidencePhotoUrls?: string[];
}

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
  const [job, setJob] = useState<JobDetail | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Lightbox/Preview states ── */
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewTitle, setPreviewTitle] = useState("");

  const openPhotoPreview = (title: string, images: string[], index: number = 0) => {
    if (!images || images.length === 0) {
      showToast(`No ${title.toLowerCase()} available to display.`);
      return;
    }
    setPreviewTitle(title);
    setPreviewImages(images);
    setPreviewIndex(index);
    setIsPreviewOpen(true);
  };

  const getFileName = (url: string) => {
    try {
      const parts = url.split("/");
      const name = parts[parts.length - 1];
      return name.replace(/^\d+-/, "");
    } catch (e) {
      return "Attachment";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !job) return;

    setIsSaving(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await apiFetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          newUrls.push(`${API_BASE_URL}${data.url}`);
        } else {
          console.error("Failed to upload file:", file.name);
        }
      }

      if (newUrls.length > 0) {
        const updatedAttachments = [...(job.attachments || []), ...newUrls];
        const response = await apiFetch(`/api/work-requests/${job.id}`, {
          method: "PUT",
          body: JSON.stringify({
            referencePhotoUrls: updatedAttachments,
          }),
        });

        if (response.ok) {
          showToast("Photo uploaded successfully!");
          await fetchJobDetail();
        } else {
          toast.error("Failed to update attachments.");
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error((err as any).message || "An error occurred during file upload.");
    } finally {
      setIsSaving(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAttachment = async (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (!job) return;
    if (!confirm("Are you sure you want to remove this attachment?")) return;

    setIsSaving(true);
    try {
      const updatedAttachments = job.attachments.filter((_, i) => i !== index);
      const response = await apiFetch(`/api/work-requests/${job.id}`, {
        method: "PUT",
        body: JSON.stringify({
          referencePhotoUrls: updatedAttachments.length > 0 ? updatedAttachments : null,
        }),
      });

      if (response.ok) {
        showToast("Attachment removed successfully!");
        await fetchJobDetail();
      } else {
        toast.error("Failed to delete attachment.");
      }
    } catch (err) {
      console.error("Delete attachment error:", err);
      toast.error((err as any).message || "Error deleting attachment.");
    } finally {
      setIsSaving(false);
    }
  };

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
  const [departmentsList, setDepartmentsList] = useState<{ id: string; name: string }[]>([]);
  const [isFetchingDepts, setIsFetchingDepts] = useState(false);

  useEffect(() => {
    if (isEditModalOpen && job?.siteId) {
      const fetchDepartments = async () => {
        setIsFetchingDepts(true);
        try {
          const res = await apiFetch(`/api/sites/${job.siteId}/departments`);
          if (res.ok) {
            const data = await res.json();
            setDepartmentsList(data.data || []);
          }
        } catch (err) {
          console.error("Failed to fetch departments", err);
        } finally {
          setIsFetchingDepts(false);
        }
      };
      fetchDepartments();
    }
  }, [isEditModalOpen, job?.siteId]);

  /* ── Toast message state ── */
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const mapStatus = (backendStatus: string): "Assigned" | "In-Progress" | "Completed" | "Active" => {
    switch (backendStatus) {
      case "in-progress":
      case "in_progress":
        return "In-Progress";
      case "started":
      case "active":
        return "Active";
      case "completed":
        return "Completed";
      case "assigned":
      case "pending":
      default:
        return "Assigned";
    }
  };

  const mapPriority = (backendPriority: string): string => {
    if (backendPriority === "high") return "High";
    if (backendPriority === "low") return "Low";
    return "Medium";
  };

  const mapCategory = (backendCategory: string): string => {
    switch (backendCategory) {
      case "cleaning": return "Cleaning";
      case "maintenance": return "Maintenance";
      case "repairs": return "Repairs";
      case "landscaping": return "Landscaping";
      case "security": return "Security";
      case "other": return "Other";
      default: return "Cleaning";
    }
  };

  const openEditModal = () => {
    if (!job) return;
    setEditTitle(job.title);
    setEditLocation(job.siteLocation === "Not specified" ? "" : job.siteLocation);
    setEditDept(job.department === "Not specified" ? "None" : job.department);
    // Parse ISO date string to YYYY-MM-DD for the HTML date input
    setEditDate(job.dueDate ? new Date(job.dueDate).toISOString().split('T')[0] : "");
    setEditPo(job.poNumber === "N/A" ? "" : job.poNumber);
    setEditAsset(job.assetId === "N/A" ? "" : job.assetId);
    setEditScope(job.scopeOfWork === "N/A" ? "" : job.scopeOfWork);
    setEditPriority(job.priority || "Medium");
    setEditCategory(job.category || "Cleaning");
    setEditAdditionalNotes(job.additionalNotes === "None" ? "" : job.additionalNotes || "");
    setEditDetailedDesc(job.detailedDescription === "No description provided." ? "" : job.detailedDescription || "");
    setIsEditModalOpen(true);
  };

  const fetchJobDetail = useCallback(async () => {
    if (!params?.id) return;
    const id = params.id as string;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/work-requests/${id}`, {
        credentials: "include"
      });
      if (!res.ok) {
        setError("Failed to fetch request details from server.");
        return;
      }
      const data = await res.json();
      const mappedJob: JobDetail = {
        id: data.id,
        siteId: data.siteId,
        title: data.title,
        status: mapStatus(data.status),
        customer: data.customer ? `${data.customer.firstName} ${data.customer.lastName}` : "Unknown Customer",
        siteLocation: data.location || "Not specified",
        department: data.department || "Not specified",
        scheduleDate: data.dueDate ? new Date(data.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "TBD",
        dueDate: data.dueDate ? (data.dueDate as string) : null,
        poNumber: data.poNumber || "N/A",
        assetId: data.assetId || "N/A",
        scopeOfWork: (data.scopeOfWork && data.scopeOfWork.trim() && data.scopeOfWork.trim() !== data.description?.trim()) ? data.scopeOfWork.trim() : "Not specified",
        contactName: data.assignedEmployee ? `${data.assignedEmployee.firstName} ${data.assignedEmployee.lastName}` : "No Technician Assigned",
        contactRole: data.assignedEmployee ? (data.assignedEmployee.role || "Technician") : "Awaiting Dispatch",
        contactInitials: data.assignedEmployee ? (data.assignedEmployee.firstName[0] + data.assignedEmployee.lastName[0]).toUpperCase() : "N/A",
        attachments: data.referencePhotoUrls || [],
        workType: data.workType || "N/A", // Removed static 'Routine'
        workType2: data.workType2 || "N/A", // Removed static 'Recyclable'
        priority: mapPriority(data.priority),
        duration: data.duration || "N/A",
        unit: data.unit || "N/A",
        quantity: data.quantity || "N/A",
        category: mapCategory(data.category),
        ppeUsed: data.ppeUsed || [],
        additionalNotes: data.additionalNotes || "None",
        detailedDescription: data.description || "No description provided.",
        beforePhotos: data.beforePhotoUrls || [],
        afterPhotos: data.afterPhotoUrls || [],
      };
      setJob(mappedJob);
    } catch (err) {
      console.error("Fetch request error:", err);
      setError((err as any).message || "Connection to backend server failed.");
    }
  }, [params]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    if (!editTitle.trim() || !editDetailedDesc.trim()) {
      toast.success(
        "Please fill in all required fields (Request Title and Detailed Description)."
      );
      return;
    }

    setIsSaving(true);
    try {
      const resolvedLocation =
        editLocation.trim() ||
        (editDept !== "None" && editDept !== "" ? `${editDept} Floor` : null);

      const updates = {
        title: editTitle.trim(),
        location: resolvedLocation,
        scopeOfWork: editScope.trim() || editDetailedDesc.trim(),
        priority: editPriority.toLowerCase(),
        category: editCategory.toLowerCase(),
        description: editDetailedDesc.trim(),
        additionalNotes: editAdditionalNotes.trim(),
        poNumber: editPo.trim() || null,
        assetId: editAsset.trim() || null,
        dueDate: editDate ? new Date(editDate) : null,
        department: editDept !== "None" && editDept !== "" ? editDept : null,
      };

      const response = await apiFetch(`/api/work-requests/${job.id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errObj = await response.json();
        toast.error(errObj.message || "Failed to update work request details.");
        setIsSaving(false);
        return;
      }

      setIsEditModalOpen(false);
      showToast("Work request updated successfully!");
      await fetchJobDetail();
    } catch (err) {
      console.error("Update request error:", err);
      toast.error((err as any).message || "Server connection failed. Could not save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!job) return;
    setIsDeleting(true);
    try {
      const response = await apiFetch(`/api/work-requests/${job.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errObj = await response.json();
        toast.error(errObj.message || "Failed to delete work request.");
        setIsDeleting(false);
        return;
      }

      setShowDeleteModal(false);
      router.push("/customer/requests");
    } catch (err) {
      console.error("Delete request error:", err);
      toast.error((err as any).message || "Server connection failed. Could not delete request.");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      setIsLoading(true);
      if (!params?.id) {
        setIsLoading(false);
        return;
      }
      const id = params.id as string;

      // Fetch safety notice from database
      try {
        const noticeRes = await apiFetch(`/api/work-requests/${id}/notices`);
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
              actionRequired: dbNotice.actionRequired,
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
      } catch (err) {
        console.error("Failed to fetch safety notice:", err);
      }

      await fetchJobDetail();
      setIsLoading(false);
    };

    initPage();
  }, [params, fetchJobDetail]);

  if (isLoading) {
    return (
      <CustomerLayout title="Work Requests" subtitle="Loading work request...">
        <div className="w-full">
          {/* Back Button Skeleton */}
          <div className="mb-6">
            <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column Skeleton */}
            <div className="flex-1 flex flex-col gap-5 min-w-0">
              {/* Header / Main Card Skeleton */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-16 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mt-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i}>
                        <div className="w-24 h-3 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Additional Notes Skeleton */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="w-32 h-5 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-5">
              {/* Photos Card Skeleton */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="w-24 h-5 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="w-24 h-5 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl animate-pulse"></div>
              </div>

              {/* Timeline Skeleton */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="w-32 h-5 bg-gray-200 rounded animate-pulse mb-6"></div>
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse shrink-0"></div>
                      <div className="flex-1">
                        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (error || !job) {
    return (
      <CustomerLayout title="Work Requests" subtitle="Request Error">
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="text-red-750 font-bold text-lg">{error || "Work request not found."}</div>
          <button
            onClick={() => router.push("/customer/requests")}
            className="px-6 py-2.5 bg-[#D12031] text-white rounded-xl font-bold text-xs border-none cursor-pointer hover:bg-[#a81828]"
          >
            Go Back to Requests
          </button>
        </div>
      </CustomerLayout>
    );
  }

  const isAssigned = job.status === "Assigned" || job.status === "Active";
  const badge = STATUS_BADGE[job.status] ?? STATUS_BADGE["Assigned"];

  return (
    <CustomerLayout
      title="Work Requests"
      subtitle="Manage your work requests and track their progress"
    >
      <div className="w-full">
        {/* ── Back Button ── */}
        <div className="mb-6">
          <Link
            href="/customer/requests"
            className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-[#D12031] transition-colors"
          >
            <FiChevronLeft className="mr-1" size={18} />
            Back to Requests
          </Link>
        </div>

        {isAssigned ? (
          /* ══════════════ ASSIGNED LAYOUT ══════════════ */
          (<div className="flex flex-col lg:flex-row gap-6">
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
                  <button 
                    disabled={job.contactName === "No Technician Assigned"}
                    className="w-full py-3 bg-[#D12031] text-white rounded-xl font-bold text-[13px] flex justify-center items-center gap-2 hover:bg-[#a81828] transition-colors cursor-pointer border-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiPhoneCall size={15} />
                    Call
                  </button>
                  <button 
                    onClick={() => router.push(`/customer/messages?requestId=${job.id}`)}
                    className="w-full py-3 border-2 border-[#D12031] text-[#D12031] rounded-xl font-bold text-[13px] flex justify-center items-center gap-2 hover:bg-red-50 transition-colors cursor-pointer bg-white"
                  >
                    <FiMessageSquare size={15} />
                    Message
                  </button>
                </div>
              </div>

              {/* Attachments Card */}
              <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-sm p-6">
                <h3 className="text-[15px] font-bold text-gray-900 mb-4">
                  Attachments
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  {/* Add Photo Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                    className="h-[88px] rounded-xl border-2 border-dashed border-[#D12031] flex flex-col items-center justify-center text-[#D12031] hover:bg-red-50 transition-colors cursor-pointer bg-white gap-1"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#D12031] flex items-center justify-center">
                      <FiPlus size={16} className="text-white" />
                    </div>
                    <span className="text-[11px] font-semibold">Add Photo</span>
                  </button>
                  {/* Attachment thumbnails */}
                  {job.attachments.map((src, i) => (
                    <div
                      key={i}
                      onClick={() => openPhotoPreview("Attachments", job.attachments, i)}
                      className="relative h-[88px] rounded-xl overflow-hidden shadow-sm group cursor-pointer hover:scale-[1.02] transition-transform"
                    >
                      <img
                        src={src}
                        alt={`Attachment ${i + 1}`}
                        className="object-cover w-full h-full"
                      />
                      {/* Delete icon */}
                      <button
                        onClick={(e) => handleDeleteAttachment(e, i)}
                        type="button"
                        className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#D12031] rounded-full flex items-center justify-center opacity-90 hover:opacity-100 cursor-pointer border-none z-10"
                      >
                        <FiTrash2 size={10} className="text-white" />
                      </button>
                      {/* Filename */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/55 py-1 px-1.5">
                        <p className="text-[9px] text-white truncate text-center font-medium">
                          {getFileName(src)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>)
        ) : (
          /* ══════════════ IN-PROGRESS / COMPLETED LAYOUT ══════════════ */
          (<div className="flex flex-col lg:flex-row gap-6">
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
                    {/* <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Action Required</p>
                      <p className="text-[13.5px] font-semibold text-gray-800 mt-1">{notice.actionRequired ? "Yes (Authorization Needed)" : "No"}</p>
                    </div> */}
                  </div>

                  <div className="border-t border-red-150/40 pt-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Detailed Description</p>
                    <p className="text-[13.5px] text-gray-700 leading-relaxed font-semibold mt-1">
                      {notice.description}
                    </p>
                  </div>

                  {/* Evidence Photos */}
                  {notice.evidencePhotoUrls && notice.evidencePhotoUrls.length > 0 && (
                    <div className="border-t border-red-150/40 pt-4 mt-4">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Evidence Photos</p>
                      <div className="flex gap-3 flex-wrap">
                        {notice.evidencePhotoUrls.map((url, i) => {
                          const fileName = url.substring(url.lastIndexOf("/") + 1);
                          return (
                            <div 
                              key={i} 
                              onClick={() => openPhotoPreview("Evidence Photos", notice.evidencePhotoUrls || [], i)}
                              className="relative w-24 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white font-sans cursor-pointer hover:opacity-90 transition-opacity"
                            >
                              <img src={url} alt="Evidence" className="absolute inset-0 w-full h-full object-cover" />
                              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white px-2 py-0.5 truncate text-center">
                                {fileName}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
                      onClick={() => openPhotoPreview("Before Photos", job.beforePhotos || [], i)}
                      className="relative h-[66px] rounded-lg overflow-hidden shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
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
                  <button
                    onClick={() => openPhotoPreview("Before Photos", job.beforePhotos || [])}
                    className="h-[66px] rounded-lg bg-red-50 border border-[#D12031] flex flex-col items-center justify-center text-[#D12031] hover:bg-red-100 transition-colors cursor-pointer gap-0.5"
                  >
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
                      onClick={() => openPhotoPreview("After Photos", job.afterPhotos || [], i)}
                      className="relative h-[66px] rounded-lg overflow-hidden shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
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
                  <button
                    onClick={() => openPhotoPreview("After Photos", job.afterPhotos || [])}
                    className="h-[66px] rounded-lg bg-red-50 border border-[#D12031] flex flex-col items-center justify-center text-[#D12031] hover:bg-red-100 transition-colors cursor-pointer gap-0.5"
                  >
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
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${job.status === "In-Progress" ||
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
                        className={`w-0.5 h-8 ${job.status === "Completed"
                            ? "bg-[#D12031]"
                            : "bg-gray-200"
                          }`}
                      />
                    </div>
                    <div className="pt-1">
                      <p
                        className={`text-[12px] font-bold ${job.status === "In-Progress" ||
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
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${job.status === "Completed"
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
                        className={`text-[12px] font-bold ${job.status === "Completed"
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

              {/* Attachments Card (Completed / In-Progress) */}
              <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-sm p-5">
                <h3 className="text-[14px] font-bold text-gray-900 mb-4">
                  Attachments
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Add Photo Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                    className="h-[88px] rounded-xl border-2 border-dashed border-[#D12031] flex flex-col items-center justify-center text-[#D12031] hover:bg-red-50 transition-colors cursor-pointer bg-white gap-1"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#D12031] flex items-center justify-center">
                      <FiPlus size={16} className="text-white" />
                    </div>
                    <span className="text-[11px] font-semibold">Add Photo</span>
                  </button>
                  {/* Attachment thumbnails */}
                  {job.attachments.map((src, i) => (
                    <div
                      key={i}
                      onClick={() => openPhotoPreview("Attachments", job.attachments, i)}
                      className="relative h-[88px] rounded-xl overflow-hidden shadow-sm group cursor-pointer hover:scale-[1.02] transition-transform"
                    >
                      <img
                        src={src}
                        alt={`Attachment ${i + 1}`}
                        className="object-cover w-full h-full"
                      />
                      {/* Delete icon */}
                      <button
                        onClick={(e) => handleDeleteAttachment(e, i)}
                        type="button"
                        className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#D12031] rounded-full flex items-center justify-center opacity-90 hover:opacity-100 cursor-pointer border-none z-10"
                      >
                        <FiTrash2 size={10} className="text-white" />
                      </button>
                      {/* Filename */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/55 py-1 px-1.5">
                        <p className="text-[9px] text-white truncate text-center font-medium">
                          {getFileName(src)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>)
        )}
      </div>
      {/* ══════════════ Edit Request Modal ══════════════ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 my-auto">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 text-center shrink-0">
              <h3 className="text-[20px] font-bold text-gray-900">Edit Work Request</h3>
              <p className="text-[13px] text-gray-555 mt-1 font-medium">
                Modify details for Job ID #{job.id}
              </p>
            </div>

            {/* Body Form */}
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">
                  Request Title <span className="text-[#D12031] font-black">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#D12031] focus:ring-1 focus:ring-[#D12031] transition-all"
                />
              </div>

              {/* Site Location */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">Site Location</label>
                <input
                  type="text"
                  placeholder="e.g. Warehouse D, Bay 14"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#D12031] focus:ring-1 focus:ring-[#D12031] transition-all"
                />
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">
                  Detailed Description <span className="text-[#D12031] font-black">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide detailed description of the work to be completed..."
                  value={editDetailedDesc}
                  onChange={(e) => setEditDetailedDesc(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-950 outline-none focus:border-[#D12031] focus:ring-1 focus:ring-[#D12031] transition-all resize-none"
                />
              </div>

              {/* Scope of Work */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">Scope of Work</label>
                <textarea
                  rows={3}
                  placeholder="Describe the full scope of work..."
                  value={editScope}
                  onChange={(e) => setEditScope(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-955 outline-none focus:border-[#D12031] focus:ring-1 focus:ring-[#D12031] transition-all resize-none"
                />
              </div>

              {/* Additional Notes */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">Additional Notes</label>
                <textarea
                  rows={2}
                  placeholder="Any additional notes or special instructions..."
                  value={editAdditionalNotes}
                  onChange={(e) => setEditAdditionalNotes(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-955 outline-none focus:border-[#D12031] focus:ring-1 focus:ring-[#D12031] transition-all resize-none"
                />
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">Due Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-955 outline-none focus:border-[#D12031] focus:ring-1 focus:ring-[#D12031] transition-all"
                  />
                  <FiCalendar size={16} className="text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Priority & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-gray-700">Priority Level</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-955 outline-none focus:border-[#D12031] focus:ring-1 focus:ring-[#D12031] transition-all"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-gray-700">Work Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-955 outline-none focus:border-[#D12031] focus:ring-1 focus:ring-[#D12031] transition-all"
                  >
                    <option value="Cleaning">Cleaning</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Repairs">Repairs</option>
                    <option value="Landscaping">Landscaping</option>
                    <option value="Security">Security</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">Department</label>
                <select
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  disabled={isFetchingDepts}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-955 outline-none focus:border-[#D12031] focus:ring-1 focus:ring-[#D12031] transition-all disabled:opacity-50"
                >
                  {isFetchingDepts ? (
                    <option value="None">Loading departments...</option>
                  ) : departmentsList.length === 0 ? (
                    <>
                      <option value="None">None</option>
                      <option disabled>No departments found</option>
                    </>
                  ) : (
                    <>
                      <option value="None">None</option>
                      {departmentsList.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>



              {/* Actions Footer */}
              <div className="flex gap-4 pt-4 border-t border-gray-100 mt-2 shrink-0 pb-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-800 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3.5 bg-[#D12031] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#a81828] transition-colors cursor-pointer border-none shadow-sm shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
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
                  onClick={handleDeleteRequest}
                  disabled={isDeleting}
                  className="flex-1 py-3.5 bg-[#D12031] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#a81828] transition-colors cursor-pointer border-none shadow-sm shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <FiTrash2 size={17} />
                      Delete
                    </>
                  )}
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
      {/* ══════════════ Photo Preview Modal (Lightbox) ══════════════ */}
      {isPreviewOpen && previewImages.length > 0 && (
        <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          {/* Header toolbar */}
          <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-6 bg-gradient-to-b from-black/50 to-transparent">
            <h3 className="text-white font-bold text-sm tracking-wide">
              {previewTitle} ({previewIndex + 1} of {previewImages.length})
            </h3>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border-none text-lg font-bold"
            >
              ✕
            </button>
          </div>

          {/* Main Content Area */}
          <div className="relative w-full max-w-4xl aspect-[4/3] max-h-[75vh] flex items-center justify-center">
            {/* Left arrow */}
            {previewImages.length > 1 && (
              <button
                onClick={() => setPreviewIndex((prev) => (prev === 0 ? previewImages.length - 1 : prev - 1))}
                className="absolute left-4 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer border-none z-10 text-lg font-bold"
              >
                ◀
              </button>
            )}

            {/* Current Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={previewImages[previewIndex]}
                alt="Preview"
                className="object-contain w-full h-full max-w-full max-h-full rounded-lg"
              />
            </div>

            {/* Right arrow */}
            {previewImages.length > 1 && (
              <button
                onClick={() => setPreviewIndex((prev) => (prev === previewImages.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer border-none z-10 text-lg font-bold"
              >
                ▶
              </button>
            )}
          </div>

          {/* Thumbnails list at the bottom */}
          {previewImages.length > 1 && (
            <div className="flex gap-2 mt-6 overflow-x-auto max-w-full px-4 pb-2 shrink-0">
              {previewImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setPreviewIndex(i)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer bg-black/20 ${
                    previewIndex === i ? "border-[#D12031] scale-105" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={src} className="object-cover w-full h-full" alt="Thumb" />
                </button>
              ))}
            </div>
          )}
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
