"use client";

import React, { useState } from "react";
import TechnicianLayout from "@/components/TechnicianLayout";
import { FiUser } from "react-icons/fi";
import ChatModal from "@/components/ChatModal";

const MOCK_MESSAGES = [
  {
    id: "1",
    title: "HVAC Repair - Unit 101",
    snippet: "I have scheduled the repair for tomorrow morning at 9 AM.",
    sender: "Maurice Maldonado",
    count: 5,
    isNew: true,
    date: "6/06/2026"
  },
  {
    id: "2",
    title: "Plumbing Issue - Unit 204",
    snippet: "Thanks for fixing the leak so quickly!",
    sender: "Maurice Maldonado",
    count: 2,
    isNew: false,
    date: "6/06/2026"
  },
  {
    id: "3",
    title: "Electrical Maintenance - Lobby",
    snippet: "We need to order more bulbs for the lobby chandelier.",
    sender: "Maurice Maldonado",
    count: 8,
    isNew: false,
    date: "6/06/2026"
  },
  {
    id: "4",
    title: "Plumbing Issue - Unit 204",
    snippet: "Thanks for fixing the leak so quickly!",
    sender: "Maurice Maldonado",
    count: 2,
    isNew: false,
    date: "6/06/2026"
  }
];

const MOCK_CHAT_MESSAGES = [
  {
    id: 1,
    text: "I have scheduled the repair for tomorrow morning at 9 AM.",
    time: "6/5/2026, 1:47:10 PM",
    senderName: "Maurice Maldonado",
    initials: "MM",
    isCurrentUser: false,
  },
  {
    id: 2,
    text: "I have scheduled the repair for tomorrow morning at 9 AM.",
    time: "YOU • 10:46 AM",
    senderName: "Karl Smith",
    initials: "KS",
    isCurrentUser: true,
  },
];

export default function MessagesPage() {
  const [selectedChatTitle, setSelectedChatTitle] = useState<string | null>(null);

  return (
    <TechnicianLayout title="Messages" subtitle="Communicate with team members about work requests">

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-5xl">

        {/* Red Title Banner */}
        <div className="bg-[#D12031] px-6 py-5">
          <h2 className="text-white text-[17px] font-bold">Recent Messages</h2>
          <p className="text-white/90 text-[12px] font-medium mt-1">Your conversation history and notifications</p>
        </div>

        {/* Message List */}
        <div className="p-6 space-y-4 bg-gray-50/50">
          {MOCK_MESSAGES.map((msg) => (
            <div
              key={msg.id}
              onClick={() => setSelectedChatTitle(msg.title)}
              className={`bg-white border rounded-xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 cursor-pointer hover:shadow-md transition-shadow ${msg.isNew ? "border-[#D12031] border-l-[4px]" : "border-gray-200"
                }`}
            >
              <div className="space-y-2 flex-1 min-w-0">
                <h3 className="text-[16px] font-bold text-gray-900 truncate">{msg.title}</h3>
                <p className="text-[14px] text-gray-500 font-medium truncate">{msg.snippet}</p>
                <div className="flex items-center gap-2 pt-1">
                  <FiUser className="text-gray-400" size={16} />
                  <span className="text-[13px] font-bold text-gray-700">{msg.sender}</span>
                  <span className="text-[13px] font-bold text-gray-900 ml-1">({msg.count} Messages)</span>
                  {msg.isNew ? (
                    <span className="text-[13px] font-bold text-[#D12031] ml-1">New</span>
                  ) : (
                    <span className="text-[13px] font-medium text-gray-400 ml-1">Send</span>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-[13px] font-medium text-gray-400 mt-1 sm:mt-0">
                {msg.date}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ChatModal
        isOpen={selectedChatTitle !== null}
        onClose={() => setSelectedChatTitle(null)}
        chatTitle={selectedChatTitle || "Chat with John Doe"}
        messages={MOCK_CHAT_MESSAGES}
        onSendMessage={(text) => console.log("Technician sent:", text)}
      />

    </TechnicianLayout>
  );
}
