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
  FiAlertCircle,
} from "react-icons/fi";
import AdminLayout from "@/components/AdminLayout";
import { apiFetch } from "@/lib/apiFetch";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);

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

  /* ── Loading states ── */
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  /* ── Toast notifications ── */
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiFetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          const user = json.data?.user || json.user || json;
          setCurrentAdmin(user);
          setFirstName(user.firstName || "");
          setLastName(user.lastName || "");
          setEmail(user.email || "");
        }
      } catch (err) {
        console.error("Failed to load session:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin || isSavingProfile) return;

    if (!firstName.trim() || !email.trim()) {
      showToast("First name and email are required.", "error");
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await apiFetch("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ 
          firstName: firstName.trim(), 
          lastName: lastName.trim(), 
          email: email.trim() 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to update profile", "error");
        return;
      }

      const updatedUser = data.data?.user || data.user || data;
      setCurrentAdmin((prev: any) => ({ ...prev, ...updatedUser }));
      showToast("Profile settings saved successfully!", "success");

      // Instantly refresh top-right header admin details across the app
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("user-profile-updated"));
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating profile.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin || isSavingPassword) return;

    if (!currentPwd || !newPwd || !confirmPwd) {
      showToast("Please fill in all password fields.", "error");
      return;
    }

    if (newPwd !== confirmPwd) {
      showToast("New password and confirm password do not match.", "error");
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ 
          currentPassword: currentPwd, 
          newPassword: newPwd 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to update password", "error");
        return;
      }

      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      showToast("Password updated successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Error changing password.", "error");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <AdminLayout
      title="Settings"
      subtitle="Manage your personal administration profile details and credentials"
    >
      <div className="max-w-7xl space-y-6">
        
        {loading ? (
          <div className="space-y-6 animate-pulse">
            {/* Profile Card Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-6">
              <div className="h-6 bg-gray-200 rounded w-1/4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="h-12 bg-gray-150 rounded-xl" />
                <div className="h-12 bg-gray-150 rounded-xl" />
              </div>
              <div className="h-12 bg-gray-150 rounded-xl w-full" />
              <div className="flex justify-end">
                <div className="h-10 bg-gray-200 rounded-xl w-32" />
              </div>
            </div>

            {/* Password Card Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-6">
              <div className="h-6 bg-gray-200 rounded w-1/4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="h-12 bg-gray-150 rounded-xl" />
                <div className="h-12 bg-gray-150 rounded-xl" />
              </div>
              <div className="h-12 bg-gray-150 rounded-xl w-full" />
              <div className="flex justify-end">
                <div className="h-10 bg-gray-200 rounded-xl w-36" />
              </div>
            </div>
          </div>
        ) : (
          <>
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
                        placeholder="Enter your first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full border border-gray-250 rounded-xl pl-10 pr-4 py-3 text-[13px] text-gray-800 outline-none focus:border-[#D12031] transition-colors bg-white font-semibold placeholder:text-gray-400 placeholder:font-normal"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-gray-700">Last Name</label>
                    <div className="relative">
                      <FiUser size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter your last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full border border-gray-255 rounded-xl pl-10 pr-4 py-3 text-[13px] text-gray-800 outline-none focus:border-[#D12031] transition-colors bg-white font-semibold placeholder:text-gray-400 placeholder:font-normal"
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
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-250 rounded-xl pl-10 pr-4 py-3 text-[13px] text-gray-800 outline-none focus:border-[#D12031] transition-colors bg-white font-semibold placeholder:text-gray-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-7 py-3 bg-[#D12031] hover:bg-[#a81828] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold text-[13px] rounded-xl cursor-pointer transition-colors border-none shadow-sm flex items-center gap-2"
                  >
                    {isSavingProfile ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
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
                        placeholder="Enter current password"
                        value={currentPwd}
                        onChange={(e) => setCurrentPwd(e.target.value)}
                        className="w-full border border-gray-250 rounded-xl pl-10 pr-10 py-3 text-[13px] text-gray-850 outline-none focus:border-[#D12031] bg-white font-semibold placeholder:text-gray-400 placeholder:font-normal"
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
                        placeholder="Enter new password"
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                        className="w-full border border-gray-250 rounded-xl pl-10 pr-10 py-3 text-[13px] text-gray-850 outline-none focus:border-[#D12031] bg-white font-semibold placeholder:text-gray-400 placeholder:font-normal"
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
                      placeholder="Confirm new password"
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      className="w-full border border-gray-250 rounded-xl pl-10 pr-10 py-3 text-[13px] text-gray-850 outline-none focus:border-[#D12031] bg-white font-semibold placeholder:text-gray-400 placeholder:font-normal"
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
                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="px-7 py-3 bg-[#D12031] hover:bg-[#a81828] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold text-[13px] rounded-xl cursor-pointer transition-colors border-none shadow-sm flex items-center gap-2"
                  >
                    {isSavingPassword ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Change Password</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

      </div>

      {/* Toast message */}
      {toastMsg && (
        <div className={`fixed top-24 right-6 z-50 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-xs font-bold border transition-all animate-toast-in ${toastType === "success" ? "bg-emerald-600 border-emerald-500/20" : "bg-[#D12031] border-red-500/20"}`}>
          {toastType === "success" ? <FiCheck size={18} /> : <FiAlertCircle size={18} />}
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
