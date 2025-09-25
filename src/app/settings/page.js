"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { UserButton } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
import Footer from "@/components/Footer";
import Link from "next/link";
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
    } catch { }
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

  // used AI to fix the UI 
  return (
    <div className="bg-background min-h-screen w-screen">
      <Header />

      <main className="p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card-bg rounded-lg shadow-sm border border-card-border p-6">
            <h2 className="text-2xl font-bold mb-6 text-text-primary text-center">Account Settings</h2>

            {/* Navigation to Profile */}
            <div className="mb-6 text-center">
              <Link 
                href="/settings/profile"
                className="inline-flex items-center gap-2 px-4 py-2 bg-text-primary text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                👤 View Profile
              </Link>
            </div>

            <div className="space-y-6">
              {/* Email Update Section */}
              <div className="border-b border-card-border pb-6">
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

              {/* Password Update Section */}
              <div className="border-b border-card-border pb-6">
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


              {/* Sign Out Section */}
              <div className="text-center">
                <button
                  onClick={() => signOut()}
                  className="text-sm text-red-500 hover:text-red-700 underline transition-colors"
                >
                  Sign Out
                </button>
              </div>

              {/* Message Display */}
              {message && (
                <div className="text-center">
                  <p className={`text-sm mt-4 px-4 py-2 rounded-md ${
                    message.includes('Error') || message.includes('error') 
                      ? 'text-red-600 bg-red-50 border border-red-200' 
                      : 'text-green-600 bg-green-50 border border-green-200'
                  }`}>
                    {message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
        <Footer />
    </div>
    
  );
}