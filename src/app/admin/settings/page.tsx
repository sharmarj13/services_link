/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
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
    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const user = await res.json();
          setCurrentAdmin(user);
          setFirstName(user.firstName || "");
          setLastName(user.lastName || "");
          setEmail(user.email || "");
        }
      } catch (err) {
        console.error("Failed to load session:", err);
      }
    }
    loadProfile();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin) return;

    if (!firstName.trim() || !email.trim()) {
      alert("First name and email are required.");
      return;
    }

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          firstName: firstName.trim(), 
          lastName: lastName.trim(), 
          email: email.trim() 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to update profile");
        return;
      }

      const updatedUser = await res.json();
      setCurrentAdmin({ ...currentAdmin, ...updatedUser });
      showToast("Profile settings saved successfully!");
      
      // Reload page to refresh layouts if needed
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Error updating profile.");
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
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

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          currentPassword: currentPwd, 
          newPassword: newPwd 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to update password");
        return;
      }

      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      showToast("Password updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error changing password.");
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
