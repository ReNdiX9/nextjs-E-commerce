// src/components/Item.jsx
"use client";

import { useRouter } from "next/navigation";

import FavoriteButton from "@/components/FavoriteButton";

export default function Item({ id, title, category, image, price, detailsHref }) {
  const detailsUrl = detailsHref ?? (id ? `/product/${id}` : "#");
  const router = useRouter();
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
      className="rounded-xl border border-card-border bg-card-bg p-3 shadow-sm transition hover:shadow-lg w-60 cursor-pointer"
      title={title}
    >
      {/* Picture */}
      <div className="rounded-lg bg-card-border  flex items-center justify-center h-40">
        <img src={image} alt={title} className=" object-contain" width={80} />
      </div>

      {/* Title / meta */}
      <div className="mt-3">
        <h3 className="text-base font-semibold ">
          <span className="block truncate text-text-primary">{title}</span>
        </h3>

        {category && <p className="mt-1 text-sm text-text-secondary">{category}</p>}

        <div className="mt-3 flex items-center ">
          <div className="flex items-center justify-center gap-20 w-full">
            <p className="text-xs  text-text-secondary font-semibold select-none">${price}</p>
            <FavoriteButton product={product} />
          </div>
        </div>
      </div>
    </article>
  );
}
