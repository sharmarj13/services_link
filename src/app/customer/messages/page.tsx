"use client";

import React, { useState, useEffect } from "react";
import CustomerLayout from "@/components/CustomerLayout";
import { FiUser } from "react-icons/fi";
import ChatModal from "@/components/ChatModal";
import NewRequestModal from "@/app/customer/modal/NewRequestModal";
import { API_BASE_URL } from "@/config";

/* ── Types ── */
interface Notice {
  jobId: string;
  noticeType: string;
  priority: string;
  description: string;
  actionRequired: boolean;
  date: string;
  time: string;
}

interface LocalStorageMessage {
  id: string | number;
  text: string;
  time: string;
  senderName: string;
  initials: string;
  isCurrentUser: boolean;
  isNotice: boolean;
  noticeDetails?: unknown;
}

interface Message {
  id: string | number;
  sender: "us" | "them";
  text: string;
  time: string;
  initials: string;
  isNotice?: boolean;
  noticeDetails?: unknown;
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
    id: 99402,
    title: "HVAC Compressor Maintenance",
    preview: "I have scheduled the repair for tomorrow morning at 9 AM.",
    name: "Maurice Maldonado",
    messageCount: 5,
    badge: "New",
    date: "6/06/2026",
    messages: [
      { id: 1, sender: "us",   text: "I have scheduled the repair for tomorrow morning at 9 AM.", time: "6/5/2026, 1:47:10 PM", initials: "KS" },
      { id: 2, sender: "them", text: "I have scheduled the repair for tomorrow morning at 9 AM.", time: "YOU • 10:46 AM",       initials: "MM" },
      { id: 3, sender: "us",   text: "I have scheduled the repair for tomorrow morning at 9 AM.", time: "6/5/2026, 1:47:10 PM", initials: "KS" },
      {
        id: 4,
        sender: "us",
        text: "⚠️ NOTICE & NOTIFY APPLIED\n\nType: Maintenance Issue\nPriority: High\nDescription: HVAC compressor has a severe leak and pressure drop. Customer action required to authorize repair.\nAction Required: Yes\n\nPlease submit a new work request to address this issue.",
        time: "Karl Smith • 11:30 AM",
        initials: "KS",
        isNotice: true,
      }
    ],
  },
  {
    id: 99408,
    title: "Routine Safety Inspection",
    preview: "Thanks for fixing the leak so quickly!",
    name: "Maurice Maldonado",
    messageCount: 2,
    badge: "Send",
    date: "6/06/2026",
    messages: [
      { id: 1, sender: "us",   text: "Thanks for fixing the leak so quickly!", time: "6/5/2026, 2:10:00 PM", initials: "KS" },
      { id: 2, sender: "them", text: "Happy to help! Let us know if any issues arise.", time: "YOU • 2:15 PM",       initials: "MM" },
    ],
  },
  {
    id: 99412,
    title: "Calibration Check: Unit 7",
    preview: "We need to order more bulbs for the lobby chandelier.",
    name: "Maurice Maldonado",
    messageCount: 8,
    badge: null,
    date: "6/06/2026",
    messages: [
      { id: 1, sender: "us",   text: "We need to order more bulbs for the lobby chandelier.", time: "6/5/2026, 9:00:00 AM", initials: "KS" },
      { id: 2, sender: "them", text: "Understood, I will place the order today.", time: "6/5/2026, 9:30:00 AM",             initials: "MM" },
    ],
  },
  {
    id: 99403,
    title: "Lighting Fix & Bulbs Replacement",
    preview: "Thanks for fixing the leak so quickly!",
    name: "Maurice Maldonado",
    messageCount: 2,
    badge: "Send",
    date: "6/06/2026",
    messages: [
      { id: 1, sender: "them", text: "Thanks for fixing the leak so quickly!", time: "6/5/2026, 2:10:00 PM", initials: "MM" },
    ],
  },
];

