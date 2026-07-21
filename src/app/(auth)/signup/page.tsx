"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiUser, FiMail, FiUserPlus, FiPhone } from "react-icons/fi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { BsBuildingCheck } from "react-icons/bs";
import { AuthLayout, Logo, InputField, PasswordInput, SelectField, PrimaryButton } from "@/components/AuthUI";
import { API_BASE_URL } from "@/config";

const ROLES = ["Customer", "Technician"];

interface SiteOption {
  id: string;
  name: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [site, setSite] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic sites from backend
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);

  // Load available sites on mount from public API
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/signup/sites`);
        if (res.ok) {
          const data: SiteOption[] = await res.json();
          setSites(data);
        }
      } catch {
        // fallback silently — dropdown stays empty
      } finally {
        setSitesLoading(false);
      }
    };
    fetchSites();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!role) {
      setError("Please select a role");
      return;
    }

    if (!site) {
      setError("Please select a site");
      return;
    }

    setIsLoading(true);

    try {
      const apiRole = role === "Customer" ? "customer" : "tech";

      // Resolve real siteId from the selected site name
      const selectedSite = sites.find((s) => s.name === site);
      const siteId = selectedSite?.id ?? "67332402-733c-4364-996e-020e138719d0";

      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          role: apiRole,
          siteId,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        setError(errData.message || "Registration failed. Check password length (min 8 chars).");
        setIsLoading(false);
        return;
      }

      console.log("Signup success");

      // Verify session and redirect based on role
      const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (!meResponse.ok) {
        setError("Account created, but session initialization failed. Please sign in manually.");
        setIsLoading(false);
        return;
      }

      const meData = await meResponse.json();
      const userRole = (meData.data?.user || meData.user)?.siteUser?.role || apiRole;

      if (userRole === "tech") {
        router.push("/technician/overview");
      } else {
        router.push("/customer/overview");
      }
    } catch (err: unknown) {
      console.error("Signup error:", err);
      setError("Server connection failed. Make sure the backend is running.");
      setIsLoading(false);
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

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 text-red-750 text-[13px] font-semibold px-4 py-2.5 rounded-xl border border-red-100 mb-5 text-center leading-normal">
          {error}
        </div>
      )}

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

        {/* Email + Phone row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
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

          <InputField
            id="signup-phone"
            label="Phone Number"
            type="tel"
            placeholder="Enter your Phone Number"
            icon={<FiPhone />}
            value={phone}
            onChange={setPhone}
            required
          />
        </div>
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
            placeholder={sitesLoading ? "Loading sites..." : "Select your Site"}
            icon={<BsBuildingCheck />}
            options={sites.map((s) => s.name)}
            value={site}
            onChange={setSite}
            required
          />
        </div>

        {/* Passwords row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
          <PasswordInput
            id="signup-password"
            label="Password"
            placeholder="Min 8 characters"
            value={password}
            onChange={setPassword}
            required
            noMarginBottom
          />

          <PasswordInput
            id="signup-confirm-password"
            label="Confirm Password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            noMarginBottom
          />
        </div>

        <div className="mt-6">
          <PrimaryButton id="btn-sign-up" disabled={isLoading || sitesLoading}>
            <FiUserPlus size={18} /> {isLoading ? "Signing Up..." : "Sign UP"}
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
