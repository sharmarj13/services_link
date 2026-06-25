"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiPaperclip, FiSend, FiUser, FiX } from "react-icons/fi";

export interface ChatMessage {
  id: string | number;
  text: string;
  time: string;
  senderName: string;
  initials: string;
  isCurrentUser: boolean;
  role?: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatTitle: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  infoMessage?: string; // Optional banner text (like in Admin chat)
}

export default function ChatModal({ isOpen, onClose, chatTitle, messages, onSendMessage, infoMessage }: ChatModalProps) {
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
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${msg.isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8.5 h-8.5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${
                  msg.isCurrentUser
                    ? "bg-[#D12031] text-white border-red-200"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                {msg.initials}
              </div>

              {/* Bubble Body */}
              <div className={`flex flex-col ${msg.isCurrentUser ? "items-end" : "items-start"} max-w-[75%]`}>
                {msg.senderName && (
                  <span className="text-[9px] text-gray-400 font-black mb-1 px-1">
                    {msg.senderName} {msg.role ? `(${msg.role})` : ""}
                  </span>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-[13.5px] font-medium leading-relaxed ${
                    msg.isCurrentUser
                      ? "bg-[#D12031] text-white rounded-br-none shadow-sm"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-xs"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 px-1 font-bold">
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

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
