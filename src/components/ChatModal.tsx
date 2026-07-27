"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiMessageSquare, FiPaperclip, FiSend, FiUser, FiX } from "react-icons/fi";
import Image from "next/image";
import { apiFetch } from "@/lib/apiFetch";
import { API_BASE_URL } from "@/config";

export interface ChatMessage {
  id: string | number;
  text: string;
  time: string;
  senderName: string;
  initials: string;
  isCurrentUser: boolean;
  role?: string;
  isNotice?: boolean;
  isPending?: boolean;
  isRead?: boolean;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatTitle: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  infoMessage?: string; // Optional banner text (like in Admin chat)
  showNewRequestSuggestion?: boolean;
  onTriggerNewRequest?: () => void;
  isTyping?: boolean;
  isLoading?: boolean;
}

const isImageUrl = (text: string): boolean => {
  if (!text) return false;
  if (text.startsWith("blob:")) return true;
  return (
    (text.startsWith("http://") || text.startsWith("https://") || text.startsWith("/uploads/")) &&
    /\.(jpeg|jpg|gif|png|svg|webp)($|\?)/i.test(text)
  );
};

export default function ChatModal({
  isOpen,
  onClose,
  chatTitle,
  messages,
  onSendMessage,
  infoMessage,
  showNewRequestSuggestion,
  onTriggerNewRequest,
  isTyping,
  isLoading,
}: ChatModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [approvedNotices, setApprovedNotices] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    setOptimisticMessages([]);
  }, [messages]);

  useEffect(() => {
    // Reconstruct approved state based on subsequent chat messages
    const approved: Record<string, boolean> = {};
    messages.forEach((msg, idx) => {
      const isNoticeMsg = msg.isNotice || (msg.text && msg.text.includes("NOTICE & NOTIFY APPLIED"));
      if (isNoticeMsg) {
        // Check if there is an auto-reply approving it after this message
        const hasApproval = messages.slice(idx + 1).some(m => 
          m.text && m.text.includes("The customer has approved the safety observation")
        );
        if (hasApproval) {
          approved[msg.id] = true;
        }
      }
    });
    setApprovedNotices(prev => ({ ...prev, ...approved }));
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, messages, optimisticMessages, isTyping]);

  if (!isOpen) return null;

  const displayMessages = [...messages, ...optimisticMessages];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    
    setInputValue("");
    
    setOptimisticMessages(prev => [...prev, {
      id: `temp-${Date.now()}`,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderName: "You",
      initials: "Me",
      isCurrentUser: true,
      isPending: true
    }]);

    onSendMessage(text);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const tempId = `temp-${Date.now()}`;

    setOptimisticMessages(prev => [...prev, {
      id: tempId,
      text: previewUrl,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderName: "Uploading...",
      initials: "Me",
      isCurrentUser: true,
      isPending: true
    }]);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiFetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          const absoluteUrl = data.url.startsWith("http") ? data.url : `${API_BASE_URL}${data.url}`;
          URL.revokeObjectURL(previewUrl);
          onSendMessage(absoluteUrl);
        }
      } else {
        console.error("Attachment upload failed");
        setOptimisticMessages(prev => prev.filter(m => m.id !== tempId));
      }
    } catch (err) {
      console.error("Error uploading attachment:", err);
      setOptimisticMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-white rounded-3xl w-full max-w-[460px] overflow-hidden flex flex-col shadow-2xl relative z-10 animate-scale-up h-[85vh] sm:h-[600px]">

        {/* Header */}
        <div className="bg-white px-4 sm:px-6 py-4 flex items-center gap-3 border-b border-gray-200 shrink-0">
          <div className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
            <FiUser size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] sm:text-[16px] font-bold text-gray-900 truncate">{chatTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors cursor-pointer border-none bg-transparent"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Info Banner if provided */}
        {infoMessage && (
          <div className="bg-blue-50/50 border-b border-blue-100/50 px-6 py-2 flex items-center gap-2 text-[10px] font-bold text-blue-700 shrink-0">
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 custom-scrollbar flex flex-col">
          {isLoading ? (
            <div className="space-y-4 animate-pulse my-auto">
              <div className="flex items-end gap-2.5 flex-row">
                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-10 bg-gray-200 rounded-2xl rounded-bl-none w-2/3" />
                </div>
              </div>
              <div className="flex items-end gap-2.5 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                <div className="space-y-1.5 flex-1 flex flex-col items-end">
                  <div className="h-3 bg-gray-200 rounded w-20" />
                  <div className="h-12 bg-gray-200 rounded-2xl rounded-br-none w-3/4" />
                </div>
              </div>
              <div className="flex items-end gap-2.5 flex-row">
                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-gray-200 rounded w-28" />
                  <div className="h-8 bg-gray-200 rounded-2xl rounded-bl-none w-1/2" />
                </div>
              </div>
            </div>
          ) : displayMessages.length === 0 ? (
            <div className="my-auto flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#D12031] flex items-center justify-center mb-1">
                <FiMessageSquare size={24} />
              </div>
              <p className="text-sm font-bold text-gray-800">No messages in this channel yet</p>
              <p className="text-xs text-gray-400 max-w-[260px]">
                Type your message in the input below to start communicating with the customer and technician.
              </p>
            </div>
          ) : (
            displayMessages.map((msg) => {
            const textContent = msg.text || "";
            const isNoticeMsg = msg.isNotice || textContent.includes("NOTICE & NOTIFY APPLIED");
            const isImg = isImageUrl(textContent);

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2.5 ${msg.isCurrentUser ? "flex-row-reverse" : "flex-row"} ${msg.isPending ? "opacity-60 transition-opacity" : "opacity-100"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8.5 h-8.5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${msg.isCurrentUser
                      ? "bg-[#D12031] text-white border-red-200"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                >
                  {msg.initials}
                </div>

                {/* Bubble Body */}
                <div className={`flex flex-col ${msg.isCurrentUser ? "items-end" : "items-start"} ${isNoticeMsg ? "w-full max-w-[85%]" : "max-w-[75%]"}`}>
                  {msg.senderName && (
                    <span className="text-[9px] text-gray-400 font-black mb-1 px-1 flex items-center gap-1.5">
                      {msg.senderName} {msg.role ? `(${msg.role})` : ""}
                    </span>
                  )}
                  {isNoticeMsg ? (() => {
                    const isApproved = approvedNotices[msg.id];
                    return (
                    <div className={`border rounded-2xl p-4 shadow-sm text-gray-800 w-full font-sans my-0.5 space-y-3.5 relative overflow-hidden text-left ${isApproved ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                      <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl pointer-events-none ${isApproved ? "bg-green-200/40" : "bg-red-200/40"}`} />

                      <div className={`flex items-center justify-between pb-3 border-b ${isApproved ? "border-green-200/50" : "border-red-200/50"}`}>
                        <div className="flex items-center gap-2">
                          {!isApproved && <span className="w-2 h-2 rounded-full bg-[#D12031] animate-pulse" />}
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${isApproved ? "text-green-700" : "text-[#D12031]"}`}>
                            {isApproved ? "Approved Safety Observation" : "Active Safety Observation"}
                          </span>
                        </div>
                        {!msg.isCurrentUser && (
                          <button 
                            type="button"
                            onClick={async () => {
                              setApprovedNotices(prev => ({ ...prev, [msg.id]: true }));
                              onSendMessage("✅ The customer has approved the safety observation.");
                              try {
                                await apiFetch(`/api/messages/${msg.id}/approve-notice`, { method: "POST" });
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            disabled={isApproved}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors shadow-xs ${isApproved ? "bg-green-100 text-green-700 border border-green-200 cursor-default" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 cursor-pointer"}`}
                          >
                            {isApproved ? "Approved" : "Approve"}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[10.5px]">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1">Notice Type</p>
                          <p className="font-semibold text-gray-800">{textContent.match(/Type:\s*([^\n]+)/)?.[1] || "General Observation"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1">Priority</p>
                          <p className={`font-extrabold uppercase ${textContent.match(/Priority:\s*([^\n]+)/)?.[1]?.trim()?.toUpperCase() === "HIGH" ? "text-[#D12031]" : "text-gray-800"}`}>
                            {textContent.match(/Priority:\s*([^\n]+)/)?.[1] || "High"}
                          </p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1">Reported On</p>
                          <p className="font-semibold text-gray-800">{msg.time}</p>
                        </div>
                      </div>

                      <div className={`pt-3 border-t ${isApproved ? "border-green-200/50" : "border-red-200/50"}`}>
                        <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1.5">Detailed Description</p>
                        <p className="text-[12px] font-semibold text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {textContent.match(/Description:\s*([\s\S]*?)(?:$)/)?.[1]?.trim() || "No description provided."}
                        </p>
                      </div>
                    </div>
                  )})() : isImg ? (
                    <div className="rounded-2xl overflow-hidden border border-gray-200 max-w-[240px] shadow-sm bg-white p-1 my-0.5">
                      <img src={msg.text} alt="Shared attachment" className="w-full h-auto rounded-xl max-h-[180px] object-cover" />
                    </div>
                  ) : (
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-[13.5px] font-medium leading-relaxed ${msg.isCurrentUser
                          ? "bg-[#D12031] text-white rounded-br-none shadow-sm animate-fade-in whitespace-pre-line"
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-xs whitespace-pre-line"
                        }`}
                    >
                      {msg.text}
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-1.5 mt-1 px-1">
                    <span className="text-[9px] text-gray-400 font-bold">
                      {msg.time}
                    </span>
                    {msg.isCurrentUser && (
                      msg.isPending ? (
                        <span className="text-[9.5px] text-gray-400 font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : msg.isRead ? (
                        <span className="text-sky-500 font-black text-[12px] leading-none tracking-tighter" title="Read by recipient">
                          ✓✓
                        </span>
                      ) : (
                        <span className="text-gray-400 font-black text-[12px] leading-none tracking-tighter" title="Delivered to recipient">
                          ✓✓
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          }))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-end gap-2.5 flex-row animate-fade-in mb-2">
              <div className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-gray-400 bg-gray-100 border border-gray-200 shrink-0">
                <FiUser size={14} />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none shadow-xs px-4 py-3.5 flex items-center gap-1.5 h-[38px]">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer Input */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-5 bg-white border-t border-gray-200 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
          />
          <div className="relative flex items-center bg-gray-50 border border-gray-300 rounded-2xl px-4 py-2 focus-within:bg-white focus-within:border-[#D12031] transition-all">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a Message..."
              className="flex-1 text-[13px] text-gray-800 outline-none bg-transparent placeholder-gray-400 font-semibold"
            />
            <div className="flex items-center gap-1.5 ml-2">
              <div className="relative group flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent disabled:opacity-50"
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-4.5 w-4.5 border-b-2 border-[#D12031]" />
                  ) : (
                    <FiPaperclip size={18} />
                  )}
                </button>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 pointer-events-none whitespace-nowrap bg-gray-800 text-white text-[11px] font-medium px-2.5 py-1 rounded shadow-md z-50">
                  Attach Photo
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-gray-800"></div>
                </div>
              </div>

              <div className="relative group flex items-center justify-center">
                <button
                  type="submit"
                  className="w-10 h-10 bg-[#D12031] hover:bg-[#a81828] text-white rounded-xl flex items-center justify-center shrink-0 cursor-pointer border-none transition-colors shadow-sm"
                >
                  <FiSend size={16} />
                </button>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 pointer-events-none whitespace-nowrap bg-gray-800 text-white text-[11px] font-medium px-2.5 py-1 rounded shadow-md z-50">
                  Send Message
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
