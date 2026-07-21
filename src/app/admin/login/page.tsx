"use client";

import React, { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // 1. Log in via backend
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Invalid email address or password. Please try again.");
        return;
      }

      // 2. Verify admin role
      const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (!meRes.ok) {
        setError("Failed to verify user profile.");
        return;
      }

      const meData = await meRes.json();
      const role = meData.user?.siteUser?.role || meData.user?.globalRole;

      if (role !== "admin") {
        // If they are not an admin, we must log them out immediately
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
        setError("Unauthorized: Admin access required.");
        return;
      }

      // Success - Redirect to admin overview
      router.push("/admin/overview");
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Make sure the server is running.");
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

        <PrimaryButton id="btn-admin-sign-in">
          <FiLogIn size={18} /> Sign IN
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
