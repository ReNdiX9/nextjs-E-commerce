"use client";

import React from "react";
import RatingStars from "./RatingStars";

export default function ReviewList({ meta = { average: 0, count: 0 }, reviews = [] }) {
    return (
        <div className="mt-6 border-t border-card-border pt-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold">{(meta.average || 0).toFixed(1)}</div>
                    <div className="text-xs text-text-secondary">out of 5</div>
                    <div>
                        <RatingStars value={Math.round(meta.average || 0)} size={18} editable={false} />
                    </div>
                </div>
                <div className="text-sm text-text-secondary">{meta.count || 0} review{(meta.count || 0) !== 1 ? "s" : ""}</div>
            </div>

            <div className="space-y-4">
                {reviews.length === 0 && <div className="text-text-secondary">No reviews yet — be the first to review this product.</div>}

                {reviews.map((r) => (
                    <div key={r._id} className="border rounded-md p-4 bg-card-bg border-card-border">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="font-semibold text-text-primary">{r.userName || "Anonymous"}</div>
                                <div className="text-xs text-text-secondary">{new Date(r.createdAt).toLocaleDateString()}</div>
                            </div>
                            <RatingStars value={Math.round(r.rating)} size={14} />
                        </div>
                        {r.title && <div className="text-sm font-semibold mb-2">{r.title}</div>}
                        {r.text && <div className="text-text-secondary whitespace-pre-wrap">{r.text}</div>}
                    </div>
                ))}
            </div>
        </div>
    );
}
