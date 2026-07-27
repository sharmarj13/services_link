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
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#D12031",
        position: "relative",
        overflowY: "auto",
      }}
    >
      {/* Background image */}
      {bgImage && (
        <>
          <Image
            src={bgImage}
            alt="bg"
            fill
            priority
            style={{ objectFit: "cover", zIndex: 0 }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(209,32,49,0.84)",
              zIndex: 1,
            }}
          />
        </>
      )}

      {/* Scrollable wrapper so card never clips on small screens */}
      <div style={{ position: "relative", zIndex: 2, width: "100%", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", boxSizing: "border-box" }}>
        {/* White Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "32px 40px",
            width: "100%",
            maxWidth: "650px",
            boxShadow: "0 8px 48px rgba(0,0,0,0.22)",
            boxSizing: "border-box",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Logo ────────────────────────────────────────────────────────────────── */
export function Logo() {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
      <Image
        src="/images/Logo.png"
        alt="ServiceLink Cardinal Group"
        width={240}
        height={75}
        priority
        style={{ objectFit: "contain" }}
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
    <div style={{ marginBottom: noMarginBottom ? "0" : "14px", width: "100%", minWidth: 0 }}>
      <label
        htmlFor={id}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          fontSize: "13px",
          fontWeight: 500,
          color: "#6b7280",
          marginBottom: "6px",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "#D12031", marginLeft: "1px" }}>*</span>
        )}
      </label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          border: `1px solid ${focused ? "#D12031" : "#d1d5db"}`,
          borderRadius: "8px",
          padding: "10px 14px",
          backgroundColor: "#fff",
          transition: "border-color 0.15s",
          boxSizing: "border-box",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <span
          style={{
            color: "#9ca3af",
            fontSize: "17px",
            display: "flex",
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            outline: "none",
            border: "none",
            background: "transparent",
            fontSize: "14px",
            color: "#111827",
            fontFamily: "inherit",
            minWidth: 0,
          }}
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
    <div style={{ marginBottom: noMarginBottom ? "0" : "18px", width: "100%", minWidth: 0 }}>
      <label
        htmlFor={id}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          fontSize: "13px",
          fontWeight: 500,
          color: "#6b7280",
          marginBottom: "6px",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "#D12031", marginLeft: "1px" }}>*</span>
        )}
      </label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          border: `1px solid ${focused ? "#D12031" : "#d1d5db"}`,
          borderRadius: "8px",
          padding: "13px 16px",
          backgroundColor: "#fff",
          transition: "border-color 0.15s",
          boxSizing: "border-box",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <span
          style={{
            color: "#9ca3af",
            fontSize: "17px",
            display: "flex",
            flexShrink: 0,
          }}
        >
          <FiLock />
        </span>
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            outline: "none",
            border: "none",
            background: "transparent",
            fontSize: "14px",
            color: "#111827",
            fontFamily: "inherit",
            minWidth: 0,
          }}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(!show)}
          style={{
            color: "#9ca3af",
            cursor: "pointer",
            background: "none",
            border: "none",
            display: "flex",
            padding: 0,
            flexShrink: 0,
          }}
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
    <div style={{ marginBottom: "14px", position: "relative", zIndex: open ? 100 : 1, width: "100%", minWidth: 0 }} ref={ref}>
      <label
        htmlFor={id}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          fontSize: "13px",
          fontWeight: 500,
          color: "#6b7280",
          marginBottom: "6px",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "#D12031", marginLeft: "1px" }}>*</span>
        )}
      </label>

      {/* Trigger button */}
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          border: `1px solid ${open ? "#D12031" : "#d1d5db"}`,
          borderRadius: open ? "8px 8px 0 0" : "8px",
          padding: "10px 14px",
          backgroundColor: "#fff",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
          boxSizing: "border-box",
          transition: "border-color 0.15s, border-radius 0.1s",
        }}
      >
        <span style={{ color: "#9ca3af", fontSize: "17px", display: "flex", flexShrink: 0 }}>
          {icon}
        </span>
        <span
          style={{
            flex: 1,
            fontSize: "14px",
            color: selectedLabel ? "#111827" : "#9ca3af",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {selectedLabel ?? placeholder}
        </span>
        <span
          style={{
            color: open ? "#D12031" : "#9ca3af",
            display: "flex",
            flexShrink: 0,
            transition: "transform 0.2s, color 0.15s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <FiChevronDown size={17} />
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            border: "1px solid #D12031",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 999,
            overflow: "hidden",
          }}
        >
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "11px 16px",
                  fontSize: "14px",
                  cursor: "pointer",
                  backgroundColor: isSelected
                    ? "#fff5f5"
                    : isHovered
                    ? "#f9fafb"
                    : "#fff",
                  color: isSelected ? "#D12031" : "#111827",
                  fontWeight: isSelected ? 600 : 400,
                  transition: "background-color 0.1s",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                {opt}
                {isSelected && (
                  <span style={{ color: "#D12031", fontSize: "16px", display: "flex" }}>✓</span>
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
  isLoading,
}: { 
  id: string; 
  children: React.ReactNode; 
  type?: "button" | "submit";
  disabled?: boolean;
  isLoading?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const isDisabled = disabled || isLoading;
  return (
    <button
      id={id}
      type={type}
      disabled={isDisabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        padding: "14px",
        borderRadius: "8px",
        backgroundColor: isDisabled ? "#9ca3af" : (hovered ? "#a81828" : "#D12031"),
        color: "#fff",
        fontWeight: 700,
        fontSize: "16px",
        border: "none",
        cursor: isDisabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontFamily: "inherit",
        transition: "background-color 0.15s",
        boxSizing: "border-box",
      }}
    >
      {children}
    </button>
  );
}
