"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiMail, FiLink, FiArrowLeft } from "react-icons/fi";
import { AuthLayout, Logo, InputField, PrimaryButton } from "@/components/AuthUI";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");

  return (
    <AuthLayout bgImage="/images/onbording-background.png">
      <Logo />

      <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-snug">
        Reset Password
      </h1>
      <p className="text-[15px] text-gray-550 mb-6 leading-relaxed font-medium">
        Enter your admin email address and we&apos;ll send you instructions to reset your password
      </p>

      <form onSubmit={(e) => e.preventDefault()}>
        <InputField
          id="admin-forgot-email"
          label="Email"
          type="email"
          placeholder="Enter your Email"
          icon={<FiMail />}
          value={email}
          onChange={setEmail}
        />

        <div className="mt-2">
          <PrimaryButton id="btn-admin-send-reset">
            <FiLink size={16} /> Send Reset Link
          </PrimaryButton>
        </div>
      </form>

      <div className="text-center mt-6">
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-2 text-[15px] font-semibold text-gray-900 hover:underline transition-all"
        >
          <FiArrowLeft size={16} /> Back to Sign IN
        </Link>
      </div>
    </AuthLayout>
  );
}
