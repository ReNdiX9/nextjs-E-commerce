//api/orders/session/[sessionId]/route.js

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/mongodb";

export const runtime = "nodejs";

// GET method to fetch order by Stripe session ID
export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const ordersCollection = await getCollection("orders");
    const order = await ordersCollection.findOne({
      stripeSessionId: sessionId,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify the order belongs to the current user
    if (order.buyerId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Convert ObjectId to string for JSON response
    const orderResponse = {
      ...order,
      _id: order._id.toString(),
      productId: order.productId.toString(),
    };

    return NextResponse.json(orderResponse);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

