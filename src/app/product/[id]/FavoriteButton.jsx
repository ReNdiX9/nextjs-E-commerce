// app/product/[id]/FavoriteButton.jsx
"use client";

import { useState, useEffect } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";

const LS_KEY = "favorites";

export default function FavoriteButton({ product }) {
  const [ready, setReady] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const items = raw ? JSON.parse(raw) : [];
      setIsFavorite(items.some((p) => p.id === product.id));
    } catch {
      setIsFavorite(false);
    } finally {
      setReady(true);
    }
  }, [product?.id]);

  const toggleFavorite = (e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const raw = localStorage.getItem(LS_KEY);
      const items = raw ? JSON.parse(raw) : [];

      const exists = items.some((p) => p.id === product.id);
      let next;

      if (exists) {
        next = items.filter((p) => p.id !== product.id);
        setIsFavorite(false);
      } else {
        next = [...items, product];
        setIsFavorite(true);
      }

      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("Failed to toggle favorite", e);
    }
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
