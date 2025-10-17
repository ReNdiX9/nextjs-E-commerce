// app/(app)/favorites/page.js
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Item from "@/components/Item";

export default function MyFavourites() {
  const { userId } = useAuth();
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) {
        setReady(true);
        return;
      }

      try {
        const response = await fetch("/api/myfavorites");

        if (!response.ok) {
          throw new Error("Failed to fetch favorites");
        }

        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setReady(true);
      }
    };

    fetchFavorites();
  }, [userId]);

  const remove = async (id) => {
    try {
      const response = await fetch(`/api/myfavorites/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove favorite");
      }

      // Remove from local state
      setItems((prev) => prev.filter((item) => item._id !== id));
      console.log("Removed from favorites");
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  // If not logged in
  if (!userId) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Please sign in to view your favorites</h2>
          <Link href="/sign-in" className="text-text-secondary underline">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-text-primary text-lg">Loading favorites…</div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <main className={`${items.length ? "w-fit" : "max-w-2xl"} mx-auto px-4 py-6`}>
        {items.length === 0 ? (
          <div className="bg-card-bg rounded-lg shadow-sm border border-card-border p-6">
            <h1 className="text-2xl font-bold text-text-primary mb-6">My Favourites</h1>
            <div className="text-center py-8">
              <p className="text-text-secondary text-lg">No items yet</p>
              <p className="text-text-secondary text-sm mt-2">Start by starring your favorite item!</p>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4 text-text-primary text-center">My Favourites</h1>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 grid-cols-1">
              {items.map((item) => (
                <Item
                  key={item._id}
                  id={item._id}
                  title={item.title}
                  category={item.category}
                  image={item.images?.[0] || item.image}
                  price={item.price}
                  onDelete={remove}
                  showFavorite={false}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
