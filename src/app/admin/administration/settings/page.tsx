"use client";

import React, { useState } from "react";
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
import { useEffect } from "react";

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

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, { credentials: "include" });
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

  const fetchSites = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/sites`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data);
      }
    } catch (err) {
      console.error("Failed to fetch sites:", err);
    } finally {
      setIsLoadingSites(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSites();
  }, []);

  // Form states - Admin
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminRole, setAdminRole] = useState("Super Admin");
  const [adminPass, setAdminPass] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminDept, setAdminDept] = useState("Operations");
  const [adminSites, setAdminSites] = useState("All Sites");

  // Form states - Business
  const [bizName, setBizName] = useState("");
  const [bizContact, setBizContact] = useState("");
  const [bizEmail, setBizEmail] = useState("");
  const [bizSites, setBizSites] = useState("Site A");

  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminEmail || !adminPass) {
      alert("Please fill in all user fields.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
        setAdminDept("Operations");
        setAdminRole("Super Admin");
        setAdminSites("All Sites");
        showToast("User account created successfully!");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to create user.");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating user");
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (confirm("Are you sure you want to revoke this user's access?")) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.ok) {
          await fetchUsers();
          showToast("User access revoked.");
        } else {
          const err = await res.json();
          alert(err.message || "Failed to delete user.");
        }
      } catch (err) {
        console.error(err);
        alert("Error deleting user");
      }
    }
  };

  const handleAddBizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName || !bizContact || !bizEmail) {
      alert("Please fill in all business fields.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/sites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
        alert(err.message || "Failed to create business.");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating business");
    }
  };

  const handleDeleteBiz = async (id: string) => {
    if (confirm("Are you sure you want to suspend this business?")) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/sites/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.ok) {
          await fetchSites();
          showToast("Business account suspended.");
        } else {
          const err = await res.json();
          alert(err.message || "Failed to suspend business.");
        }
      } catch (err) {
        console.error(err);
        alert("Error suspending business");
      }
    }
  };

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
                      value={adminDept}
                      onChange={(e) => setAdminDept(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4.5 py-2.5 text-xs text-gray-850 outline-none focus:border-[#D12031]"
                    >
                      <option>Operations</option>
                      <option>Executive Office</option>
                      <option>IT & Security</option>
                      <option>Customer Support</option>
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
                      <option>Super Admin</option>
                      <option>Admin</option>
                      <option>Technician</option>
                      <option>Customer</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700">Site Access Scope</label>
                    <select
                      value={adminSites}
                      onChange={(e) => setAdminSites(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-855 outline-none focus:border-[#D12031]"
                    >
                      <option>All Sites</option>
                      <option>Site A</option>
                      <option>Site B</option>
                      <option>Site C</option>
                      <option>Site D</option>
                      <option>Site E</option>
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
                  className="w-full bg-[#D12031] hover:bg-[#b91c2c] text-white py-3 rounded-xl font-bold text-xs flex justify-center items-center gap-1.5 transition-colors cursor-pointer border-none shadow-sm"
                >
                  <FiUserPlus size={15} />
                  <span>Create User</span>
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

              <div className="divide-y divide-gray-100">
                {admins.map((adm) => (
                  <div key={adm.id} className="py-3.5 flex items-start justify-between text-xs font-semibold">
                    <div className="space-y-0.5">
                      <h4 className="text-gray-950 font-bold">{adm.name}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold">{adm.email}</p>
                      {adm.phone && (
                        <p className="text-[10px] text-gray-500 font-medium">Phone: {adm.phone}</p>
                      )}
                      <p className="text-[10px] text-gray-500 font-medium">
                        Dept: <span className="font-semibold text-gray-700">{adm.department || "Operations"}</span>
                        {" • "}
                        Sites: <span className="font-semibold text-[#D12031]">{adm.siteAccess || "All Sites"}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="bg-red-50 text-[#D12031] border border-red-100 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {adm.role}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteAdmin(adm.id)}
                        className="text-gray-400 hover:text-[#D12031] p-1 rounded-lg hover:bg-gray-50 transition-colors border-none bg-transparent cursor-pointer"
                        title="Revoke Access"
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
                      className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold text-xs flex justify-center items-center gap-1.5 transition-colors cursor-pointer border-none shadow-sm h-[46px]"
                    >
                      <FiPlus size={15} />
                      <span>Register Entity</span>
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
                      <h4 className="text-gray-950 font-bold text-[13px]">{biz.businessName}</h4>
                      <p className="text-[10px] text-gray-450 mt-1">Rep: {biz.contact} • {biz.email}</p>
                      <p className="text-[10px] text-gray-500 font-bold mt-1.5">Sites: <span className="text-[#D12031]">{biz.sitesAllocated}</span></p>
                    </div>

                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {biz.status}
                    </span>
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
