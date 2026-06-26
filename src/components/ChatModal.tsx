"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiPaperclip, FiSend, FiUser, FiX } from "react-icons/fi";
import Image from "next/image";

export interface ChatMessage {
  id: string | number;
  text: string;
  time: string;
  senderName: string;
  initials: string;
  isCurrentUser: boolean;
  role?: string;
  isNotice?: boolean;
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
}

export default function ChatModal({
  isOpen,
  onClose,
  chatTitle,
  messages,
  onSendMessage,
  infoMessage,
  showNewRequestSuggestion,
  onTriggerNewRequest,
}: ChatModalProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-white rounded-3xl w-full max-w-[460px] overflow-hidden flex flex-col shadow-2xl relative z-10 animate-scale-up h-[85vh] sm:h-[600px]">

        {/* Header */}
        <div className="bg-white px-4 sm:px-6 py-4 flex items-center gap-3 border-b border-gray-150 shrink-0">
          <div className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
            <FiUser size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] sm:text-[16px] font-bold text-gray-900 truncate">{chatTitle}</h2>
          </div>
          {/* {onTriggerNewRequest && (
            <button
              type="button"
              onClick={onTriggerNewRequest}
              className="px-3.5 py-1.5 bg-[#D12031] hover:bg-[#a81828] text-white font-extrabold text-[11px] rounded-lg transition-colors shadow-sm cursor-pointer border-none shrink-0 mr-1.5"
            >
              New Request
            </button>
          )} */}
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 custom-scrollbar">
          {messages.map((msg) => {
            const isNoticeMsg = msg.isNotice || msg.text.includes("NOTICE & NOTIFY APPLIED");
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2.5 ${msg.isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
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
                    <span className="text-[9px] text-gray-400 font-black mb-1 px-1">
                      {msg.senderName} {msg.role ? `(${msg.role})` : ""}
                    </span>
                  )}
                  {isNoticeMsg ? (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm text-gray-800 w-full font-sans my-0.5 space-y-2.5 relative overflow-hidden text-left">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-red-100/35 rounded-full blur-xl pointer-events-none" />

                      <div className="flex items-center gap-1.5 pb-2 border-b border-red-100/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D12031] animate-pulse" />
                        <span className="text-[11px] font-bold text-gray-900">
                          Notice &amp; Notify Observation
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10.5px] font-medium text-gray-500">
                        <div>
                          <p className="text-[8.5px] uppercase tracking-wider text-gray-400 font-bold">Notice Type</p>
                          <p className="text-gray-800 mt-0.5">{msg.text.match(/Type:\s*([^\n]+)/)?.[1] || "Maintenance Issue"}</p>
                        </div>
                        <div>
                          <p className="text-[8.5px] uppercase tracking-wider text-gray-400 font-bold">Priority Level</p>
                          <p className="text-[#D12031] mt-0.5 font-extrabold">{msg.text.match(/Priority:\s*([^\n]+)/)?.[1] || "High"}</p>
                        </div>
                        <div>
                          <p className="text-[8.5px] uppercase tracking-wider text-gray-400 font-bold">Action Required</p>
                          <p className="text-gray-800 mt-0.5">{msg.text.match(/Action Required:\s*([^\n]+)/)?.[1] || "Yes"}</p>
                        </div>
                        <div>
                          <p className="text-[8.5px] uppercase tracking-wider text-gray-400 font-bold">Technician</p>
                          <p className="text-gray-800 mt-0.5">Karl Smith</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-red-100/50">
                        <p className="text-[8.5px] uppercase tracking-wider text-gray-400 font-bold">Detailed Description</p>
                        <p className="text-[11.5px] font-semibold text-gray-700 mt-1 leading-relaxed">
                          {msg.text.match(/Description:\s*([^\n\r]+(?:\r?\n(?!\s*(?:Priority|Action|Type|Please))[^\n\r]+)*)/)?.[1] ||
                            "HVAC compressor has a severe leak and pressure drop."}
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-red-100/50">
                        {[
                          { name: "Warehouse_Map.png", img: "/images/warehouse_map.svg" },
                          { name: "Site.jpg", img: "/images/warehouse_map.svg" }
                        ].map((file, i) => (
                          <div key={i} className="relative w-14 h-10 rounded-lg overflow-hidden border border-red-200/50 bg-white">
                            <Image src={file.img} alt="Evidence" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
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
                  <span className="text-[9px] text-gray-400 mt-1 px-1 font-bold">
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Banner */}
        {showNewRequestSuggestion && onTriggerNewRequest && (
          <div className="bg-red-50 border-t border-b border-red-100 px-4 py-3.5 flex items-center justify-between gap-3 shrink-0">
            <div className="flex-1">
              <p className="text-[12.5px] font-bold text-gray-800">
                Notice &amp; Notify Applied
              </p>
              <p className="text-[10.5px] font-medium text-gray-500 mt-0.5">
                The technician raised a maintenance notice. Create a new request to schedule repairs.
              </p>
            </div>
            <button
              type="button"
              onClick={onTriggerNewRequest}
              className="px-3.5 py-1.5 bg-[#D12031] hover:bg-[#a81828] text-white font-extrabold text-[11px] rounded-lg transition-colors shadow-xs cursor-pointer border-none shrink-0"
            >
              Create Request
            </button>
          </div>
        )}

        {/* Footer Input */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-5 bg-white border-t border-gray-150 shrink-0">
          <div className="relative flex items-center bg-gray-50 border border-gray-250 rounded-2xl px-4 py-2 focus-within:bg-white focus-within:border-[#D12031] transition-all">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a Message..."
              className="flex-1 text-[13px] text-gray-800 outline-none bg-transparent placeholder-gray-400 font-semibold"
            />
            <div className="flex items-center gap-1.5 ml-2">
              <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent">
                <FiPaperclip size={18} />
              </button>
              <button
                type="submit"
                className="w-10 h-10 bg-[#D12031] hover:bg-[#a81828] text-white rounded-xl flex items-center justify-center shrink-0 cursor-pointer border-none transition-colors shadow-sm"
              >
                <FiSend size={16} />
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
