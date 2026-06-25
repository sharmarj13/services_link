"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineUserGroup } from "react-icons/hi";
import { BsBuildingCheck } from "react-icons/bs";
import { FiEye, FiEyeOff, FiArrowLeft, FiLink, FiLogIn, FiUserPlus, FiMail, FiLock, FiUser } from "react-icons/fi";

export type AuthView = "login" | "signup" | "forgot-password";

interface AuthPageProps {
  view: AuthView;
  isAdmin?: boolean;
  bgImage?: string;
}

function Logo() {
  return (
    <div className="flex justify-center mb-8">
      <Image
        src="/images/Logo.png"
        alt="ServiceLink Cardinal Group"
        width={300}
        height={90}
        priority
        className="object-contain"
      />
    </div>
  );
}

interface InputProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  rightEl?: React.ReactNode;
}

function InputField({
  id, label, type = "text", placeholder, icon,
  value, onChange, required, rightEl,
}: InputProps) {
  return (
    <div className="flex flex-col mb-6">
      <label
        htmlFor={id}
        className="text-[14px] font-medium text-gray-600 mb-2"
      >
        {label}
        {required && (
          <span className="text-[#D12031]"> *</span>
        )}
      </label>
      <div
        className="flex items-center gap-3 rounded-[8px] px-4 py-[14px] bg-white transition-colors duration-150 border border-gray-300 focus-within:border-[#D12031]"
      >
        <span className="text-gray-500 text-[18px]">{icon}</span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 outline-none bg-transparent text-[14px] placeholder-gray-400 text-gray-900"
        />
        {rightEl}
      </div>
    </div>
  );
}

function PasswordInput({
  id, label, placeholder, value, onChange, required, hideBottomMargin = false
}: Omit<InputProps, "type" | "icon" | "rightEl"> & { hideBottomMargin?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className={`flex flex-col ${hideBottomMargin ? 'mb-2' : 'mb-6'}`}>
      <label
        htmlFor={id}
        className="text-[14px] font-medium text-gray-600 mb-2"
      >
        {label}
        {required && (
          <span className="text-[#D12031]"> *</span>
        )}
      </label>
      <div
        className="flex items-center gap-3 rounded-[8px] px-4 py-[14px] bg-white transition-colors duration-150 border border-gray-300 focus-within:border-[#D12031]"
      >
        <span className="text-gray-500 text-[18px]"><FiLock /></span>
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 outline-none bg-transparent text-[14px] placeholder-gray-400 text-gray-900"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(!show)}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          {show ? <FiEye size={18} /> : <FiEyeOff size={18} />}
        </button>
      </div>
    </div>
  );
}

interface SelectProps {
  id: string;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}

function SelectField({
  id, label, placeholder, icon, options, value, onChange, required,
}: SelectProps) {
  return (
    <div className="flex flex-col mb-6">
      <label
        htmlFor={id}
        className="text-[14px] font-medium text-gray-600 mb-2"
      >
        {label}
        {required && <span className="text-[#D12031]"> *</span>}
      </label>
      <div
        className="flex items-center gap-3 rounded-[8px] px-4 py-[14px] bg-white transition-colors duration-150 border border-gray-300 focus-within:border-[#D12031]"
      >
        <span className="text-gray-500 text-[18px]">{icon}</span>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 outline-none bg-transparent text-[14px] appearance-none cursor-pointer ${value ? "text-gray-900" : "text-gray-400"}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="text-gray-900">
              {opt}
            </option>
          ))}
        </select>
        <span className="text-gray-400 text-[14px]">▾</span>
      </div>
    </div>
  );
}

function PrimaryButton({
  id, children, type = "submit",
}: {
  id: string;
  children: React.ReactNode;
  type?: "button" | "submit";
}) {
  return (
    <button
      id={id}
      type={type}
      className="w-full py-[14px] rounded-[8px] text-white font-bold text-[16px] flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] bg-[#D12031] hover:bg-[#a81828]"
    >
      {children}
    </button>
  );
}

