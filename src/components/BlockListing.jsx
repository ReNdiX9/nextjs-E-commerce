"use client";

import { MdBlock, MdCheckCircle } from "react-icons/md";
import { useState } from "react";
import { blockProduct, unblockProduct } from "@/actions/userAddBlockActions";
import { useRouter } from "next/navigation";

export default function BlockListingButton({ productId, initialBlocked = false }) {
  const [isBlocked, setIsBlocked] = useState(initialBlocked);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggleBlock = async () => {
    setIsLoading(true);
    try {
      const result = isBlocked ? await unblockProduct(productId) : await blockProduct(productId);

      if (result.error) {
        return;
      } else {
        setIsBlocked(!isBlocked);
        //redirect home
        if (!isBlocked) {
          setTimeout(() => {
            router.replace("/");
          }, 1000);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleBlock}
      disabled={isLoading}
      title={isBlocked ? "Remove from blocked" : "Block listing"}
      type="button"
      className={`
        group relative h-10 w-10 rounded-lg
        transition-all duration-300 ease-out
        ${
          isBlocked
            ? "bg-red-50 dark:bg-red-950/30 border-2 border-red-500 text-red-600 dark:text-red-400 shadow-sm shadow-red-500/20"
            : "bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-300 dark:hover:border-red-800 hover:text-red-500"
        }
        ${isLoading ? "opacity-70" : "hover:scale-105 active:scale-95"}
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center
        backdrop-blur-sm
      `}
    >
      {/* Loading spinner or icon */}
      {isLoading ? (
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
//TODO finish unblock functionality
