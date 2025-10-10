// components/SendOfferDialog.jsx
"use client";
import { useEffect, useRef, useState } from "react";

export default function SendOfferDialog({
  open,
  onClose,
  item, // { id, title, price, image, description }
  onSubmit,
  primaryLabel = "Send",
  secondaryLabel = "Cancel",
}) {
  const panelRef = useRef(null);
  const [mode, setMode] = useState("standard"); // 'standard' or 'custom'
  const [customPrice, setCustomPrice] = useState("");

  // reset + focus + lock scroll
  useEffect(() => {
    if (open) {
      setMode("standard");
      setCustomPrice("");
      panelRef.current?.focus();
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  if (!open) return null;

  const finalPrice = mode === "standard" ? Number(item?.price ?? 0) : Number(customPrice || 0);
  const validPrice = Number.isFinite(finalPrice) && finalPrice >= 0.1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-offer-title"
      className="fixed inset-0 z-100 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose?.()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity min-h-screen" />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl origin-center rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl outline-none backdrop-blur  transition-all"
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="space-y-0.5">
            <h2 id="send-offer-title" className="text-xl font-semibold tracking-tight text-neutral-900">
              Review & Send Offer
            </h2>
            <p className="text-xs text-neutral-500 font-bold">Confirm details and choose a price.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Item */}
        <div className="flex gap-4">
          {item?.image && (
            <img
              src={item.image}
              alt={item.title}
              className="h-40 w-40 p-3  rounded-lg border border-neutral-200 object-cover"
            />
          )}
          <div className="min-w-0">
            <h3 className="truncate text-base font-medium text-neutral-900">{item?.title}</h3>
            <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-700">
              Standard price
              <span className="font-semibold">${Number(item?.price ?? 0).toFixed(2)}</span>
            </div>
            {item?.description && (
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-600">{item.description}</p>
            )}
          </div>
        </div>

        {/* Price selection */}
        <div className="mt-6 grid gap-3">
          {/* Card: standard */}
          <label
            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition
                        ${mode === "standard" ? "border-neutral-900 " : "border-neutral-200 hover:border-neutral-500"}`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="price-mode"
                className="h-4 w-4 accent-neutral-900"
                checked={mode === "standard"}
                onChange={() => setMode("standard")}
              />
              <div className="text-sm">
                <div className="font-medium text-neutral-900">Use Standard price</div>
                <div className="text-neutral-600">${Number(item?.price ?? 0).toFixed(2)}</div>
              </div>
            </div>
          </label>

          {/* Card: custom */}
          <label
            className={`rounded-xl border p-3 transition-all
                        ${
                          mode === "custom"
                            ? "border-neutral-900 "
                            : "border-neutral-200 hover:border-neutral-500 transition-all"
                        }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="price-mode"
                className="h-4 w-4 accent-neutral-900"
                checked={mode === "custom"}
                onChange={() => setMode("custom")}
              />
              <div className="text-sm">
                <div className="font-medium text-neutral-900">Enter custom price</div>
                <div className="mt-2 flex items-center">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      pattern="^\d*([.]\d{0,2})?$"
                      value={customPrice}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (/^\d*(\.\d{0,2})?$/.test(v) || v === "") {
                          setCustomPrice(v);
                        }
                      }}
                      className={`w-40 rounded-lg border bg-white pl-7 pr-2 py-2 text-sm outline-none transition text-black
                                 ${
                                   mode === "custom"
                                     ? "border-neutral-300 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                                     : "border-neutral-200 opacity-60 pointer-events-none"
                                 }`}
                    />
                  </div>
                  <span
                    className={`ml-3 text-xs ${
                      validPrice || mode === "standard" ? "text-transparent" : "text-red-600"
                    }`}
                  >
                    Enter amount
                  </span>
                </div>
              </div>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className=" cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
          >
            {secondaryLabel}
          </button>
          <button
            disabled={!validPrice}
            onClick={() => {
              if (!validPrice) return;
              onSubmit?.(finalPrice.toFixed(2));
              onClose?.();
            }}
            className={`rounded-lg px-4 py-2 text-sm text-white transition cursor-pointer
                        ${validPrice ? "bg-neutral-900 hover:opacity-90" : "bg-neutral-400 "}`}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
