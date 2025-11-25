"use client";

import { MdBlock, MdCheckCircle } from "react-icons/md";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { blockProduct, isProductBlocked, unblockProducts } from "@/actions/userAddBlockActions";

export default function BlockListingButton({ productId, sellerId }) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Check if product is blocked on mount
  useEffect(() => {
    async function checkBlockStatus() {
      try {
        const blocked = await isProductBlocked(productId, sellerId);
        setIsBlocked(blocked);
      } catch (error) {
        console.error("Error checking block status:", error);
      }
    }

    checkBlockStatus();
  }, [productId]);

  const handleToggleBlock = async () => {
    setIsProcessing(true);
    try {
      let result;

      if (isBlocked) {
        // Unblock the product
        result = await unblockProducts(productId, sellerId);
        if (result.success) {
          setIsBlocked(false);
        }
      } else {
        // Block the product
        result = await blockProduct(productId, sellerId);
        if (result.success) {
          setIsBlocked(true);

          // Redirect home after blocking
          setTimeout(() => router.replace("/"), 1000);
        }
      }
    } catch (error) {
      console.error("Toggle block error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleToggleBlock}
      disabled={isProcessing}
      title={isBlocked ? "Remove from blocked" : "Block listing"}
      type="button"
      className={`cursor-pointer
        group relative h-10 w-10 rounded-lg
        transition-all duration-300 ease-out
        ${
          isBlocked
            ? "bg-red-50 dark:bg-red-950/30 border-2 border-red-500 text-red-600 dark:text-red-400 shadow-sm shadow-red-500/20"
            : "bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-300 dark:hover:border-red-800 hover:text-red-500"
        }
        ${isProcessing ? "opacity-70" : "hover:scale-105 active:scale-95"}
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center
        backdrop-blur-sm
      `}
    >
      {isProcessing ? (
        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        <div className="relative">
          <MdBlock
            size={18}
            className={`transition-transform duration-300 ${isBlocked ? "scale-110" : "group-hover:scale-110"}`}
          />
          {isBlocked && (
            <div className="absolute -top-1 -right-1">
              <MdCheckCircle size={10} className="text-red-500" />
            </div>
          )}
        </div>
      )}
    </button>
  );
}
