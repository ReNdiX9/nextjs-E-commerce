"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const LS_KEY = "settings";

export default function Settings() {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === LS_KEY) {
        try {
          setItems(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {
          setItems([]);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!ready) {
    return <div className="p-4 text-text-primary">Loading settings…</div>;
  }

  return (
    <div className="bg-background min-h-screen w-full">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card-bg rounded-lg shadow-sm border border-card-border p-6 mt-4">
          <h2 className="text-2xl font-bold mb-6 text-text-primary text-center">Account Settings</h2>

          <div className="space-y-6">
            {/* Profile Section */}
            <div className="space-y-6">
              <div className="text-center space-x-4">
                <Link
                  href="/settings/profile"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-text-primary text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  👤 View Full Profile
                </Link>

                <Link
                  href="/order-history"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card-bg text-text-primary border border-card-border rounded-lg hover:bg-text-primary hover:text-background transition-colors font-medium"
                >
                  📦 Order History
                </Link>
              </div>

              <Separator />

              <div className="text-center">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-20 h-20",
                    },
                  }}
                />
                <p className="mt-2 text-text-secondary">Click to manage your profile</p>
              </div>
            </div>

            <Separator />

            {/* Settings Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/settings/blocked"
                className="flex items-center gap-3 p-4 border border-card-border rounded-lg hover:bg-card-bg transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  🔒
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Blocked Items</h3>
                  <p className="text-sm text-text-secondary">List of items you have blocked</p>
                </div>
              </Link>

              <Link
                href={`/settings/notifications`}
                className="flex items-center gap-3 p-4 border border-card-border rounded-lg hover:bg-card-bg transition-colors"
              >
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
                  🔔
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Notifications</h3>
                  <p className="text-sm text-text-secondary">Check your notifications here</p>
                </div>
              </Link>

              <Link
                href="/settings/preferences"
                className="flex items-center gap-3 p-4 border border-card-border rounded-lg hover:bg-card-bg transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  ⚙️
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Preferences</h3>
                  <p className="text-sm text-text-secondary">Theme and account actions</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
