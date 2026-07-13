"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiEye, FiEyeOff, FiLock, FiChevronDown } from "react-icons/fi";

/* ─── Auth Layout ─────────────────────────────────────────────────────────── */
export function AuthLayout({
  children,
  bgImage,
}: {
  children: React.ReactNode;
  bgImage?: string;
}) {
  return (
    <div className="min-h-screen w-full bg-[#D12031] relative overflow-y-auto">
      {/* Background image */}
      {bgImage && (
        <>
          <Image
            src={bgImage}
            alt="bg"
            fill
            priority
            className="object-cover z-0"
          />
          <div className="absolute inset-0 bg-[#D12031]/84 z-1" />
        </>
      )}

      {/* Scrollable wrapper so card never clips on small screens */}
      <div className="relative z-2 w-full min-h-screen flex items-center justify-center py-10 px-4 sm:px-6 box-border">
        {/* White Card */}
        <div className="bg-white rounded-[20px] py-6 sm:py-8 px-5 sm:px-10 w-full max-w-[650px] shadow-[0_8px_48px_rgba(0,0,0,0.22)] box-border">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Logo ────────────────────────────────────────────────────────────────── */
export function Logo() {
  return (
    <div className="flex justify-center mb-7">
      <Image
        src="/images/Logo.png"
        alt="ServiceLink Cardinal Group"
        width={240}
        height={75}
        priority
        className="object-contain"
      />
    </div>
  );
}

/* ─── Input Field ─────────────────────────────────────────────────────────── */
export interface InputProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  rightEl?: React.ReactNode;
  noMarginBottom?: boolean;
}

export function InputField({
  id,
  label,
  type = "text",
  placeholder,
  icon,
  value,
  onChange,
  required,
  rightEl,
  noMarginBottom,
}: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={`${noMarginBottom ? "mb-0" : "mb-3.5"} w-full min-w-0`}>
      <label
        htmlFor={id}
        className="flex items-center gap-0.5 text-[13px] font-medium text-gray-500 mb-1.5"
      >
        {label}
        {required && (
          <span className="text-[#D12031] ml-0.5">*</span>
        )}
      </label>
      <div
        className={`flex items-center gap-2.5 border rounded-lg px-3.5 py-2.5 bg-white transition-colors duration-150 box-border ${
          focused ? "border-[#D12031]" : "border-gray-300"
        }`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <span className="text-gray-400 text-[17px] flex shrink-0">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 outline-none border-none bg-transparent text-sm text-gray-900 font-sans min-w-0"
        />
        {rightEl}
      </div>
    </div>
  );
}

/* ─── Password Input ──────────────────────────────────────────────────────── */
export function PasswordInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  required,
  noMarginBottom,
}: Omit<InputProps, "type" | "icon" | "rightEl">) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div className={`${noMarginBottom ? "mb-0" : "mb-4.5"} w-full min-w-0`}>
      <label
        htmlFor={id}
        className="flex items-center gap-0.5 text-[13px] font-medium text-gray-500 mb-1.5"
      >
        {label}
        {required && (
          <span className="text-[#D12031] ml-0.5">*</span>
        )}
      </label>
      <div
        className={`flex items-center gap-2.5 border rounded-lg px-4 py-3.5 bg-white transition-colors duration-150 box-border ${
          focused ? "border-[#D12031]" : "border-gray-300"
        }`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <span className="text-gray-400 text-[17px] flex shrink-0">
          <FiLock />
        </span>
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 outline-none border-none bg-transparent text-sm text-gray-900 font-sans min-w-0"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(!show)}
          className="text-gray-400 cursor-pointer bg-none border-none flex p-0 shrink-0"
        >
          {show ? <FiEye size={17} /> : <FiEyeOff size={17} />}
        </button>
      </div>
    </div>
  );
}

/* ─── Select Field (Custom Dropdown) ─────────────────────────────────────── */
export interface SelectProps {
  id: string;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}

export function SelectField({
  id,
  label,
  placeholder,
  icon,
  options,
  value,
  onChange,
  required,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedLabel = options.find((o) => o === value) ?? null;

  return (
    <div className="mb-3.5 relative w-full min-w-0" style={{ zIndex: open ? 100 : 1 }} ref={ref}>
      <label
        htmlFor={id}
        className="flex items-center gap-0.5 text-[13px] font-medium text-gray-500 mb-1.5"
      >
        {label}
        {required && (
          <span className="text-[#D12031] ml-0.5">*</span>
        )}
      </label>

      {/* Trigger button */}
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-2.5 border px-3.5 py-2.5 bg-white cursor-pointer text-left font-sans box-border transition-all duration-150 ${
          open ? "border-[#D12031] rounded-t-lg rounded-b-none" : "border-gray-300 rounded-lg"
        }`}
      >
        <span className="text-gray-400 text-[17px] flex shrink-0">
          {icon}
        </span>
        <span
          className={`flex-1 text-sm overflow-hidden whitespace-nowrap text-ellipsis ${
            selectedLabel ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {selectedLabel ?? placeholder}
        </span>
        <span
          className={`flex shrink-0 transition-all duration-200 ${
            open ? "text-[#D12031] rotate-180" : "text-gray-400 rotate-0"
          }`}
        >
          <FiChevronDown size={17} />
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border border-[#D12031] border-t-0 rounded-b-lg shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-[999] overflow-hidden">
          {options.map((opt) => {
            const isSelected = opt === value;
            const isHovered = hovered === opt;
            return (
              <div
                key={opt}
                onMouseEnter={() => setHovered(opt)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-[11px] text-sm cursor-pointer border-b border-gray-100 transition-colors duration-105 ${
                  isSelected
                    ? "bg-red-50/50 text-[#D12031] font-semibold"
                    : isHovered
                      ? "bg-gray-50 text-gray-900"
                      : "bg-white text-gray-900"
                }`}
              >
                {opt}
                {isSelected && (
                  <span className="text-[#D12031] text-[16px] flex">✓</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Primary Button ──────────────────────────────────────────────────────── */
export function PrimaryButton({
  id,
  children,
  type = "submit",
  disabled,
}: {
  id: string;
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      id={id}
      type={type}
      disabled={disabled}
      className="w-full py-3.5 rounded-lg bg-[#D12031] hover:bg-[#a81828] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold text-[16px] border-none cursor-pointer flex items-center justify-center gap-2 font-sans transition-colors duration-150 box-border"
    >
      {children}
    </button>
  );
}
