import { MdBlock } from "react-icons/md";
import { useState } from "react";

export default function BlockListingButton({ product }) {
  const [isBlocked, setIsBlocked] = useState(false);
  return (
    <button
      onClick={() => setIsBlocked((blocked) => !blocked)}
      title={isBlocked ? `Remove from blocked` : `Block listing`}
      type="button"
      className={`rounded-lg ${
        isBlocked ? "border-red-600" : "border-black"
      }  border-2 text-md h-10 w-10 text-white transition hover:opacity-90 active:translate-y-px cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
    >
      <MdBlock className={isBlocked ? ` text-red-600` : `text-black`} size={24} />
    </button>
  );
}
