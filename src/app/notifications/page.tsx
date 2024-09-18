"use client";

import moment from "moment";
import { useNotificationContext } from "../providers/notification-provider";
import { useAppContext } from "../providers/app-provider";
import Link from "next/link";

export default function NotificationsPage() {
  const { notifications, markNotificationAsRead } = useNotificationContext();
  return (
    <div>
      <div className="mt-10 mb-3 text-center font-bold text-2xl relative">
        Notifications
      </div>
      <p className="text-center mb-10">
        <Link href="/rooms" className="underline hover:opacity-50">
          Rooms
        </Link>
      </p>

      {notifications.length > 0 && (
        <div>
          {notifications.filter((noti) => !noti?.isRead).length > 0 && (
            <p className="flex justify-end mb-2">
              <span
                className="text-sm font-bold cursor-pointer"
                onClick={() => {
                  if (markNotificationAsRead) {
                    markNotificationAsRead("", true);
                  }
                }}
              >
                Mark all as read
              </span>
            </p>
          )}
          <div className="flex flex-col min-w-72 w-full py-2 gap-4">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`${
                  !notification?.isRead && "bg-gray-100 hover:bg-white"
                } cursor-pointer p-4 border border-gray-200 rounded-md`}
              >
                <div
                  className={`flex justify-between gap-5`}
                  onClick={() => {
                    if (!notification.isRead && markNotificationAsRead) {
                      markNotificationAsRead(notification.id, false);
                    }
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <div className="text-base font-bold line-clamp-2">
                      {notification.title}
                    </div>
                    <div className="text-sm">{notification.body}</div>
                  </div>
                  <div className="text-sm line-clamp-2">
                    {moment(new Date(notification.createdAt)).fromNow()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
