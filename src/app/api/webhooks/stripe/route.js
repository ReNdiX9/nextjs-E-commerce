//api/webhooks/stripe/route.js

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

// Get webhook secret from environment
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// POST method to handle Stripe webhook events
export async function POST(request) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature found");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "payment_intent.succeeded":
        console.log("Payment intent succeeded:", event.data.object.id);
        // You can add additional logic here if needed
        break;

      case "payment_intent.payment_failed":
        console.log("Payment intent failed:", event.data.object.id);
        // Handle failed payments if needed
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return success response to Stripe
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed", details: error.message },
      { status: 500 }
    );
  }
}

// Handle successful checkout session
async function handleCheckoutSessionCompleted(session) {
  try {
    console.log("Processing checkout session completed:", session.id);

    // Extract metadata from session
    const {
      metadata,
      amount_total,
      customer_email,
      payment_status,
    } = session;

    if (!metadata || !metadata.productId || !metadata.buyerId || !metadata.sellerId) {
      console.error("Missing required metadata in session:", session.id);
      return;
    }

    const {
      productId,
      sellerId,
      buyerId,
      productTitle,
      sellerName,
      buyerName,
    } = metadata;

    // Get collections
    const ordersCollection = await getCollection("orders");
    const productsCollection = await getCollection("products");

    // Check if order already exists (idempotency)
    const existingOrder = await ordersCollection.findOne({
      stripeSessionId: session.id,
    });

    if (existingOrder) {
      console.log("Order already exists for session:", session.id);
      return;
    }

    // Create order document
    const order = {
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent || null,
      productId: new ObjectId(productId),
      sellerId: sellerId,
      buyerId: buyerId,
      productTitle: productTitle,
      sellerName: sellerName,
      buyerName: buyerName,
      buyerEmail: customer_email || null,
      amount: amount_total / 100, // Convert from cents to dollars
      currency: session.currency || "usd",
      paymentStatus: payment_status || "paid",
      orderStatus: "completed", // You can add: pending, processing, shipped, delivered, cancelled
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert order into MongoDB
    const orderResult = await ordersCollection.insertOne(order);
    console.log("Order created:", orderResult.insertedId);

    // Optionally mark product as sold (uncomment if you want to hide sold products)
    // await productsCollection.updateOne(
    //   { _id: new ObjectId(productId) },
    //   {
    //     $set: {
    //       sold: true,
    //       soldAt: new Date(),
    //       soldTo: buyerId,
    //     },
    //   }
    // );

    console.log("Order processing completed successfully");
  } catch (error) {
    console.error("Error handling checkout session completed:", error);
    throw error;
  }
}

