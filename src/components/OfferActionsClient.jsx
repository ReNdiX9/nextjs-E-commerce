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

      </div>

      <SendOfferDialog
        open={open}
        onClose={() => setOpen(false)}
        item={item}
        onSubmit={(finalPrice) => {
          console.log("Offer sent with price:", finalPrice);
          notify();
        }}
        primaryLabel="Send"
        secondaryLabel="Cancel"
      />
      {/* Toast message*/}
      <ToastContainer position="top-center" theme="colored" style={{ zIndex: 10000 }} draggable autoClose={2000} />
    </>
  );
}
