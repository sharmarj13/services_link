"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiUser, FiMail, FiUserPlus } from "react-icons/fi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { BsBuildingCheck } from "react-icons/bs";
import { AuthLayout, Logo, InputField, PasswordInput, SelectField, PrimaryButton } from "@/components/AuthUI";

const ROLES = ["Customer", "Technician"];
const SITES = ["Site A", "Site B", "Site C", "Site D", "Site E"];

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [site, setSite] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "Customer") {
      router.push("/customer/overview");
    } else if (role === "Technician") {
      router.push("/technician/overview");
    } else {
      // Default fallback
      router.push("/technician/overview");
    }
  };

  return (
    <AuthLayout bgImage="/images/onbording-background.png">
      <Logo />

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1 leading-snug">
        Create Account
      </h1>
      <p className="text-[15px] text-gray-550 mb-6 font-medium">
        Sign up for Service Link
      </p>

      <form onSubmit={handleSignup}>
        {/* First + Last Name row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
          <InputField
            id="signup-firstname"
            label="First Name"
            placeholder="John"
            icon={<FiUser />}
            value={firstName}
            onChange={setFirstName}
          />
          <InputField
            id="signup-lastname"
            label="Last Name"
            placeholder="Doe"
            icon={<FiUser />}
            value={lastName}
            onChange={setLastName}
          />
        </div>

        <InputField
          id="signup-email"
          label="Email"
          type="email"
          placeholder="Enter your Email"
          icon={<FiMail />}
          value={email}
          onChange={setEmail}
          required
        />

        {/* Role + Site row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
          <SelectField
            id="signup-role"
            label="I am a"
            placeholder="Select your Role"
            icon={<HiOutlineUserGroup />}
            options={ROLES}
            value={role}
            onChange={setRole}
            required
          />
          <SelectField
            id="signup-site"
            label="Site"
            placeholder="Select your Site"
            icon={<BsBuildingCheck />}
            options={SITES}
            value={site}
            onChange={setSite}
            required
          />
        </div>

        <PasswordInput
          id="signup-password"
          label="Password"
          placeholder="Enter your Password"
          value={password}
          onChange={setPassword}
          required
        />

        <PasswordInput
          id="signup-confirm-password"
          label="Confirm Password"
          placeholder="Enter your Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          required
          noMarginBottom
        />

        <div className="mt-6">
          <PrimaryButton id="btn-sign-up">
            <FiUserPlus size={18} /> Sign UP
          </PrimaryButton>
        </div>
      </form>

      {/* Bottom link */}
      <div className="text-center mt-5">
        <span className="text-sm text-gray-750 font-medium">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-gray-955 hover:underline transition-all"
          >
            Sign IN
          </Link>
        </span>
      </div>
    </AuthLayout>
  );
}

