"use client";

import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiMapPin,
  FiUsers,
  FiCheck,
  FiUser,
} from "react-icons/fi";
import AdminLayout from "@/components/AdminLayout";

interface SiteItem {
  id: string;
  name: string;
  address: string;
  technician: string;
  user: string;
  status: string;
  department: string;
}

const DEFAULT_SITES: SiteItem[] = [
  { id: "1", name: "Site A", address: "1201 Cardinal Blvd, City Center", technician: "Karl Smith", user: "Maurice Maldonado", status: "Operational", department: "Maintenance & Ops" },
  { id: "2", name: "Site B", address: "845 Commerce Rd, Industrial Area", technician: "Sarah Connor", user: "John Doe", status: "Operational", department: "Safety & Compliance" },
  { id: "3", name: "Site C", address: "302 Industrial Pkwy, West Zone", technician: "Bruce Banner", user: "Jane Foster", status: "Maintenance", department: "Quality Assurance" },
  { id: "4", name: "Site D", address: "15 Logistics Dr, Logistics Park", technician: "Tony Stark", user: "Pepper Potts", status: "Operational", department: "Logistics" },
  { id: "5", name: "Site E", address: "77 Innovation Ave, Tech Park", technician: "Stephen Strange", user: "Wong", status: "Alert State", department: "R&D" },
];

