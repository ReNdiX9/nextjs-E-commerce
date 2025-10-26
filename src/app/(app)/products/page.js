// products/page.js
"use client";

import Loading from "@/app/loading";
import ProductsGrid from "@/components/ProductsGrid";
import { PaginationComponent } from "@/components/Pagination";
import { useEffect, useState } from "react";

export default function ProductsPage({ filters }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  // Fetch products when page or filters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Build query params
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });

        if (filters?.q) params.append("q", filters.q);
        if (filters?.categories?.length > 0) params.append("categories", filters.categories.join(","));
        if (filters?.conditions?.length > 0) params.append("conditions", filters.conditions.join(","));
        if (filters?.min) params.append("min", filters.min);
        if (filters?.max) params.append("max", filters.max);

        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error("Server is currently down, sorry for the inconvenience!");

        const data = await res.json();
        setProducts(data.products);
        setPagination(data.pagination);
      } catch (e) {
        setErr(e.message || "Error");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [pagination.page, filters]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [filters]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <Loading />;
  if (err) return <div className="p-4 text-red-600">{err}</div>;
  if (products.length === 0) {
    return <div className="mx-auto max-w-6xl p-4 text-text-primary text-center">No items found</div>;
  }

  return (
    <>
      <div className="mx-auto max-w-6xl">
        <ProductsGrid products={products} />
      </div>
      <div className=" flex w-full  justify-around items-center mt-4">
        {/* Results count */}
        <span className=" text-sm text-text-secondary">
          Showing {products.length} of {pagination.total} products
        </span>
        {/* Pagination Controls */}
        <span>
          {pagination.totalPages > 1 && (
            <PaginationComponent
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </span>
      </div>
    </>
  );
}
