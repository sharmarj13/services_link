"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiGrid,
  FiClipboard,
  FiClock,
  FiMessageSquare,
  FiBell,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiShield,
  FiUsers,
  FiMapPin,
} from "react-icons/fi";
import { API_BASE_URL } from "@/config";
import { apiFetch } from "@/lib/apiFetch";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AdminLayout({
  children,
  title,
  subtitle,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [adminSectionOpen, setAdminSectionOpen] = useState(() =>
    typeof window !== "undefined" ? window.location.pathname.startsWith("/admin/administration") : false
  );
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [adminUser, setAdminUser] = useState({
    name: "Admin User",
    email: "admin@example.com",
    role: "Super Admin",
    initials: "AD"
  });

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          if (isMounted) router.push("/admin/login");
          return;
        }

        const data = await res.json();
        
        // Ensure user is an admin
        const role = (data.data?.user || data.user)?.siteUser?.role || (data.data?.user || data.user)?.globalRole;
        if (role !== "admin") {
          // If logged in but not admin, kick to login (or respective dashboard)
          if (isMounted) router.push("/admin/login");
          return;
        }

        if (isMounted) {
          const user = (data.data?.user || data.user);
          const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Admin User";
          const parts = fullName.split(" ");
          let initials = "";
          if (parts.length >= 2) {
            initials = (parts[0][0] + parts[1][0]).toUpperCase();
          } else if (parts.length === 1 && parts[0].length > 0) {
            initials = parts[0].substring(0, 2).toUpperCase();
          } else {
            initials = "AD";
          }
          
          setAdminUser({
            name: fullName,
            email: user.email,
            role: "Super Admin",
            initials
          });
          setIsLoadingAuth(false);
        }
      } catch (err) {
        if (isMounted) router.push("/admin/login");
      }
    };
    
    fetchUser();

    const handleProfileUpdated = () => {
      setIsLoadingAuth(true);
      fetchUser();
    };

    window.addEventListener("user-profile-updated", handleProfileUpdated);

    return () => { 
      isMounted = false; 
      window.removeEventListener("user-profile-updated", handleProfileUpdated);
    };
  }, [router]);

  // Keep Administration dropdown open whenever user is on an administration page
  useEffect(() => {
    if (pathname.startsWith("/admin/administration")) {
      setAdminSectionOpen(true);
    }
  }, [pathname]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await apiFetch(`/api/auth/logout`, {
        method: "POST"
      });
    } catch (err) {
      console.error("Signout error:", err);
    }
    setIsLoggingOut(false);
    setShowSignOutModal(false);
    router.push("/login");
  };

  const menuItems = [
    { name: "Work Overview", path: "/admin/overview", icon: <FiGrid size={18} /> },
    { name: "My Request", path: "/admin/requests", icon: <FiClipboard size={18} /> },
    { name: "Assigned", path: "/admin/in-progress", icon: <FiClock size={18} /> },
    { name: "Messages", path: "/admin/messages", icon: <FiMessageSquare size={18} /> },
    { name: "Notification", path: "/admin/notifications", icon: <FiBell size={18} /> },
  ];

  const adminSubItems = [
    { name: "Overview", path: "/admin/administration/overview", icon: <FiUsers size={16} /> },
    { name: "Sites & Depts", path: "/admin/administration/sites", icon: <FiMapPin size={16} /> },
    { name: "Settings", path: "/admin/administration/settings", icon: <FiSettings size={16} /> },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#D12031] text-white">
      {/* Logo / Brand area */}
      <div className="flex items-center justify-center bg-white shrink-0 h-20 px-5">
        <img
          src="/images/Logo.png"
          alt="ServiceLink Cardinal Group Logo"
          width={170}
          height={52}
          className="object-contain"
        />
      </div>

      {/* Small red gap between logo and first nav item */}
      <div className="shrink-0 h-2.5 bg-[#D12031]" />

      {/* Navigation items */}
      <div className="border-t border-white/15" />
      <nav className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/admin/overview" && pathname.startsWith(item.path) && !pathname.startsWith("/admin/administration"));
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

        {/* Administration Collapsible section */}
        <div className="border-b border-white/15 flex flex-col">
          <button
            onClick={() => setAdminSectionOpen(!adminSectionOpen)}
            className={`w-full flex items-center justify-between px-6 py-3.5 text-sm font-semibold text-white/90 transition-colors select-none hover:bg-white/8 ${
              pathname.startsWith("/admin/administration") ? "bg-[#C7283A]/40" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="shrink-0 opacity-85">
                <FiShield size={18} />
              </span>
              <span>Administration</span>
            </div>
            <span>
              {adminSectionOpen ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
            </span>
          </button>

          {/* Sub menu list */}
          {adminSectionOpen && (
            <div className="bg-[#B91C2C] flex flex-col border-t border-white/10">
              {adminSubItems.map((subItem) => {
                const isActive = pathname === subItem.path;
                return (
                  <Link
                    key={subItem.name}
                    href={subItem.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 pl-12 pr-6 py-3 text-xs font-semibold border-b border-white/10 transition-colors select-none ${
                      isActive
                        ? "bg-[#A81828] text-white font-bold"
                        : "text-white/80 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <span className={`shrink-0 transition-opacity ${isActive ? "opacity-100" : "opacity-75"}`}>{subItem.icon}</span>
                    <span>{subItem.name}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Settings nav item */}
        <Link
          href="/admin/settings"
          onClick={() => setMobileMenuOpen(false)}
          className={`flex items-center gap-3 px-6 py-3.5 text-sm font-semibold text-white/90 border-b border-white/15 transition-colors select-none ${
            pathname.startsWith("/admin/settings") ? "bg-[#C7283A]" : "hover:bg-white/8"
          }`}
        >
          <span className={`shrink-0 transition-opacity ${pathname.startsWith("/admin/settings") ? "opacity-100" : "opacity-85"}`}>
            <FiSettings size={18} />
          </span>
          <span>Settings</span>
        </Link>
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

          {/* Right: Profile Info */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
            {isLoadingAuth ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="hidden sm:flex flex-col items-end gap-1.5">
                  <div className="h-3.5 bg-gray-200 rounded w-24"></div>
                  <div className="h-2.5 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-200 border border-gray-200 flex-shrink-0"></div>
              </div>
            ) : (
              <>
                <div className="text-right hidden sm:block">
                  <div className="text-[14px] font-bold text-gray-900">{adminUser.name}</div>
                  <div className="text-[11px] text-gray-500">{adminUser.email}</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#D12031]/10 flex items-center justify-center border border-[#D12031]/20 flex-shrink-0">
                  <span className="text-sm font-bold text-[#D12031]">{adminUser.initials}</span>
                </div>
              </>
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
              Are you sure you want to sign out from the Admin Control Center?
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutModal(false)}
                disabled={isLoggingOut}
                className="flex-1 py-3 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-xl cursor-pointer transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsLoggingOut(true);
                  await handleSignOut();
                  setIsLoggingOut(false);
                }}
                disabled={isLoggingOut}
                className="flex-1 py-3 bg-[#D12031] hover:bg-[#b91c2c] text-white font-extrabold text-sm rounded-xl cursor-pointer shadow-lg shadow-red-500/20 transition-colors border-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isLoggingOut ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Signing Out...</span>
                  </>
                ) : (
                  "Yes, Sign Out"
                )}
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
