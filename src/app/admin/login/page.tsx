"use client";

import { apiFetch } from "@/lib/apiFetch";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMail, FiLogIn } from "react-icons/fi";
import { AuthLayout, Logo, InputField, PasswordInput, PrimaryButton } from "@/components/AuthUI";
import { API_BASE_URL } from "@/config";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function checkExistingAuth() {
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const meData = await res.json();
          const userObj = meData.user || meData.data?.user || meData;
          const isAdmin =
            userObj?.isAdmin === true ||
            userObj?.isSuperAdmin === true ||
            userObj?.role === "admin" ||
            userObj?.role === "super_admin" ||
            userObj?.globalRole === "admin" ||
            userObj?.globalRole === "super_admin" ||
            userObj?.siteUser?.role === "admin";

          if (isAdmin) {
            router.replace("/admin/overview");
          }
        }
      } catch (err) {
        // User is not logged in, stay on login page
      }
    }
    checkExistingAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. Log in via backend
      const res = await apiFetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Invalid email address or password. Please try again.");
        setIsLoading(false);
        return;
      }

      // 2. Verify admin role
      const meRes = await apiFetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (!meRes.ok) {
        setError("Failed to verify user profile.");
        setIsLoading(false);
        return;
      }

      const meData = await meRes.json();
      const userObj = meData.user || meData.data?.user || meData;
      const isAdmin =
        userObj?.isAdmin === true ||
        userObj?.isSuperAdmin === true ||
        userObj?.role === "admin" ||
        userObj?.role === "super_admin" ||
        userObj?.globalRole === "admin" ||
        userObj?.globalRole === "super_admin" ||
        userObj?.siteUser?.role === "admin";

      if (!isAdmin) {
        // If they are not an admin, we must log them out immediately
        await apiFetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
        setError("Unauthorized: Admin access required.");
        setIsLoading(false);
        return;
      }

      // Success - Redirect to admin overview
      router.push("/admin/overview");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        (err as any).message || "An unexpected error occurred. Make sure the server is running."
      );
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout bgImage="/images/onbording-background.png">
      <Logo />

      <h1 className="text-2xl font-bold text-gray-900 mb-1 leading-snug">
        Admin Panel
      </h1>
      <p className="text-[15px] text-gray-550 mb-6 font-medium">
        Administrator Control Center
      </p>

      {error && (
        <div className="text-[#D12031] bg-red-50/50 border border-red-150 rounded-xl px-4 py-3 text-[13px] font-bold mb-4 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <InputField
          id="admin-login-email"
          label="Email"
          type="email"
          placeholder="Enter your Email"
          icon={<FiMail />}
          value={email}
          onChange={setEmail}
          required
        />

        <PasswordInput
          id="admin-login-password"
          label="Password"
          placeholder="Enter your Password"
          value={password}
          onChange={setPassword}
          required
          noMarginBottom
        />

        <div className="flex justify-end mt-2 mb-5">
          <Link
            href="/admin/forgot-password"
            className="text-[13px] font-semibold text-gray-700 hover:underline transition-all"
          >
            Forgot your password?
          </Link>
        </div>

        <PrimaryButton id="btn-admin-sign-in" isLoading={isLoading}>
          {!isLoading && <FiLogIn size={18} />} Sign IN
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
