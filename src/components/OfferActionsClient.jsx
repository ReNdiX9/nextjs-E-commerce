// components/OfferActionsClient.jsx
"use client";
import { useState } from "react";
import SendOfferDialog from "@/components/SendOfferDialog";
import ChatWidget from "@/components/ChatWidget";
import { ToastContainer, toast } from "react-toastify";
import { MessageCircle } from "lucide-react";

export default function OfferActionsClient({ item, sellerId, sellerName }) {
  const [offerOpen, setOfferOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //handleOfferSubmit function
  const handleOfferSubmit = async (finalPrice) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sellerId: sellerId,
          productId: item.id,
          productTitle: item.title,
          offerAmount: parseFloat(finalPrice),
        }),
      });
      if (!res.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send notification");
      }
      toast.success("Your offer was sent successfully!");
    } catch (error) {
      console.error("Error sending offer:", error);
      toast.error("Failed to send offer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex gap-4 items-center">
        <button
          onClick={() => setOfferOpen(true)}
          className="rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 active:translate-y-px hover:scale-103"
        >
          Send Offer
        </button>

        <button
          onClick={() => setChatOpen(true)}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 active:translate-y-px hover:scale-103 flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Send Message
        </button>
      </div>

      <SendOfferDialog
        open={offerOpen}
        onClose={() => setOfferOpen(false)}
        item={item}
        onSubmit={handleOfferSubmit}
        primaryLabel="Send"
        secondaryLabel="Cancel"
      />

      <ChatWidget
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        recipientId={sellerId}
        recipientName={sellerName}
      />

      {/* Toast message*/}
      <ToastContainer position="top-center" theme="colored" style={{ zIndex: 10000 }} draggable autoClose={2000} />
    </>
  );
}
