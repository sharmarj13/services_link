/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
} from "react-icons/fi";
import AdminLayout from "@/components/AdminLayout";

export default function AdminSettingsPage() {

  /* ── Profile fields ── */
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  /* ── Password fields ── */
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ── Modals ── */
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("servicelink_current_admin");
      if (saved) {
        try {
          const user = JSON.parse(saved);
          setCurrentAdmin(user);
          if (user.name) {
            const parts = user.name.split(" ");
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
          }
          setEmail(user.email || "");
        } catch {}
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin) return;

    const newName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!newName || !email.trim()) {
      alert("Name and email are required.");
      return;
    }

    if (typeof window !== "undefined") {
      // Update global database
      let admins = [];
      const saved = localStorage.getItem("servicelink_admins");
      if (saved) {
        try { admins = JSON.parse(saved); } catch {}
      }
      
      const index = admins.findIndex((adm: any) => adm.id === currentAdmin.id);
      if (index !== -1) {
        admins[index] = {
          ...admins[index],
          name: newName,
          email: email.trim(),
        };
        localStorage.setItem("servicelink_admins", JSON.stringify(admins));
      }

      // Update current session
      const updatedSession = {
        ...currentAdmin,
        name: newName,
        email: email.trim()
      };
      localStorage.setItem("servicelink_current_admin", JSON.stringify(updatedSession));
      setCurrentAdmin(updatedSession);
      showToast("Profile settings saved successfully!");
      
      // Reload page to refresh layouts
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin) return;

    if (!currentPwd || !newPwd || !confirmPwd) {
      alert("Please fill in all password fields.");
      return;
    }

    if (newPwd !== confirmPwd) {
      alert("New password and confirm password do not match.");
      return;
    }

    if (typeof window !== "undefined") {
      let admins = [];
      const saved = localStorage.getItem("servicelink_admins");
      if (saved) {
        try { admins = JSON.parse(saved); } catch {}
      }

      const match = admins.find((adm: any) => adm.id === currentAdmin.id);
      const expectedPwd = (match && match.password) || "admin";

      if (currentPwd !== expectedPwd) {
        alert("The current password you entered is incorrect.");
        return;
      }

      const index = admins.findIndex((adm: any) => adm.id === currentAdmin.id);
      if (index !== -1) {
        admins[index].password = newPwd;
        localStorage.setItem("servicelink_admins", JSON.stringify(admins));
      }

      // Update session
      const updatedSession = { ...currentAdmin, password: newPwd };
      localStorage.setItem("servicelink_current_admin", JSON.stringify(updatedSession));
      setCurrentAdmin(updatedSession);

      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      showToast("Password updated successfully!");
    }
  };



  return (
    <AdminLayout
      title="Settings"
      subtitle="Manage your personal administration profile details and credentials"
    >
      <div className="max-w-7xl space-y-6">
        
        {/* ════════ Profile Information ════════ */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-[#D12031] px-6 py-5">
            <h2 className="text-white text-[17px] font-bold">Profile Details</h2>
            <p className="text-white/80 text-[12px] font-medium mt-0.5">
              Update your personal details and administration contact email
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleProfileSave} className="px-6 py-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-gray-700">First Name</label>
                <div className="relative">
                  <FiUser size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-gray-250 rounded-xl pl-10 pr-4 py-3 text-[13px] text-gray-800 outline-none focus:border-[#D12031] transition-colors bg-white font-semibold"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-gray-700">Last Name</label>
                <div className="relative">
                  <FiUser size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-gray-255 rounded-xl pl-10 pr-4 py-3 text-[13px] text-gray-800 outline-none focus:border-[#D12031] transition-colors bg-white font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-gray-750">Contact Email *</label>
              <div className="relative">
                <FiMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-250 rounded-xl pl-10 pr-4 py-3 text-[13px] text-gray-800 outline-none focus:border-[#D12031] transition-colors bg-white font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button type="submit" className="px-7 py-3 bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[13px] rounded-xl cursor-pointer transition-colors border-none shadow-sm">
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* ════════ Change Password ════════ */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-[#D12031] px-6 py-5">
            <h2 className="text-white text-[17px] font-bold">Credential Change</h2>
            <p className="text-white/80 text-[12px] font-medium mt-0.5">
              Update password credentials to protect administrative permissions
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handlePasswordSave} className="px-6 py-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-gray-700">Current Password</label>
                <div className="relative">
                  <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    className="w-full border border-gray-250 rounded-xl pl-10 pr-10 py-3 text-[13px] text-gray-850 outline-none focus:border-[#D12031] bg-white font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer border-none bg-transparent"
                  >
                    {showCurrent ? <FiEye size={15} /> : <FiEyeOff size={15} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-gray-700">New Password</label>
                <div className="relative">
                  <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    className="w-full border border-gray-250 rounded-xl pl-10 pr-10 py-3 text-[13px] text-gray-850 outline-none focus:border-[#D12031] bg-white font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer border-none bg-transparent"
                  >
                    {showNew ? <FiEye size={15} /> : <FiEyeOff size={15} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-gray-700">Confirm New Password</label>
              <div className="relative">
                <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  className="w-full border border-gray-250 rounded-xl pl-10 pr-10 py-3 text-[13px] text-gray-850 outline-none focus:border-[#D12031] bg-white font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer border-none bg-transparent"
                >
                  {showConfirm ? <FiEye size={15} /> : <FiEyeOff size={15} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button type="submit" className="px-7 py-3 bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[13px] rounded-xl cursor-pointer border-none shadow-sm">
                Change Password
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Toast message */}
      {toastMsg && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold border border-emerald-500/20 animate-toast-in">
          <FiCheck size={18} className="text-emerald-100" />
          <span>{toastMsg}</span>
        </div>
      )}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-toast-in {
          animation: toastIn 0.3s ease forwards;
        }
      `}</style>
    </AdminLayout>
  );
}
