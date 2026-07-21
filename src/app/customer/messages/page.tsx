"use client";

import React, { useState, useEffect, useRef } from "react";
import CustomerLayout from "@/components/CustomerLayout";
import { FiUser, FiAlertCircle } from "react-icons/fi";
import ChatModal from "@/components/ChatModal";
import NewRequestModal from "@/app/customer/modal/NewRequestModal";
import { API_BASE_URL } from "@/config";
import { apiFetch } from "@/lib/apiFetch";

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

interface Message {
  id: string | number;
  sender: "us" | "them"; // "them" represents current user (sender === currentUser), "us" represents others
  text: string;
  time: string;
  senderName: string;
  initials: string;
  isNotice?: boolean;
}

interface Conversation {
  id: string; // workRequestId or otherUserId
  type: "work_request" | "direct";
  title: string;
  preview: string;
  name: string;
  messageCount: number;
  badge?: "New" | "Send" | null;
  date: string;
  messages: Message[];
}

export default function CustomerMessagesPage() {
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [convList, setConvList] = useState<Conversation[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [siteId, setSiteId] = useState("");
  const [userId, setUserId] = useState("");
  const [currentUserName, setCurrentUserName] = useState("You");
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "offline">("connecting");

  // Helper to fetch session, work requests, and enriched messages
  const loadData = async () => {
    try {
      // 1. Fetch Session
      const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: "include" });
      if (!meRes.ok) return;
      const meData = await meRes.json();
      const sId = (meData.data?.user || meData.user)?.siteUser?.siteId;
      const uId = (meData.data?.user || meData.user)?.id;
      const fName = (meData.data?.user || meData.user)?.firstName || "";
      const lName = (meData.data?.user || meData.user)?.lastName || "";
      const name = `${fName} ${lName}`.trim() || "You";

      if (uId) setUserId(uId);
      if (sId) setSiteId(sId);
      setCurrentUserName(name);

      if (!sId || !uId) return;

      // 2. Fetch Work Requests & Enriched Messages & Safety Notices in parallel
      const [wrRes, msgRes, noticeRes] = await Promise.all([
        apiFetch(`/api/sites/${sId}/work-requests`),
        apiFetch("/api/messages/enriched"),
        apiFetch("/api/safety-notices"),
      ]);

      let workRequests = [];
      if (wrRes.ok) {
        const wrData = await wrRes.json();
        workRequests = wrData.data || [];
      }

      let enrichedMessages = [];
      if (msgRes.ok) {
        enrichedMessages = await msgRes.json();
      }

      if (noticeRes.ok) {
        const noticeData = await noticeRes.json();
        const list = (noticeData.data || []).map((dbNotice: any) => {
          const noticeDate = new Date(dbNotice.createdAt);
          return {
            jobId: dbNotice.workRequestId,
            noticeType: dbNotice.noticeType,
            priority: dbNotice.priority,
            description: dbNotice.description,
            actionRequired: dbNotice.actionRequired,
            date: noticeDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            time: noticeDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
        });
        setNotices(list);
      }

      // 3. Process and group messages into conversations
      const conversationsMap: Record<string, Conversation> = {};

      enrichedMessages.forEach((msg: any) => {
        let key = "";
        let type: "work_request" | "direct" = "direct";
        let convId = "";
        let title = "";
        let otherName = "";

        if (msg.workRequestId) {
          key = `work_request_${msg.workRequestId}`;
          type = "work_request";
          convId = msg.workRequestId;
          title = msg.workRequestTitle || `Request #${msg.workRequestId.substring(0, 8)}`;
          otherName = msg.senderId === uId ? (msg.recipientName || "Support Team") : (msg.senderName || "Support Team");
        } else {
          const otherUserId = msg.senderId === uId ? msg.recipientId : msg.senderId;
          if (!otherUserId) return;
          key = `direct_${otherUserId}`;
          type = "direct";
          convId = otherUserId;
          title = msg.senderId === uId ? (msg.recipientName || msg.recipientEmail) : (msg.senderName || msg.senderEmail);
          otherName = title;
        }

        let dateStrRaw = String(msg.createdAt).replace(' ', 'T');
        // Handle PostgreSQL UTC suffix "+00" by converting to standard "Z"
        if (dateStrRaw.endsWith('+00')) {
          dateStrRaw = dateStrRaw.slice(0, -3) + 'Z';
        } else if (!dateStrRaw.endsWith('Z') && !dateStrRaw.match(/[+-]\d{2}:?\d{2}$/)) {
          dateStrRaw = dateStrRaw + 'Z';
        }
        const messageDate = new Date(dateStrRaw);
        const dateStr = messageDate.toLocaleDateString();

        const nameForInitials = msg.senderName || (msg.senderId === uId ? name : "Support Team");
        const formattedMessage: Message = {
          id: msg.id,
          sender: msg.senderId === uId ? "them" : "us",
          text: msg.content,
          time: messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          senderName: nameForInitials,
          initials: nameForInitials.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "ST",
          isNotice: msg.content?.includes("NOTICE & NOTIFY APPLIED") || false,
        };

        if (!conversationsMap[key]) {
          conversationsMap[key] = {
            id: convId,
            type,
            title,
            preview: msg.content,
            name: otherName,
            messageCount: 1,
            badge: msg.senderId !== uId && !msg.isRead ? "New" : null,
            date: dateStr,
            messages: [formattedMessage],
          };
        } else {
          conversationsMap[key].messages.unshift(formattedMessage);
          conversationsMap[key].messageCount += 1;
          if (msg.senderId !== uId && !msg.isRead) {
            conversationsMap[key].badge = "New";
          }
        }
      });

      // 4. Fill in work requests that do not have messages yet (so user can initiate chat)
      // Only show requests owned by this user
      const userRequests = workRequests.filter((wr: any) => wr.customerId === uId);
      userRequests.forEach((wr: any) => {
        const key = `work_request_${wr.id}`;
        if (!conversationsMap[key]) {
          conversationsMap[key] = {
            id: wr.id,
            type: "work_request",
            title: wr.title,
            preview: "No messages yet. Click to start conversation.",
            name: "Support Team / Technician",
            messageCount: 0,
            badge: null,
            date: new Date(wr.createdAt).toLocaleDateString(),
            messages: [],
          };
        }
      });

      const finalConvs = Object.values(conversationsMap).sort((a, b) => {
        if (a.messages.length === 0 && b.messages.length > 0) return 1;
        if (a.messages.length > 0 && b.messages.length === 0) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setConvList(finalConvs);

      // Keep active conversation reference in sync if it's currently open
      if (activeConv) {
        const updatedActive = finalConvs.find((c) => c.id === activeConv.id);
        if (updatedActive) {
          setActiveConv(updatedActive);
        }
      }
    } catch (err) {
      console.error("Error loading chat data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync activeConv changes to keep it in sync with updated list
  useEffect(() => {
    if (activeConv) {
      const current = convList.find((c) => c.id === activeConv.id);
      if (current && current.messages.length !== activeConv.messages.length) {
        setActiveConv(current);
      }
    }
  }, [convList, activeConv]);

  const openConversation = (conv: any) => {
    setActiveConv(conv);
    
    if (conv.badge === "New") {
      let unreadCountToDecrement = 0;
      
      // Mark all unread messages from others as read
      conv.messages.forEach((msg: any) => {
        if (!msg.isMine && !msg.isRead && msg.id) {
          unreadCountToDecrement++;
          apiFetch(`/api/messages/${msg.id}/read`, { method: "POST" })
            .catch(console.error);
        }
      });
      
      // Optimistically clear the badge in the list
      setConvList((prev) => 
        prev.map((c) => (c.id === conv.id ? { ...c, badge: null } : c))
      );
      
      // Notify layout to update the badge count instantly
      if (unreadCountToDecrement > 0) {
        window.dispatchEvent(new CustomEvent("decrementMessages", { detail: unreadCountToDecrement }));
      }
      
      // Also trigger a background fetch just in case
      window.dispatchEvent(new Event("messagesRead"));
    }
  };

  // WebSocket Connection
  useEffect(() => {
    if (!siteId) return;

    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;
      
      setWsStatus("connecting");
      
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      let backendHost = API_BASE_URL ? API_BASE_URL.replace(/^https?:\/\//, "") : "localhost:5000";
      
      // If we're on localhost but backendHost somehow became empty
      if (!backendHost || backendHost === "") {
         backendHost = window.location.hostname === "localhost" ? "localhost:5000" : window.location.host;
      }
      
      socket = new WebSocket(`${protocol}//${backendHost}/ws`);
      socketRef.current = socket;

      socket.onopen = () => {
        if (!isMounted) return;
        socket?.send(JSON.stringify({ type: "authenticate" }));
        setWsStatus("connected");
      };

      socket.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "new-message") {
            // Trigger a silent reload of message data to sync everything
            loadData();
          }
        } catch (err) {
          console.error("Error handling ws message:", err);
        }
      };

      socket.onclose = () => {
        if (!isMounted) return;
        setWsStatus("offline");
        // Reconnect after 3 seconds
        reconnectTimeout = setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        if (!isMounted) return;
        setWsStatus("offline");
        // Socket close event will handle reconnect
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId]);

  const handleSendMessage = async (text: string) => {
    if (!activeConv || !siteId) return;

    try {
      const body = {
        siteId,
        content: text,
        workRequestId: activeConv.type === "work_request" ? activeConv.id : null,
        recipientId: activeConv.type === "direct" ? activeConv.id : null,
      };

      const res = await apiFetch("/api/messages", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        // Reload all data to catch the sent message + trigger socket broadcasts
        await loadData();
      } else {
        console.error("Failed to send message:", await res.text());
      }
    } catch (err) {
      console.error("Network error sending message:", err);
    }
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
        <div className="bg-[#D12031] px-6 py-5 flex items-center justify-between text-white">
          <div>
            <h2 className="text-white text-[17px] font-bold">Recent Messages</h2>
            <p className="text-white/80 text-[12px] font-medium mt-0.5">
              Your conversation history and work request logs
            </p>
          </div>
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2">
            {wsStatus === "connected" && (
              <span className="bg-white/15 backdrop-blur-md text-white border border-white/30 shadow-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400 shadow-[0_0_5px_rgba(74,222,128,1)]"></span>
                </span>
                Online
              </span>
            )}
            {wsStatus === "connecting" && (
              <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all">
                <span className="w-2.5 h-2.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                Connecting
              </span>
            )}
            {wsStatus === "offline" && (
              <span className="bg-black/20 backdrop-blur-md text-white/90 border border-black/10 shadow-inner px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                Offline
              </span>
            )}
          </div>
        </div>

        {/* Offline Warning Bar */}
        {wsStatus === "offline" && (
          <div className="bg-red-50 border-b border-red-100 px-6 py-2.5 flex items-center gap-2 text-[11px] font-bold text-red-700 transition-all">
            <FiAlertCircle size={14} className="shrink-0 text-red-500" />
            <span>Connection lost. We are trying to reconnect you. New messages might not appear in real-time.</span>
          </div>
        )}

        {/* Loading and empty states */}
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start justify-between px-6 py-5">
                <div className="flex-1 pr-4">
                  <div className="w-1/3 h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : convList.length === 0 ? (
          <div className="text-center py-24 px-6">
            <FiAlertCircle className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium text-sm">No conversations found. Create a work request to start chatting.</p>
          </div>
        ) : (
          /* Conversation List */
          <div className="divide-y divide-gray-100">
            {convList.map((conv) => (
              <div
                key={conv.id}
                onClick={() => openConversation(conv)}
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
        )}
      </div>

      {/* ══════════ Chat Modal ══════════ */}
      <ChatModal
        isOpen={activeConv !== null}
        onClose={() => setActiveConv(null)}
        chatTitle={activeConv ? `Chat: ${activeConv.title}` : ""}
        messages={activeConv ? activeConv.messages.map((m) => ({
          id: m.id,
          text: m.text,
          time: m.time,
          senderName: m.senderName,
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
