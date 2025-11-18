// app/products/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import OfferActionsClient from "@/components/OfferActionsClient";
import ImageCarousel from "@/components/ImageCarousel";
import Loading from "@/app/loading";
import { toast } from "react-toastify";
import BlockListingButton from "@/components/BlockListing";

export default function ItemPage() {
  const params = useParams();
  const router = useRouter();
  const { id: fullId } = params;
  const id = fullId.split("-")[0];

  //Products
  const [product, setProduct] = useState(null);
  //Loading State
  const [loading, setLoading] = useState(true);
  //Error
  const [error, setError] = useState(null);
  //Email
  const [email, showEmail] = useState(false);

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

  const copyEmail = async () => {
    if (product?.sellerEmail) {
      try {
        await navigator.clipboard.writeText(product.sellerEmail);
        toast.success("Copied!");
      } catch (err) {
        console.error("Failed to copy email:", err);
      }
    }
  };

  if (loading) return <Loading />;

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Product not found"}</p>
          <button onClick={() => router.push("/")} className="text-text-secondary hover:text-text-primary">
            Back to products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center items-center">
      <main className="max-w-6xl w-full  py-8">
        <div className="grid gap-16 md:grid-cols-2">
          {/* Image Gallery */}
          {!product.images.length == 0 && (
            <div className="rounded-2xl border border-card-border bg-card-bg  shadow-md">
              <ImageCarousel images={product.images} title={product.title} />
            </div>
          )}
          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-3">{product.title}</h1>

              {/* Category & Condition */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1.5 bg-card-bg border border-card-border rounded-full text-sm text-text-secondary capitalizes">
                  {product.category}
                </span>
                {product.condition && (
                  <span className="px-3 py-1.5 bg-card-bg border border-card-border rounded-full text-sm text-text-secondary capitalize">
                    {product.condition}
                  </span>
                )}
              </div>

              {/* Price */}
              <p className="text-4xl font-bold  mb-4">${product.price?.toFixed(2) || "0.00"}</p>
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
                <div className="flex items-center gap-3">
                  <p
                    className="text-text-secondary cursor-pointer hover:underline underline-offset-2"
                    onClick={() => showEmail((p) => !p)}
                    title="Show Email"
                  >
                    {product.sellerName}
                  </p>

                  {email && (
                    <div className="flex items-center gap-2">
                      <span className="text-text-secondary  cursor-pointer hover:text-foreground" onClick={copyEmail}>
                        {product.sellerEmail}
                      </span>
                    </div>
                  )}
                </div>
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
            <div className="flex gap-2 items-center pt-4">
              <OfferActionsClient
                item={{
                  id: product._id,
                  title: product.title,
                  price: product.price,
                  image: product.images?.[0],
                  description: product.description,
                }}
                sellerId={product?.sellerId || product?.userId}
                sellerName={product?.sellerName}
              />
              {/*Favorite button*/}
              <FavoriteButton product={product} />
              {/*Block button*/}
              <BlockListingButton productId={product._id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
