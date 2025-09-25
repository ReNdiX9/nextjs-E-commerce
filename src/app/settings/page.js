"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaRegTrashAlt } from "react-icons/fa";
import Header from "@/components/Header";
import { UserProfile, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";

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
    const { error } = await supabase.auth.updateUser({ email });
    if (error) {
      setMessage(`Error updating email: ${error.message}`);
    } else {
      setMessage("Email updated successfully!");
    }
  };

  const handleUpdatePassword = async () => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(`Error updating password: ${error.message}`);
    } else {
      setMessage("Password updated successfully!");
    }
  };

  if (!ready) {
    return <div className="p-4 text-text-primary">Loading settings…</div>;
  }

  return (
    <div className="bg-background min-h-screen w-screen">
      <Header />

      <main className="p-4">
        <section className="max-w-md mx-auto mb-8">
          <h2 className="text-xl font-semibold mb-4 text-text-primary text-center">Account Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary">New Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-input-border rounded-md px-3 py-2 mt-1 bg-input-bg text-text-primary"
                placeholder="Enter new email"
              />
              <button
                onClick={handleUpdateEmail}
                className="mt-2 bg-text-primary text-background px-4 py-2 rounded hover:opacity-90"
              >
                Update Email
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-input-border rounded-md px-3 py-2 mt-1 bg-input-bg text-text-primary"
                placeholder="Enter new password"
              />
              <button
                onClick={handleUpdatePassword}
                className="mt-2 bg-text-primary text-background px-4 py-2 rounded hover:opacity-90"
              >
                Update Password
              </button>

              <li>
                <UserButton />
              </li>

              {/* ✅ Sign Out Button */}
              <button
                onClick={() => signOut()}
                className="mt-4 text-sm text-red-500 underline hover:text-red-700"
              >
                Sign Out
              </button>
            </div>

            {message && <p className="text-center text-sm text-green-600 mt-4">{message}</p>}
          </div>
        </section>
      </main>
    </div>
  );
}