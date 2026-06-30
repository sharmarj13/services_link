"use client";

import React from "react";
import { FiUsers, FiShield, FiActivity } from "react-icons/fi";
import AdminLayout from "@/components/AdminLayout";

export default function AdministrationOverviewPage() {
  return (
    <AdminLayout
      title="Administration Overview"
      subtitle="Overview of system-wide users, registered sites, and platform telemetry"
    >
      <div className="max-w-7xl pb-2 space-y-8 animate-[fadeIn_0.3s_ease]">

        {/* 📊 Administration Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Users */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FiUsers size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Total Users</span>
              <span className="text-2xl font-black text-gray-900 block mt-1">125</span>
            </div>
          </div>

          {/* Card 2: Customers */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#D12031]/10 text-[#D12031] flex items-center justify-center shrink-0">
              <FiUsers size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Active Customers</span>
              <span className="text-2xl font-black text-gray-900 block mt-1">84</span>
            </div>
          </div>

          {/* Card 3: Technicians */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FiUsers size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Technicians</span>
              <span className="text-2xl font-black text-gray-900 block mt-1">36</span>
            </div>
          </div>

          {/* Card 4: Super Admins */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <FiShield size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Super Admins</span>
              <span className="text-2xl font-black text-gray-900 block mt-1">05</span>
            </div>
          </div>
        </div>

        {/* 🏢 Sites Performance Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-[#D12031] px-6 py-5 text-white">
            <h3 className="text-[15px] font-bold tracking-wide">Sites Operational Status</h3>
            <p className="text-[11px] text-white/90 font-medium mt-1">
              Active facility footprint and operations health overview
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-150">
                  <th className="py-4 px-6">Site Name</th>
                  <th className="py-4 px-6">Address</th>
                  <th className="py-4 px-6 text-center">Headcount</th>
                  <th className="py-4 px-6 text-center">Active Jobs</th>
                  <th className="py-4 px-6 text-center">Health Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-[13px] text-gray-700 font-semibold">
                {[
                  { name: "Site A", address: "1201 Cardinal Blvd", users: 32, jobs: 4, status: "Operational", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                  { name: "Site B", address: "845 Commerce Rd", users: 18, jobs: 2, status: "Operational", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                  { name: "Site C", address: "302 Industrial Pkwy", users: 25, jobs: 5, status: "Maintenance", color: "text-amber-700 bg-amber-50 border-amber-100" },
                  { name: "Site D", address: "15 Logistics Dr", users: 10, jobs: 1, status: "Operational", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                  { name: "Site E", address: "77 Innovation Ave", users: 40, jobs: 12, status: "Alert State", color: "text-[#D12031] bg-red-50 border-red-100" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">{row.name}</td>
                    <td className="py-4 px-6 font-medium text-gray-500">{row.address}</td>
                    <td className="py-4 px-6 text-center text-gray-900">{row.users}</td>
                    <td className="py-4 px-6 text-center text-gray-900">{row.jobs}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black border ${row.color}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🆕 Recent Registered Users */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <FiActivity size={18} className="text-[#D12031]" />
            <div>
              <h3 className="text-[15px] font-bold text-gray-900">Recent Platform Registrations</h3>
              <p className="text-[11px] text-gray-400 font-medium">New accounts created in the last 72 hours</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { name: "John Smith", role: "Technician", site: "Site A", time: "2 hours ago", initials: "JS", bg: "bg-emerald-50 text-emerald-700" },
              { name: "Robert Davis", role: "Customer", site: "Site C", time: "1 day ago", initials: "RD", bg: "bg-blue-50 text-blue-700" },
              { name: "Emma Watson", role: "Customer", site: "Site D", time: "2 days ago", initials: "EW", bg: "bg-blue-50 text-blue-700" },
              { name: "David Miller", role: "Technician", site: "Site E", time: "3 days ago", initials: "DM", bg: "bg-emerald-50 text-emerald-700" },
            ].map((usr, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 border border-gray-150 rounded-xl hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${usr.bg}`}>
                    {usr.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-950">{usr.name}</h4>
                    <p className="text-[10px] text-gray-450 mt-0.5 font-semibold">
                      {usr.role} • Registered to <span className="font-bold text-gray-700">{usr.site}</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 font-bold shrink-0">{usr.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
