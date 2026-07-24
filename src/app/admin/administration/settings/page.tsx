"use client";

import React, { useState, useEffect } from "react";
import {
  FiShield,
  FiBriefcase,
  FiPlus,
  FiCheck,
  FiUserPlus,
  FiSliders,
  FiTrash2,
  FiRotateCcw,
} from "react-icons/fi";
import AdminLayout from "@/components/AdminLayout";
import { API_BASE_URL } from "@/config";
import { apiFetch } from "@/lib/apiFetch";


interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
  phone?: string;
  department?: string;
  siteAccess?: string;
}

interface BusinessAccount {
  id: string;
  businessName: string;
  contact: string;
  email: string;
  sitesAllocated: string;
  status: "Active" | "Inactive";
}

export default function AdministrationSettingsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [isSubmittingBiz, setIsSubmittingBiz] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Admin Delete Modal States
  const [isDeleteAdminModalOpen, setIsDeleteAdminModalOpen] = useState(false);
  const [activeAdminToDelete, setActiveAdminToDelete] = useState<AdminUser | null>(null);
  const [isSavingDeleteAdmin, setIsSavingDeleteAdmin] = useState(false);

  // Business Delete Modal States
  const [isDeleteBizModalOpen, setIsDeleteBizModalOpen] = useState(false);
  const [activeBizToDelete, setActiveBizToDelete] = useState<BusinessAccount | null>(null);
  const [isSavingDeleteBiz, setIsSavingDeleteBiz] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await apiFetch(`/api/admin/users`);
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : (data.users || data.data || []);
        const formatted = rawList.map((u: any) => ({
          id: u.id,
          name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'N/A',
          email: u.email || 'N/A',
          phone: u.phone || 'N/A',
          department: u.department || 'N/A',
          siteAccess: u.siteAccess || u.siteName || (u.siteId ? 'Assigned' : 'All Sites'),
          role: u.role || 'customer',
          status: 'Active'
        }));
        setAdmins(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const [businesses, setBusinesses] = useState<BusinessAccount[]>([]);
  const [isLoadingSites, setIsLoadingSites] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);

  const [activeBizTab, setActiveBizTab] = useState<"active" | "archived">("active");

  const activeBusinesses = businesses.filter(b => (b.status || "").toLowerCase() === "active" || (b.status || "").toLowerCase() === "operational");
  const archivedBusinesses = businesses.filter(b => (b.status || "").toLowerCase() !== "active" && (b.status || "").toLowerCase() !== "operational");
  const displayedBusinesses = activeBizTab === "active" ? activeBusinesses : archivedBusinesses;

  const fetchDepartments = async () => {
    try {
      const res = await apiFetch(`/api/admin/departments`);
      if (res.ok) {
        const data = await res.json();
        setDepartments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await apiFetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        const userData = data.data?.user || data.user;
        setCurrentUser(userData);
        if (!userData?.isSuperAdmin) {
          setAdminRole("Technician");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSites = async () => {
    try {
      const res = await apiFetch(`/api/admin/sites`);
      if (res.ok) {
        const data = await res.json();
        const siteList = Array.isArray(data) ? data : (data.data || []);
        setBusinesses(siteList);
      }
    } catch (err) {
      console.error("Failed to fetch sites:", err);
    } finally {
      setIsLoadingSites(false);
    }
  };

  const [platformSettings, setPlatformSettings] = useState<any>(null);

  const fetchPlatformSettings = async () => {
    try {
      const res = await apiFetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setPlatformSettings(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePermission = async (key: string, currentValue: boolean) => {
    if (!currentUser?.isSuperAdmin) {
      setToastMsg("Only Super Admins can modify global permissions.");
      setToastType("error");
      return;
    }
    
    // Optimistic update
    setPlatformSettings((prev: any) => ({ ...prev, [key]: !currentValue }));
    
    try {
      const res = await apiFetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: !currentValue })
      });
      const data = await res.json();
      if (!res.ok || !data.status) {
        throw new Error(data.message || "Failed to update");
      }
      setToastMsg("Platform setting updated successfully");
      setToastType("success");
      setTimeout(() => setToastMsg(""), 3000);
    } catch (err: any) {
      // Revert on error
      setPlatformSettings((prev: any) => ({ ...prev, [key]: currentValue }));
      setToastMsg((err as any).message || "Failed to update setting");
      setToastType("error");
      setTimeout(() => setToastMsg(""), 3000);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
    fetchSites();
    fetchDepartments();
    fetchPlatformSettings();
  }, []);

  // Form states - Admin
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminRole, setAdminRole] = useState("Super Admin");
  const [adminPass, setAdminPass] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminDept, setAdminDept] = useState("");
  const [adminSites, setAdminSites] = useState("All Sites");

  // Form states - Business
  const [bizName, setBizName] = useState("");
  const [bizContact, setBizContact] = useState("");
  const [bizEmail, setBizEmail] = useState("");
  const [bizLogoUrl, setBizLogoUrl] = useState("");
  const [bizThemeColor, setBizThemeColor] = useState("#D12031");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminEmail || !adminPass) {
      showToast("Please fill in all user fields.", "error");
      return;
    }
    setIsSubmittingUser(true);
    const nameParts = adminName.trim().split(" ");
    const firstName = nameParts[0] || adminName;
    const lastName = nameParts.slice(1).join(" ") || "User";

    let backendRole = "customer";
    const rLower = adminRole.toLowerCase();
    if (rLower.includes("admin")) backendRole = "admin";
    else if (rLower.includes("tech")) backendRole = "tech";
    else if (rLower.includes("customer")) backendRole = "customer";

    const payload: any = {
      name: adminName,
      firstName,
      lastName,
      email: adminEmail,
      password: adminPass,
      phone: adminPhone,
      department: adminDept,
      role: backendRole,
      sendEmail: false,
    };

    if (adminSites && adminSites !== "All Sites") {
      payload.siteId = adminSites;
      payload.siteIds = [adminSites];
      payload.siteAccess = adminSites;
    } else {
      payload.siteAccess = "All Sites";
    }

    try {
      const res = await apiFetch(`/api/admin/users`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.status !== false) {
        await fetchUsers();
        setAdminName("");
        setAdminEmail("");
        setAdminPass("");
        setAdminPhone("");
        setAdminDept("");
        setAdminRole("Super Admin");
        setAdminSites("All Sites");
        showToast("User account created successfully!");
      } else {
        const errorMessage = data.message || data.error || (data.data && data.data.message) || "Failed to create user.";
        showToast(errorMessage, "error");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Error creating user", "error");
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const confirmDeleteAdmin = (adm: AdminUser) => {
    setActiveAdminToDelete(adm);
    setIsDeleteAdminModalOpen(true);
  };

  const handleDeleteAdmin = async () => {
    if (!activeAdminToDelete) return;
    setIsSavingDeleteAdmin(true);
    try {
      const res = await apiFetch(`/api/admin/users/${activeAdminToDelete.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await fetchUsers();
        showToast("User access revoked.");
        setIsDeleteAdminModalOpen(false);
        setActiveAdminToDelete(null);
      } else {
        const err = await res.json();
        showToast((err as any).message || "Failed to delete user.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting user", "error");
    } finally {
      setIsSavingDeleteAdmin(false);
    }
  };

  const handleAddBizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName || !bizContact || !bizEmail) {
      showToast("Please fill in all business fields.", "error");
      return;
    }
    setIsSubmittingBiz(true);
    try {
      const res = await apiFetch(`/api/admin/sites`, {
        method: "POST",
        body: JSON.stringify({
          businessName: bizName,
          contact: bizContact,
          email: bizEmail,
          logoUrl: bizLogoUrl,
          themeColor: bizThemeColor,
          siteType: "business",
          status: "active",
        }),
      });
      if (res.ok) {
        await fetchSites();
        setBizName("");
        setBizContact("");
        setBizEmail("");
        setBizLogoUrl("");
        setBizThemeColor("#D12031");
        showToast("Business entity registered successfully!");
      } else {
        const err = await res.json();
        showToast((err as any).message || "Failed to create business.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error creating business", "error");
    } finally {
      setIsSubmittingBiz(false);
    }
  };

  const toggleBizStatus = async (biz: BusinessAccount) => {
    const currentStatus = (biz.status || "").toLowerCase();
    const newStatus = currentStatus === "active" || currentStatus === "operational" ? "inactive" : "active";
    try {
      const res = await apiFetch(`/api/admin/sites/${biz.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Partner license status set to ${newStatus.toUpperCase()}!`);
        fetchSites();
      } else {
        showToast("Failed to update partner status", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating status", "error");
    }
  };

  const confirmDeleteBiz = (biz: BusinessAccount) => {
    setActiveBizToDelete(biz);
    setIsDeleteBizModalOpen(true);
  };

  const handleDeleteBiz = async () => {
    if (!activeBizToDelete) return;
    setIsSavingDeleteBiz(true);
    try {
      const res = await apiFetch(`/api/admin/sites/${activeBizToDelete.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await fetchSites();
        showToast("Business account suspended.");
        setIsDeleteBizModalOpen(false);
        setActiveBizToDelete(null);
      } else {
        const err = await res.json();
        showToast((err as any).message || "Failed to suspend business.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error suspending business", "error");
    } finally {
      setIsSavingDeleteBiz(false);
    }
  };

  /* ── Skeleton ── */
  if (isLoading || isLoadingSites) {
    return (
      <AdminLayout
        title="Administration Configuration"
        subtitle="Register business accounts, delegate super admin permissions, and modify roles"
      >
        <div className="max-w-7xl pb-2 space-y-8 animate-pulse">
          {/* Two column skeleton rows */}
          {[...Array(2)].map((_, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, colIdx) => (
                <div key={colIdx} className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded-full w-40" />
                  <div className="h-3 bg-gray-200 rounded-full w-64" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 bg-gray-200 rounded-xl" />
                    <div className="h-10 bg-gray-200 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 bg-gray-200 rounded-xl" />
                    <div className="h-10 bg-gray-200 rounded-xl" />
                  </div>
                  <div className="h-10 bg-gray-200 rounded-xl" />
                </div>
              ))}
            </div>
          ))}
          {/* Permissions skeleton */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded-full w-48 mb-5" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                <div className="h-3 bg-gray-200 rounded-full w-64" />
                <div className="w-10 h-5 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Administration Configuration"
      subtitle="Register business accounts, delegate super admin permissions, and modify roles"
    >
      <div className="max-w-7xl pb-2 space-y-8 animate-[fadeIn_0.3s_ease]">

        {/* Row 1: Register Super Admins & View list */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Super Admin Form */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FiUserPlus className="text-[#D12031]" size={18} />
                <h3 className="text-sm font-bold text-gray-900">Create New User</h3>
              </div>
              <p className="text-[11px] text-gray-400 font-semibold mb-5">Create accounts to help manage operations and dispatching tasks.</p>

              <form onSubmit={handleAddAdminSubmit} className="space-y-4" autoComplete="off">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700">Full Name <span className="text-[#D12031]">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Robert Smith"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      autoComplete="off"
                      className="w-full bg-white border border-gray-300 rounded-xl px-4.5 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700">Email Address <span className="text-[#D12031]">*</span></label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. robert@servicelink.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      autoComplete="new-password"
                      className="w-full bg-white border border-gray-300 rounded-xl px-4.5 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +1 (555) 019-2834"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      autoComplete="off"
                      className="w-full bg-white border border-gray-300 rounded-xl px-4.5 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700">Department</label>
                    <select
                      value={departments.length === 0 ? "" : adminDept}
                      onChange={(e) => setAdminDept(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4.5 py-2.5 text-xs text-gray-850 outline-none focus:border-[#D12031]"
                    >
                      {departments.length === 0 ? (
                        <option value="" disabled>-- No departments available --</option>
                      ) : (
                        <>
                          <option value="">-- Select Department (Optional) --</option>
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700">Access Role</label>
                    <select
                      value={adminRole}
                      onChange={(e) => setAdminRole(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-850 outline-none focus:border-[#D12031]"
                    >
                      {currentUser?.isSuperAdmin && (
                        <option>Admin</option>
                      )}
                      <option>Technician</option>
                      <option>Customer</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700">Site Access Scope</label>
                    <select
                      value={businesses.length === 0 ? "" : adminSites}
                      onChange={(e) => setAdminSites(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-855 outline-none focus:border-[#D12031]"
                    >
                      {businesses.length === 0 ? (
                        <option value="" disabled>-- No sites available --</option>
                      ) : (
                        <>
                          <option value="All Sites">All Sites</option>
                          {businesses.map((biz: any) => (
                            <option key={biz.id} value={biz.id}>{biz.businessName || biz.name}</option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700">Password <span className="text-[#D12031]">*</span></label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      autoComplete="new-password"
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-855 outline-none focus:border-[#D12031]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="w-full bg-[#D12031] hover:bg-[#b91c2c] text-white py-3 rounded-xl font-bold text-xs flex justify-center items-center gap-1.5 transition-colors cursor-pointer border-none shadow-sm disabled:opacity-70"
                >
                  {isSubmittingUser ? (
                    <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</>
                  ) : (
                    <><FiUserPlus size={15} /><span>Create User</span></>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Current Admins List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <FiShield className="text-[#D12031]" size={18} />
                <h3 className="text-sm font-bold text-gray-900">Current Platform Users</h3>
              </div>

              <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto pr-2">
                {admins.map((adm) => (
                  <div key={adm.id} className="py-3.5 flex items-start justify-between text-xs font-semibold">
                    <div className="space-y-0.5">
                      <h4 className="text-gray-950 font-bold">{adm.name || "N/A"}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold">{adm.email || "N/A"}</p>
                      <p className="text-[10px] text-gray-500 font-medium">
                        Phone: <span className="font-semibold text-gray-700">{adm.phone || "N/A"}</span>
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium">
                        Dept: <span className="font-semibold text-gray-700">{adm.department || "N/A"}</span>
                        {" • "}
                        Sites: <span className="font-semibold text-[#D12031]">{adm.siteAccess || "N/A"}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="bg-red-50 text-[#D12031] border border-red-100 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {adm.role === "super_admin" ? "SUPER ADMIN" : adm.role === "admin" ? "ADMIN" : adm.role === "tech" ? "TECHNICIAN" : adm.role.toUpperCase()}
                      </span>
                      {(() => {
                        const isSelf = adm.id === currentUser?.id || (adm.email && currentUser?.email && adm.email.toLowerCase() === currentUser.email.toLowerCase());
                        const isTargetSuperAdmin = adm.role?.toLowerCase() === 'super_admin' || adm.role?.toLowerCase() === 'super admin';
                        const isTargetAdmin = adm.role?.toLowerCase() === 'admin';

                        let isDisableDelete = false;
                        let disableReason = "Delete User Account";

                        if (isSelf) {
                          isDisableDelete = true;
                          disableReason = "You cannot delete your own logged-in account";
                        } else if (isTargetSuperAdmin) {
                          isDisableDelete = true;
                          disableReason = !currentUser?.isSuperAdmin
                            ? "Admins cannot delete Super Admin accounts"
                            : "Super Admin accounts cannot be deleted";
                        } else if (isTargetAdmin && !currentUser?.isSuperAdmin) {
                          isDisableDelete = true;
                          disableReason = "Only Super Admin can delete Admin accounts";
                        }

                        return (
                          <button
                            type="button"
                            disabled={isDisableDelete}
                            onClick={() => !isDisableDelete && confirmDeleteAdmin(adm)}
                            className={`p-1 rounded-lg transition-colors border-none bg-transparent ${
                              isDisableDelete
                                ? "text-gray-300 opacity-40 cursor-not-allowed"
                                : "text-[#D12031] hover:bg-red-50 hover:text-[#b91c2c] cursor-pointer"
                            }`}
                            title={disableReason}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Add Partner Businesses (B2B Sharing) & Business list */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Business Sharing account */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FiBriefcase className="text-[#D12031]" size={18} />
                <h3 className="text-sm font-bold text-gray-900">Onboard Partner Business Account</h3>
              </div>
              <p className="text-[11px] text-gray-400 font-semibold mb-5">
                Grant platform usage and site access rights to partner business companies.
              </p>

              <form onSubmit={handleAddBizSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Business Company Name *</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D12031]/20 focus:border-[#D12031] transition-all outline-none"
                      placeholder="e.g. BuildersInc Co."
                      value={bizName}
                      onChange={(e) => setBizName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Account Contact Representative *</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D12031]/20 focus:border-[#D12031] transition-all outline-none"
                      placeholder="e.g. Sarah Connor"
                      value={bizContact}
                      onChange={(e) => setBizContact(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Contact Email *</label>
                      <input
                        type="email"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D12031]/20 focus:border-[#D12031] transition-all outline-none"
                        placeholder="sarah@builders.com"
                        value={bizEmail}
                        onChange={(e) => setBizEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Logo Image URL</label>
                      <input
                        type="url"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D12031]/20 focus:border-[#D12031] transition-all outline-none"
                        placeholder="https://example.com/logo.png"
                        value={bizLogoUrl}
                        onChange={(e) => setBizLogoUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Theme Color (Whitelabel)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        className="w-12 h-11 rounded-xl border border-gray-200 cursor-pointer bg-transparent p-1"
                        value={bizThemeColor}
                        onChange={(e) => setBizThemeColor(e.target.value)}
                      />
                      <input
                        type="text"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D12031]/20 focus:border-[#D12031] transition-all outline-none"
                        placeholder="#D12031"
                        value={bizThemeColor}
                        onChange={(e) => setBizThemeColor(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingBiz}
                      className="w-full bg-[#D12031] hover:bg-[#b01b29] text-white py-3 rounded-xl font-bold text-xs flex justify-center items-center gap-1.5 transition-colors cursor-pointer border-none shadow-sm h-[46px] disabled:opacity-70"
                    >
                      {isSubmittingBiz ? (
                        <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Onboarding...</>
                      ) : (
                        <><FiPlus size={15} /><span>Onboard Business Partner</span></>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Current Onboarded Businesses */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <FiBriefcase className="text-[#D12031]" size={18} />
                  <h3 className="text-sm font-bold text-gray-900">Partner Business Licenses</h3>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200/60">
                  <button
                    type="button"
                    onClick={() => setActiveBizTab("active")}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer border-none ${
                      activeBizTab === "active"
                        ? "bg-[#D12031] text-white shadow-xs"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Active ({activeBusinesses.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveBizTab("archived")}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer border-none ${
                      activeBizTab === "archived"
                        ? "bg-[#D12031] text-white shadow-xs"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Archived ({archivedBusinesses.length})
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {displayedBusinesses.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                      <FiBriefcase className="text-gray-300" size={16} />
                    </div>
                    <p className="text-xs font-semibold text-gray-500">
                      {activeBizTab === "active" ? "No active partner businesses yet" : "No archived partner businesses"}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">Register or manage entities to see them here</p>
                  </div>
                ) : (
                  displayedBusinesses.map((biz: any) => (
                    <div key={biz.id} className="py-4 flex items-start justify-between text-xs font-semibold">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-gray-950 font-bold text-[13px]">{biz.businessName || "N/A"}</h4>
                          {biz.themeColor && (
                            <span 
                              className="w-3.5 h-3.5 rounded-full inline-block border border-black/10 shadow-xs" 
                              style={{ backgroundColor: biz.themeColor }}
                              title={`Theme: ${biz.themeColor}`}
                            />
                          )}
                        </div>
                        <p className="text-[10px] text-gray-450 mt-1">
                          Rep: {biz.contact || "N/A"} • {biz.email || "N/A"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleBizStatus(biz)}
                          className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border cursor-pointer transition-transform hover:scale-105 ${
                            (biz.status || "").toLowerCase() === "active" || (biz.status || "").toLowerCase() === "operational"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                              : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                          }`}
                          title="Click to toggle status (Active / Inactive)"
                        >
                          {biz.status || "N/A"}
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmDeleteBiz(biz)}
                          className="text-gray-400 hover:text-[#D12031] p-1 rounded-lg hover:bg-gray-50 transition-colors border-none bg-transparent cursor-pointer"
                          title="Suspend Business"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Role & Permissions toggles */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <FiSliders className="text-[#D12031]" size={18} />
            <div>
              <h3 className="text-sm font-bold text-gray-900">Platform Permissions Registry</h3>
              <p className="text-[11px] text-gray-400 font-medium">Toggle user capabilities on the fly</p>
            </div>
          </div>

          <div className="space-y-4">
            {platformSettings ? [
              { key: "customerCanSubmitRequests", role: "Customer", desc: "Can submit new facility work requests", enabled: platformSettings.customerCanSubmitRequests },
              { key: "customerCanDeleteRequests", role: "Customer", desc: "Can delete/modify pending requests", enabled: platformSettings.customerCanDeleteRequests },
              { key: "customerRequiresApproval", role: "Customer", desc: "Requires admin approval for new customer signup", enabled: platformSettings.customerRequiresApproval },
              { key: "techCanReassignJobs", role: "Technician", desc: "Can re-assign jobs to other technicians", enabled: platformSettings.techCanReassignJobs },
              { key: "techCanCloseWithoutProof", role: "Technician", desc: "Can close jobs without uploading photos/proof", enabled: platformSettings.techCanCloseWithoutProof },
              { key: "techCanSeeCustomerPhone", role: "Technician", desc: "Can see customer phone numbers", enabled: platformSettings.techCanSeeCustomerPhone },
              { key: "adminCanCreateDepts", role: "Admin", desc: "Can create new Departments/Sites", enabled: platformSettings.adminCanCreateDepts },
              { key: "adminCanDeleteUsers", role: "Admin", desc: "Can delete Users", enabled: platformSettings.adminCanDeleteUsers },
              { key: "systemEmailNotifications", role: "Global System", desc: "Enable System-wide Email Notifications", enabled: platformSettings.systemEmailNotifications },
              { key: "systemMaintenanceMode", role: "Global System", desc: "Maintenance Mode", enabled: platformSettings.systemMaintenanceMode },
            ].map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-gray-150 rounded-xl">
                <div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 mr-2 uppercase">
                    {p.role}
                  </span>
                  <span className="text-xs font-semibold text-gray-800">{p.desc}</span>
                </div>

                {/* Switch indicator */}
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold ${p.enabled ? "text-emerald-600" : "text-gray-400"}`}>
                    {p.enabled ? "Active" : "Disabled"}
                  </span>
                  <div
                    onClick={() => handleTogglePermission(p.key, p.enabled)}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${p.enabled ? "bg-emerald-500" : "bg-gray-300"
                      }`}
                  >
                    <div
                      className={`bg-white w-4.5 h-4.5 rounded-full shadow-xs transform transition-transform duration-200 ${p.enabled ? "translate-x-4.5" : "translate-x-0"
                        }`}
                    />
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-4 text-center text-gray-500 text-xs animate-pulse">Loading permissions registry...</div>
            )}
          </div>
        </div>

      </div>

      {/* 🗑️ DELETE ADMIN MODAL */}
      {isDeleteAdminModalOpen && activeAdminToDelete && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-[380px] w-full shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4 text-[#D12031]">
              <FiTrash2 size={24} />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete User Account?</h2>
            <p className="text-xs text-gray-500 leading-relaxed mb-6 font-semibold">
              Are you sure you want to permanently delete <span className="text-gray-900 font-bold">&quot;{activeAdminToDelete.name}&quot;</span>? This action will permanently remove their access from the platform.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteAdminModalOpen(false)}
                disabled={isSavingDeleteAdmin}
                className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAdmin}
                disabled={isSavingDeleteAdmin}
                className="flex-1 py-2.5 bg-[#D12031] hover:bg-[#b91c2c] text-white font-extrabold text-xs rounded-xl cursor-pointer border-none disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSavingDeleteAdmin ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>
                ) : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ DELETE BUSINESS MODAL */}
      {isDeleteBizModalOpen && activeBizToDelete && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-[380px] w-full shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4 text-[#D12031]">
              <FiTrash2 size={24} />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-2">Suspend Business?</h2>
            <p className="text-xs text-gray-500 leading-relaxed mb-6 font-semibold">
              Are you sure you want to suspend &quot;{activeBizToDelete.businessName}&quot;? All connected users will lose access.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteBizModalOpen(false)}
                disabled={isSavingDeleteBiz}
                className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBiz}
                disabled={isSavingDeleteBiz}
                className="flex-1 py-2.5 bg-[#D12031] hover:bg-[#b91c2c] text-white font-extrabold text-xs rounded-xl cursor-pointer border-none disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSavingDeleteBiz ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Suspending...</>
                ) : "Suspend"}
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
    </AdminLayout>
  );
}
