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

  // fetch cats
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
    "w-full rounded-xl border border-neutral-400 bg-white/80 px-3 py-2.5 text-sm outline-none transition placeholder:text-neutral-400 hover:border-neutral-900 focus:border-neutral-900 text-black";

  const visibleCats = showAllCats ? categories : categories.slice(0, 6);

  return (
    <aside className="sticky top-20 rounded-2xl border border-neutral-200 bg-white/70 p-5 shadow-md backdrop-blur-sm">
      {/* Search */}
      <div className="mb-4">
        <label className="mb-2 block text-md font-semibold text-black">Search</label>
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
        <p className="mb-2 text-md text-black  font-semibold">Categories</p>
        {!categories.length ? (
          <div className="space-y-2">
            <p className="text-neutral-400 text-xs">No categories found</p>
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
                        ? "border-black bg-black text-white shadow"
                        : "border-neutral-300 text-neutral-700 hover:border-black",
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
                className="mt-3 inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-black"
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
          className="flex-1 rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90  cursor-pointer hover:scale-103 active:translate-y-px"
        >
          Apply filters
        </button>
        <button
          onClick={reset}
          className="flex-1 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 cursor-pointer hover:scale-103 active:translate-y-px hover:border-neutral-900"
        >
          Reset
        </button>
      </div>
    </aside>
  );
}

function PriceFilter({ min, max, setMin, setMax }) {
  const inputBase =
    " w-20  rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none " +
    "placeholder:text-neutral-400 focus:border-neutral-900 hover:border-neutral-900 text-black";

  return (
    <div className="mb-6">
      <p className="mb-2  font-semibold text-black">Price</p>
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
        <span className="text-neutral-400">–</span>
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
