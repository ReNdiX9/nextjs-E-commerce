"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UserButton, useUser } from "@clerk/nextjs";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="bg-background min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-text-primary">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-background min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-text-primary">Please sign in</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Header />

      <main className="p-4">
        <div className="max-w-2xl mx-auto">
          {/* Profile Card */}
          <div className="bg-card-bg rounded-lg border border-card-border p-6">
            <div className="flex items-center gap-4">
              <UserButton />
              <div>
                <h1 className="text-xl font-bold text-text-primary">
                  {user.fullName || user.firstName || "User"}
                </h1>
                <p className="text-text-secondary">{user.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}