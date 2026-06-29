"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  read: boolean;
  createdAt: string;
  ticketId: string;
  ticket: { title: string };
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = await res.json();
    setNotifications(data.notifications);
    setUnreadCount(data.unreadCount);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full border border-black/10 px-3 py-1 text-sm dark:border-white/15"
      >
        Notificaciones
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 flex w-80 flex-col gap-2 rounded border border-black/10 bg-background p-3 shadow-lg dark:border-white/15">
          {notifications.length === 0 && (
            <p className="text-sm text-zinc-500">No hay notificaciones.</p>
          )}
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={`/tickets/${n.ticketId}`}
              onClick={() => !n.read && markRead(n.id)}
              className={`rounded p-2 text-sm hover:bg-black/[.03] dark:hover:bg-white/[.03] ${
                n.read ? "text-zinc-500" : "font-medium"
              }`}
            >
              {n.ticket.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
