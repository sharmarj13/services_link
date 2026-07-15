"use client";

import React, { useState, useEffect } from "react";
import TechnicianLayout from "@/components/TechnicianLayout";
import { apiFetch } from "@/lib/apiFetch";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiTrash2,
  FiCheck,
} from "react-icons/fi";

export default function TechnicianSettingsPage() {
  /* ── Profile fields ── */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  /* ── Password fields ── */
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ── Toast ── */
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 3500);
  };

  /* ── Delete modal ── */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  /* ── Fetch user on mount ── */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiFetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setFirstName(data.user.firstName || "");
            setLastName(data.user.lastName || "");
            setEmail(data.user.email || "");
          }
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  /* ── Handlers ── */
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      showToast("All profile fields are required.", "error");
      return;
    }
    setIsSavingProfile(true);
    try {
      const res = await apiFetch("/api/users/profile", {
        method: "PATCH",
        body: JSON.stringify({ firstName, lastName, email }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Profile settings saved successfully!");
        window.dispatchEvent(new Event("profileUpdated"));
      } else {
        showToast(data.message || "Failed to save profile.", "error");
      }
    } catch {
      showToast("Network error. Try again.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPwd || !newPwd || !confirmPwd) {
      showToast("Please fill in all password fields.", "error");
      return;
    }
    if (newPwd !== confirmPwd) {
      showToast("New password and confirm password do not match.", "error");
      return;
    }
    if (newPwd.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }
    setIsSavingPassword(true);
    try {
      const res = await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPwd("");
        setNewPwd("");
        setConfirmPwd("");
        showToast("Password updated successfully!");
      } else {
        showToast(data.message || "Failed to update password.", "error");
      }
    } catch {
      showToast("Network error. Try again.", "error");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await apiFetch("/api/auth/account", { method: "DELETE" });
      if (res.ok) {
        setShowDeleteModal(false);
        router.push("/login");
      } else {
        const data = await res.json();
        showToast(data.message || "Failed to delete account.", "error");
        setIsDeleting(false);
      }
    } catch {
      showToast("Network error. Try again.", "error");
      setIsDeleting(false);
    }
  };

  return (
    <TechnicianLayout
      title="Settings"
      subtitle="Manage your account settings and preferences"
    >
      <div className="max-w-7xl space-y-6">

        {/* ════════ Profile Information ════════ */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Red header */}
          <div className="bg-[#D12031] px-6 py-5">
            <h2 className="text-white text-[17px] font-bold">
              Profile Information
            </h2>
            <p className="text-white/80 text-[12px] font-medium mt-0.5">
              Update your personal information and email address
            </p>
          </div>

          {/* Form body */}
          <form onSubmit={handleProfileSave} className="px-6 py-7 space-y-5">
            {isLoading ? (
              <div className="animate-pulse space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="h-12 bg-gray-200 rounded-xl w-full" />
                  <div className="h-12 bg-gray-200 rounded-xl w-full" />
                </div>
                <div className="h-12 bg-gray-200 rounded-xl w-full" />
                <div className="flex justify-end pt-1">
                  <div className="h-10 w-32 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ) : (
              <>
                {/* First Name + Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-gray-700">
                      First Name
                    </label>
                    <div className="relative">
                      <FiUser
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-[13px] text-gray-800 outline-none focus:border-[#D12031] transition-colors bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-gray-700">
                      Last Name
                    </label>
                    <div className="relative">
                      <FiUser
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-[13px] text-gray-800 outline-none focus:border-[#D12031] transition-colors bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-gray-700">
                    Email <span className="text-[#D12031]">*</span>
                  </label>
                  <div className="relative">
                    <FiMail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-[13px] text-gray-800 outline-none focus:border-[#D12031] transition-colors bg-white"
                    />
                  </div>
                </div>

                {/* Save */}
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className={`px-7 py-3 bg-[#D12031] text-white font-bold text-[14px] rounded-xl transition-colors shadow-sm border-none ${
                      isSavingProfile
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:bg-[#a81828] cursor-pointer"
                    }`}
                  >
                    {isSavingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* ════════ Change Password ════════ */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Red header */}
          <div className="bg-[#D12031] px-6 py-5">
            <h2 className="text-white text-[17px] font-bold">
              Change Password
            </h2>
            <p className="text-white/80 text-[12px] font-medium mt-0.5">
              Update your password to keep your account secure
            </p>
          </div>

          {/* Form body */}
          <form onSubmit={handlePasswordSave} className="px-6 py-7 space-y-5">
            {/* Current + New Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-gray-700">
                  Current Password
                </label>
                <div className="relative">
                  <FiLock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-[13px] text-gray-800 outline-none focus:border-[#D12031] transition-colors bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer border-none bg-transparent p-0"
                  >
                    {showCurrent ? <FiEye size={15} /> : <FiEyeOff size={15} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <FiLock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-[13px] text-gray-800 outline-none focus:border-[#D12031] transition-colors bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer border-none bg-transparent p-0"
                  >
                    {showNew ? <FiEye size={15} /> : <FiEyeOff size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <FiLock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-[13px] text-gray-800 outline-none focus:border-[#D12031] transition-colors bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer border-none bg-transparent p-0"
                >
                  {showConfirm ? <FiEye size={15} /> : <FiEyeOff size={15} />}
                </button>
              </div>
            </div>

            {/* Change Password button */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSavingPassword}
                className={`px-7 py-3 bg-[#D12031] text-white font-bold text-[14px] rounded-xl transition-colors shadow-sm border-none ${
                  isSavingPassword
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-[#a81828] cursor-pointer"
                }`}
              >
                {isSavingPassword ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>

        {/* ════════ Delete Account ════════ */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[15px] rounded-2xl cursor-pointer transition-colors shadow-sm border-none"
        >
          <FiTrash2 size={18} />
          Delete Account
        </button>
      </div>

      {/* ════════ Delete Account Modal ════════ */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-sm px-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-[400px] overflow-hidden shadow-2xl animate-[modalSlideUp_0.22s_ease]"
          >
            {/* Modal header */}
            <div className="bg-[#D12031] text-white text-center py-5 px-6">
              <h2 className="text-[18px] font-bold">Delete Account</h2>
              <p className="text-white/80 text-[12px] mt-1 font-medium">
                Permanently delete your account and all associated data
              </p>
            </div>

            {/* Modal body */}
            <div className="px-8 py-7">
              <p className="text-[14px] text-gray-700 font-medium text-center leading-relaxed">
                <span className="font-bold text-[#D12031]">Warning :</span>{" "}
                This action cannot be undone.
                <br />
                All your data will be permanently deleted.
              </p>

              {/* Buttons */}
              <div className="flex gap-4 mt-7">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-800 rounded-2xl font-bold text-[14px] hover:bg-gray-200 transition-colors cursor-pointer border-none"
                >
                  Close
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className={`flex-1 py-3.5 bg-[#D12031] text-white rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 transition-colors border-none shadow-sm ${
                    isDeleting
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:bg-[#a81828] cursor-pointer"
                  }`}
                >
                  <FiTrash2 size={16} />
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div
          className={`fixed top-24 right-6 z-50 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold border animate-toast-in ${
            toastType === "success"
              ? "bg-emerald-600 border-emerald-500/20"
              : "bg-red-600 border-red-500/20"
          }`}
        >
          {toastType === "success" ? (
            <FiCheck size={18} className="text-emerald-100" />
          ) : (
            <FiUser size={18} className="text-red-100" />
          )}
          <span>{toastMsg}</span>
        </div>
      )}

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-toast-in {
          animation: toastIn 0.3s ease forwards;
        }
      `}</style>
    </TechnicianLayout>
  );
}
