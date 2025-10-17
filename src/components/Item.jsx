// src/components/Item.jsx
"use client";

import { useRouter } from "next/navigation";
import { FaRegTrashAlt } from "react-icons/fa";
import FavoriteButton from "@/components/FavoriteButton";

export default function Item({
  id,
  _id,
  title,
  category,
  image,
  images,
  price,
  detailsHref,
  onDelete,
  showFavorite = true,
}) {
  // Handle both id and _id
  const productId = _id || id;
  const productImage = images?.[0] || image;

  const detailsUrl = detailsHref ?? (productId ? `/product/${productId}` : "#");
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
    _id: productId,
    id: productId,
    title,
    category,
    image: productImage,
    images: images || [image],
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
      {/* Picture for now later pictures */}
      <div className="rounded-lg bg-card-border flex items-center justify-center h-40">
        <img src={productImage} alt={title} className="object-contain" width={80} />
      </div>

      {/* Title / meta */}
      <div className="mt-3">
        <h3 className="text-base font-semibold">
          <span className="block truncate text-text-primary">{title}</span>
        </h3>

        {category && <p className="mt-1 text-sm text-text-secondary">{category}</p>}

        <div className="mt-3 flex items-center">
          <div className="flex items-center justify-center gap-20 w-full">
            <p className="text-xs text-text-secondary font-semibold select-none">${price?.toFixed(2) || "0.00"}</p>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {showFavorite && <FavoriteButton product={product} />}
              {onDelete && (
                <button
                  onClick={() => onDelete(productId)}
                  className="rounded-md border border-card-border px-3 py-1 text-text-secondary hover:opacity-90 active:translate-y-px transition-all cursor-pointer"
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
