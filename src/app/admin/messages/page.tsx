"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiUser } from "react-icons/fi";
import AdminLayout from "@/components/AdminLayout";
import ChatModal from "@/components/ChatModal";
import { API_BASE_URL } from "@/config";
import { apiFetch } from "@/lib/apiFetch";

interface ChatMessage {
  id: number | string;
  sender: "customer" | "technician" | "admin";
  senderName: string;
  text: string;
  time: string;
  initials: string;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  customerName: string;
  techName: string;
  messageCount: number;
  badge?: "New" | "Active" | null;
  date: string;
  messages: ChatMessage[];
}

export default function AdminMessagesPage() {
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [convList, setConvList] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMsgsLoading, setIsMsgsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");

  const showToast = (msg: string, type: "success" | "error" = "error") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const socketRef = useRef<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "offline">("connecting");

  // Fetch initial conversations
  const fetchConversations = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/admin/conversations`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        // Add empty messages array for now, fetched on demand
        const formatted = data.map((c: any) => ({ ...c, messages: [] }));
        setConvList(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConv || activeConv.messages.length > 0) return;
    
    async function fetchMessages() {
      setIsMsgsLoading(true);
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/admin/conversations/${activeConv!.id}/messages`, {
          credentials: "include",
        });
        if (res.ok) {
          const msgs = await res.json();
          setActiveConv(prev => prev ? { ...prev, messages: msgs } : null);
          setConvList(prev => prev.map(c => c.id === activeConv!.id ? { ...c, messages: msgs } : c));
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setIsMsgsLoading(false);
      }
    }
    fetchMessages();
  }, [activeConv?.id]);

  // WebSocket Connection
  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;

    const connectWebSocket = () => {
      setWsStatus("connecting");
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      let backendHost = API_BASE_URL ? API_BASE_URL.replace(/^https?:\/\//, "") : "localhost:5000";
      if (!backendHost || backendHost === "") {
         backendHost = window.location.hostname === "localhost" ? "localhost:5000" : window.location.host;
      }
      
      socket = new WebSocket(`${protocol}//${backendHost}/ws`);
      socketRef.current = socket;

      socket.onopen = () => {
        setWsStatus("connected");
        // Authenticate using the HTTPOnly cookie implicitly sent
        socket?.send(JSON.stringify({ type: "authenticate" }));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "new-message") {
            const msg = data.data;
            // Update convList preview & message count
            setConvList(prev => prev.map(c => {
              if (c.id === msg.workRequestId) {
                const isExisting = c.messages.some((m: any) => m.id === msg.id);
                if (isExisting) return c;
                return {
                  ...c,
                  preview: `${msg.senderName}: ${msg.text}`,
                  messageCount: c.messageCount + 1,
                  badge: "Active",
                  messages: [...c.messages, msg]
                };
              }
              return c;
            }));

            // Update activeConv if this message belongs to it
            setActiveConv(prev => {
              if (prev && prev.id === msg.workRequestId) {
                const isExisting = prev.messages.some((m: any) => m.id === msg.id);
                if (isExisting) return prev;
                return {
                  ...prev,
                  messages: [...prev.messages, msg],
                  preview: `${msg.senderName}: ${msg.text}`,
                  messageCount: prev.messageCount + 1,
                };
              }
              return prev;
            });
          }
        } catch (err) {
          console.error("Error handling ws message:", err);
        }
      };

      socket.onclose = () => {
        setWsStatus("offline");
        reconnectTimer = setTimeout(connectWebSocket, 5000);
      };

      socket.onerror = () => {
        setWsStatus("offline");
      };
    };

    connectWebSocket();

    return () => {
      clearTimeout(reconnectTimer);
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!activeConv || !text.trim()) return;

    try {
      const res = await apiFetch(`/api/admin/conversations/${activeConv.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const sentMsg = await res.json();
      setActiveConv(prev => {
        if (!prev) return null;
        const exists = prev.messages.some(m => m.id === sentMsg.id);
        if (exists) return prev;
        return { ...prev, messages: [...prev.messages, sentMsg] };
      });
      setConvList(prev => prev.map(c => {
        if (c.id !== activeConv.id) return c;
        const exists = c.messages.some(m => m.id === sentMsg.id);
        const updatedMsgs = exists ? c.messages : [...c.messages, sentMsg];
        return { ...c, messages: updatedMsgs, preview: text, messageCount: c.messageCount + 1 };
      }));
    } catch (err) {
      console.error(err);
      showToast("Failed to send message", "error");
    }
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
            
            {wsStatus === "connected" && (
              <span className="bg-white/15 px-3 py-1 rounded-full text-[9px] font-bold tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live Supervision Mode
              </span>
            )}
            {wsStatus === "connecting" && (
              <span className="bg-white/15 px-3 py-1 rounded-full text-[9px] font-bold tracking-wider flex items-center gap-1">
                <div className="w-2.5 h-2.5 border-2 border-t-white/30 border-white rounded-full animate-spin"></div>
                Connecting...
              </span>
            )}
            {wsStatus === "offline" && (
              <span className="bg-white/15 px-3 py-1 rounded-full text-[9px] font-bold tracking-wider flex items-center gap-1 text-red-100">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                Offline
              </span>
            )}
          </div>

          {/* Conv List */}
          {loading ? (
            <div className="divide-y divide-gray-100 p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between animate-pulse">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                  <div className="h-8 bg-gray-200 rounded-xl w-24" />
                </div>
              ))}
            </div>
          ) : convList.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium">
              No active conversations found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 h-[600px] overflow-y-auto">
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
          )}
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
        isLoading={isMsgsLoading}
      />

      {/* 🔔 Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-20 right-6 z-[9999] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border transition-all animate-bounce ${toastType === "success" ? "bg-emerald-600 border-emerald-500" : "bg-[#D12031] border-red-500"}`}>
          <span>{toastMsg}</span>
        </div>
      )}
    </AdminLayout>
  );
}
