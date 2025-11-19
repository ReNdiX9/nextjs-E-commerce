"use client";

import { useState } from "react";
import { unblockProducts } from "@/actions/userAddBlockActions";

export default function BlockedProductsList({ products: initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [loadingId, setLoadingId] = useState(null);

  const handleUnblock = async (productId, sellerId) => {
    setLoadingId(productId);
    try {
      const result = await unblockProducts(productId, sellerId);

      if (result.success) {
        // Remove from list
        setProducts((prev) => prev.filter((p) => p.productId !== productId));
      } else if (result.error) {
      }
    } catch (error) {
      console.error("Error unblocking product:", error);
    } finally {
      setLoadingId(null);
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary text-lg">No blocked products</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-card-border">
      <table className="w-full bg-card-bg">
        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-card-border">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">ID</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
              User ID
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
              Product ID
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
              Blocked At
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-card-border">
          {products.map((product) => (
            <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
              {/* _id */}
              <td className="px-6 py-4">
                <code className="text-xs text-text-secondary bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {product._id}
                </code>
              </td>

              {/* userId */}
              <td className="px-6 py-4">
                <code className="text-xs text-text-secondary bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {product.userId}
                </code>
              </td>
              {/* sellerId */}
              <td className="px-6 py-4">
                <code className="text-xs text-text-secondary bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {product.sellerId}
                </code>
              </td>

              {/* productId */}
              <td className="px-6 py-4">
                <code className="text-xs text-text-secondary bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {product.productId}
                </code>
              </td>

              {/* blockedAt */}
              <td className="px-6 py-4">
                <p className="text-sm text-text-secondary">
                  {new Date(product.blockedAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </td>

              {/* Action */}
              <td className="px-6 py-4">
                <button
                  onClick={() => handleUnblock(product.productId, product.sellerId)}
                  disabled={loadingId === product.productId}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {loadingId === product.productId ? "Unblocking..." : "Unblock"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
//TODO finish diplaying sellerid in the list