export default function CustomerMessagesPage() {
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [convList, setConvList] = useState(CONVERSATIONS);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [siteId, setSiteId] = useState("");

  // Retrieve site ID on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: "include" });
        if (res.ok) {
          const meData = await res.json();
          const sId = meData.user?.siteUser?.siteId;
          if (sId) {
            setSiteId(sId);
          }
        }
      } catch (err) {
        console.error("Session load error in messages page:", err);
      }
    };
    fetchSession();
  }, []);

  // Load notices list
  useEffect(() => {
    try {
      const storedNotices: Notice[] = JSON.parse(localStorage.getItem("servicelink_notices") || "[]");
      if (!storedNotices.some((n: Notice) => n.jobId === "99402")) {
        storedNotices.push({
          jobId: "99402",
          noticeType: "Maintenance Issue",
          priority: "High",
          description: "HVAC compressor has a severe leak and pressure drop. Customer action required to authorize repair.",
          actionRequired: true,
          date: "Jun 25, 2026",
          time: "11:30 AM"
        });
        localStorage.setItem("servicelink_notices", JSON.stringify(storedNotices));
      }
      setNotices(storedNotices);
    } catch {}
  }, [activeConv]);

  // Load chat messages from localStorage on select
  useEffect(() => {
    if (!activeConv) return;
    const chatKey = `servicelink_chat_${activeConv.id}`;
    try {
      const stored = localStorage.getItem(chatKey);
      if (stored) {
        const parsed: LocalStorageMessage[] = JSON.parse(stored);
        
        // Inject static notice for 99402 if it was cleared or deleted
        if (activeConv.id === 99402 && !parsed.some((m: LocalStorageMessage) => m.isNotice)) {
          parsed.push({
            id: `notice_99402_static`,
            text: "⚠️ NOTICE & NOTIFY APPLIED\n\nType: Maintenance Issue\nPriority: High\nDescription: HVAC compressor has a severe leak and pressure drop. Customer action required to authorize repair.\nAction Required: Yes\n\nPlease submit a new work request to address this issue.",
            time: "Karl Smith • 11:30 AM",
            senderName: "Karl Smith",
            initials: "KS",
            isCurrentUser: false,
            isNotice: true,
          });
          localStorage.setItem(chatKey, JSON.stringify(parsed));
        }

        const mappedMessages: Message[] = parsed.map((m: LocalStorageMessage) => ({
          id: m.id,
          sender: m.isCurrentUser ? "them" : "us",
          text: m.text,
          time: m.time,
          initials: m.initials,
          isNotice: m.isNotice,
          noticeDetails: m.noticeDetails
        }));
        
        setActiveConv((prev) => prev ? { ...prev, messages: mappedMessages } : null);
        
        setConvList((prevList) =>
          prevList.map((c) =>
            c.id === activeConv.id ? { ...c, messages: mappedMessages, preview: mappedMessages[mappedMessages.length - 1]?.text || c.preview } : c
          )
        );
      } else {
        const initialLocalStorageSchema = activeConv.messages.map((m) => ({
          id: m.id,
          text: m.text,
          time: m.time,
          senderName: m.sender === "them" ? "Maurice Maldonado" : "Karl Smith",
          initials: m.initials,
          isCurrentUser: m.sender === "them",
          isNotice: m.isNotice || false,
        }));
        localStorage.setItem(chatKey, JSON.stringify(initialLocalStorageSchema));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv?.id]);

  const handleSendMessage = (text: string) => {
    if (!activeConv) return;
    const newMsg: Message = {
      id: Date.now(),
      sender: "them",
      text: text,
      time: `YOU • ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      initials: "MM",
    };
    
    const updatedMessages = [...activeConv.messages, newMsg];
    
    // Save to localStorage
    const chatKey = `servicelink_chat_${activeConv.id}`;
    const localStorageSchema = updatedMessages.map((m) => ({
      id: m.id,
      text: m.text,
      time: m.time,
      senderName: m.sender === "them" ? "Maurice Maldonado" : "Karl Smith",
      initials: m.initials,
      isCurrentUser: m.sender === "them",
      isNotice: m.isNotice || false,
      noticeDetails: m.noticeDetails || null
    }));
    try {
      localStorage.setItem(chatKey, JSON.stringify(localStorageSchema));
    } catch {}

    const updated = convList.map((c) =>
      c.id === activeConv.id
        ? { ...c, messages: updatedMessages, preview: text }
        : c
    );
    setConvList(updated);
    setActiveConv({ ...activeConv, messages: updatedMessages });
  };

  const hasNotice = activeConv ? notices.some((n: Notice) => n.jobId === String(activeConv.id)) : false;

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
          senderName: m.sender === "them" ? "Maurice Maldonado" : "Karl Smith",
          initials: m.initials,
          isCurrentUser: m.sender === "them",
          isNotice: m.isNotice,
        })) : []}
        onSendMessage={handleSendMessage}
        showNewRequestSuggestion={hasNotice}
        onTriggerNewRequest={() => setIsNewRequestOpen(true)}
      />

      {/* ══════════ New Request Modal ══════════ */}
      <NewRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        siteId={siteId}
        onSubmit={(newRequest) => {
          setIsNewRequestOpen(false);
          const successText = `✅ New Work Request Created:\nID: #${newRequest.id}\nTitle: ${newRequest.title}\nPriority: ${newRequest.priority}\nStatus: Assigned`;
          handleSendMessage(successText);
        }}
      />
    </CustomerLayout>
  );
}