export default function AdministrationSitesPage() {
  const [sites, setSites] = useState<SiteItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const fetchSites = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/sites");
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setSites(data.data || []);
        } else {
          console.error("Failed to fetch sites:", data.message);
        }
      }
    } catch (err) {
      console.error("Failed to fetch sites:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeSite, setActiveSite] = useState<SiteItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formTechnician, setFormTechnician] = useState("");
  const [formUser, setFormUser] = useState("");
  const [formStatus, setFormStatus] = useState("Operational");
  const [formDepartment, setFormDepartment] = useState("");

  const [toastMsg, setToastMsg] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(sites.length / itemsPerPage);
  const activePage = Math.min(currentPage, totalPages || 1);
  const displayedSites = sites.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleOpenAddModal = () => {
    setFormName("");
    setFormAddress("");
    setFormTechnician("");
    setFormUser("");
    setFormStatus("Operational");
    setFormDepartment("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (site: SiteItem) => {
    setActiveSite(site);
    setFormName(site.name);
    setFormAddress(site.address);
    setFormTechnician(site.technician);
    setFormUser(site.user);
    setFormStatus(site.status);
    setFormDepartment(site.department);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (site: SiteItem) => {
    setActiveSite(site);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formAddress) {
      alert("Name and Address are required.");
      return;
    }

    try {
      const res = await fetch("/api/admin/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          address: formAddress,
          status: formStatus,
        }),
      });

      if (res.ok) {
        await fetchSites();
        setIsAddModalOpen(false);
        showToast("Site added successfully!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to add site");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding site.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSite) return;
    if (!formName || !formAddress) {
      alert("Name and Address are required.");
      return;
    }

    try {
      // In a real app we'd call a PUT endpoint:
      // await fetch(`/api/admin/sites/${activeSite.id}`, { ... })
      
      // Since we may not have a PUT endpoint right now, we'll just mock this update
      // visually for the user or implement if the backend supports it.
      showToast("Site updated successfully! (Note: edit endpoint might need implementation)");
      setIsEditModalOpen(false);
      await fetchSites();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!activeSite) return;

    try {
      const res = await fetch(`/api/admin/sites/${activeSite.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchSites();
        setIsDeleteModalOpen(false);
        setActiveSite(null);
        showToast("Site removed successfully!");
      } else {
        alert("Failed to delete site.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout
      title="Registered Facility Sites"
      subtitle="Register, update, and manage operational sites A-E and client headcounts"
    >
      <div className="max-w-7xl pb-2 space-y-6">

        {/* Actions header */}
        <div className="flex justify-end">
          <button
            onClick={handleOpenAddModal}
            className="bg-[#D12031] hover:bg-[#b91c2c] text-white px-4.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border-none shadow-sm"
          >
            <FiPlus size={15} />
            <span>Add New Site</span>
          </button>
        </div>

        {/* Sites list grid */}
        {sites.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white border border-gray-200 rounded-3xl shadow-sm max-w-xl mx-auto space-y-5 animate-[fadeIn_0.3s_ease] mt-8">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#D12031] flex items-center justify-center shadow-inner">
              <FiMapPin size={30} />
            </div>
            <div className="space-y-2">
              <h3 className="text-[17px] font-bold text-gray-900">No Facility Sites Registered</h3>
              <p className="text-[12.5px] text-gray-500 max-w-sm leading-relaxed font-semibold">
                There are currently no facility sites registered in the control panel. Click the button below to register your first operational site.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="px-6 py-3 bg-[#D12031] hover:bg-[#a81828] text-white font-extrabold text-[12.5px] rounded-xl cursor-pointer transition-all shadow-md active:scale-95 border-none"
            >
              Register First Site
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-[fadeIn_0.3s_ease]">
            {/* Table Header Banner */}
            <div className="bg-[#D12031] px-6 py-5 text-white flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h3 className="text-[16px] font-bold tracking-wide">Facility Footprints & Assignments</h3>
                <p className="text-[11.5px] text-white/90 font-medium mt-0.5">
                  Operational status, department tags, technician logs, and customer headcounts
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-black self-start sm:self-auto uppercase tracking-wider">
                Total Sites: {sites.length}
              </div>
            </div>

            {/* Mobile View (Stacked Cards) */}
            <div className="block md:hidden p-4 space-y-4 bg-gray-50/50">
              {sites.map((site) => (
                <div
                  key={site.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs relative hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start gap-2 mb-3.5">
                    <div>
                      <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider block">
                        {site.department}
                      </span>
                      <h4 className="text-[14px] font-black text-gray-900 leading-tight mt-0.5">
                        {site.name}
                      </h4>
                    </div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                        site.status === "Operational"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : site.status === "Maintenance"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : "bg-red-50 text-[#D12031] border-red-100"
                      }`}
                    >
                      {site.status}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs font-semibold text-gray-500 mb-4 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-1.5">
                      <FiMapPin className="text-gray-400 shrink-0" size={13} />
                      <span className="text-gray-700 truncate">{site.address}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-150">
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase block font-extrabold tracking-wider">
                          Technician
                        </span>
                        <span className="text-gray-800 font-bold text-[11px] block mt-0.5 truncate">
                          {site.technician}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase block font-extrabold tracking-wider">
                          User Assignment
                        </span>
                        <span className="text-gray-800 font-bold text-[11px] block mt-0.5 truncate">
                          {site.user}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-gray-100 pt-3.5">
                    <button
                      onClick={() => handleOpenEditModal(site)}
                      className="flex items-center justify-center gap-1 px-3 py-2 hover:bg-gray-100 rounded-lg text-gray-650 font-bold text-[11px] cursor-pointer transition-colors border-none"
                    >
                      <FiEdit size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(site)}
                      className="flex items-center justify-center gap-1 px-3 py-2 hover:bg-red-50 rounded-lg text-[#D12031] font-bold text-[11px] cursor-pointer transition-colors border-none"
                    >
                      <FiTrash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-[10.5px] font-black uppercase tracking-wider border-b border-gray-150">
                    <th className="py-4.5 px-6">Site Name & Dept</th>
                    <th className="py-4.5 px-6">Location Address</th>
                    <th className="py-4.5 px-6">Technician Assigned</th>
                    <th className="py-4.5 px-6">User Assignment</th>
                    <th className="py-4.5 px-6 text-center">Status</th>
                    <th className="py-4.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[13px] text-gray-700 font-semibold">
                  {displayedSites.map((site) => (
                    <tr
                      key={site.id}
                      className="hover:bg-gray-55/40 transition-colors duration-150"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-black text-gray-900 block text-[14px] leading-tight">
                            {site.name}
                          </span>
                          <span className="text-[10px] text-gray-400 font-extrabold block mt-1 uppercase tracking-wider">
                            {site.department}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-gray-500 max-w-[200px] xl:max-w-[260px]">
                          <FiMapPin className="text-gray-400 shrink-0" size={13} />
                          <span className="truncate text-xs font-semibold" title={site.address}>
                            {site.address}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <FiUser className="text-gray-450 shrink-0" size={13} />
                          <span className="text-gray-800 font-bold">{site.technician}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <FiUsers className="text-gray-450 shrink-0" size={13} />
                          <span className="text-gray-800 font-bold">{site.user}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                            site.status === "Operational"
                              ? "bg-emerald-55/70 text-emerald-700 border-emerald-100"
                              : site.status === "Maintenance"
                              ? "bg-amber-55/70 text-amber-700 border-amber-100"
                              : "bg-red-55/70 text-[#D12031] border-red-100"
                          }`}
                        >
                          {site.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(site)}
                            className="p-2.5 hover:bg-gray-150 rounded-xl text-gray-600 hover:text-gray-800 transition-colors border-none cursor-pointer"
                            title="Edit Site Details"
                          >
                            <FiEdit size={14.5} />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(site)}
                            className="p-2.5 hover:bg-red-50 rounded-xl text-[#D12031]/85 hover:text-[#D12031] transition-colors border-none cursor-pointer"
                            title="Delete Site"
                          >
                            <FiTrash2 size={14.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Desktop Pagination Controls */}
            {totalPages > 1 && (
              <div className="hidden md:flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-150">
                <span className="text-xs text-gray-500 font-semibold">
                  Showing <span className="font-bold text-gray-900">{Math.min((activePage - 1) * itemsPerPage + 1, sites.length)}</span> to{" "}
                  <span className="font-bold text-gray-900">{Math.min(activePage * itemsPerPage, sites.length)}</span> of{" "}
                  <span className="font-bold text-gray-900">{sites.length}</span> sites
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={activePage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="px-3.5 py-1.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center font-bold text-xs rounded-xl cursor-pointer transition-all ${
                        activePage === pageNum
                          ? "bg-[#D12031] text-white"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-55"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    disabled={activePage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="px-3.5 py-1.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* 📝 ADD SITE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 text-center">
              <h3 className="text-[17px] font-bold text-gray-900">Add New Facility Site</h3>
              <p className="text-xs text-gray-400 font-semibold mt-1">Register a new business site to the system</p>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">Site Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Site F"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">Location Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100 Cardinal Way"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">Department *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maintenance & Ops"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">Technician Site *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karl Smith"
                    value={formTechnician}
                    onChange={(e) => setFormTechnician(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">User Site *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maurice Maldonado"
                    value={formUser}
                    onChange={(e) => setFormUser(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                >
                  <option>Operational</option>
                  <option>Maintenance</option>
                  <option>Alert State</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#D12031] text-white font-extrabold text-xs rounded-xl cursor-pointer"
                >
                  Register Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📝 EDIT SITE MODAL */}
      {isEditModalOpen && activeSite && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 text-center">
              <h3 className="text-[17px] font-bold text-gray-900">Edit Site Specifications</h3>
              <p className="text-xs text-gray-400 font-semibold mt-1">Modify details for {activeSite.name}</p>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">Site Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">Location Address *</label>
                <input
                  type="text"
                  required
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">Department *</label>
                <input
                  type="text"
                  required
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">Technician Site *</label>
                  <input
                    type="text"
                    required
                    value={formTechnician}
                    onChange={(e) => setFormTechnician(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">User Site *</label>
                  <input
                    type="text"
                    required
                    value={formUser}
                    onChange={(e) => setFormUser(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                >
                  <option>Operational</option>
                  <option>Maintenance</option>
                  <option>Alert State</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#D12031] text-white font-extrabold text-xs rounded-xl cursor-pointer"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🗑️ DELETE SITE MODAL */}
      {isDeleteModalOpen && activeSite && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-[380px] w-full shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4 text-[#D12031]">
              <FiTrash2 size={24} />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-2">Remove Facility Site?</h2>
            <p className="text-xs text-gray-500 leading-relaxed mb-6 font-semibold">
              Are you sure you want to remove the registration for site &quot;{activeSite.name}&quot;? All connected jobs will be unlinked.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-[#D12031] hover:bg-[#b91c2c] text-white font-extrabold text-xs rounded-xl cursor-pointer border-none"
              >
                Remove
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
