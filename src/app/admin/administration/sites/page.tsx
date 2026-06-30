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
  FiBriefcase,
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("servicelink_sites");
      if (saved) {
        try {
          setSites(JSON.parse(saved));
        } catch {
          setSites(DEFAULT_SITES);
        }
      } else {
        setSites(DEFAULT_SITES);
        localStorage.setItem("servicelink_sites", JSON.stringify(DEFAULT_SITES));
      }
    }
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

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formAddress || !formTechnician || !formUser || !formDepartment) {
      alert("Please fill in all required fields.");
      return;
    }
    const newSite: SiteItem = {
      id: String(Date.now()),
      name: formName,
      address: formAddress,
      technician: formTechnician,
      user: formUser,
      status: formStatus,
      department: formDepartment,
    };
    const updated = [...sites, newSite];
    setSites(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("servicelink_sites", JSON.stringify(updated));
    }
    setIsAddModalOpen(false);
    showToast("New facility site registered!");
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSite) return;
    if (!formName || !formAddress || !formTechnician || !formUser || !formDepartment) {
      alert("Please fill in all required fields.");
      return;
    }
    const updated = sites.map((s) =>
      s.id === activeSite.id
        ? {
          ...s,
          name: formName,
          address: formAddress,
          technician: formTechnician,
          user: formUser,
          status: formStatus,
          department: formDepartment,
        }
        : s
    );
    setSites(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("servicelink_sites", JSON.stringify(updated));
    }
    setIsEditModalOpen(false);
    showToast("Site specifications updated!");
  };

  const handleDeleteConfirm = () => {
    if (!activeSite) return;
    const updated = sites.filter((s) => s.id !== activeSite.id);
    setSites(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("servicelink_sites", JSON.stringify(updated));
    }
    setIsDeleteModalOpen(false);
    showToast("Facility site deleted!");
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sites.map((site) => (
              <div
                key={site.id}
                className="bg-white border border-gray-200 rounded-2xl shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative"
              >
                <div>
                  <div className="flex justify-between items-start gap-3 mb-3.5">
                    <h3 className="text-[15px] font-black text-gray-900 leading-tight">{site.name}</h3>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border ${site.status === "Operational"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : site.status === "Maintenance"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : "bg-red-50 text-[#D12031] border-red-100"
                        }`}
                    >
                      {site.status}
                    </span>
                  </div>

                  <div className="space-y-2.5 mb-6 text-xs text-gray-500 font-semibold">
                    <p className="flex items-center gap-1.5">
                      <FiMapPin className="text-gray-400 shrink-0" size={14} />
                      <span className="truncate">{site.address}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <FiBriefcase className="text-gray-400 shrink-0" size={14} />
                      <span>Department: <span className="font-bold text-gray-700">{site.department}</span></span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <FiUser className="text-gray-400 shrink-0" size={14} />
                      <span>Technician: <span className="font-bold text-gray-700">{site.technician}</span></span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <FiUsers className="text-gray-400 shrink-0" size={14} />
                      <span>User: <span className="font-bold text-gray-700">{site.user}</span></span>
                    </p>
                  </div>
                </div>

                {/* Action buttons footer */}
                <div className="border-t border-gray-100 pt-3.5 flex justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(site)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-800 transition-colors border-none cursor-pointer"
                    title="Edit Site Details"
                  >
                    <FiEdit size={14} />
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(site)}
                    className="p-2 hover:bg-red-50 rounded-lg text-[#D12031]/85 hover:text-[#D12031] transition-colors border-none cursor-pointer"
                    title="Delete Site"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
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
