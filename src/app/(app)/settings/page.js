"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
// used shadcn ui for tabs and separator tabslist and tabstrigger and tabscontent
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeToggle from "@/components/themetoggle";
import { Separator } from "@/components/ui/separator";
const LS_KEY = "settings";

export default function Settings() {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { signOut } = useClerk();

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

  const remove = (id) => {
    try {
      const next = items.filter((p) => p.id !== id);
      setItems(next);
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {}
  };

  const handleUpdateEmail = async () => {
    // TODO: Implement email update with Clerk
    setMessage("Email update feature coming soon!");
  };

  const handleUpdatePassword = async () => {
    // TODO: Implement password update with Clerk
    setMessage("Password update feature coming soon!");
  };

  if (!ready) {
    return <div className="p-4 text-text-primary">Loading settings…</div>;
  }

  return (
    <div className="bg-background min-h-screen w-full">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card-bg rounded-lg shadow-sm border border-card-border p-6 mt-4">
          <h2 className="text-2xl font-bold mb-6 text-text-primary text-center">Account Settings</h2>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
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
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-6">
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
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-text-primary text-center">Account Actions</h3>
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between">
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
