"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaRegTrashAlt } from "react-icons/fa";
import Header from "@/components/Header";

//key for local storage
const LS_KEY = "favorites";

export default function MyFavourites() {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState([]);

  //get array of items from local storage once page mounts
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

  //remove function by id(gives array of items where id's is not id argument)
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
    <div className="bg-background min-h-screen w-screen">
      <Header />

      <main className="p-4">
        {items.length === 0 ? (
          <>
            <h1 className="text-2xl font-bold mb-2 text-text-primary text-center">My Favorites</h1>
            <p className="mb-4 text-text-secondary text-center">Your favorite list is empty</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4 text-text-primary text-center">My Favourites</h1>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {items.map((p) => (
                <div key={p.id} className="rounded-xl border border-card-border bg-card-bg p-3 shadow-md">
                  <Link href={`/product/${p.id}`}>
                    <div className="relative aspect-square mb-2">
                      <Image src={p.image} alt={p.title} fill className="object-contain" unoptimized />
                    </div>
                    <h3 className="line-clamp-2 font-semibold mb-1 text-text-primary">{p.title}</h3>
                  </Link>

                  <div className="flex items-center justify-between px-1 mt-2">
                    <span className="font-semibold text-text-secondary">${p.price}</span>
                    <button
                      onClick={() => remove(p.id)}
                      className="rounded-md border border-card-border px-3 py-1 text-text-secondary hover:bg-card-bg cursor-pointer hover:opacity-90 active:translate-y-px transition-all"
                      title="Remove from favorites"
                    >
                      <FaRegTrashAlt />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
