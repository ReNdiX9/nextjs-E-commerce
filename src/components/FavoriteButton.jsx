// app/product/[id]/FavoriteButton.jsx
"use client";

import { useState, useEffect } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";

const LS_KEY = "favorites";

function readFavorites() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    // keep only objects with a non-null id
    return Array.isArray(parsed) ? parsed.filter((p) => p && typeof p === "object" && "id" in p && p.id != null) : [];
  } catch {
    return [];
  }
}

function writeFavorites(items) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
}

export default function FavoriteButton({ product }) {
  const [ready, setReady] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // if product is missing, just mark not favorite
    if (!product || product.id == null) {
      setIsFavorite(false);
      setReady(true);
      return;
    }
    const items = readFavorites();
    setIsFavorite(items.some((p) => p.id === product.id));
    setReady(true);
  }, [product?.id]);

  const toggleFavorite = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!product || product.id == null) return;

    const items = readFavorites();
    const exists = items.some((p) => p.id === product.id);

    let next;
    if (exists) {
      next = items.filter((p) => p.id !== product.id);
      setIsFavorite(false);
    } else {
      // store only what you need
      const { id, title, price, image } = product;
      next = [...items, { id, title, price, image }];
      setIsFavorite(true);
    }
    writeFavorites(next);
  };

  return (
    <button
      title="Add to Favorites"
      type="button"
      onClick={toggleFavorite}
      disabled={!ready}
      className="rounded-lg bg-black p-3 text-md  h-10 w-10 text-white transition hover:opacity-90 active:translate-y-px cursor-pointer "
    >
      {isFavorite ? <FaStar className="text-yellow-400" /> : <FaRegStar />}
    </button>
  );
}
