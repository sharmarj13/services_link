"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiCalendar,
} from "react-icons/fi";
import { HiOutlineUpload } from "react-icons/hi";
import AdminLayout from "@/components/AdminLayout";


interface WorkRequest {
  id: string;
  title: string;
  location: string;
  site: string;
  priority: string;
  status: string;
  category: string;
  customer: string;
  department: string;
  dueDate: string;
  description: string;
  scopeOfWork: string;
  assignedTechnician?: string;
}

export default function AdminRequestsPage() {
  // Mock Data Store in state
  const [requests, setRequests] = useState<WorkRequest[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("servicelink_requests");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.map((r: WorkRequest) => {
              let s = r.status;
              if (s === "In-Progress") s = "Active";
              if (s === "Pending") s = "Assigned";
              return { ...r, status: s };
            });
          }
        } catch {}
      }
    }
    return [
      {
        id: "99402",
        title: "HVAC Compressor Maintenance",
        location: "Facility Area 48",
        site: "Site A",
        priority: "High",
        status: "Active",
        category: "Maintenance",
        customer: "Maurice Maldonado",
        department: "Restrooms",
        dueDate: "2026-06-25",
        description: "HVAC Compressor is making loud grinding noise and cooling is inefficient. Inspect belt, bearings and refrigerant levels.",
        scopeOfWork: "Inspect belt, bearings, compressor coils, refrigerant line pressure and clean air filters.",
        assignedTechnician: "John Doe",
      },
      {
        id: "99408",
        title: "Routine Safety Inspection",
        location: "Main Assembly Floor",
        site: "Site B",
        priority: "Low",
        status: "Assigned",
        category: "Safety",
        customer: "Alice Smith",
        department: "Kitchen",
        dueDate: "2026-06-30",
        description: "Semiannual safety inspection of sprinkler valves, emergency exits, fire extinguishers and hazard markings.",
        scopeOfWork: "Check pressure gauges, examine lock-outs, verify clear pathways to emergency exits.",
        assignedTechnician: "Unassigned",
      },
      {
        id: "99411",
        title: "Deep Carpet Cleaning",
        location: "Main Lobby Area",
        site: "Site C",
        priority: "Medium",
        status: "Completed",
        category: "Cleaning",
        customer: "Robert Brown",
        department: "Lobby",
        dueDate: "2026-06-18",
        description: "High traffic carpet area needs heavy steam extraction cleaning and deodorizing before corporate meeting.",
        scopeOfWork: "Pre-treat traffic lanes, steam clean entire area, deodorize, set air blowers.",
        assignedTechnician: "Sarah Connor",
      },
      {
        id: "99415",
        title: "Warehouse Ventilation Repair",
        location: "Loading Dock B",
        site: "Site D",
        priority: "High",
        status: "Active",
        category: "Maintenance",
        customer: "Emma Wilson",
        department: "Maintenance",
        dueDate: "2026-06-28",
        description: "Exhaust fan in Warehouse loading dock B is not turning on. Electrical panel check required.",
        scopeOfWork: "Diagnose electrical power feed, check motor capacitor, replace motor if burned out.",
        assignedTechnician: "Alex Mercer",
      },
    ];
  });

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSite, setFilterSite] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  // Modals States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState<WorkRequest | null>(null);

  // Form Fields (For Add & Edit)
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formScope, setFormScope] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formPriority, setFormPriority] = useState("Medium");
  const [formCategory, setFormCategory] = useState("Cleaning");
  const [formDept, setFormDept] = useState("None");
  const [formSite, setFormSite] = useState("Site A");
  const [formCust, setFormCust] = useState("");
  const [formStatus, setFormStatus] = useState("Assigned");
  const [formTech, setFormTech] = useState("Unassigned");

  // Photos & Toasts
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Reset form fields
  const resetForm = () => {
    setFormTitle("");
    setFormDesc("");
    setFormScope("");
    setFormDueDate("");
    setFormPriority("Medium");
    setFormCategory("Cleaning");
    setFormDept("None");
    setFormSite("Site A");
    setFormCust("");
    setFormStatus("Assigned");
    setFormTech("Unassigned");
    setUploadedPhotos([]);
  };

  // Handlers
  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (req: WorkRequest) => {
    setActiveRequest(req);
    setFormTitle(req.title);
    setFormDesc(req.description);
    setFormScope(req.scopeOfWork);
    setFormDueDate(req.dueDate);
    setFormPriority(req.priority);
    setFormCategory(req.category);
    setFormDept(req.department);
    setFormSite(req.site);
    setFormCust(req.customer);
    setFormStatus(req.status);
    setFormTech(req.assignedTechnician || "Unassigned");
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (req: WorkRequest) => {
    setActiveRequest(req);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDesc || !formCust) {
      alert("Please fill in all required fields.");
      return;
    }

    const newId = String(Math.floor(10000 + Math.random() * 90000));
    const newReq: WorkRequest = {
      id: newId,
      title: formTitle,
      location: formDept !== "None" ? `${formDept} Area` : "Facility Area 1A",
      site: formSite,
      priority: formPriority,
      status: formStatus,
      category: formCategory,
      customer: formCust,
      department: formDept,
      dueDate: formDueDate || "2026-06-30",
      description: formDesc,
      scopeOfWork: formScope,
      assignedTechnician: formTech,
    };

    const updated = [newReq, ...requests];
    setRequests(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("servicelink_requests", JSON.stringify(updated));
    }
    setIsAddModalOpen(false);
    resetForm();
    showToast("Work Request created successfully!");
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;

    const updatedRequests = requests.map((r) => {
      if (r.id === activeRequest.id) {
        return {
          ...r,
          title: formTitle,
          description: formDesc,
          scopeOfWork: formScope,
          dueDate: formDueDate,
          priority: formPriority,
          category: formCategory,
          department: formDept,
          site: formSite,
          customer: formCust,
          status: formStatus,
          location: formDept !== "None" ? `${formDept} Area` : r.location,
          assignedTechnician: formTech,
        };
      }
      return r;
    });

    setRequests(updatedRequests);
    if (typeof window !== "undefined") {
      localStorage.setItem("servicelink_requests", JSON.stringify(updatedRequests));
    }
    setIsEditModalOpen(false);
    showToast("Work Request updated successfully!");
  };

  const handleDeleteConfirm = () => {
    if (!activeRequest) return;
    const updated = requests.filter((r) => r.id !== activeRequest.id);
    setRequests(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("servicelink_requests", JSON.stringify(updated));
    }
    setIsDeleteModalOpen(false);
    showToast("Work Request deleted successfully!");
  };

  const handleQuickAssign = (id: string, technicianName: string) => {
    const updated = requests.map((req) => {
      if (req.id === id) {
        return {
          ...req,
          assignedTechnician: technicianName,
          status: technicianName === "Unassigned" ? "Assigned" : "Active",
        };
      }
      return req;
    });

    setRequests(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("servicelink_requests", JSON.stringify(updated));
    }
    if (technicianName === "Unassigned") {
      showToast(`Technician unassigned. Status transitioned to Assigned.`);
    } else {
      showToast(`Technician ${technicianName} assigned successfully. Status transitioned to Active.`);
    }
  };

  const handlePhotoUpload = () => {
    setUploadedPhotos((prev) => [...prev, "/images/warehouse_map.svg"]);
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, idx) => idx !== index));
  };

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.includes(searchTerm) ||
      r.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = filterSite === "All" || r.site === filterSite;
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;
    const matchesPriority = filterPriority === "All" || r.priority === filterPriority;

    return matchesSearch && matchesSite && matchesStatus && matchesPriority;
  });

  return (
    <AdminLayout
      title="My Request Management"
      subtitle="Create, edit, dispatch, and manage all facility work requests"
    >
      <div className="max-w-7xl pb-10 space-y-6">

        {/* 🔍 Search & Filters Bar */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search by Title, ID, or Customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031] focus:bg-white transition-all font-semibold"
            />
            <FiSearch size={16} className="text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Site Filter */}
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:border-[#D12031]"
            >
              <option value="All">All Sites</option>
              <option value="Site A">Site A</option>
              <option value="Site B">Site B</option>
              <option value="Site C">Site C</option>
              <option value="Site D">Site D</option>
              <option value="Site E">Site E</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:border-[#D12031]"
            >
              <option value="All">All Status</option>
              <option value="Assigned">Assigned</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:border-[#D12031]"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Add New Request Button */}
            <button
              onClick={handleOpenAddModal}
              className="ml-auto md:ml-0 bg-[#D12031] hover:bg-[#b91c2c] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border-none shadow-sm"
            >
              <FiPlus size={15} />
              <span>Create Request</span>
            </button>
          </div>
        </div>

        {/* 📋 Work Requests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-gray-200 border-l-[5px] rounded-l-2xl shadow-xs p-6 hover:shadow-md transition-shadow relative flex flex-col justify-between"
              style={{
                borderLeftColor:
                  req.status === "Completed"
                    ? "#10B981"
                    : req.status === "Active"
                      ? "#D12031"
                      : req.status === "Assigned"
                        ? "#F59E0B"
                        : "#9CA3AF",
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-[11px] font-black text-gray-400">ID #{req.id}</span>
                  <div className="flex items-center gap-1.5">
                    {/* Status Badge */}
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${req.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : req.status === "Active"
                          ? "bg-red-50 text-[#D12031] border-red-100"
                          : req.status === "Assigned"
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                    >
                      {req.status}
                    </span>

                    {/* Priority Badge */}
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${req.priority === "High"
                        ? "bg-rose-50 text-rose-700 border-rose-100"
                        : req.priority === "Medium"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}
                    >
                      {req.priority} Priority
                    </span>
                  </div>
                </div>

                <h4 className="text-[15px] font-bold text-gray-950 mb-1 leading-snug">{req.title}</h4>
                <p className="text-xs text-gray-500 font-semibold mb-3">{req.location} • {req.site}</p>
                <p className="text-[13px] text-gray-600 font-medium line-clamp-2 leading-relaxed mb-4">
                  {req.description}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-2 flex items-center justify-between text-xs font-semibold">
                <div className="text-[11px] text-gray-550 font-semibold flex flex-col gap-0.5">
                  <div>Client: <span className="font-bold text-gray-800">{req.customer}</span></div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span>Tech:</span>
                    <select
                      value={req.assignedTechnician || "Unassigned"}
                      onChange={(e) => handleQuickAssign(req.id, e.target.value)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg outline-none cursor-pointer focus:border-[#D12031] border ${
                        req.assignedTechnician && req.assignedTechnician !== "Unassigned"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                      title="Quick Assign Technician"
                    >
                      <option value="Unassigned">Assign Tech...</option>
                      <option value="John Doe">John Doe</option>
                      <option value="Bob Johnson">Bob Johnson</option>
                      <option value="Sarah Connor">Sarah Connor</option>
                      <option value="Alex Mercer">Alex Mercer</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {req.status === "Active" && (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(req)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-800 transition-colors cursor-pointer border-none"
                        title="Edit Request"
                      >
                        <FiEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(req)}
                        className="p-2 hover:bg-red-50 rounded-lg text-[#D12031]/80 hover:text-[#D12031] transition-colors cursor-pointer border-none"
                        title="Delete Request"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </>
                  )}
                  <Link
                    href={`/admin/requests/${req.id}`}
                    className="ml-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {filteredRequests.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 font-semibold text-sm shadow-xs">
              No work requests match the current filters.
            </div>
          )}
        </div>

      </div>

      {/* 📝 ADD WORK REQUEST MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 text-center">
              <h3 className="text-[19px] font-bold text-gray-900">Create Work Request (Admin Mode)</h3>
              <p className="text-xs text-gray-500 mt-1 font-semibold">Submit a new request for any site and client</p>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              {/* Client Name */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">
                  Client Name <span className="text-[#D12031] font-black">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alice Smith"
                  value={formCust}
                  onChange={(e) => setFormCust(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031] focus:ring-1 focus:ring-[#D12031]"
                />
              </div>

              {/* Site Selection */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">Target Site</label>
                <select
                  value={formSite}
                  onChange={(e) => setFormSite(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031]"
                >
                  <option>Site A</option>
                  <option>Site B</option>
                  <option>Site C</option>
                  <option>Site D</option>
                  <option>Site E</option>
                </select>
              </div>

              {/* Request Title */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">
                  Request Title <span className="text-[#D12031] font-black">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Corridor Cleaning"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031]"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">
                  Detailed Description <span className="text-[#D12031] font-black">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide details about the issue..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031] resize-none"
                />
              </div>

              {/* Scope */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">Scope of Work</label>
                <textarea
                  rows={2}
                  placeholder="Describe step by step requirements..."
                  value={formScope}
                  onChange={(e) => setFormScope(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031] resize-none"
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">Due Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031]"
                  />
                  <FiCalendar size={16} className="text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-gray-700">Priority Level</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031]"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-gray-700">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031]"
                  >
                    <option>Assigned</option>
                    <option>Active</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>

              {/* Dept & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-gray-700">Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031]"
                  >
                    <option>None</option>
                    <option>Kitchen</option>
                    <option>Lobby</option>
                    <option>Restrooms</option>
                    <option>Maintenance</option>
                    <option>Bedroom</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-gray-700">Work Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031]"
                  >
                    <option>Cleaning</option>
                    <option>Maintenance</option>
                    <option>Safety</option>
                  </select>
                </div>
              </div>

              {/* Assign Technician */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">Assign Technician</label>
                <select
                  value={formTech}
                  onChange={(e) => setFormTech(e.target.value)}
                  className="w-full bg-white border border-gray-305 rounded-xl px-4 py-2.5 text-sm text-gray-950 outline-none focus:border-[#D12031]"
                >
                  <option value="Unassigned">Unassigned (Assign Later)</option>
                  <option value="John Doe">John Doe</option>
                  <option value="Bob Johnson">Bob Johnson</option>
                  <option value="Sarah Connor">Sarah Connor</option>
                  <option value="Alex Mercer">Alex Mercer</option>
                </select>
              </div>

              {/* Upload */}
              <div className="space-y-2">
                <label className="block text-[13px] font-bold text-gray-700">Attach Reference Photos (Optional)</label>
                <div
                  onClick={handlePhotoUpload}
                  className="border-2 border-dashed border-red-200 hover:border-[#D12031] rounded-2xl p-4 bg-red-50/5 hover:bg-red-50/10 cursor-pointer text-center flex flex-col items-center justify-center transition-all group"
                >
                  <HiOutlineUpload size={22} className="text-[#D12031] mb-1 group-hover:scale-105 transition-transform" />
                  <span className="text-[11px] font-bold text-gray-700">Click to upload photos</span>
                </div>
                {uploadedPhotos.length > 0 && (
                  <div className="flex gap-2 pt-1.5">
                    {uploadedPhotos.map((src, i) => (
                      <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 group/item">
                        <Image src={src} alt="Upload" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(i)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 flex items-center justify-center text-white text-[10px] rounded-lg transition-opacity"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleAddSubmit}
                className="flex-1 py-2.5 bg-[#D12031] hover:bg-[#b91c2c] text-white font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📝 EDIT WORK REQUEST MODAL */}
      {isEditModalOpen && activeRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 text-center">
              <h3 className="text-[19px] font-bold text-gray-900">Edit Work Request</h3>
              <p className="text-xs text-gray-500 mt-1 font-semibold">Modify details for Request #{activeRequest.id}</p>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Client Name */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="Client"
                  value={formCust}
                  onChange={(e) => setFormCust(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031]"
                />
              </div>

              {/* Target Site */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">Target Site</label>
                <select
                  value={formSite}
                  onChange={(e) => setFormSite(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031]"
                >
                  <option>Site A</option>
                  <option>Site B</option>
                  <option>Site C</option>
                  <option>Site D</option>
                  <option>Site E</option>
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">Request Title</label>
                <input
                  type="text"
                  required
                  placeholder="Request Title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031]"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031] resize-none"
                />
              </div>

              {/* Scope */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">Scope of Work</label>
                <textarea
                  rows={2}
                  value={formScope}
                  onChange={(e) => setFormScope(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031] resize-none"
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">Due Date</label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031]"
                />
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-gray-700">Priority Level</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031]"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-gray-700">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031]"
                  >
                    <option>Assigned</option>
                    <option>Active</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>

              {/* Dept & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-gray-700">Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031]"
                  >
                    <option>None</option>
                    <option>Kitchen</option>
                    <option>Lobby</option>
                    <option>Restrooms</option>
                    <option>Maintenance</option>
                    <option>Bedroom</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-gray-700">Work Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#D12031]"
                  >
                    <option>Cleaning</option>
                    <option>Maintenance</option>
                    <option>Safety</option>
                  </select>
                </div>
              </div>

              {/* Assign Technician */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-gray-700">Assign Technician</label>
                <select
                  value={formTech}
                  onChange={(e) => setFormTech(e.target.value)}
                  className="w-full bg-white border border-gray-305 rounded-xl px-4 py-2.5 text-sm text-gray-955 outline-none focus:border-[#D12031]"
                >
                  <option value="Unassigned">Unassigned</option>
                  <option value="John Doe">John Doe</option>
                  <option value="Bob Johnson">Bob Johnson</option>
                  <option value="Sarah Connor">Sarah Connor</option>
                  <option value="Alex Mercer">Alex Mercer</option>
                </select>
              </div>
            </form>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleEditSubmit}
                className="flex-1 py-2.5 bg-[#D12031] text-white font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && activeRequest && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-[380px] w-full shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4 text-[#D12031]">
              <FiTrash2 size={24} />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Work Request?</h2>
            <p className="text-xs text-gray-500 leading-relaxed mb-6 font-semibold">
              Are you sure you want to delete request ID #{activeRequest.id}? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-750 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-[#D12031] hover:bg-[#b91c2c] text-white font-extrabold text-xs rounded-xl cursor-pointer border-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast message */}
      {toastMsg && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold border border-emerald-500/20 animate-toast-in">
          <FiCheck size={18} className="text-emerald-100" />
          <span>{toastMsg}</span>
        </div>
      )}
    </AdminLayout>
  );
}
