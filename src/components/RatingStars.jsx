"use client";

import React from "react";
import { Star } from "lucide-react";

export default function RatingStars({ value = 0, size = 18, editable = false, onChange }) {
    const handleClick = (i) => {
        if (!editable || !onChange) return;
        onChange(i);
    };

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
                <button
                    key={i}
                    type="button"
                    aria-label={`${i} star`}
                    onClick={() => handleClick(i)}
                    className={`p-1 rounded-md hover:bg-muted transition-colors ${editable ? "cursor-pointer" : "cursor-default"}`}
                >
                    <Star size={size} className={i <= value ? "text-yellow-400" : "text-gray-300"} />
                </button>
            ))}
        </div>
    );
}
