"use client";

import { useEffect, useState } from "react";
import Item from "@/components/Item";

const LS_KEY = "favorites";

export default function MyFavourites() {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState([]);

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

  if (!ready) {
    return <div className="p-4 text-text-primary">Loading favorites…</div>;
  }

  return (
    <div className="bg-background min-h-screen">
      <main className={` ${items.length ? " w-fit" : "max-w-2xl"}   mx-auto px-4 py-6`}>
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
                <Item {...item} key={item.id} onDelete={remove} showFavorite={false} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
