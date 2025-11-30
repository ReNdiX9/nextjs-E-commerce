//app/checkout/success/page.js
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { CheckCircle, Package, Home } from "lucide-react";
import Link from "next/link";
import Loading from "@/app/loading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const sessionId = searchParams.get("session_id");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/session/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
        // Silently handle errors - order might still be processing via webhook
      } catch (err) {
        console.error("Error fetching order:", err);
        // Don't show error - just show success message
      } finally {
        setLoading(false);
      }
    };

    // Wait a bit for webhook to process
    const timer = setTimeout(() => {
      fetchOrder();
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId]);

  if (!isLoaded || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <Card className="p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Order is Placed!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your purchase. Your order has been confirmed and will be processed shortly.
          </p>

          {/* Session ID */}
          {sessionId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Order Reference</p>
              <p className="text-sm font-mono text-gray-700 break-all">{sessionId}</p>
            </div>
          )}

          {/* Order Details */}
          {order ? (
            <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-semibold text-gray-900">{order.productTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-gray-900">
                    ${order.amount?.toFixed(2)} {order.currency?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600 capitalize">{order.orderStatus}</span>
                </div>
                {order.buyerEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900">{order.buyerEmail}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <p className="text-gray-600">
                Your order is being processed. You will receive a confirmation email shortly.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center">
            <Link href="/">
              <Button
                variant="outline"
                className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              If you have any questions about your order, please contact us.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

