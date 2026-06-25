"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiMail, FiLink, FiArrowLeft } from "react-icons/fi";
import { AuthLayout, Logo, InputField, PrimaryButton } from "@/components/AuthUI";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

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

      <form onSubmit={(e) => e.preventDefault()}>
        <InputField
          id="forgot-email"
          label="Email"
          type="email"
          placeholder="Enter your Email"
          icon={<FiMail />}
          value={email}
          onChange={setEmail}
        />

        <div className="mt-2">
          <PrimaryButton id="btn-send-reset">
            <FiLink size={16} /> Send Reset Link
          </PrimaryButton>
        </div>
      </form>

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
