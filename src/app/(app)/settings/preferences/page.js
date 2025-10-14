"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import ThemeToggle from "@/components/themetoggle";
import { Separator } from "@/components/ui/separator";

export default function PreferencesPage() {
  const [message, setMessage] = useState("");
  const { signOut } = useClerk();

  return (
    <div className="bg-background min-h-screen w-full">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card-bg rounded-lg shadow-sm border border-card-border p-6 mt-4">
          {/* Back to Settings */}
          <div className="mb-6">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              ← Back to Settings
            </Link>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-text-primary text-center">Preferences</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-text-primary text-center">Account Actions</h3>
              {/* Theme Toggle */}
              <div className="flex items-center justify-between mb-6">
                <p className="font-semibold">Application theme</p>
                <ThemeToggle />
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => signOut()}
                  className="w-full text-sm text-red-500 hover:text-red-700 underline transition-colors py-2"
                >
                  Sign Out
                </button>
              </div>
            </div>

            <Separator />

            {/* Message Display */}
            {message && (
              <div className="text-center">
                <p
                  className={`text-sm mt-4 px-4 py-2 rounded-md ${
                    message.includes("Error") || message.includes("error")
                      ? "text-red-600 bg-red-50 border border-red-200"
                      : "text-green-600 bg-green-50 border border-green-200"
                  }`}
                >
                  {message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
