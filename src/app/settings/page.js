"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaRegTrashAlt } from "react-icons/fa";
import Header from "@/components/Header";
import { UserProfile, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const LS_KEY = "settings";

export default function Settings() {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

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
    return <div className="p-4">Loading settings…</div>;
  }

  return (
    <div className="bg-white min-h-screen w-screen">
      <Header />

      <main className="p-4">
        <section className="max-w-md mx-auto mb-8">
          <h2 className="text-xl font-semibold mb-4 text-black text-center">Account Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700">New Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-md px-3 py-2 mt-1"
                placeholder="Enter new email"
              />
              <button
                onClick={handleUpdateEmail}
                className="mt-2 bg-black text-white px-4 py-2 rounded hover:opacity-90"
              >
                Update Email
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-md px-3 py-2 mt-1"
                placeholder="Enter new password"
              />
              <button
                onClick={handleUpdatePassword}
                className="mt-2 bg-black text-white px-4 py-2 rounded hover:opacity-90"
              >
                Update Password
              </button>
              <li>
                <UserButton />
              </li>
            </div>

            {message && <p className="text-center text-sm text-green-600 mt-4">{message}</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
