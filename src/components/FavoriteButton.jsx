// src/components/FavoriteButton.jsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { FaRegStar, FaStar } from "react-icons/fa";

export default function FavoriteButton({ product }) {
  const { userId } = useAuth();
  const [ready, setReady] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!product || !product._id) {
        setIsFavorite(false);
        setReady(true);
        return;
      }

      if (!userId) {
        setIsFavorite(false);
        setReady(true);
        return;
      }

      try {
        const response = await fetch("/api/myfavorites");
        if (response.ok) {
          const favorites = await response.json();
          const isFav = favorites.some((fav) => fav._id === product._id);
          setIsFavorite(isFav);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      } finally {
        setReady(true);
      }
    };

    checkFavorite();
  }, [userId, product?._id]);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!product || !product._id) return;

    if (!userId) {
      toast.error("Please sign in to save favorites");
      return;
    }

    setReady(false);

    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/myfavorites/${product._id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to remove favorite");
        }

        setIsFavorite(false);
      } else {
        // Add to favorites
        const response = await fetch("/api/myfavorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId: product._id }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to add favorite");
        }

        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setReady(true);
    }
  };

  return (
    <button
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      type="button"
      onClick={toggleFavorite}
      disabled={!ready}
      className="rounded-lg bg-black p-3 text-md h-10 w-10 text-white transition hover:opacity-90 active:translate-y-px cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isFavorite ? <FaStar className="text-yellow-400" /> : <FaRegStar />}
    </button>
  );
}
