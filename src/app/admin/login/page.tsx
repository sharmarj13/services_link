"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMail, FiLogIn } from "react-icons/fi";
import { AuthLayout, Logo, InputField, PasswordInput, PrimaryButton } from "@/components/AuthUI";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (typeof window !== "undefined") {
      // Retrieve admins from localStorage or fallback to defaults
      let admins: AdminUser[] = [];
      const saved = localStorage.getItem("servicelink_admins");
      if (saved) {
        try {
          admins = JSON.parse(saved);
        } catch {
          // ignore
        }
      }

      if (admins.length === 0) {
        admins = [
          { id: "1", name: "Admin User", email: "admin@servicelink.com", role: "Super Admin", password: "admin" },
          { id: "2", name: "Support Desk", email: "support@servicelink.com", role: "Operations Lead", password: "admin" },
        ];
        localStorage.setItem("servicelink_admins", JSON.stringify(admins));
      }

      // Find admin by email
      const matchedAdmin = admins.find(
        (adm) => adm.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (matchedAdmin) {
        // Match password (if stored, otherwise use fallback "admin")
        const expectedPwd = matchedAdmin.password || "admin";
        if (password === expectedPwd) {
          localStorage.setItem("servicelink_current_admin", JSON.stringify(matchedAdmin));
          router.push("/admin/overview");
          return;
        }
      }

      setError("Invalid email address or password. Please try again.");
    } else {
      router.push("/admin/overview");
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
