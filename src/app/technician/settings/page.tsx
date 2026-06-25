"use client";

import React, { useState } from "react";
import TechnicianLayout from "@/components/TechnicianLayout";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiTrash2, FiX, FiCheck } from "react-icons/fi";

export default function SettingsPage() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  /* ── Profile fields ── */
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [email, setEmail] = useState("user@gmail.com");

  /* ── Password fields ── */
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ── Toast message ── */
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert("All profile fields are required.");
      return;
    }
    showToast("Profile settings saved successfully!");
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPwd || !newPwd || !confirmPwd) {
      alert("Please fill in all password fields.");
      return;
    }
    if (newPwd !== confirmPwd) {
      alert("New password and confirm password do not match.");
      return;
    }
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    showToast("Password updated successfully!");
  };

  return (
    <TechnicianLayout
      title="Settings"
      subtitle="Manage your account settings and preferences"
    >
      <div className="max-w-7xl space-y-6 sm:space-y-8 pb-10">

        {/* Profile Information */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-[#D12031] px-6 py-5">
            <h2 className="text-[16px] sm:text-[18px] font-bold text-white">Profile Information</h2>
            <p className="text-[12px] sm:text-[13px] text-white/90 mt-1 font-medium">
              Update your personal information and email address
            </p>
          </div>

          <form onSubmit={handleProfileSave} className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="block text-[14px] font-medium text-gray-600">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiUser className="text-gray-500" size={18} />
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-[15px] font-medium text-gray-800 outline-none focus:border-[#D12031] transition-colors shadow-sm"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="block text-[14px] font-medium text-gray-600">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiUser className="text-gray-500" size={18} />
                  </div>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-[15px] font-medium text-gray-800 outline-none focus:border-[#D12031] transition-colors shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2 mb-8">
              <label className="block text-[14px] font-medium text-gray-600">Email *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="text-gray-500" size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-[15px] font-medium text-gray-850 outline-none focus:border-[#D12031] transition-colors shadow-sm"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[14px] px-8 py-3.5 rounded-xl transition-all shadow-sm cursor-pointer border-none">
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-[#D12031] px-6 py-5">
            <h2 className="text-[16px] sm:text-[18px] font-bold text-white">Change Password</h2>
            <p className="text-[12px] sm:text-[13px] text-white/90 mt-1 font-medium">
              Update your password to keep your account secure
            </p>
          </div>

          <form onSubmit={handlePasswordSave} className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="block text-[14px] font-medium text-gray-600">Current Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="text-gray-500" size={18} />
                  </div>
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-[15px] font-medium text-gray-800 outline-none focus:border-[#D12031] transition-colors shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer border-none bg-transparent"
                  >
                    {showCurrent ? <FiEye className="text-gray-400 hover:text-gray-600 transition-colors" size={18} /> : <FiEyeOff className="text-gray-400 hover:text-gray-600 transition-colors" size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-[14px] font-medium text-gray-600">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="text-gray-500" size={18} />
                  </div>
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-[15px] font-medium text-gray-800 outline-none focus:border-[#D12031] transition-colors shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer border-none bg-transparent"
                  >
                    {showNew ? <FiEye className="text-gray-400 hover:text-gray-600 transition-colors" size={18} /> : <FiEyeOff className="text-gray-400 hover:text-gray-600 transition-colors" size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2 mb-8">
              <label className="block text-[14px] font-medium text-gray-600">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="text-gray-500" size={18} />
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-[15px] font-medium text-gray-800 outline-none focus:border-[#D12031] transition-colors shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer border-none bg-transparent"
                >
                  {showConfirm ? <FiEye className="text-gray-400 hover:text-gray-600 transition-colors" size={18} /> : <FiEyeOff className="text-gray-400 hover:text-gray-600 transition-colors" size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[14px] px-8 py-3.5 rounded-xl transition-all shadow-sm cursor-pointer border-none">
                Change Password
              </button>
            </div>
          </form>
        </div>

        {/* Delete Account Button */}
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="w-full bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[15px] py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer border-none"
        >
          <FiTrash2 size={18} />
          <span>Delete Account</span>
        </button>

      </div>

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-[400px] overflow-hidden flex flex-col shadow-2xl relative">

            {/* Modal Header */}
            <div className="bg-[#D12031] pt-6 pb-4 px-6 text-center shrink-0">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-white">Delete Account</h2>
              <p className="text-[12px] sm:text-[13px] text-white/90 mt-1.5 font-medium leading-relaxed">
                Permanently delete your account and all associated data
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 text-center">
              <p className="text-[14px] text-gray-800 font-medium leading-relaxed">
                <span className="text-[#D12031] font-bold">Warning : </span>
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex gap-3 sm:gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-[14px] rounded-xl transition-colors shadow-sm cursor-pointer border-none"
              >
                Close
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3.5 bg-[#D12031] hover:bg-[#a81828] text-white font-bold text-[14px] rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer border-none"
              >
                <FiTrash2 size={16} />
                <span>Delete</span>
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

      <style>{`
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