function LoginForm({ isAdmin }: { isAdmin: boolean }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex flex-col">
      <div>
        <h1 className="text-[26px] font-bold text-gray-900 leading-tight">
          {isAdmin ? "Admin Panel" : "Service Link - Cardinal group"}
        </h1>
        <p className="text-[15px] text-gray-500 mt-2">
          {isAdmin ? "Administrator Control Center" : "Work Management Platform"}
        </p>
      </div>

      <form className="mt-8 flex flex-col" onSubmit={(e) => e.preventDefault()}>
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
          hideBottomMargin
        />

        <div className="flex justify-end mb-6 mt-2">
          <Link
            href={isAdmin ? "/admin/forgot-password" : "/forgot-password"}
            className="text-[13px] font-semibold text-gray-800 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <PrimaryButton id="btn-sign-in">
          <FiLogIn size={18} /> Sign IN
        </PrimaryButton>
      </form>

      {!isAdmin && (
        <div className="mt-[70px] flex justify-center pb-2">
          <p className="text-[14px] text-gray-800">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-black hover:underline"
            >
              Sign UP
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

const ROLES = ["Customer", "Technician"];
const SITES = ["Site A", "Site B", "Site C", "Site D", "Site E"];

function SignupForm() {
  const [firstName, setFirstName]             = useState("");
  const [lastName, setLastName]               = useState("");
  const [email, setEmail]                     = useState("");
  const [role, setRole]                       = useState("");
  const [site, setSite]                       = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="flex flex-col">
      <div>
        <h1 className="text-[26px] font-bold text-gray-900 leading-tight">Create Account</h1>
        <p className="text-[15px] text-gray-500 mt-2">Sign up for Service Link</p>
      </div>

      <form className="mt-8 flex flex-col" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          hideBottomMargin
        />

        <div className="mt-8">
          <PrimaryButton id="btn-sign-up">
            <FiUserPlus size={18} /> Sign UP
          </PrimaryButton>
        </div>
      </form>

      <div className="mt-[50px] flex justify-center pb-2">
        <p className="text-[14px] text-gray-800">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-black hover:underline">
            Sign IN
          </Link>
        </p>
      </div>
    </div>
  );
}

function ForgotPasswordForm({ isAdmin }: { isAdmin: boolean }) {
  const [email, setEmail] = useState("");

  return (
    <div className="flex flex-col">
      <div>
        <h1 className="text-[26px] font-bold text-gray-900 leading-tight">Reset Password</h1>
        <p className="text-[15px] text-gray-500 mt-2 leading-relaxed">
          Enter your email address and we&apos;ll send you instructions to reset
          your password
        </p>
      </div>

      <form className="mt-8 flex flex-col" onSubmit={(e) => e.preventDefault()}>
        <InputField
          id="forgot-email"
          label="Email"
          type="email"
          placeholder="Enter your Email"
          icon={<FiMail />}
          value={email}
          onChange={setEmail}
        />

        <div className="mt-4">
          <PrimaryButton id="btn-send-reset">
            <FiLink size={16} /> Send Reset Link
          </PrimaryButton>
        </div>
      </form>

      <div className="mt-[50px] flex justify-center pb-2">
        <Link
          href={isAdmin ? "/admin/login" : "/login"}
          className="flex items-center gap-2 text-[15px] font-medium text-gray-800 hover:text-black hover:underline"
        >
          <FiArrowLeft size={16} /> Back to Sign IN
        </Link>
      </div>
    </div>
  );
}

export default function AuthPage({
  view,
  isAdmin = false,
  bgImage,
}: AuthPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative bg-[#D12031]">
      {bgImage && (
        <>
          <Image
            src={bgImage}
            alt="background"
            fill
            priority
            className="object-cover object-center z-0"
          />
          <div className="absolute inset-0 bg-[#D12031]/85 z-10" />
        </>
      )}

      {/* The White Card */}
      <div
        className="relative w-full max-w-[500px] bg-white rounded-[24px] p-6 sm:px-12 sm:pt-12 sm:pb-10 z-20 shadow-[0_8px_40px_rgba(0,0,0,0.15)]"
      >
        <Logo />

        {view === "login"           && <LoginForm isAdmin={isAdmin} />}
        {view === "signup"          && <SignupForm />}
        {view === "forgot-password" && <ForgotPasswordForm isAdmin={isAdmin} />}
      </div>
    </div>
  );
}
