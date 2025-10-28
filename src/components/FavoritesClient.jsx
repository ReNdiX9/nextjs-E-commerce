// app/(app)/favorites/FavoritesClient.js
"use client";

import { useState } from "react";
import Link from "next/link";
import Item from "@/components/Item";

export default function FavoritesClient({ initialItems }) {
  const [items, setItems] = useState(initialItems);
  const [isDeleting, setIsDeleting] = useState(false);

  const remove = async (id) => {
    if (isDeleting) return;

    // Store original items
    const originalItems = [...items];

    setItems((prev) => prev.filter((item) => item._id !== id));
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/myfavorites/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove favorite");
      }

      console.log("Removed from favorites");
    } catch (error) {
      console.error("Error removing favorite:", error);
      setItems(originalItems);
      console.log("Failed to remove item. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <main className={`${items.length ? "w-fit" : "max-w-4xl"} mx-auto px-4 py-8`}>
        {items.length === 0 ? (
          <div className="bg-card-bg rounded-2xl shadow-md border border-card-border p-6 md:p-8">
            <h1 className="text-3xl font-bold text-text-primary mb-6">My Favorites</h1>
            <div className="text-center py-12">
              <h1 className="text-text-secondary text-lg mb-2">No favorites yet</h1>
              <p className="text-text-secondary text-sm mb-6">Start by starring your favorite items!</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-text-primary text-background rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                Browse Items
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-text-primary mb-6">My Favorites</h1>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 grid-cols-1">
              {items.map((item) => (
                <Item
                  key={item._id}
                  _id={item._id}
                  title={item.title}
                  category={item.category}
                  images={item.images}
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
