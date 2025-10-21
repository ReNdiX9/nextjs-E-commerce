// app/product/[ProductID]/page.js
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import OfferActionsClient from "@/components/OfferActionsClient";
// used shadcn ui for breadcrumb navigation
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function ProductPage({ params }) {
  const { id } = params;

  // Mock product data as fallback
  const mockProduct = {
    id: id,
    title: "Sample Product",
    price: 29.99,
    description: "This is a sample product description for testing purposes.",
    category: "electronics",
    image: "https://via.placeholder.com/300x300?text=Product+Image",
    rating: {
      rate: 4.5,
      count: 120
    }
  };

  let p = mockProduct; // Default to mock data

  try {
    const res = await fetch(`https://fakestoreapi.com/products/${id}`, {
      next: { revalidate: 60 },
    });
    
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim() !== '') {
        try {
          const apiProduct = JSON.parse(text);
          if (apiProduct && apiProduct.id) {
            p = apiProduct; // Use API data if successful
          }
        } catch (parseError) {
          console.log('Using mock data due to JSON parse error');
        }
      }
    }
  } catch (error) {
    console.log('Using mock data due to fetch error:', error.message);
  }

  return (
    <div className=" h-full min-h-screen  bg-background">
      {/* Breadcrumb Navigation */}
      <div className="m-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-text-secondary hover:text-text-primary">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/products" className="text-text-secondary hover:text-text-primary">
                Products
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-text-primary font-medium">{p.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {/* Image */}
        <div className="rounded-xl border border-card-border bg-card-bg p-4 shadow-sm">
          <Image
            unoptimized
            src={p.image}
            alt={p.title}
            width={600}
            height={600}
            className="mx-auto h-72 w-auto object-contain"
          />
        </div>

        {/* Details */}
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-text-primary text-center">{p.title}</h1>
          <p className="text-text-secondary capitalize">Category: {p.category}</p>
          <p className="text-2xl font-bold text-text-primary">${p.price}</p>
          {p.rating?.rate && (
            <p className="text-sm text-text-secondary">
              Rating: {p.rating.rate} ({p.rating.count} reviews)
            </p>
          )}
          <p className="text-text-primary leading-relaxed">{p.description}</p>

          <div className="flex gap-4 items-center">
            {/* Actions (client) */}
            <OfferActionsClient
              item={{
                id: p.id,
                title: p.title,
                price: p.price,
                image: p.image,
                description: p.description,
              }}
              seller={{
                id: 'seller-123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com'
              }}
            />
            <FavoriteButton product={p} />
          </div>
        </div>
      </div>
    </div>
  );
}
