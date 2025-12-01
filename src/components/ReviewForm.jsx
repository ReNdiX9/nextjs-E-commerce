"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import RatingStars from "./RatingStars";

export default function ReviewForm({ productId, onSaved }) {
    const { user } = useUser();

    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!user) return toast.error("Please sign in to leave a review");

        setLoading(true);
        try {
            const res = await fetch(`/api/products/${productId}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, title, text, userName: user?.fullName || user?.firstName || user?.email }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to save review");
            toast.success("Review saved");
            setTitle("");
            setText("");
            if (onSaved) onSaved();
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to save review");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} className="mt-6 border-t border-card-border pt-6">
            <h3 className="text-lg font-semibold mb-2">Leave a review</h3>

            <div className="flex items-center gap-3 mb-3">
                <RatingStars value={rating} editable onChange={(v) => setRating(v)} />
                <div className="text-sm text-text-secondary">{rating} / 5</div>
            </div>

            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summary (optional)"
                className="w-full border rounded-md p-2 mb-3 bg-card-bg border-card-border"
            />

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write your review (e.g., what worked, what didn't)."
                rows={4}
                className="w-full border rounded-md p-2 mb-3 bg-card-bg border-card-border"
            />

            <div className="flex gap-2">
                <button
                    disabled={loading}
                    type="submit"
                    className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
                >
                    {loading ? "Saving..." : "Submit review"}
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setRating(5);
                        setTitle("");
                        setText("");
                    }}
                    className="px-4 py-2 rounded-md border border-card-border text-text-secondary"
                >
                    Reset
                </button>
            </div>
        </form>
    );
}
