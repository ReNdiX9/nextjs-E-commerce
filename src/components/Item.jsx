// src/components/Item.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaRegStar, FaStar } from "react-icons/fa";
import FavoriteButton from "@/app/product/[id]/FavoriteButton";

export default function Item({ id, title, category, image, price, onAddToCart, detailsHref }) {
  const detailsUrl = detailsHref ?? (id ? `/product/${id}` : "#");
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const handleCardClick = () => {
    if (detailsUrl) router.push(detailsUrl);
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === " ") && detailsUrl) {
      e.preventDefault();
      router.push(detailsUrl);
    }
  };

  const product = { id, title, category, image, price };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm transition hover:shadow-lg w-60 cursor-pointer"
      title={title}
    >
      {/* Picture */}
      <div className="rounded-lg bg-neutral-100  flex items-center justify-center h-40">
        <img src={image} alt={title} className=" object-contain" width={80} />
      </div>

      {/* Title / meta */}
      <div className="mt-3">
        <h3 className="text-base font-semibold ">
          <span className="block truncate text-black">{title}</span>
        </h3>

        {category && <p className="mt-1 text-sm text-neutral-500">{category}</p>}

        <div className="mt-3 flex items-center ">
          <div className="flex items-center justify-center gap-20 w-full">
            <p className="text-xs  text-neutral-500 font-semibold select-none">${price}</p>
            <FavoriteButton product={product} />
          </div>
        </div>
      </div>
    </article>
  );
}
