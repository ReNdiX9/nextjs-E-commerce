"use client";

import { useState } from "react";

export default function Notifications() {
  const [notifications, setNotifications] = useState(["notification one", "notification two"]);

  return (
    <div>
      <h1 className="font-medium text-3xl text-left">Notifications</h1>
      <ul className="flex gap-2 flex-col">
        {notifications.map((n) => (
          <div className="border p-4 w-160 rounded " key={n}>
            <li className="border p-4 w-">{n}</li>
          </div>
        ))}
      </ul>
    </div>
  );
}
