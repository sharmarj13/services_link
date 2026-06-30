"use client";

import React, { useState } from "react";
import { FiUser } from "react-icons/fi";
import AdminLayout from "@/components/AdminLayout";
import ChatModal from "@/components/ChatModal";

interface ChatMessage {
  id: number;
  sender: "customer" | "technician" | "admin";
  senderName: string;
  text: string;
  time: string;
  initials: string;
}

interface Conversation {
  id: number;
  title: string;
  preview: string;
  customerName: string;
  techName: string;
  messageCount: number;
  badge?: "New" | "Active" | null;
  date: string;
  messages: ChatMessage[];
}

const CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    title: "HVAC Repair - Unit 101",
    preview: "Admin joined: I have updated the work request checklist details.",
    customerName: "Maurice Maldonado",
    techName: "John Doe",
    messageCount: 5,
    badge: "New",
    date: "6/19/2026",
    messages: [
      { id: 1, sender: "customer", senderName: "Maurice Maldonado", text: "Hi John, are you still coming tomorrow at 9 AM?", time: "09:12 AM", initials: "MM" },
      { id: 2, sender: "technician", senderName: "John Doe", text: "Yes, I will be there. Bringing the replacement coolant filters.", time: "10:05 AM", initials: "JD" },
      { id: 3, sender: "admin", senderName: "Admin User", text: "I have updated the work request checklist details. Please review.", time: "10:46 AM", initials: "AD" },
    ],
  },
  {
    id: 2,
    title: "Plumbing Issue - Lobby restroom",
    preview: "Technician Bob: Found the pipe leak, looking for spare valves.",
    customerName: "Maurice Maldonado",
    techName: "Bob Johnson",
    messageCount: 2,
    badge: "Active",
    date: "6/18/2026",
    messages: [
      { id: 1, sender: "customer", senderName: "Maurice Maldonado", text: "Water is overflowing from the main lobby tank.", time: "Yesterday, 3:00 PM", initials: "MM" },
      { id: 2, sender: "technician", senderName: "Bob Johnson", text: "Found the pipe leak, looking for spare valves.", time: "Yesterday, 3:15 PM", initials: "BJ" },
    ],
  },
  {
    id: 3,
    title: "Routine Safety Inspection",
    preview: "Customer Alice: The safety markings are complete.",
    customerName: "Alice Smith",
    techName: "Bob Johnson",
    messageCount: 3,
    badge: null,
    date: "6/15/2026",
    messages: [
      { id: 1, sender: "admin", senderName: "Admin User", text: "Please start the inspection of the main sprinkler valves.", time: "June 15, 08:00 AM", initials: "AD" },
      { id: 2, sender: "technician", senderName: "Bob Johnson", text: "Beginning inspection now.", time: "June 15, 08:30 AM", initials: "BJ" },
      { id: 3, sender: "customer", senderName: "Alice Smith", text: "The safety markings are complete.", time: "June 15, 11:00 AM", initials: "AS" },
    ],
  },
];

export default function AdminMessagesPage() {
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [convList, setConvList] = useState(CONVERSATIONS);

  const handleSendMessage = (text: string) => {
    if (!activeConv) return;

    const newMsg: ChatMessage = {
      id: Date.now(),
      sender: "admin",
      senderName: "Admin User",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      initials: "AD",
    };

    const updated = convList.map((c) =>
      c.id === activeConv.id
        ? {
          ...c,
          messages: [...c.messages, newMsg],
          preview: `Admin joined: ${text}`,
          messageCount: c.messageCount + 1,
        }
        : c
    );

    setConvList(updated);
    setActiveConv({
      ...activeConv,
      messages: [...activeConv.messages, newMsg],
      messageCount: activeConv.messageCount + 1,
    });
  };

  return (
    <AdminLayout
      title="Live Channels & Messages"
      subtitle="Supervise client-technician dialogs and join any active support ticket"
    >
      <div className="max-w-7xl pb-2 space-y-6">

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Red Header Banner */}
          <div className="bg-[#D12031] px-6 py-5 flex items-center justify-between text-white">
            <div>
              <h2 className="text-[16px] font-bold tracking-wide">Operation Channels</h2>
              <p className="text-[11px] text-white/80 font-medium mt-1">
                Monitor and participate in active service chat threads
              </p>
            </div>
            <span className="bg-white/15 px-3 py-1 rounded-full text-[9px] font-bold tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Supervision Mode
            </span>
          </div>

          {/* Conv List */}
          <div className="divide-y divide-gray-150">
            {convList.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                className={`flex items-start justify-between px-6 py-5 cursor-pointer transition-colors hover:bg-gray-50/50 ${conv.badge === "New" ? "bg-red-50/10 border-l-4 border-l-[#D12031]" : ""
                  }`}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h3 className="text-[14px] font-bold text-gray-900 leading-snug">
                      {conv.title}
                    </h3>
                    {conv.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${conv.badge === "New"
                            ? "bg-red-50 text-[#D12031] border border-red-100"
                            : "bg-blue-50 text-blue-700 border border-blue-100"
                          }`}
                      >
                        {conv.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-gray-500 font-semibold line-clamp-1 italic">
                    {conv.preview}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-500 font-semibold">
                    <span className="flex items-center gap-1">
                      <FiUser size={12} />
                      Client: <span className="font-bold text-gray-800">{conv.customerName}</span>
                    </span>
                    <span className="text-gray-300">|</span>
                    <span>
                      Tech: <span className="font-bold text-emerald-600">{conv.techName}</span>
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-400">({conv.messageCount} Messages)</span>
                  </div>
                </div>

                <span className="text-[11px] text-gray-400 font-bold shrink-0 pt-0.5">
                  {conv.date}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 💬 CHAT MODAL INTERACTION */}
      <ChatModal
        isOpen={activeConv !== null}
        onClose={() => setActiveConv(null)}
        chatTitle={activeConv ? activeConv.title : ""}
        infoMessage="You are viewing this channel as Administrator. You can post messages to help resolve issues."
        messages={activeConv ? activeConv.messages.map((m) => ({
          id: m.id,
          text: m.text,
          time: m.time,
          senderName: m.senderName,
          initials: m.initials,
          isCurrentUser: m.sender === "admin",
          role: m.sender,
        })) : []}
        onSendMessage={handleSendMessage}
      />
    </AdminLayout>
  );
}
