"use client";

import { apiFetch } from "@/lib/apiFetch";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiLock, FiCheckCircle, FiArrowLeft, FiKey } from "react-icons/fi";
import { AuthLayout, Logo, InputField, PrimaryButton } from "@/components/AuthUI";
import { API_BASE_URL } from "@/config";

import { Suspense } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !otp.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          password: password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.status) {
        throw new Error(data.message || "Failed to reset password.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError((err as any).message || "Server connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout bgImage="/images/onbording-background.png">
      <Logo />

      <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-snug">
        Enter OTP
      </h1>
      <p className="text-[15px] text-gray-550 mb-6 leading-relaxed font-medium">
        Please enter the 6-digit OTP sent to your email and your new password.
      </p>

      {success ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <FiCheckCircle size={32} className="text-emerald-500" />
          </div>
          <p className="text-[15px] text-center text-gray-700 font-medium leading-relaxed">
            Your password has been successfully reset.
          </p>
          <p className="text-[13px] text-center text-gray-500 font-medium">
            Redirecting to login page...
          </p>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-50 text-red-750 text-[13px] font-semibold px-4 py-2.5 rounded-xl border border-red-100 mb-5 text-center leading-normal">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!initialEmail && (
              <InputField
                id="reset-email"
                label="Email"
                type="email"
                placeholder="Enter your Email"
                icon={<FiKey />}
                value={email}
                onChange={setEmail}
                required
              />
            )}

            <InputField
              id="reset-otp"
              label="OTP Code"
              type="text"
              placeholder="Enter 6-digit OTP"
              icon={<FiKey />}
              value={otp}
              onChange={setOtp}
              required
            />

            <InputField
              id="reset-new-password"
              label="New Password"
              type="password"
              placeholder="Enter new password"
              icon={<FiLock />}
              value={password}
              onChange={setPassword}
              required
            />

            <div className="mt-4">
              <PrimaryButton id="btn-reset" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Resetting...
                  </>
                ) : (
                  <>
                    <FiCheckCircle size={16} /> Reset Password
                  </>
                )}
              </PrimaryButton>
            </div>
          </form>
        </>
      )}

      <div className="text-center mt-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[15px] font-semibold text-gray-900 hover:underline transition-all"
        >
          <FiArrowLeft size={16} /> Back to Sign IN
        </Link>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-[#D12031] border-t-transparent rounded-full animate-spin"></div></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
