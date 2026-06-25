"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMail, FiLogIn } from "react-icons/fi";
import { AuthLayout, Logo, InputField, PasswordInput, PrimaryButton } from "@/components/AuthUI";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.toLowerCase().includes("customer")) {
      router.push("/customer/overview");
    } else {
      router.push("/technician/overview");
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

        <PrimaryButton id="btn-sign-in">
          <FiLogIn size={18} /> Sign IN
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

