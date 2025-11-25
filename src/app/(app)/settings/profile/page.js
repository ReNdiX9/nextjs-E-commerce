//"make  me a minmalist profile page with user stats and quick links to create listing, view listings, view favorites"
// this is ai generated code for now only
"use client";

import { useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { FaList, FaHeart, FaCalendarAlt } from "react-icons/fa";
import BlockedItems from "@/components/BlockedItems";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [userStats, setUserStats] = useState({
    listingsCount: 0,
    favoritesCount: 0,
    joinDate: null,
  });
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Load user statistics from localStorage
  useEffect(() => {
    if (isLoaded && user) {
      try {
        // Get listings count
        const userListings = localStorage.getItem("userListings");
        const listings = userListings ? JSON.parse(userListings) : [];

        // Get favorites count
        const favorites = localStorage.getItem("favorites");
        const favoriteItems = favorites ? JSON.parse(favorites) : [];

        // Get join date from user creation
        const joinDate = user.createdAt ? new Date(user.createdAt) : new Date();

        setUserStats({
          listingsCount: listings.length,
          favoritesCount: favoriteItems.length,
          joinDate: joinDate,
        });
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="bg-background min-h-screen w-screen">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-text-primary">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-background min-h-screen w-screen">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Please sign in</h1>
            <Link href="/signin" className="text-text-primary hover:underline">
              Sign in to view your profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen w-screen">
      <main className="p-4">
        <div className="max-w-2xl mx-auto">
          {/* Back to Settings */}
          <div className="mb-4">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              ← Back to Settings
            </Link>
          </div>

          {/* Profile Header Card */}
          <div className="bg-card-bg rounded-lg shadow-sm border border-card-border p-6 mb-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-24 h-24",
                  },
                }}
              />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">{user.fullName || user.firstName || "User"}</h1>
            <p className="text-text-secondary mb-2">{user.primaryEmailAddress?.emailAddress}</p>
            <div className="flex items-center justify-center gap-2 text-text-secondary">
              <FaCalendarAlt className="w-4 h-4" />
              <span>Joined {userStats.joinDate?.toLocaleDateString()}</span>
            </div>
          </div>

          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-card-bg rounded-lg shadow-sm border border-card-border p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <FaList className="w-8 h-8 text-text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-1">{userStats.listingsCount}</h3>
              <p className="text-text-secondary">Listings Created</p>
            </div>

            <div className="bg-card-bg rounded-lg shadow-sm border border-card-border p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <FaHeart className="w-8 h-8 text-text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-1">{userStats.favoritesCount}</h3>
              <p className="text-text-secondary">Favorites</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card-bg rounded-lg shadow-sm border border-card-border p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/createItem"
                className="flex items-center gap-3 p-4 border border-card-border rounded-lg hover:bg-card-bg transition-colors"
              >
                <FaList className="w-5 h-5 text-text-primary" />
                <div>
                  <h3 className="font-medium text-text-primary">Create Listing</h3>
                  <p className="text-sm text-text-secondary">Add a new item to sell</p>
                </div>
              </Link>

              <Link
                href="/mylistings"
                className="flex items-center gap-3 p-4 border border-card-border rounded-lg hover:bg-card-bg transition-colors"
              >
                <FaList className="w-5 h-5 text-text-primary" />
                <div>
                  <h3 className="font-medium text-text-primary">My Listings</h3>
                  <p className="text-sm text-text-secondary">View your items</p>
                </div>
              </Link>

              <Link
                href="/myfavorites"
                className="flex items-center gap-3 p-4 border border-card-border rounded-lg hover:bg-card-bg transition-colors"
              >
                <FaHeart className="w-5 h-5 text-text-primary" />
                <div>
                  <h3 className="font-medium text-text-primary">My Favorites</h3>
                  <p className="text-sm text-text-secondary">View saved items</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
