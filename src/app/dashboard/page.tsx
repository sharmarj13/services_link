"use client";

import { apiFetch } from "@/lib/apiFetch";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        const data = await res.json();
        const user = data.data?.user || data.user || {};
        const role = user.role || user.siteUser?.role || "customer";
        const isAdmin = Boolean(user.isAdmin || user.siteUser?.role === "admin" || user.email?.includes("admin"));

        if (data.redirect && data.redirect !== "/dashboard") {
          router.replace(data.redirect);
        } else if (isAdmin) {
          router.replace("/admin/overview");
        } else if (role === "tech") {
          router.replace("/technician/overview");
        } else {
          router.replace("/customer/overview");
        }
      } catch (err) {
        console.error("Dashboard redirect error:", err);
        router.replace("/login");
      }
    };

    handleRedirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-[#D12031] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-gray-500">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
