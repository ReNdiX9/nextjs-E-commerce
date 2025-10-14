"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function SecurityPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { signOut } = useClerk();

  const handleUpdateEmail = async () => {
    // TODO: Implement email update with Clerk
    setMessage("Email update feature coming soon!");
  };

  const handleUpdatePassword = async () => {
    // TODO: Implement password update with Clerk
    setMessage("Password update feature coming soon!");
  };

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

          <h2 className="text-2xl font-bold mb-6 text-text-primary text-center">Security Settings</h2>

          <div className="space-y-6">
            {/* Email Update Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-text-primary">Update Email</h3>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-text-primary">New Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-input-border rounded-md px-3 py-2 bg-input-bg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-text-primary focus:border-transparent"
                  placeholder="Enter new email"
                />
                <button
                  onClick={handleUpdateEmail}
                  className="w-full bg-text-primary text-background px-4 py-2 rounded-md hover:opacity-90 transition-opacity font-medium"
                >
                  Update Email
                </button>
              </div>
            </div>

            <Separator />

            {/* Password Update Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-text-primary">Update Password</h3>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-text-primary">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-input-border rounded-md px-3 py-2 bg-input-bg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-text-primary focus:border-transparent"
                  placeholder="Enter new password"
                />
                <button
                  onClick={handleUpdatePassword}
                  className="w-full bg-text-primary text-background px-4 py-2 rounded-md hover:opacity-90 transition-opacity font-medium"
                >
                  Update Password
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
