"use client";

import React, { useState } from "react";
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

const ASSIGNED_JOBS = [
  {
    id: "99402",
    title: "HVAC Compressor Maintenance",
    loc: "Facility Area 4B",
    pri: "High",
    badgeBg: "bg-red-50 text-red-700 border-red-200",
    description: "Inspect the refrigeration compress unit in Facility Area 4B. Check for gaseous leaks, top-up lubricant level, and verify current draw parameters under high load.",
    tools: ["Manifold Gauge Set", "Refrigerant Sniffer", "Fluke Clamp Multimeter", "PPE Level 2"],
    estDuration: "90 min"
  },
  {
    id: "99408",
    title: "Routine Safety Inspection",
    loc: "Main Assembly Floor",
    pri: "Low",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Conduct standard quarterly safety inspections of all primary and secondary egress channels, manual fire horn alarm pull-points, and eye-wash basin stations.",
    tools: ["Pressure Gauge Calibrator", "Standard Screwdriver", "Safety Hazard Warning Tape", "Decibel Meter"],
    estDuration: "45 min"
  },
  {
    id: "99412",
    title: "Calibration Check: Unit 7",
    loc: "Lab Section 1",
    pri: "Medium",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Calibrate high-frequency thermostatic controllers on the bioreactor assembly in Lab Section 1. Sync parameter logs to server databases.",
    tools: ["Digital Thermocouple Standard", "USB Ground Link Cable", "Vertex Calibration Kit"],
    estDuration: "60 min"
  },
];

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<WorkEntryForm>(INITIAL_FORM);
  const [successToast, setSuccessToast] = useState(false);
  const [completedRequests, setCompletedRequests] = useState(8);
  const [assignedRequests, setAssignedRequests] = useState(2);
  const [activeJobProgress, setActiveJobProgress] = useState(0); // 0=Assigned 1=Started 2=In-Progress 3=Completed
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // States to add job details popups
  const [selectedJob, setSelectedJob] = useState<typeof ASSIGNED_JOBS[0] | null>(null);

  // Alert drawer display state (from Notice & Notify action button)
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompletedRequests((p) => p + 1);
    setIsModalOpen(false);
    setFormData(INITIAL_FORM);
    setSuccessToast(true);
    // Reset active job after completing
    setActiveJobProgress(0);
    setActiveJobId(null);
    setAssignedRequests((prev) => Math.max(0, prev - 1));
    setTimeout(() => setSuccessToast(false), 4000);
  };

  // Triggered when a progress stepper step circle is clicked
  const handleStepClick = (stepIndex: number) => {
    const nextStep = activeJobProgress + 1;
    if (stepIndex !== nextStep) return; // only the immediate next sequential step is clickable
    if (stepIndex === 3) {
      // Direct completion modal opening when clicking index 3 ("Completed")
      // Pre-fill the work form with active job keys to make layout flow seamless
      if (activeJobId) {
        const matchingJob = ASSIGNED_JOBS.find((j) => j.id === activeJobId);
        if (matchingJob) {
          setFormData((prev: WorkEntryForm) => ({
            ...prev,
            requestTitle: REQUEST_TITLES.includes(matchingJob.title) ? matchingJob.title : "",
            workTitle: matchingJob.title,
            detailedDescription: matchingJob.description,
            site: "Site A",
            department: matchingJob.loc,
          }));
        }
      }
      setIsModalOpen(true);
    } else {
      setActiveJobProgress(stepIndex);
    }
  };

  // Called when "Start Job" button is clicked
  const handleStartJob = (jobId: string) => {
    setActiveJobId(jobId);
    setActiveJobProgress(1); // move straight to "Started" state
  };

  const stepLabels = ["Assigned", "Started", "In-Progress", "Completed"];

  // Dynamic header titles based on current view
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
                {String(completedRequests).padStart(2, "0")}
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
                {String(assignedRequests).padStart(2, "0")}
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
                  defaultValue="All Time"
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
                  <span className="text-[32px] font-black text-slate-900 leading-none">02</span>
                  <span className="text-[11px] font-semibold text-slate-800 mb-1">All Time</span>
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
                  <span className="text-[32px] font-black text-slate-900 leading-none">01</span>
                  <span className="text-[11px] font-semibold text-slate-800 mb-1">Various units combined</span>
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
                  <span className="text-[32px] font-black text-slate-900 leading-none">30m</span>
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
                {[
                  { name: "Plastic", sub: "Collected in 3200 cleanings", val: "720 kg" },
                  { name: "Organic", sub: "Collected in 4200 cleanings", val: "500 kg" },
                  { name: "Paper", sub: "Collected in 1870 cleanings", val: "320 kg" },
                  { name: "Plastic", sub: "Collected in 3200 cleanings", val: "720 kg" },
                ].map((w, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-5 relative overflow-hidden flex items-center justify-between"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#D12031]"></div>
                    <div className="min-w-0 pl-4 pr-3">
                      <div className="text-[13px] font-bold text-slate-900 truncate leading-tight">{w.name}</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-1.5 leading-none">{w.sub}</div>
                    </div>
                    <div className="text-[15px] font-black text-slate-900 shrink-0">{w.val}</div>
                  </div>
                ))}
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
              {activeJobId === null ? (
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
                const activeJob = ASSIGNED_JOBS.find((j) => j.id === activeJobId) ?? ASSIGNED_JOBS[0];
                return (
                  <div className="border-[1.5px] border-[#D12031] rounded-2xl p-6 sm:p-8 bg-white shadow-sm">
                    {/* Meta details & view sheets link */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                      <div className="space-y-1.5">
                        <h4 className="text-[17px] font-bold text-slate-900">{activeJob.title}</h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {activeJob.loc} • ID #{activeJob.id}
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
              {ASSIGNED_JOBS.map((job) => {
                const isThisJobActive = activeJobId === job.id;
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
                        {job.loc} • ID #{job.id}
                      </p>
                      
                      <div className="mt-4 inline-block">
                        {job.pri === "High" ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 py-1.5 px-4 rounded-lg border border-emerald-200">
                            High Priority
                          </span>
                        ) : job.pri === "Medium" ? (
                          <span className="text-[11px] font-bold text-lime-700 bg-lime-100/70 py-1.5 px-4 rounded-lg border border-lime-200">
                            Medium Priority
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-yellow-700 bg-yellow-100/70 py-1.5 px-4 rounded-lg border border-yellow-200">
                            Low Priority
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
          />
        </>
      )}

      {/* Overlays / Modals */}
      <NoticeBroadcastModal
        isOpen={isNotifyOpen}
        onClose={() => setIsNotifyOpen(false)}
        onSendBroadcast={() => {
          setIsNotifyOpen(false);
          setSuccessToast(true);
          setTimeout(() => setSuccessToast(false), 3000);
        }}
      />
    </TechnicianLayout>
  );
}
