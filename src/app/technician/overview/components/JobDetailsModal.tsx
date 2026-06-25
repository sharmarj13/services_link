"use client";

import React from "react";
import { User, MapPin, Calendar, Hash, Shield, Phone, Mail, Plus, Lock, Trash2, MessageSquare, Bell } from "lucide-react";

interface Job {
  id: string;
  title: string;
  loc: string;
  pri: string;
  badgeBg: string;
  description: string;
  tools: string[];
  estDuration: string;
}

interface JobDetailsModalProps {
  job: Job | null;
  onClose: () => void;
}

export default function JobDetailsModal({ job, onClose }: JobDetailsModalProps) {
  if (!job) return null;

  return (
    <div className="w-full pb-10 animate-fade-in">
      {/* Top action row (Back button) */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span className="text-lg leading-none mb-0.5">‹</span> Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: 2/3 width */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* Job Information Card */}
          <div className="bg-white rounded-2xl border-2 border-[#D12031] p-6 sm:p-8">
            <div className="flex items-start justify-between mb-8">
              <h3 className="text-[17px] font-bold text-slate-900">Job Information</h3>
              <span className="text-[11px] font-bold text-yellow-600 border border-yellow-300 bg-yellow-50 py-1.5 px-4 rounded-lg">
                Work in Progress
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div className="flex items-start gap-3">
                <User size={18} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[13px] font-semibold text-slate-500">Customer</div>
                  <div className="text-[13px] font-bold text-[#D12031] mt-0.5">Maurice Maldonado</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[13px] font-semibold text-slate-500">Site Location</div>
                  <div className="text-[13px] font-bold text-[#D12031] mt-0.5">Warehouse D, Bay 14</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[13px] font-semibold text-slate-500">Department</div>
                  <div className="text-[13px] font-bold text-[#D12031] mt-0.5">Maintenance &amp; Ops</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[13px] font-semibold text-slate-500">Schedule Date</div>
                  <div className="text-[13px] font-bold text-[#D12031] mt-0.5">Oct 24, 08:00 AM</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Hash size={18} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[13px] font-semibold text-slate-500">PO Number</div>
                  <div className="text-[13px] font-bold text-[#D12031] mt-0.5">#PO-882910</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User size={18} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[13px] font-semibold text-slate-500">Asset ID</div>
                  <div className="text-[13px] font-bold text-[#D12031] mt-0.5">HVAC-UNIT-04</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scope of Work Card */}
          <div className="bg-white rounded-2xl border-2 border-[#D12031] p-6 sm:p-8 flex-1">
            <h3 className="text-[17px] font-bold text-slate-900 mb-4">Scope of Work</h3>
            <p className="text-[15px] font-medium text-slate-700 leading-relaxed">
              Diagnose the network issue, inspect switches and cabling, identify the root cause, and restore connectivity. Test the network after repairs and provide a completion report.
            </p>
          </div>

          {/* Start Job Button */}
          <div className="pt-2">
            <button className="w-full bg-[#D12031] hover:bg-[#b81d2c] text-white font-bold text-sm py-4 rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer">
              Start Job
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: 1/3 width */}
        <div className="space-y-6 flex flex-col">
          {/* Contact Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <User size={20} className="text-slate-600" />
              <h3 className="text-[15px] font-bold text-slate-900">Contact Details</h3>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-full bg-red-50 text-[#D12031] flex items-center justify-center font-bold text-lg border border-red-100 shrink-0">
                JB
              </div>
              <div>
                <div className="text-[15px] font-bold text-slate-900">James Brennan</div>
                <div className="text-[13px] font-medium text-slate-500 mt-0.5">Facility Manager</div>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 bg-[#D12031] hover:bg-[#b81d2c] text-white font-bold text-[13px] py-3.5 rounded-xl transition-colors cursor-pointer">
                <Phone size={16} /> Call
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-[#D12031] border border-[#D12031] font-bold text-[13px] py-3.5 rounded-xl transition-colors cursor-pointer">
                <Mail size={16} /> Email Contact
              </button>
            </div>
          </div>

          {/* Attachments Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex-1">
            <h3 className="text-[15px] font-bold text-slate-900 mb-5">Attachments</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Add Photo Box */}
              <button className="border-2 border-dashed border-[#D12031]/40 hover:border-[#D12031] bg-red-50/30 rounded-xl flex flex-col items-center justify-center gap-2 aspect-[4/3] transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-[#D12031] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus size={18} strokeWidth={3} />
                </div>
                <span className="text-[11px] font-bold text-[#D12031]">Add Photo</span>
              </button>

              {/* Image 1 */}
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200 group">
                <img src="https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=300&auto=format&fit=crop" alt="Construction site" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 w-6 h-6 bg-[#D12031] rounded-full flex items-center justify-center shadow-sm">
                  <Lock size={12} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5 backdrop-blur-sm">
                  <span className="text-[9px] font-semibold text-white/90 truncate block">Warehouse_Map.png</span>
                </div>
              </div>

              {/* Image 2 */}
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200 group">
                <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=300&auto=format&fit=crop" alt="Site" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 w-6 h-6 bg-[#D12031] rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-[#b81d2c] transition-colors">
                  <Trash2 size={12} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5 backdrop-blur-sm">
                  <span className="text-[9px] font-semibold text-white/90 truncate block">Warehouse_Map.png</span>
                </div>
              </div>

              {/* Image 3 */}
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200 group">
                <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=300&auto=format&fit=crop" alt="Site overview" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 w-6 h-6 bg-[#D12031] rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-[#b81d2c] transition-colors">
                  <Trash2 size={12} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5 backdrop-blur-sm">
                  <span className="text-[9px] font-semibold text-white/90 truncate block">Warehouse_Map.png</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Right Side */}
          <div className="pt-2 flex items-center gap-4">
            <button className="flex-1 bg-white hover:bg-red-50 text-[#D12031] border border-[#D12031] font-bold text-sm py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer">
              <MessageSquare size={18} /> Message
            </button>
            <button className="flex-1 bg-white hover:bg-red-50 text-[#D12031] border border-[#D12031] font-bold text-sm py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer">
              <Bell size={18} /> Notice &amp; Notify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
