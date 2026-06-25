"use client";

import React, { useState } from "react";
import CustomerLayout from "@/components/CustomerLayout";
import { FiUser } from "react-icons/fi";
import ChatModal from "@/components/ChatModal";

/* ── Types ── */
interface Message {
  id: number;
  sender: "us" | "them";
  text: string;
  time: string;
  initials: string;
}

interface Conversation {
  id: number;
  title: string;
  preview: string;
  name: string;
  messageCount: number;
  badge?: "New" | "Send" | null;
  date: string;
  messages: Message[];
}

/* ── Mock Data ── */
const CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    title: "HVAC Repair - Unit 101",
    preview: "I have scheduled the repair for tomorrow morning at 9 AM.",
    name: "Maurice Maldonado",
    messageCount: 5,
    badge: "New",
    date: "6/06/2026",
    messages: [
      { id: 1, sender: "us",   text: "I have scheduled the repair for tomorrow morning at 9 AM.", time: "6/5/2026, 1:47:10 PM", initials: "US" },
      { id: 2, sender: "them", text: "I have scheduled the repair for tomorrow morning at 9 AM.", time: "YOU • 10:46 AM",       initials: "KS" },
      { id: 3, sender: "us",   text: "I have scheduled the repair for tomorrow morning at 9 AM.", time: "6/5/2026, 1:47:10 PM", initials: "US" },
    ],
  },
  {
    id: 2,
    title: "Plumbing Issue - Unit 204",
    preview: "Thanks for fixing the leak so quickly!",
    name: "Maurice Maldonado",
    messageCount: 2,
    badge: "Send",
    date: "6/06/2026",
    messages: [
      { id: 1, sender: "us",   text: "Thanks for fixing the leak so quickly!", time: "6/5/2026, 2:10:00 PM", initials: "US" },
      { id: 2, sender: "them", text: "Happy to help! Let us know if any issues arise.", time: "YOU • 2:15 PM",       initials: "KS" },
    ],
  },
  {
    id: 3,
    title: "Electrical Maintenance - Lobby",
    preview: "We need to order more bulbs for the lobby chandelier.",
    name: "Maurice Maldonado",
    messageCount: 8,
    badge: null,
    date: "6/06/2026",
    messages: [
      { id: 1, sender: "them", text: "We need to order more bulbs for the lobby chandelier.", time: "6/5/2026, 9:00:00 AM", initials: "KS" },
      { id: 2, sender: "us",   text: "Understood, I will place the order today.", time: "6/5/2026, 9:30:00 AM",             initials: "US" },
    ],
  },
  {
    id: 4,
    title: "Plumbing Issue - Unit 204",
    preview: "Thanks for fixing the leak so quickly!",
    name: "Maurice Maldonado",
    messageCount: 2,
    badge: "Send",
    date: "6/06/2026",
    messages: [
      { id: 1, sender: "us",   text: "Thanks for fixing the leak so quickly!", time: "6/5/2026, 2:10:00 PM", initials: "US" },
    ],
  },
];

export default function CustomerMessagesPage() {
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [convList, setConvList] = useState(CONVERSATIONS);

  const handleSendMessage = (text: string) => {
    if (!activeConv) return;
    const newMsg: Message = {
      id: Date.now(),
      sender: "them",
      text: text,
      time: `YOU • ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      initials: "KS",
    };
    const updated = convList.map((c) =>
      c.id === activeConv.id
        ? { ...c, messages: [...c.messages, newMsg], preview: text }
        : c
    );
    setConvList(updated);
    setActiveConv({ ...activeConv, messages: [...activeConv.messages, newMsg] });
  };

  return (
    <CustomerLayout
      title="Messages"
      subtitle="Communicate with team members about work requests"
    >
      {/* ── Main Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Red Banner */}
        <div className="bg-[#D12031] px-6 py-5">
          <h2 className="text-white text-[17px] font-bold">Recent Messages</h2>
          <p className="text-white/80 text-[12px] font-medium mt-0.5">
            Your conversation history and notifications
          </p>
        </div>

        {/* Conversation List */}
        <div className="divide-y divide-gray-100">
          {convList.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConv(conv)}
              className={`flex items-start justify-between px-6 py-5 cursor-pointer transition-colors hover:bg-gray-50 ${
                conv.badge === "New" ? "bg-white border-l-4 border-l-[#D12031]" : ""
              }`}
            >
              {/* Left */}
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-[15px] font-bold text-gray-900 leading-snug">
                  {conv.title}
                </h3>
                <p className="text-[13px] text-gray-500 mt-1 font-medium line-clamp-1">
                  {conv.preview}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <FiUser size={13} className="text-gray-400 shrink-0" />
                  <span className="text-[12px] text-gray-500 font-medium">
                    {conv.name}
                  </span>
                  <span className="text-[12px] text-gray-400 font-medium">
                    ({conv.messageCount} Messages)
                  </span>
                  {conv.badge && (
                    <span
                      className={`text-[12px] font-bold ${
                        conv.badge === "New" ? "text-[#D12031]" : "text-gray-500"
                      }`}
                    >
                      {conv.badge}
                    </span>
                  )}
                </div>
              </div>
              {/* Right – date */}
              <span className="text-[12px] text-gray-400 font-medium shrink-0 pt-0.5">
                {conv.date}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ Chat Modal ══════════ */}
      <ChatModal
        isOpen={activeConv !== null}
        onClose={() => setActiveConv(null)}
        chatTitle={activeConv ? `Chat with ${activeConv.name}` : ""}
        messages={activeConv ? activeConv.messages.map((m) => ({
          id: m.id,
          text: m.text,
          time: m.time,
          senderName: m.sender === "them" ? "Maurice Maldonado" : "John Doe",
          initials: m.initials,
          isCurrentUser: m.sender === "them",
        })) : []}
        onSendMessage={handleSendMessage}
      />
    </CustomerLayout>
  );
}
