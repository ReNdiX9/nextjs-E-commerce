// products/page.js
"use client";

import Loading from "@/app/loading";
import ProductsGrid from "@/components/ProductsGrid";
import { useEffect, useState, useMemo } from "react";

export default function ProductsPage({ filters }) {
  //Items array
  const [items, setItems] = useState([]);
  //Loading state
  const [loading, setLoading] = useState(true);
  //Error
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Server is currently down, sorry for the inconvenience!"); //failed to fetch
        const data = await res.json();
        setItems(data);
      } catch (e) {
        setErr(e.message || "Error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  //useMemo to prevent extra rerenders
  const filtered = useMemo(() => {
    const q = (filters?.q || "").toLowerCase().trim();
    const cats = Array.isArray(filters?.categories) ? filters.categories : [];
    const cond = Array.isArray(filters?.conditions) ? filters.conditions : [];
    const minNum =
      filters?.min !== null && filters?.min !== undefined && filters?.min !== "" ? Number(filters.min) : null;
    const maxNum =
      filters?.max !== null && filters?.max !== undefined && filters?.max !== "" ? Number(filters.max) : null;

    return items.filter((p) => {
      const inCat = cats.length === 0 ? true : cats.includes(p.category);
      const inCon = cond.length === 0 ? true : cond.includes(p.condition);
      const priceOk = (minNum === null || p.price >= minNum) && (maxNum === null || p.price <= maxNum);
      const qOk =
        q === "" ||
        p.title.toLowerCase().includes(q) ||
        (p.description ? p.description.toLowerCase().includes(q) : false);
      return inCat && priceOk && qOk && inCon;
    });
  }, [items, filters]);

  if (loading) return <Loading />;
  if (err) return <div className="p-4 text-red-600">{err}</div>;
  if (filtered.length === 0) {
    return <div className="mx-auto max-w-6xl p-4 text-text-primary text-center">No items found</div>;
  }

  return (
    <div className="mx-auto max-w-6xl ">
      <ProductsGrid products={filtered} />
    </div>
  );
}
