"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMail, FiLogIn } from "react-icons/fi";
import { AuthLayout, Logo, InputField, PasswordInput, PrimaryButton } from "@/components/AuthUI";
import { API_BASE_URL } from "@/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. Call login endpoint on backend Port 5000 dynamically
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        setError(errData.message || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Login success:", data);

      // 2. Fetch role details using /me endpoint dynamically
      const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (!meResponse.ok) {
        setError("Authentication session initialization failed.");
        setIsLoading(false);
        return;
      }

      const meData = await meResponse.json();
      console.log("User details:", meData);

      // Extract user role from siteUser details
      const role = meData.user?.siteUser?.role || "customer";
      const isAdmin = meData.user?.isAdmin || meData.user?.siteUser?.role === "admin";

      if (isAdmin) {
        router.push("/admin/overview");
      } else if (role === "tech") {
        router.push("/technician/overview");
      } else {
        router.push("/customer/overview");
      }
    } catch (err: any) {
      console.error("Login request error:", err);
      setError("Server connection failed. Make sure the backend is running.");
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout bgImage="/images/onbording-background.png">
      <Logo />

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1 leading-snug">
        Service Link - Cardinal group
      </h1>
      <p className="text-[15px] text-gray-550 mb-6 font-medium">
        Work Management Platform
      </p>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 text-red-750 text-[13px] font-semibold px-4 py-2.5 rounded-xl border border-red-100 mb-5 text-center leading-normal">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin}>
        <InputField
          id="login-email"
          label="Email"
          type="email"
          placeholder="Enter your Email"
          icon={<FiMail />}
          value={email}
          onChange={setEmail}
        />

        <PasswordInput
          id="login-password"
          label="Password"
          placeholder="Enter your Password"
          value={password}
          onChange={setPassword}
          noMarginBottom
        />

        {/* Forgot password */}
        <div className="flex justify-end mt-2 mb-5">
          <Link
            href="/forgot-password"
            className="text-[13px] font-semibold text-gray-700 hover:underline transition-all"
          >
            Forgot your password?
          </Link>
        </div>

        <PrimaryButton id="btn-sign-in" disabled={isLoading}>
          <FiLogIn size={18} /> {isLoading ? "Signing In..." : "Sign IN"}
        </PrimaryButton>
      </form>

      {/* Bottom link */}
      <div className="text-center mt-8">
        <span className="text-sm text-gray-750 font-medium">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-gray-950 hover:underline transition-all"
          >
            Sign UP
          </Link>
        </span>
      </div>
    </AuthLayout>
  );
}

