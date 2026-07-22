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
import { API_BASE_URL } from "@/config";
import { apiFetch } from "@/lib/apiFetch";

interface SiteItem {
  id: string;
  name: string;
  address: string;
  technician: string;
  user: string;
  status: string;
  department: string;
}



export default function AdministrationSitesPage() {
  const [sites, setSites] = useState<SiteItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const fetchSites = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/admin/sites`);
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

  const fetchDepartments = async () => {
    setIsDeptLoading(true);
    try {
      const res = await apiFetch(`/api/admin/departments`);
      if (res.ok) {
        const data = await res.json();
        if (data.status) setDepartments(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeptLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
    fetchDepartments();
  }, []);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeSite, setActiveSite] = useState<SiteItem | null>(null);
  const [isSavingAdd, setIsSavingAdd] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isSavingDelete, setIsSavingDelete] = useState(false);

  // Departments State
  const [departments, setDepartments] = useState<any[]>([]);
  const [isDeptLoading, setIsDeptLoading] = useState(true);
  const [isSavingDept, setIsSavingDept] = useState(false);
  const [deptFormName, setDeptFormName] = useState("");
  const [deptFormIsActive, setDeptFormIsActive] = useState(true);
  const [isEditDeptModalOpen, setIsEditDeptModalOpen] = useState(false);
  const [activeDept, setActiveDept] = useState<any>(null);
  const [editDeptFormName, setEditDeptFormName] = useState("");
  const [editDeptFormIsActive, setEditDeptFormIsActive] = useState(true);
  const [isDeleteDeptModalOpen, setIsDeleteDeptModalOpen] = useState(false);
  const [activeDeptToDelete, setActiveDeptToDelete] = useState<any>(null);
  const [isSavingDeleteDept, setIsSavingDeleteDept] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formTechnician, setFormTechnician] = useState("");
  const [formUser, setFormUser] = useState("");
  const [formStatus, setFormStatus] = useState("Operational");
  const [formDepartment, setFormDepartment] = useState("");

  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(sites.length / itemsPerPage);
  const activePage = Math.min(currentPage, totalPages || 1);
  const displayedSites = sites.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 3500);
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

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptFormName) {
      showToast("Department Name is required.", "error");
      return;
    }
    setIsSavingDept(true);
    try {
      const res = await apiFetch(`/api/admin/departments`, {
        method: "POST",
        body: JSON.stringify({
          name: deptFormName,
          isActive: deptFormIsActive,
        })
      });
      if (res.ok) {
        showToast("Department created successfully!");
        setDeptFormName("");
        setDeptFormIsActive(true);
        fetchDepartments();
      } else {
        const data = await res.json();
        showToast(data.message || "Failed to create department", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error creating department", "error");
    } finally {
      setIsSavingDept(false);
    }
  };

  const confirmDeleteDept = (dept: any) => {
    setActiveDeptToDelete(dept);
    setIsDeleteDeptModalOpen(true);
  };

  const handleDeleteDepartment = async () => {
    if (!activeDeptToDelete) return;
    setIsSavingDeleteDept(true);
    try {
      const res = await apiFetch(`/api/admin/departments/${activeDeptToDelete.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showToast("Department deleted");
        fetchDepartments();
        setIsDeleteDeptModalOpen(false);
        setActiveDeptToDelete(null);
      } else {
        showToast("Failed to delete department", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting department", "error");
    } finally {
      setIsSavingDeleteDept(false);
    }
  };

  const handleOpenEditDeptModal = (dept: any) => {
    setActiveDept(dept);
    setEditDeptFormName(dept.name);
    setEditDeptFormIsActive(dept.isActive !== false); // default to true if undefined
    setIsEditDeptModalOpen(true);
  };

  const handleEditDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDept || !editDeptFormName) {
      showToast("Department Name is required.", "error");
      return;
    }
    setIsSavingDept(true);
    try {
      const res = await apiFetch(`/api/admin/departments/${activeDept.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editDeptFormName,
          isActive: editDeptFormIsActive,
        })
      });
      if (res.ok) {
        showToast("Department updated successfully!");
        setIsEditDeptModalOpen(false);
        setActiveDept(null);
        fetchDepartments();
      } else {
        const data = await res.json();
        showToast(data.message || "Failed to update department", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating department", "error");
    } finally {
      setIsSavingDept(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formAddress) {
      showToast("Name and Address are required.", "error");
      return;
    }
    setIsSavingAdd(true);
    try {
      const res = await apiFetch(`/api/admin/sites`, {
        method: "POST",
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
        showToast(data.message || "Failed to add site", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error adding site.", "error");
    } finally {
      setIsSavingAdd(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSite) return;
    if (!formName || !formAddress) {
      showToast("Name and Address are required.", "error");
      return;
    }
    setIsSavingEdit(true);
    try {
      const res = await apiFetch(`/api/admin/sites/${activeSite.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: formName,
          address: formAddress,
          status: formStatus,
          department: formDepartment,
          technician: formTechnician,
          user: formUser,
        }),
      });
      showToast("Site updated successfully!");
      setIsEditModalOpen(false);
      await fetchSites();
    } catch (err) {
      console.error(err);
      showToast("Error updating site.", "error");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!activeSite) return;
    setIsSavingDelete(true);
    try {
      const res = await apiFetch(`/api/admin/sites/${activeSite.id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        await fetchSites();
        setIsDeleteModalOpen(false);
        setActiveSite(null);
        showToast("Site removed successfully!");
      } else {
        showToast("Failed to delete site.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting site.", "error");
    } finally {
      setIsSavingDelete(false);
    }
  };

  /* ── Skeleton ── */
  if (isLoading) {
    return (
      <AdminLayout
        title="Registered Facility Sites"
        subtitle="Register, update, and manage operational sites A-E and client headcounts"
      >
        <div className="max-w-7xl pb-2 space-y-6 animate-pulse">
          {/* Action bar skeleton */}
          <div className="flex justify-end">
            <div className="h-9 w-32 bg-gray-200 rounded-xl" />
          </div>
          {/* Table skeleton */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-20 bg-gray-200 w-full" />
            <div className="p-6 space-y-4">
              <div className="hidden md:grid grid-cols-6 gap-4 pb-2 border-b border-gray-100">
                {[...Array(6)].map((_, i) => <div key={i} className="h-3 bg-gray-200 rounded-full" />)}
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-4">
                  <div className="h-4 bg-gray-200 rounded-full col-span-2" />
                  <div className="h-4 bg-gray-200 rounded-full col-span-2" />
                  <div className="h-4 bg-gray-200 rounded-full" />
                  <div className="h-4 bg-gray-200 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Department Table skeleton */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-8">
            <div className="h-[76px] bg-gray-200 w-full" />
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 bg-gray-50/50 p-5 rounded-2xl border border-gray-200 h-fit space-y-4">
                <div className="h-4 bg-gray-200 rounded-full w-40" />
                <div className="h-10 bg-gray-200 rounded-xl w-full" />
                <div className="h-6 bg-gray-200 rounded-full w-full mt-2" />
                <div className="h-10 bg-gray-200 rounded-xl w-full mt-2" />
              </div>
              <div className="md:col-span-2 overflow-x-auto">
                <div className="grid grid-cols-4 gap-4 pb-3 border-b border-gray-100">
                  <div className="h-3 bg-gray-200 rounded-full col-span-2" />
                  <div className="h-3 bg-gray-200 rounded-full" />
                  <div className="h-3 bg-gray-200 rounded-full" />
                </div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 py-4 border-b border-gray-50">
                    <div className="h-4 bg-gray-200 rounded-full col-span-2" />
                    <div className="h-5 bg-gray-200 rounded-full w-16" />
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-gray-200 rounded-xl" />
                      <div className="h-8 w-8 bg-gray-200 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </AdminLayout>
    );
  }

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
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-[fadeIn_0.3s_ease] mt-8">
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
              {sites.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-[#D12031] flex items-center justify-center shadow-inner">
                    <FiMapPin size={24} />
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-900">No Sites Found</h3>
                </div>
              ) : (
                sites.map((site) => (
                <div
                  key={site.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs relative hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start gap-2 mb-3.5">
                    <div>
                      <span className="text-[9px] text-gray-400 font-extrabold uppercase block">
                        {site.department || "N/A"}
                      </span>
                      <h4 className="text-[14px] font-black text-gray-900 leading-tight mt-0.5">
                        {site.name || "N/A"}
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
                      <span className="text-gray-700 truncate">{site.address || "N/A"}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase block font-extrabold tracking-wider">
                          Technician
                        </span>
                        <span className="text-gray-800 font-bold text-[11px] block mt-0.5 truncate">
                          {site.technician || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase block font-extrabold tracking-wider">
                          User Assignment
                        </span>
                        <span className="text-gray-800 font-bold text-[11px] block mt-0.5 truncate">
                          {site.user || "N/A"}
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
              ))
              )}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-[10.5px] font-black uppercase tracking-wider border-b border-gray-200">
                    <th className="py-4.5 px-6">Site Name & Dept</th>
                    <th className="py-4.5 px-6">Location Address</th>
                    <th className="py-4.5 px-6">Technician Assigned</th>
                    <th className="py-4.5 px-6">User Assignment</th>
                    <th className="py-4.5 px-6 text-center">Status</th>
                    <th className="py-4.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[13px] text-gray-700 font-semibold">
                  {sites.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#D12031] flex items-center justify-center shadow-inner">
                            <FiMapPin size={26} />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-[16px] font-bold text-gray-900">No Facility Sites Registered</h3>
                            <p className="text-[12px] text-gray-500 max-w-sm mx-auto font-medium">
                              There are currently no facility sites registered in the control panel.
                            </p>
                          </div>
                          <button
                            onClick={handleOpenAddModal}
                            className="px-5 py-2 mt-2 bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[11px] rounded-lg cursor-pointer transition-all shadow-md active:scale-95 border-none"
                          >
                            Register First Site
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    displayedSites.map((site) => (
                    <tr
                      key={site.id}
                      className="hover:bg-gray-55/40 transition-colors duration-150"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-black text-gray-900 block text-[14px] leading-tight">
                            {site.name || "N/A"}
                          </span>
                          <span className="text-[10px] text-gray-400 font-extrabold block mt-1 uppercase tracking-wider">
                            {site.department || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-gray-500 max-w-[200px] xl:max-w-[260px]">
                          <FiMapPin className="text-gray-400 shrink-0" size={13} />
                          <span className="truncate text-xs font-semibold" title={site.address}>
                            {site.address || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <FiUser className="text-gray-450 shrink-0" size={13} />
                          <span className="text-gray-800 font-bold">{site.technician || "N/A"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <FiUsers className="text-gray-450 shrink-0" size={13} />
                          <span className="text-gray-800 font-bold">{site.user || "N/A"}</span>
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
                  )))}
                </tbody>
              </table>
            </div>

            {/* Desktop Pagination Controls */}
            {totalPages > 1 && (
              <div className="hidden md:flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
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

        {/* --- DEPARTMENTS MANAGEMENT SECTION --- */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-8 animate-[fadeIn_0.3s_ease]">
          <div className="bg-[#D12031] px-6 py-5 text-white">
            <h3 className="text-[16px] font-bold tracking-wide">Department Management</h3>
            <p className="text-[11.5px] text-white/90 font-medium mt-0.5">
              Create and manage departments to assign them to your facility sites.
            </p>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-gray-50/50 p-5 rounded-2xl border border-gray-200 shadow-xs h-fit">
              <h4 className="text-[13px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiPlus className="text-[#D12031]" />
                Create New Department
              </h4>
              <form onSubmit={handleAddDepartment} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Department Name *</label>
                  <input 
                    type="text" required placeholder="e.g. Maintenance" value={deptFormName} onChange={e => setDeptFormName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <label className="text-[11px] font-bold text-gray-700">Status</label>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold ${deptFormIsActive ? "text-emerald-600" : "text-gray-400"}`}>
                      {deptFormIsActive ? "Active" : "Inactive"}
                    </span>
                    <div
                      onClick={() => setDeptFormIsActive(!deptFormIsActive)}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                        deptFormIsActive ? "bg-emerald-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-4.5 h-4.5 rounded-full shadow-xs transform transition-transform duration-200 ${
                          deptFormIsActive ? "translate-x-4.5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={isSavingDept} className="w-full bg-[#D12031] hover:bg-[#b91c2c] text-white py-2.5 rounded-xl font-bold text-xs flex justify-center items-center gap-1.5 transition-colors cursor-pointer border-none shadow-sm disabled:opacity-70 mt-2">
                  {isSavingDept ? "Creating..." : "Create Department"}
                </button>
              </form>
            </div>

            <div className="md:col-span-2">
              <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-5 text-[10px] font-black uppercase text-gray-500 tracking-wider">Department Name</th>
                      <th className="py-3 px-5 text-[10px] font-black uppercase text-gray-500 tracking-wider">Status</th>
                      <th className="py-3 px-5 text-[10px] font-black uppercase text-gray-500 tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isDeptLoading ? (
                      <tr><td colSpan={3} className="py-6 text-center text-xs text-gray-500 font-semibold animate-pulse">Loading departments...</td></tr>
                    ) : departments.length === 0 ? (
                      <tr><td colSpan={3} className="py-6 text-center text-xs text-gray-500 font-semibold">No departments created yet.</td></tr>
                    ) : (
                      departments.map(dept => (
                        <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-5">
                            <div className="font-bold text-gray-900 text-[13px]">{dept.name}</div>
                          </td>
                          <td className="py-3 px-5">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                              dept.isActive !== false ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-gray-100 text-gray-500 border border-gray-200"
                            }`}>
                              {dept.isActive !== false ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="py-3 px-5 text-right">
                            <button onClick={() => handleOpenEditDeptModal(dept)} className="p-2 hover:bg-gray-150 rounded-lg text-gray-600 hover:text-gray-800 transition-colors border-none cursor-pointer" title="Edit Department">
                              <FiEdit size={14} />
                            </button>
                            <button onClick={() => confirmDeleteDept(dept)} className="p-2 hover:bg-red-50 rounded-lg text-[#D12031]/80 hover:text-[#D12031] transition-colors border-none cursor-pointer" title="Delete Department">
                              <FiTrash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

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
                <select
                  required
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                >
                  <option value="" disabled={departments.length === 0}>
                    {departments.length === 0 ? "-- No departments available --" : "-- Select Department --"}
                  </option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
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
                  disabled={isSavingAdd}
                  className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAdd}
                  className="flex-1 py-2.5 bg-[#D12031] text-white font-extrabold text-xs rounded-xl cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSavingAdd ? (
                    <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registering...</>
                  ) : "Register Site"}
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
                <select
                  required
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                >
                  <option value="" disabled={departments.length === 0}>
                    {departments.length === 0 ? "-- No departments available --" : "-- Select Department --"}
                  </option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
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
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSavingEdit}
                  className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 py-2.5 bg-[#D12031] text-white font-extrabold text-xs rounded-xl cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSavingEdit ? (
                    <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                  ) : "Save changes"}
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
                disabled={isSavingDelete}
                className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSavingDelete}
                className="flex-1 py-2.5 bg-[#D12031] hover:bg-[#b91c2c] text-white font-extrabold text-xs rounded-xl cursor-pointer border-none disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSavingDelete ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Removing...</>
                ) : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ DELETE DEPARTMENT MODAL */}
      {isDeleteDeptModalOpen && activeDeptToDelete && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-[380px] w-full shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4 text-[#D12031]">
              <FiTrash2 size={24} />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Department?</h2>
            <p className="text-xs text-gray-500 leading-relaxed mb-6 font-semibold">
              Are you sure you want to delete the department &quot;{activeDeptToDelete.name}&quot;? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteDeptModalOpen(false)}
                disabled={isSavingDeleteDept}
                className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDepartment}
                disabled={isSavingDeleteDept}
                className="flex-1 py-2.5 bg-[#D12031] hover:bg-[#b91c2c] text-white font-extrabold text-xs rounded-xl cursor-pointer border-none disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSavingDeleteDept ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>
                ) : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast message */}
      {toastMsg && (
        <div className={`fixed top-24 right-6 z-50 px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold border animate-toast-in ${
          toastType === "error"
            ? "bg-red-600 text-white border-red-500/20"
            : "bg-emerald-600 text-white border-emerald-500/20"
        }`}>
          <FiCheck size={18} className="opacity-90" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 📝 EDIT DEPARTMENT MODAL */}
      {isEditDeptModalOpen && activeDept && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 text-center">
              <h3 className="text-[17px] font-bold text-gray-900">Edit Department</h3>
              <p className="text-xs text-gray-400 font-semibold mt-1">Modify details for {activeDept.name}</p>
            </div>

            <form onSubmit={handleEditDepartmentSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">Department Name *</label>
                <input
                  type="text"
                  required
                  value={editDeptFormName}
                  onChange={(e) => setEditDeptFormName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-[11px] font-bold text-gray-700">Status</label>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold ${editDeptFormIsActive ? "text-emerald-600" : "text-gray-400"}`}>
                    {editDeptFormIsActive ? "Active" : "Inactive"}
                  </span>
                  <div
                    onClick={() => setEditDeptFormIsActive(!editDeptFormIsActive)}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                      editDeptFormIsActive ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`bg-white w-4.5 h-4.5 rounded-full shadow-xs transform transition-transform duration-200 ${
                        editDeptFormIsActive ? "translate-x-4.5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditDeptModalOpen(false)}
                  disabled={isSavingDept}
                  className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingDept}
                  className="flex-1 py-2.5 bg-[#D12031] text-white font-extrabold text-xs rounded-xl cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSavingDept ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
