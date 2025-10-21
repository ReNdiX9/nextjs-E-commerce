// app/products/[id]/page.js
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import OfferActionsClient from "@/components/OfferActionsClient";
import ImageCarousel from "@/components/ImageCarousel";

export default function ItemPage() {
  const params = useParams();
  const router = useRouter();
  const { id: fullId } = params;
  const id = fullId.split("-")[0];

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);

        if (!res.ok) {
          throw new Error("Product not found");
        }

        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-primary">Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Product not found"}</p>
          <button onClick={() => router.push("/products")} className="text-text-secondary hover:text-text-primary">
            ← Back to products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Image Gallery */}
          {!product.images.length == 0 ? (
            <div className="rounded-2xl border border-card-border bg-card-bg p-6 shadow-md">
              <ImageCarousel images={product.images} title={product.title} />
            </div>
          ) : (
            <div className="w-full aspect-square rounded-xl bg-background flex items-center justify-center">
              <span className="text-text-secondary">No image available</span>
            </div>
          )}
          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-3">{product.title}</h1>

              {/* Category & Condition */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1.5 bg-card-bg border border-card-border rounded-full text-sm text-text-secondary capitalize">
                  {product.category}
                </span>
                {product.condition && (
                  <span className="px-3 py-1.5 bg-card-bg border border-card-border rounded-full text-sm text-text-secondary capitalize">
                    {product.condition}
                  </span>
                )}
              </div>

              {/* Price */}
              <p className="text-4xl font-bold text-green-600 mb-4">${product.price?.toFixed(2) || "0.00"}</p>
            </div>

            {/* Description */}
            <div className="border-t border-card-border pt-4">
              <h2 className="text-xl font-semibold text-text-primary mb-3">Description</h2>
              <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                {product.description || "No description provided."}
              </p>
            </div>

            {/* Seller Info */}
            {product.sellerName && (
              <div className="border-t border-card-border pt-4">
                <h2 className="text-xl font-semibold text-text-primary mb-2">Seller</h2>
                <p className="text-text-secondary">{product.sellerName}</p>
              </div>
            )}

            {/* Listing Date */}
            {product.createdAt && (
              <div className="text-sm text-text-secondary">
                Listed on{" "}
                {new Date(product.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 items-center pt-4">
              <OfferActionsClient
                item={{
                  id: product._id,
                  title: product.title,
                  price: product.price,
                  image: product.images?.[0],
                  description: product.description,
                }}
              />
              <FavoriteButton product={product} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
