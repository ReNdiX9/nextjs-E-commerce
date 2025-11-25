// app/products/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import FavoriteButton from "@/components/FavoriteButton";
import OfferActionsClient from "@/components/OfferActionsClient";
import ImageCarousel from "@/components/ImageCarousel";
import Loading from "@/app/loading";
import { toast } from "react-toastify";
import BlockListingButton from "@/components/BlockListingButton";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";

export default function ItemPage() {
  const params = useParams();
  const router = useRouter();
  const { id: fullId } = params;
  const id = fullId.split("-")[0];
  const { user, isLoaded } = useUser();

  //Products
  const [product, setProduct] = useState(null);
  //Loading State
  const [loading, setLoading] = useState(true);
  //Error
  const [error, setError] = useState(null);
  //Email
  const [email, showEmail] = useState(false);
  //Checkout loading
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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

  const handleBuyNow = async () => {
    // Check if user is logged in
    if (!user) {
      toast.error("Please sign in to purchase");
      router.push("/signin");
      return;
    }

    // Check if user is trying to buy their own product
    if (product?.sellerId === user.id || product?.userId === user.id) {
      toast.error("You cannot buy your own product");
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to start checkout. Please try again.");
      setCheckoutLoading(false);
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
            <div className="flex flex-col gap-3 pt-4">
              {/* Buy Now Button - Hide only if user is the seller */}
              {(!user || (product?.sellerId !== user.id && product?.userId !== user.id)) && (
                <Button
                  onClick={handleBuyNow}
                  disabled={checkoutLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg"
                  size="lg"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Buy Now - ${product.price?.toFixed(2) || "0.00"}
                    </>
                  )}
                </Button>
              )}
              
              {/* Other Actions */}
              <div className="flex gap-2 items-center">
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
        </div>
      </main>
    </div>
  );
}
