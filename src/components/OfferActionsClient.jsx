// components/OfferActionsClient.jsx
"use client";
import { useState } from "react";
import SendOfferDialog from "@/components/SendOfferDialog";
import { ToastContainer, toast } from "react-toastify";

export default function OfferActionsClient({ item }) {
  const [open, setOpen] = useState(false);
  const notify = () => toast.success("Your offer was send successfully!");

  return (
    <>
      <div className="flex gap-6 items-center">
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 active:translate-y-px hover:scale-103"
        >
          Send Offer
        </button>

        <button className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium transition hover:opacity-90 active:translate-y-px hover:scale-103 text-black border border-neutral-400 hover:border-neutral-900">
          Send Message
        </button>
      </div>

      <SendOfferDialog
        open={open}
        onClose={() => setOpen(false)}
        item={item}
        onSubmit={(finalPrice) => {
          // await api.sendOffer({ productId: item.id, price: finalPrice })
          console.log("Offer sent with price:", finalPrice);
          notify();
        }}
        primaryLabel="Send"
        secondaryLabel="Cancel"
      />
      {/* Toast message*/}
      <ToastContainer
        position="top-center"
        theme="light"
        style={{ zIndex: 10000 }}
        draggable
        pauseOnHover
        autoClose={3000}
      />
    </>
  );
}
