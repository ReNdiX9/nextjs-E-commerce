// components/BlockedProductsList.js
"use client";
// import BlockListingButton from "@/components/BlockListingButton";
import { useTransition, useState } from "react";
import { toggleBlockProduct } from "@/actions/userAddBlockActions";

export default function BlockedProductsList({ products }) {
  const [unblocking, startUnblock] = useTransition();
  const [blocked, setBlocked] = useState(products);

  async function handleUnblock(id) {
    startUnblock(async () => {
      const result = await toggleBlockProduct(id, true);
      if (result.success) {
        setBlocked((prev) => prev.filter((p) => p._id !== id));
      }
    });
  }

  if (!blocked.length) return <div>No blocked products.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {blocked.map((product) => (
        <div key={product._id} className="p-4 border rounded-lg flex items-center gap-4 bg-card-bg shadow">
          {/* Thumbnail */}
          <img
            src={product.images?.[0] || "/placeholder.jpg"}
            alt={product.title}
            className="w-20 h-20 object-cover rounded"
          />
          {/* Info */}
          <div className="flex-1">
            <div className="font-semibold">{product.title}</div>
            <div className="text-sm text-gray-500">${product.price?.toFixed(2)}</div>
            <div className="text-xs text-gray-400">
              {product.category} • {product.condition}
            </div>
          </div>
          {/* Unblock Button */}
          <button
            className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
            onClick={() => handleUnblock(product._id)}
            disabled={unblocking}
          >
            Unblock
          </button>
        </div>
      ))}
    </div>
  );
}
//TODO finish block show in settings
