"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiMail, FiLink, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { AuthLayout, Logo, InputField, PrimaryButton } from "@/components/AuthUI";
import { API_BASE_URL } from "@/config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      // Always show success (backend never reveals if email exists — security best practice)
      setSuccess(true);
    } catch {
      setError("Server connection failed. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout bgImage="/images/onbording-background.png">
      <Logo />

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-snug">
        Reset Password
      </h1>
      <p className="text-[15px] text-gray-550 mb-6 leading-relaxed font-medium">
        Enter your email address and we&apos;ll send you instructions to reset your password
      </p>

      {/* Success State */}
      {success ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <FiCheckCircle size={32} className="text-emerald-500" />
          </div>
          <p className="text-[14px] text-center text-gray-700 font-medium leading-relaxed">
            If an account exists with <span className="font-bold text-gray-900">{email}</span>,
            a password reset link has been sent to that address.
          </p>
          <p className="text-[13px] text-center text-gray-500 font-medium">
            Please check your inbox and spam folder.
          </p>
        </div>
      ) : (
        <>
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 text-red-750 text-[13px] font-semibold px-4 py-2.5 rounded-xl border border-red-100 mb-5 text-center leading-normal">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <InputField
              id="forgot-email"
              label="Email"
              type="email"
              placeholder="Enter your Email"
              icon={<FiMail />}
              value={email}
              onChange={setEmail}
              required
            />

            <div className="mt-2">
              <PrimaryButton id="btn-send-reset" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <FiLink size={16} /> Send Reset Link
                  </>
                )}
              </PrimaryButton>
            </div>
          </form>
        </>
      )}

      {/* Back link */}
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
