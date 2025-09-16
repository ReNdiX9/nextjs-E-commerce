// products/page.js
/*This page */
"use client";

import ProductsGrid from "@/components/ProductsGrid";
import { useEffect, useState, useMemo } from "react";

export default function ProductsPage({ onLoad, filters }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://fakestoreapi.com/products", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setItems(data);
        onLoad?.(data);
      } catch (e) {
        setErr(e.message || "Error");
      } finally {
        setLoading(false);
      }
    })();
  }, [onLoad]);

  const filtered = useMemo(() => {
    const q = (filters?.q || "").toLowerCase().trim();
    const cats = Array.isArray(filters?.categories) ? filters.categories : [];
    const minNum =
      filters?.min !== null && filters?.min !== undefined && filters?.min !== "" ? Number(filters.min) : null;
    const maxNum =
      filters?.max !== null && filters?.max !== undefined && filters?.max !== "" ? Number(filters.max) : null;

    return items.filter((p) => {
      const inCat = cats.length === 0 ? true : cats.includes(p.category);
      const priceOk = (minNum === null || p.price >= minNum) && (maxNum === null || p.price <= maxNum);
      const qOk =
        q === "" ||
        p.title.toLowerCase().includes(q) ||
        (p.description ? p.description.toLowerCase().includes(q) : false);
      return inCat && priceOk && qOk;
    });
  }, [items, filters]);

  if (loading) return <div className="p-4 text-center text-black">Loading…</div>;
  if (err) return <div className="p-4 text-red-600">{err}</div>;
  if (filtered.length === 0) {
    return <div className="mx-auto max-w-6xl p-4 text-black text-center">No items found</div>;
  }

  return (
    <div className="mx-auto max-w-6xl ">
      <ProductsGrid products={filtered} />
    </div>
  );
}
