"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiGrid,
  FiClipboard,
  FiMessageSquare,
  FiBell,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronDown,
} from "react-icons/fi";

interface TechnicianLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function TechnicianLayout({
  children,
  title,
  subtitle
}: TechnicianLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { name: "Work Overview", path: "/technician/overview", icon: <FiGrid size={18} /> },
    { name: "My Job Request", path: "/technician/requests", icon: <FiClipboard size={18} /> },
    { name: "Messages", path: "/technician/messages", icon: <FiMessageSquare size={18} /> },
    { name: "Notice & Notify", path: "/technician/notice-notify", icon: <FiBell size={18} /> },
    { name: "Notification", path: "/technician/notifications-list", icon: <FiBell size={18} /> },
    { name: "Settings", path: "/technician/settings", icon: <FiSettings size={18} /> },
  ];

  const handleSignOut = () => {
    setShowSignOutModal(false);
    router.push("/login");
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#D12031] text-white">
      {/* Logo / Brand area */}
      <div className="flex items-center justify-center bg-white shrink-0 h-20 px-5">
        <Image
          src="/images/Logo.png"
          alt="ServiceLink Cardinal Group Logo"
          width={170}
          height={52}
          priority
          className="object-contain"
        />
      </div>

      {/* Small red gap between logo and first nav item */}
      <div className="shrink-0 h-2.5 bg-[#D12031]" />

      {/* Navigation items */}
      <div className="border-t border-white/15" />
      <nav className="flex-1 overflow-y-auto min-h-0">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-6 py-3.5 text-sm font-semibold text-white/90 border-b border-white/15 transition-colors select-none ${
                isActive ? "bg-[#C7283A]" : "hover:bg-white/8"
              }`}
            >
              <span className={`shrink-0 transition-opacity ${isActive ? "opacity-100" : "opacity-85"}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="shrink-0 bg-[#D12031] p-4 pb-6">
        <button
          onClick={() => setShowSignOutModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-[#D12031] font-bold text-sm rounded-xl hover:bg-gray-50 cursor-pointer shadow-md transition-colors border-none"
        >
          <FiLogOut size={17} strokeWidth={2.5} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="font-sans antialiased text-gray-900 flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-[240px] shrink-0 h-screen overflow-y-auto overflow-x-hidden">
        {renderSidebarContent()}
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-20 shrink-0 flex items-center justify-between px-5">
          {/* Left: Mobile Menu Toggle & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <FiMenu size={24} />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{title}</h1>
              <p className="text-[13px] text-gray-500 mt-0.5">{subtitle}</p>
            </div>
          </div>

          {/* Right: Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none"
            >
              <div className="text-right hidden sm:block">
                <div className="text-[14px] font-bold text-gray-900">Maurice Maldonado</div>
                <div className="text-[11px] text-gray-500">maurice.maldonado@gmail.com</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
                <span className="text-sm font-bold text-gray-700">MM</span>
              </div>
              <FiChevronDown
                size={16}
                className={`text-gray-400 hidden sm:block transition-transform duration-200 ${
                  profileDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute top-[calc(100%+8px)] right-0 w-[200px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-[dropdownFadeIn_0.15s_ease]">
                {/* Profile header inside dropdown */}
                <div className="px-4 py-3.5 border-b border-gray-100">
                  <div className="text-sm font-bold text-gray-900">Maurice Maldonado</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Technician</div>
                </div>

                {/* Settings */}
                <Link
                  href="/technician/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50/50"
                >
                  <FiSettings size={15} className="text-gray-400" />
                  Settings
                </Link>

                {/* Logout */}
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-semibold text-[#D12031] hover:bg-red-50/50 transition-colors border-none text-left cursor-pointer"
                >
                  <FiLogOut size={15} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Mobile Header Title */}
        <div className="sm:hidden bg-white border-b border-gray-200 px-5 py-2.5 shrink-0">
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Page Content */}
        <main className="flex-1">
          <div className="p-5 pb-12">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-gray-600/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[240px] flex flex-col transform transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white focus:outline-none"
          >
            <FiX size={20} />
          </button>
        </div>
        {renderSidebarContent()}
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 backdrop-blur-xs animate-[fadeInOverlay_0.2s_ease]"
          onClick={() => setShowSignOutModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-8 max-w-[380px] w-full shadow-2xl animate-[modalSlideUp_0.2s_ease] text-center mx-4"
          >
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4.5 text-[#D12031]">
              <FiLogOut size={26} />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Sign Out?
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-7">
              Are you sure you want to sign out? You will need to log in again to access your account.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 py-3 border border-gray-200 bg-white hover:bg-gray-50 text-gray-750 font-semibold text-sm rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 py-3 bg-[#D12031] hover:bg-[#b91c2c] text-white font-extrabold text-sm rounded-xl cursor-pointer shadow-lg shadow-red-500/20 transition-colors border-none"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
