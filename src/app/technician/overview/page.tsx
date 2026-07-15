"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  Clock,
  Check,
  ChevronDown,
  TrendingUp,
  Briefcase,
  Trash2
} from "lucide-react";
import TechnicianLayout from "@/components/TechnicianLayout";
import AddWorkLogModal, {
  WorkEntryForm,
  REQUEST_TITLES,
} from "./components/AddWorkLogModal";
import NoticeBroadcastModal from "./components/NoticeBroadcastModal";
import JobDetailsModal from "./components/JobDetailsModal";
import { apiFetch } from "@/lib/apiFetch";

const INITIAL_FORM: WorkEntryForm = {
  requestTitle: "",
  date: "",
  site: "",
  department: "",
  workType: "Routine",
  workTitle: "",
  detailedDescription: "",
  ppeUsed: ["Safety Glasses", "Helmet", "Face Respirator", "Boots", "Fire-Resistant Clothing"],
  category: "Cleaning",
  priority: "Medium",
  duration: "30",
  wasteType: "",
  quantity: "0.00",
  unit: "",
  additionalNotes: "",
};

interface Notice {
  jobId: string;
  noticeType: string;
  priority: string;
  description: string;
  actionRequired: boolean;
  date: string;
  time: string;
}

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<WorkEntryForm>(INITIAL_FORM);
  const [successToast, setSuccessToast] = useState(false);
  
  // Real Data states
  const [completedRequests, setCompletedRequests] = useState(0);
  const [assignedRequests, setAssignedRequests] = useState(0);
  const [analytics, setAnalytics] = useState({
    totalCompletedCleanings: 0,
    totalWasteCollected: 0,
    avgDuration: 0,
    wasteTypeBreakdown: [] as any[]
  });
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  
  // Loading states
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  const [timeFilter, setTimeFilter] = useState("All Time");

  const [activeJobProgress, setActiveJobProgress] = useState(0); // 0=Assigned 1=Started 2=In-Progress 3=Completed
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // States to add job details popups
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  // Alert drawer display state (from Notice & Notify action button)
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);

  // Fetch functions
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const res = await apiFetch("/api/work-requests/tech/stats");
      if (res.ok) {
        const data = await res.json();
        setCompletedRequests(data.completed || 0);
        setAssignedRequests((data.inProgress || 0) + (data.pending || 0));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setIsLoadingAnalytics(true);
    try {
      const filter = timeFilter.toLowerCase().replace(" ", "-");
      const res = await apiFetch(`/api/tech/comprehensive-stats?timeFilter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [timeFilter]);

  const fetchActiveJobs = useCallback(async () => {
    setIsLoadingJobs(true);
    try {
      const userRes = await apiFetch("/api/auth/me");
      let currentUserId = null;
      if (userRes.ok) {
        const userData = await userRes.json();
        currentUserId = userData.user?.id;
      }
      
      const res = await apiFetch("/api/work-requests/tech/all-sites?status=active");
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          // Keep only jobs assigned to the current tech that are not completed
          const myJobs = data.data.filter((j: any) => j.assignedEmployeeId === currentUserId && j.status !== 'completed');
          setActiveJobs(myJobs);
          
          // Auto set active job if there's an in_progress job and no active job is selected
          const inProgressJob = myJobs.find((j: any) => j.status === 'in_progress');
          if (inProgressJob && !activeJobId) {
            setActiveJobId(inProgressJob.id);
            setActiveJobProgress(2);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingJobs(false);
    }
  }, [activeJobId]);

  const fetchAssignedSites = useCallback(async () => {
    try {
      const res = await apiFetch("/api/sites/assigned");
      if (res.ok) {
        const data = await res.json();
        setSites(data || []);
      }
    } catch (e) {
      console.error("Failed to fetch assigned sites:", e);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchActiveJobs();
    fetchAssignedSites();
  }, [fetchStats, fetchActiveJobs, fetchAssignedSites]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const categoryVal = formData.category.toLowerCase() === "safety" ? "other" : formData.category.toLowerCase();
    const workTypeMap: Record<string, string> = {
      "Routine": "routine",
      "Emergency": "emergency",
      "Preventative": "routine",
    };
    const workTypeVal = workTypeMap[formData.workType] || "routine";
    
    const unitMap: Record<string, string> = {
      "lbs": "pounds",
      "tons": "tons",
      "kg": "pounds",
    };
    const wasteUnitVal = unitMap[formData.unit] || null;

    let targetSiteId = formData.site;
    const matchedSite = sites.find(s => s.id === formData.site || s.name === formData.site);
    if (matchedSite) {
      targetSiteId = matchedSite.id;
    } else if (sites.length > 0) {
      targetSiteId = sites[0].id;
    }

    const payload = {
      siteId: targetSiteId,
      title: formData.workTitle,
      description: formData.detailedDescription,
      category: categoryVal,
      status: "completed",
      priority: formData.priority.toLowerCase(),
      workDate: new Date(formData.date || Date.now()).toISOString(),
      plantName: matchedSite ? matchedSite.name : "Main Facility",
      department: formData.department,
      workType: workTypeVal,
      wasteType: formData.wasteType || null,
      wasteQuantity: formData.quantity || null,
      wasteUnit: wasteUnitVal,
      duration: parseInt(formData.duration) || null,
      notes: formData.additionalNotes || null,
      ppeUsed: formData.ppeUsed,
    };

    try {
      const entryRes = await apiFetch("/api/work-entries", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (entryRes.ok) {
        const newEntry = await entryRes.json();
        
        if (activeJobId) {
          await apiFetch(`/api/work-requests/${activeJobId}`, {
            method: "PUT",
            body: JSON.stringify({
              status: "completed",
              workEntryId: newEntry.id,
            }),
          });
        }

        setIsModalOpen(false);
        setFormData(INITIAL_FORM);
        setSuccessToast(true);

        setActiveJobProgress(0);
        setActiveJobId(null);

        fetchStats();
        fetchAnalytics();
        fetchActiveJobs();
      } else {
        const errorData = await entryRes.json();
        alert(`Failed to save work log: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error submitting work entry:", err);
      alert("Failed to submit work log due to network or server error.");
    }
    
    setTimeout(() => setSuccessToast(false), 4000);
  };

  const handleStepClick = (stepIndex: number) => {
    const nextStep = activeJobProgress + 1;
    if (stepIndex !== nextStep) return; // only the immediate next sequential step is clickable
    if (stepIndex === 3) {
      // Direct completion modal opening when clicking index 3 ("Completed")
      if (activeJobId) {
        const matchingJob = activeJobs.find((j) => j.id === activeJobId);
        if (matchingJob) {
          setFormData((prev: WorkEntryForm) => ({
            ...prev,
            requestTitle: REQUEST_TITLES.includes(matchingJob.title) ? matchingJob.title : "",
            workTitle: matchingJob.title,
            detailedDescription: matchingJob.description || "",
            site: matchingJob.siteId || "Site A",
            department: matchingJob.department || "General",
          }));
        }
      }
      setIsModalOpen(true);
    } else {
      setActiveJobProgress(stepIndex);
    }
  };

  const handleStartJob = async (jobId: string) => {
    try {
      const res = await apiFetch(`/api/work-requests/${jobId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "in_progress" })
      });
      if (res.ok) {
        setActiveJobId(jobId);
        setActiveJobProgress(1); // Started state
        fetchActiveJobs(); // refresh the list to reflect status changes
      }
    } catch (e) {
      console.error(e);
      // Fallback local update if API fails
      setActiveJobId(jobId);
      setActiveJobProgress(1); 
    }
  };

  const stepLabels = ["Assigned", "Started", "In-Progress", "Completed"];
  const currentTitle = selectedJob || isNotifyOpen ? "Work Requests" : "Work Overview";
  const currentSubtitle = selectedJob || isNotifyOpen 
    ? "Manage your work requests and track their progress" 
    : "Track all completed and ongoing work at your site";

  return (
    <TechnicianLayout title={currentTitle} subtitle={currentSubtitle}>
      {selectedJob ? (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      ) : (
        <>
          {/* 📊 STATS CARDS SECTION */}
          <section id="analytics-statistics-cards" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Completed Requests */}
            <div
              id="stat-completed-requests"
              className="bg-white rounded-2xl border border-slate-200 border-b-[3px] border-b-[#4ade80] p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[160px]"
            >
              <div className="flex items-start justify-between">
                <span className="text-sm font-bold text-slate-800">Completed Requests</span>
                <span className="w-8 h-8 rounded-full bg-[#4ade80] flex items-center justify-center shadow-sm text-white shrink-0">
                  <Check size={18} strokeWidth={3} />
                </span>
              </div>
              <div className="text-[52px] font-black text-slate-900 leading-none mt-8">
                {isLoadingStats ? (
                  <div className="h-[52px] w-24 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  String(completedRequests).padStart(2, "0")
                )}
              </div>
            </div>

            {/* Assigned Requests */}
            <div
              id="stat-assigned-requests"
              className="bg-white rounded-2xl border border-slate-200 border-b-[3px] border-b-[#ef4444] p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[160px]"
            >
              <div className="flex items-start justify-between">
                <span className="text-sm font-bold text-slate-800">Assigned Requests</span>
                <span className="w-8 h-8 rounded-full bg-[#ef4444] flex items-center justify-center shadow-sm text-white shrink-0">
                  <Clock size={16} strokeWidth={2.5} />
                </span>
              </div>
              <div className="text-[52px] font-black text-slate-900 leading-none mt-8">
                {isLoadingStats ? (
                  <div className="h-[52px] w-24 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  String(assignedRequests).padStart(2, "0")
                )}
              </div>
            </div>
          </section>

          {/* 📈 WORK ANALYTICS SECTION */}
          <section
            id="card-analytics"
            className="mb-10"
          >
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-[17px] font-bold text-slate-900">
                  My Work Analytics
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Your cleaning activities and waste management summary
                </p>
              </div>

              {/* Time Scope Dropdown */}
              <div className="relative inline-block self-start sm:self-center shrink-0">
                <select
                  id="select-analytics-scope"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2 text-xs font-semibold text-slate-800 cursor-pointer outline-none hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <option value="All Time">All Time</option>
                  <option value="This Month">This Month</option>
                  <option value="This Week">This Week</option>
                </select>
                <ChevronDown size={14} className="text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3 columns grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
              {/* My Cleanings */}
              <div
                id="mini-card-cleanings"
                className="bg-[#dcfce7] rounded-2xl p-6 flex flex-col justify-between min-h-[130px] border-b-[4px] border-b-[#bbf7d0]"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#4ade80] flex items-center justify-center text-white shrink-0">
                    <Check size={16} strokeWidth={3} />
                  </span>
                  <span className="text-[13px] font-bold text-slate-800">My Cleanings</span>
                </div>
                <div className="flex items-end justify-between mt-8">
                  {isLoadingAnalytics ? (
                    <div className="h-[32px] w-16 bg-green-200 rounded animate-pulse"></div>
                  ) : (
                    <span className="text-[32px] font-black text-slate-900 leading-none">
                      {String(analytics.totalCompletedCleanings).padStart(2, "0")}
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-slate-800 mb-1">{timeFilter}</span>
                </div>
              </div>

              {/* Waste Collected */}
              <div
                id="mini-card-waste"
                className="bg-[#fef9c3] rounded-2xl p-6 flex flex-col justify-between min-h-[130px] border-b-[4px] border-b-[#fde047]"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#facc15] flex items-center justify-center text-white shrink-0">
                    <Trash2 size={14} strokeWidth={2.5} />
                  </span>
                  <span className="text-[13px] font-bold text-slate-800">Waste Collected</span>
                </div>
                <div className="flex items-end justify-between mt-8">
                  {isLoadingAnalytics ? (
                    <div className="h-[32px] w-16 bg-yellow-200 rounded animate-pulse"></div>
                  ) : (
                    <span className="text-[32px] font-black text-slate-900 leading-none">
                      {String(analytics.totalWasteCollected).padStart(2, "0")}
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-slate-800 mb-1">Total quantity</span>
                </div>
              </div>

              {/* Avg Duration */}
              <div
                id="mini-card-duration"
                className="bg-[#ecfccb] rounded-2xl p-6 flex flex-col justify-between min-h-[130px] border-b-[4px] border-b-[#d9f99d]"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#a3e635] flex items-center justify-center text-white shrink-0">
                    <TrendingUp size={14} strokeWidth={2.5} />
                  </span>
                  <span className="text-[13px] font-bold text-slate-800">Avg Duration</span>
                </div>
                <div className="flex items-end justify-between mt-8">
                  {isLoadingAnalytics ? (
                    <div className="h-[32px] w-20 bg-lime-200 rounded animate-pulse"></div>
                  ) : (
                    <span className="text-[32px] font-black text-slate-900 leading-none">
                      {analytics.avgDuration > 0 ? `${analytics.avgDuration}m` : "N/A"}
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-slate-800 mb-1">Per cleaning task</span>
                </div>
              </div>
            </div>

            {/* Waste Type Analysis sub-section */}
            <div
              id="analysis-subpanel"
              className="bg-[#fdf2f2] rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-start gap-3 mb-6">
                <Trash2 size={18} className="text-slate-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-[15px] font-bold text-slate-900">Waste Type Analysis</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Breakdown of waste types collected during cleaning activities
                  </p>
                </div>
              </div>

              {/* Grid holding 4 items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoadingAnalytics ? (
                   Array(4).fill(0).map((_, i) => (
                     <div key={i} className="bg-white rounded-xl p-5 relative overflow-hidden flex items-center justify-between h-[80px]">
                       <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gray-200 animate-pulse"></div>
                       <div className="flex flex-col gap-2 w-full pl-4">
                         <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                         <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                       </div>
                     </div>
                   ))
                ) : analytics.wasteTypeBreakdown.length === 0 ? (
                  <div className="col-span-1 md:col-span-2 text-center py-6 text-sm text-slate-400 font-medium bg-white rounded-xl border border-slate-100">
                    No waste data found for {timeFilter.toLowerCase()}.
                  </div>
                ) : (
                  analytics.wasteTypeBreakdown.map((w, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-5 relative overflow-hidden flex items-center justify-between"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#D12031]"></div>
                      <div className="min-w-0 pl-4 pr-3">
                        <div className="text-[13px] font-bold text-slate-900 truncate leading-tight">{w.wasteType}</div>
                        <div className="text-[11px] text-slate-400 font-medium mt-1.5 leading-none">Collected in {w.count} cleanings</div>
                      </div>
                      <div className="text-[15px] font-black text-slate-900 shrink-0">{w.totalQuantity} {w.unit}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* ⚡ MY ACTIVE JOB PANEL */}
          <section
            id="card-active-job"
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs mb-8"
          >
            {/* Header Ribbon bar */}
            <div className="bg-[#D12031] px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
              <div>
                <h3 className="text-[15px] font-bold tracking-wide">
                  My Active Job
                </h3>
                <p className="text-[11px] text-white/90 font-medium mt-1">
                  In-Progress work requests assigned to you
                </p>
              </div>
              <button
                id="btn-active-notify"
                onClick={() => setIsNotifyOpen(true)}
                className="self-start sm:self-center px-5 py-2.5 bg-white text-[#D12031] hover:bg-red-50 font-bold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Notice &amp; Notify
              </button>
            </div>

            {/* Progress block */}
            <div className="p-6 sm:p-8">
              {isLoadingJobs ? (
                <div className="flex justify-center p-12">
                  <div className="w-8 h-8 border-4 border-[#D12031] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : activeJobId === null ? (
                /* Empty State */
                <div className="text-center py-12 px-4 text-slate-400 max-w-sm mx-auto bg-white rounded-xl border border-slate-200">
                  <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mx-auto mb-4">
                    <Briefcase size={24} />
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-700">No dispatch started yet</h4>
                  <p className="text-xs text-slate-400 mt-2 pb-2 font-medium leading-relaxed">
                    Review the assigned work list below and select &quot;Start Job&quot; on a queued task to initiate the tracking stepper.
                  </p>
                </div>
              ) : (() => {
                const activeJob = activeJobs.find((j) => j.id === activeJobId);
                if (!activeJob) return null;
                
                return (
                  <div className="border-[1.5px] border-[#D12031] rounded-2xl p-6 sm:p-8 bg-white shadow-sm">
                    {/* Meta details & view sheets link */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                      <div className="space-y-1.5">
                        <h4 className="text-[17px] font-bold text-slate-900">{activeJob.title}</h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {activeJob.siteName || "Site"} • ID #{activeJob.id.substring(0,8)}
                        </p>
                      </div>
                      <button
                        id="active-job-details-link"
                        type="button"
                        onClick={() => setSelectedJob(activeJob)}
                        className="self-start text-[13px] font-bold text-[#D12031] hover:text-[#b81d2c] flex items-center gap-1 transition-colors group cursor-pointer"
                      >
                        View Details
                        <span className="text-[15px] transform group-hover:translate-x-1 transition-transform font-sans">›</span>
                      </button>
                    </div>

                    {/* Horizontal Stepper */}
                    <div className="pt-2 pb-6 px-4 sm:px-12">
                      <div className="relative">
                        {/* Backdrop connection line */}
                        <div className="absolute top-[17px] left-[12.5%] right-[12.5%] h-[3px] bg-slate-200 -translate-y-1/2 z-0 rounded" />

                        {/* Dynamic coloring active progress line */}
                        <div
                          className="absolute top-[17px] left-[12.5%] h-[3px] bg-[#D12031] -translate-y-1/2 z-0 transition-all duration-500 rounded"
                          style={{ width: `${(activeJobProgress / (stepLabels.length - 1)) * 75}%` }}
                        />

                        {/* Steps circles */}
                        <div className="relative z-10 flex items-center justify-between">
                          {stepLabels.map((label, index) => {
                            const completed = index <= activeJobProgress;
                            const isNextTarget = index === activeJobProgress + 1;

                            return (
                              <div
                                key={label}
                                onClick={() => handleStepClick(index)}
                                className="flex flex-col items-center select-none w-1/4 relative"
                              >
                                <button
                                   type="button"
                                   disabled={!isNextTarget}
                                   className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all duration-200 outline-none z-10
                                    ${completed
                                      ? "bg-[#D12031] text-white"
                                      : "bg-slate-200"
                                    }`}
                                >
                                  {completed && <Check size={18} strokeWidth={3} />}
                                </button>

                                <span
                                  className={`text-xs sm:text-[13px] font-bold mt-4 text-center ${completed
                                    ? "text-slate-800"
                                    : "text-slate-400"
                                    }`}
                                >
                                  {label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>

          {/* 📋 ASSIGNED JOB REQUESTS LIST */}
          <section
            id="card-assigned-list"
            className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs mb-8"
          >
            {/* Header ribbon */}
            <div className="bg-[#D12031] px-6 py-5 text-white">
              <h3 className="text-[15px] font-bold tracking-wide">
                Assigned Job Requests
              </h3>
              <p className="text-[11px] text-white/90 font-medium mt-1">
                Active work requests assigned to you
              </p>
            </div>

            {/* Stack list container */}
            <div className="p-6 sm:p-8 space-y-5">
              {isLoadingJobs ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-start justify-between gap-5 border border-slate-200 h-[120px] animate-pulse">
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gray-200"></div>
                    <div className="flex-1 space-y-3 pl-3">
                       <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                       <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                       <div className="h-6 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                ))
              ) : activeJobs.length === 0 ? (
                <div className="text-center py-12 px-4 text-slate-400 max-w-sm mx-auto bg-white rounded-xl border border-slate-200">
                  <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mx-auto mb-4">
                    <CheckCircle size={24} />
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-700">All Caught Up!</h4>
                  <p className="text-xs text-slate-400 mt-2 pb-2 font-medium leading-relaxed">
                    You have no active work requests assigned to you right now.
                  </p>
                </div>
              ) : activeJobs.map((job) => {
                const isThisJobActive = activeJobId === job.id;
                
                const prio = job.priority?.toLowerCase() || 'medium';
                
                return (
                  <div
                    id={`assigned-job-${job.id}`}
                    key={job.id}
                    className="bg-white rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-start justify-between gap-5 border border-slate-200 hover:shadow-sm hover:border-slate-300 transition-all duration-150"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#D12031]"></div>
                    
                    {/* Left side details */}
                    <div className="flex-1 min-w-0 pl-3">
                      <h4 className="text-[17px] font-bold text-slate-900">{job.title}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1.5">
                        {job.siteName || "Site"} • ID #{job.id.substring(0,8)}
                      </p>
                      
                      <div className="mt-4 inline-block">
                        {prio === "high" || prio === "urgent" ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 py-1.5 px-4 rounded-lg border border-emerald-200 capitalize">
                            {prio} Priority
                          </span>
                        ) : prio === "medium" ? (
                          <span className="text-[11px] font-bold text-lime-700 bg-lime-100/70 py-1.5 px-4 rounded-lg border border-lime-200 capitalize">
                            {prio} Priority
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-yellow-700 bg-yellow-100/70 py-1.5 px-4 rounded-lg border border-yellow-200 capitalize">
                            {prio} Priority
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons right side */}
                    <div className="flex flex-col items-start md:items-end gap-4 shrink-0">
                      <button
                        id={`btn-details-${job.id}`}
                        type="button"
                        onClick={() => setSelectedJob(job)}
                        className="text-[13px] font-bold text-[#D12031] hover:text-[#b81d2c] transition-colors flex items-center gap-1 cursor-pointer ml-auto md:ml-0"
                      >
                        View Detail
                        <span className="text-[15px] font-sans">›</span>
                      </button>

                      <button
                        id={`btn-start-${job.id}`}
                        type="button"
                        onClick={() => handleStartJob(job.id)}
                        disabled={isThisJobActive || (activeJobId !== null)}
                        className={`px-6 py-3 text-[13px] font-bold rounded-xl transition-all outline-none mt-2
                          ${isThisJobActive
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : activeJobId !== null
                              ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100"
                              : "bg-[#D12031] hover:bg-[#b81d2c] text-white cursor-pointer shadow-sm active:scale-[0.98]"
                          }`}
                      >
                        Start Job
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SUCCESS TOAST ALERTER */}
          {successToast && (
            <div
              id="success-notification-toast"
              className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold border border-emerald-500/20 animate-toast-in"
            >
              <CheckCircle size={18} className="text-emerald-100" />
              <span>Work Entry added successfully! Stat logs calculated.</span>
            </div>
          )}

          {/* 🛠️ ADD COMPLETED WORK ENTRY MODAL DIALOG */}
          <AddWorkLogModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            sites={sites}
          />
        </>
      )}

      {/* Overlays / Modals */}
      <NoticeBroadcastModal
        isOpen={isNotifyOpen}
        onClose={() => setIsNotifyOpen(false)}
        onSendBroadcast={(data) => {
          setIsNotifyOpen(false);
          if (activeJobId) {
            try {
              const notices: Notice[] = JSON.parse(localStorage.getItem("servicelink_notices") || "[]");
              const filteredNotices = notices.filter((n: Notice) => n.jobId !== activeJobId);
              const newNotice = {
                jobId: activeJobId,
                ...data,
                date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              };
              filteredNotices.push(newNotice);
              localStorage.setItem("servicelink_notices", JSON.stringify(filteredNotices));

              const noticeText = `⚠️ NOTICE & NOTIFY APPLIED\n\nType: ${data.noticeType}\nPriority: ${data.priority}\nDescription: ${data.description}\nAction Required: ${data.actionRequired ? "Yes" : "No"}`;

              const chatKey = `servicelink_chat_${activeJobId}`;
              const storedMessages = JSON.parse(localStorage.getItem(chatKey) || "[]");
              let updatedMessages = [...storedMessages];
              if (updatedMessages.length === 0) {
                updatedMessages = [
                  {
                    id: 1,
                    text: "I have scheduled the repair for tomorrow morning at 9 AM.",
                    time: "6/5/2026, 1:47:10 PM",
                    senderName: "Maurice Maldonado",
                    initials: "MM",
                    isCurrentUser: false,
                  },
                  {
                    id: 2,
                    text: "I have scheduled the repair for tomorrow morning at 9 AM.",
                    time: "YOU • 10:46 AM",
                    senderName: "Karl Smith",
                    initials: "KS",
                    isCurrentUser: true,
                  }
                ];
              }
              const newMsg = {
                id: `notice_${activeJobId}_${Date.now()}`,
                text: noticeText,
                time: `YOU • ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
                senderName: "Karl Smith",
                initials: "KS",
                isCurrentUser: true,
                isNotice: true,
                noticeDetails: newNotice,
              };
              updatedMessages.push(newMsg);
              localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
            } catch (err) {
              console.error(err);
            }
          }
          setSuccessToast(true);
          setTimeout(() => setSuccessToast(false), 3000);
        }}
      />
    </TechnicianLayout>
  );
}
