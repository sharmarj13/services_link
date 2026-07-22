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
        setAdmins(data);
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
        // Backend returns { status: true, data: [...] }
        setBusinesses(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (err) {
      console.error("Failed to fetch sites:", err);
    } finally {
      setIsLoadingSites(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
    fetchSites();
    fetchDepartments();
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
  const [bizSites, setBizSites] = useState("Site A");

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
    try {
      const res = await apiFetch(`/api/admin/users`, {
        method: "POST",
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          password: adminPass,
          phone: adminPhone,
          department: adminDept,
          role: adminRole,
          siteAccess: adminSites
        })
      });
      if (res.ok) {
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
        const err = await res.json();
        showToast(err.message || "Failed to create user.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error creating user", "error");
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
        showToast(err.message || "Failed to delete user.", "error");
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
          status: "active",
        }),
      });
      if (res.ok) {
        await fetchSites();
        setBizName("");
        setBizContact("");
        setBizEmail("");
        showToast("Business entity registered successfully!");
      } else {
        const err = await res.json();
        showToast(err.message || "Failed to create business.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error creating business", "error");
    } finally {
      setIsSubmittingBiz(false);
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
        showToast(err.message || "Failed to suspend business.", "error");
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

              <form onSubmit={handleAddAdminSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Robert Smith"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4.5 py-2.5 text-xs text-gray-800 outline-none focus:border-[#D12031]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. robert@servicelink.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
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
                          <option value="" disabled>-- Select Department --</option>
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
                          {businesses.map((biz) => (
                            <option key={biz.id} value={biz.id}>{biz.businessName}</option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700">Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
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
                        {adm.role}
                      </span>
                      {(!['admin', 'super_admin'].includes(adm.role?.toLowerCase() || '') || currentUser?.isSuperAdmin) && (
                        <button
                          type="button"
                          onClick={() => confirmDeleteAdmin(adm)}
                          className="text-gray-400 hover:text-[#D12031] p-1 rounded-lg hover:bg-gray-50 transition-colors border-none bg-transparent cursor-pointer"
                          title="Revoke Access"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Business / Site Name</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D12031]/20 focus:border-[#D12031] transition-all outline-none"
                      placeholder="e.g. Cardinal Group Ltd"
                      value={bizName}
                      onChange={(e) => setBizName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Primary Contact Person</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D12031]/20 focus:border-[#D12031] transition-all outline-none"
                      placeholder="e.g. Jane Doe"
                      value={bizContact}
                      onChange={(e) => setBizContact(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Contact Email</label>
                    <input
                      type="email"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D12031]/20 focus:border-[#D12031] transition-all outline-none"
                      placeholder="contact@company.com"
                      value={bizEmail}
                      onChange={(e) => setBizEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingBiz}
                      className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold text-xs flex justify-center items-center gap-1.5 transition-colors cursor-pointer border-none shadow-sm h-[46px] disabled:opacity-70"
                    >
                      {isSubmittingBiz ? (
                        <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registering...</>
                      ) : (
                        <><FiPlus size={15} /><span>Register Entity</span></>
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
              <div className="flex items-center gap-2 mb-5">
                <FiBriefcase className="text-[#D12031]" size={18} />
                <h3 className="text-sm font-bold text-gray-900">Partner Business Licenses</h3>
              </div>

              <div className="divide-y divide-gray-100">
                {businesses.map((biz) => (
                  <div key={biz.id} className="py-4 flex items-start justify-between text-xs font-semibold">
                    <div>
                      <h4 className="text-gray-950 font-bold text-[13px]">{biz.businessName || "N/A"}</h4>
                      <p className="text-[10px] text-gray-450 mt-1">
                        Rep: {biz.contact || "N/A"} • {biz.email || "N/A"}
                      </p>
                      <p className="text-[10px] text-gray-500 font-bold mt-1.5">
                        Sites: <span className="text-[#D12031]">{biz.sitesAllocated || "N/A"}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                        (biz.status || "").toLowerCase() === "active" || (biz.status || "").toLowerCase() === "operational"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}>
                        {biz.status || "N/A"}
                      </span>
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
                ))}
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
            {[
              { role: "Customer", desc: "Can submit new facility work requests", enabled: true },
              { role: "Customer", desc: "Can delete/modify pending requests", enabled: true },
              { role: "Technician", desc: "Can transition jobs to Completed status", enabled: true },
              { role: "Technician", desc: "Can file notices and trigger alarms", enabled: true },
              { role: "Partner Business", desc: "Can register new sub-users without approval", enabled: false },
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
            ))}
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

            <h2 className="text-lg font-bold text-gray-900 mb-2">Revoke Access?</h2>
            <p className="text-xs text-gray-500 leading-relaxed mb-6 font-semibold">
              Are you sure you want to revoke access for &quot;{activeAdminToDelete.name}&quot;? They will no longer be able to log in.
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
                  <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Revoking...</>
                ) : "Revoke"}
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
