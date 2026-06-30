"use client";

import React, { useState } from "react";
import CustomerLayout from "@/components/CustomerLayout";
import { FiTool, FiCheck } from "react-icons/fi";

const UNREAD_NOTIFICATIONS = [
  {
    id: 1,
    type: "assigned",
    title: "Technician Dispatched",
    description: "James Doe is assigned to fix your HVAC Compressor Maintenance request.",
    time: "2 mins ago"
  },
  {
    id: 2,
    type: "completed",
    title: "Request Completed",
    description: "Safety Routine Inspection in main hall has been completed.",
    time: "1 hour ago"
  }
];

const READ_NOTIFICATIONS = [
  {
    id: 3,
    type: "assigned",
    title: "Job Request Confirmed",
    description: "Your maintenance request has been accepted by the operations desk.",
    time: "Yesterday"
  }
];

export default function CustomerNotificationsListPage() {
  const [unreadNotifs, setUnreadNotifs] = useState(UNREAD_NOTIFICATIONS);
  const [readNotifs, setReadNotifs] = useState(READ_NOTIFICATIONS);

  const markAsRead = (id: number) => {
    const notifToMove = unreadNotifs.find(n => n.id === id);
    if (notifToMove) {
      setUnreadNotifs(prev => prev.filter(n => n.id !== id));
      setReadNotifs(prev => [notifToMove, ...prev]);
    }
  };

  return (
    <CustomerLayout
      title="Notifications"
      subtitle="Manage your Notifications"
    >
      <div className="max-w-7xl pb-2">
        {/* Unread Section */}
        <div className="mb-8">
          <h3 className="text-[18px] font-bold text-gray-900 mb-4">Unread</h3>
          <div className="space-y-3">
            {unreadNotifs.length === 0 ? (
              <p className="text-gray-500 text-[14px] italic py-4">No unread notifications.</p>
            ) : (
              unreadNotifs.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-[#e4f7db] bg-[#f8fff4] shadow-sm transition-all hover:shadow-md cursor-pointer"
                >
                  <div className="shrink-0 bg-white rounded-full p-3 shadow-sm border border-gray-100 flex items-center justify-center w-12 h-12">
                    {notif.type === "assigned" ? (
                      <FiTool className="text-gray-400" size={20} />
                    ) : (
                      <FiCheck className="text-[#3ed13e]" size={22} strokeWidth={3} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-bold text-gray-900 truncate">{notif.title}</h4>
                    <p className="text-[13px] text-gray-600 mt-0.5 whitespace-normal break-words">{notif.description}</p>
                  </div>

                  <div className="shrink-0 text-[12px] font-medium text-gray-500">
                    {notif.time}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Read Section */}
        <div>
          <h3 className="text-[18px] font-bold text-gray-900 mb-4">Read</h3>
          <div className="space-y-3">
            {readNotifs.length === 0 ? (
              <p className="text-gray-500 text-[14px] italic py-4">No read notifications.</p>
            ) : (
              readNotifs.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-[#f4f5f7] shadow-sm transition-all hover:shadow-md cursor-pointer"
                >
                  <div className="shrink-0 bg-white rounded-full p-3 shadow-sm border border-gray-100 flex items-center justify-center w-12 h-12">
                    {notif.type === "assigned" ? (
                      <FiTool className="text-gray-400" size={20} />
                    ) : (
                      <FiCheck className="text-[#3ed13e]" size={22} strokeWidth={3} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-bold text-gray-900 truncate">{notif.title}</h4>
                    <p className="text-[13px] text-gray-600 mt-0.5 whitespace-normal break-words">{notif.description}</p>
                  </div>

                  <div className="shrink-0 text-[12px] font-medium text-gray-500">
                    {notif.time}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
