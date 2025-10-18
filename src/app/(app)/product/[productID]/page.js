// app/product/[id]/page.js
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import OfferActionsClient from "@/components/OfferActionsClient";

export default async function ItemPage({ params }) {
  const { id } = params;

  const res = await fetch(`http://localhost:3001/api/products/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    notFound();
  }

  const product = await res.json();

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors text-sm">
            Back to listings
          </Link>
        </nav>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Image Gallery */}
          <div className="rounded-2xl border border-card-border bg-card-bg p-6 shadow-md">
            {product.images && product.images.length > 0 ? (
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-background">
                  <Image src={product.images[0]} alt={product.title} fill className="object-contain p-4" priority />
                </div>

                {/* Thumbnail Gallery (if multiple images) */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.slice(0, 4).map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden border border-card-border cursor-pointer hover:border-text-primary transition-colors"
                      >
                        <Image src={img} alt={`${product.title} ${idx + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full aspect-square rounded-xl bg-background flex items-center justify-center">
                <span className="text-text-secondary">No image available</span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-3">{product.title}</h1>

              {/* Category & Condition */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1.5 bg-card-bg border border-card-border rounded-full text-sm text-text-secondary">
                  {product.category}
                </span>
                {product.condition && (
                  <span className="px-3 py-1.5 bg-card-bg border border-card-border rounded-full text-sm text-text-secondary">
                    {product.condition}
                  </span>
                )}
              </div>

              {/* Price */}
              <p className="text-4xl font-bold text-green-600 mb-4">${product.price.toFixed(2)}</p>
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
