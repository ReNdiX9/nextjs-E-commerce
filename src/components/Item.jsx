// src/components/Item.jsx
"use client";

import { useRouter } from "next/navigation";
import { FaRegTrashAlt } from "react-icons/fa";
import FavoriteButton from "@/components/FavoriteButton";

export default function Item({ _id, title, price, category, condition, images, onDelete, showFavorite = true }) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

  const detailsUrl = `/products/${_id}-${slug}`;
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

  // Pass the full product object with _id for MongoDB
  const product = {
    _id: _id,
    id: _id,
    title,
    category,
    condition,
    images: images,
    price,
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="rounded-xl border border-card-border bg-card-bg p-3 shadow-sm transition hover:shadow-lg w-60 cursor-pointer"
      title={title}
    >
      {/* Image  */}
      <div className="rounded-lg bg-card-border flex items-center justify-center h-40 ">
        <img
          src={Array.isArray(images) ? images[0] : images}
          alt={title}
          className="object-cover h-full w-full rounded-lg"
        />
      </div>

      {/* Content of the card*/}
      <div className="mt-1">
        {/*Title*/}
        <h3 className="text-lg font-bold">
          <span className="block truncate text-text-primary">{title}</span>
        </h3>
        {/*Category*/}
        <p className=" text-sm text-text-secondary">{category}</p>
        {/* Condition */}
        <p className="text-sm text-text-secondary capitalize">
          <span>{condition}</span>
        </p>

        {/*Price and buttons*/}
        <div className="mt-1 flex items-center">
          <div className="flex items-center justify-between  w-full">
            <p className="text-sm  font-semibold select-none">${price?.toFixed(2) || "0.00"}</p>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {showFavorite && <FavoriteButton product={product} />}
              {onDelete && (
                <button
                  onClick={() => onDelete(_id)}
                  className="rounded-md border border-card-border bg-card-bg px-3 py-1 text-text-secondary hover:bg-red-50 hover:border-red-400 hover:text-red-600 dark:hover:bg-card-bg dark:hover:border-red-700 dark:hover:text-red-400 active:translate-y-px transition-all cursor-pointer"
                  title="Remove from favorites"
                  aria-label="Remove from favorites"
                >
                  <FaRegTrashAlt />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
