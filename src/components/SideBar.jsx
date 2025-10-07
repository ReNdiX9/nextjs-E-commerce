// src/components/SideBar.jsx
"use client";

import { useEffect, useState } from "react";
import { FiSearch, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function SideBar({ onApply }) {
  // states
  const [categories, setCategories] = useState([]);
  const [showAllCats, setShowAllCats] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [q, setQ] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  // fetch categories
  useEffect(() => {
    fetch("https://fakestoreapi.com/products/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const toggleCat = (cat) => {
    const next = new Set(selected);
    next.has(cat) ? next.delete(cat) : next.add(cat);
    setSelected(next);
  };

  const apply = () => {
    onApply?.({
      q,
      categories: [...selected],
      min: min || null,
      max: max || null,
    });
  };

  const reset = () => {
    setSelected(new Set());
    setQ("");
    setMin("");
    setMax("");
    onApply?.({ q: "", categories: [], min: null, max: null });
  };

  const inputBase =
    "w-full rounded-xl border border-input-border bg-input-bg/80 px-3 py-2.5 text-sm outline-none transition placeholder:text-text-secondary hover:border-text-primary focus:border-text-primary text-text-primary";

  const visibleCats = showAllCats ? categories : categories.slice(0, 6);

  return (
    <aside className="sticky top-20 rounded-2xl border border-card-border bg-card-bg/70 p-5 shadow-md backdrop-blur-sm">
      {/* Search */}
      <div className="mb-4">
        <label className="mb-2 block text-md font-semibold text-text-primary">Search</label>
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 " />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            placeholder="Search products…"
            className={`${inputBase} pl-9 overflow-hidden pr-7 whitespace-nowrap text-ellipsis w-full`}
          />
          {q && (
            <button
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              onClick={() => setQ("")}
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="mb-5">
        <p className="mb-2 text-md text-text-primary  font-semibold">Categories</p>
        {!categories.length ? (
          <div className="space-y-2">
            <p className="text-text-secondary text-xs">No categories found</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {visibleCats.map((cat) => {
                const active = selected.has(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCat(cat)}
                    className={[
                      "rounded-full border px-3 py-1.5 text-sm transition cursor-pointer",
                      active
                        ? "border-text-primary bg-text-primary text-background shadow"
                        : "border-card-border text-text-secondary hover:border-text-primary",
                    ].join(" ")}
                  >
                    <span className="capitalize">{cat}</span>
                  </button>
                );
              })}
            </div>

            {categories.length > 6 && (
              <button
                onClick={() => setShowAllCats((s) => !s)}
                className="mt-3 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
              >
                {showAllCats ? (
                  <>
                    Show less <FiChevronUp />
                  </>
                ) : (
                  <>
                    Show all <FiChevronDown />
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* Price */}
      <PriceFilter min={min} max={max} setMin={setMin} setMax={setMax} />

      {/* Actions */}
      <div className="flex gap-2 md:flex-col lg:flex-row">
        <button
          onClick={apply}
          className="flex-1 rounded-xl bg-text-primary px-4 py-2.5 text-sm font-medium text-background shadow-sm transition hover:opacity-90  cursor-pointer hover:scale-103 active:translate-y-px"
        >
          Apply filters
        </button>
        <button
          onClick={reset}
          className="flex-1 rounded-xl border border-card-border px-4 py-2.5 text-sm font-medium text-text-primary transition hover:bg-card-bg cursor-pointer hover:scale-103 active:translate-y-px hover:border-text-primary"
        >
          Reset
        </button>
      </div>
    </aside>
  );
}

function PriceFilter({ min, max, setMin, setMax }) {
  const inputBase =
    " w-20  rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm outline-none " +
    "placeholder:text-text-secondary focus:border-text-primary hover:border-text-primary text-text-primary";

  return (
    <div className="mb-6">
      <p className="mb-2  font-semibold text-text-primary">Price</p>
      <div className="flex items-center gap-2 md:flex-col lg:flex-row ">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Min"
          value={min}
          pattern="[0-9]*"
          onChange={(e) => {
            const onlyNums = e.target.value.replace(/[^0-9]/g, "");
            setMin(onlyNums);
          }}
          className={inputBase}
        />
        <span className="text-text-secondary">–</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Max"
          pattern="[0-9]*"
          value={max}
          onChange={(e) => {
            const onlyNums = e.target.value.replace(/[^0-9]/g, "");
            setMax(onlyNums);
          }}
          className={inputBase}
        />
      </div>
    </div>
  );
}
