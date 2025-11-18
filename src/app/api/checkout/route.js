import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const productsCollection = await getCollection("products");
    const product = await productsCollection.findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.sellerId === userId || product.userId === userId) {
      return NextResponse.json({ error: "You cannot buy your own product" }, { status: 400 });
    }

    const usersCollection = await getCollection("users");
    const user = await usersCollection.findOne({ clerkId: userId });
    const buyerName = user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Buyer"
      : "Buyer";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.title,
              description: product.description?.substring(0, 500) || "Product purchase",
              images: product.images && product.images.length > 0 ? [product.images[0]] : [],
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/products/${productId}`,
      metadata: {
        productId: productId,
        sellerId: product.sellerId || product.userId,
        buyerId: userId,
        productTitle: product.title,
        sellerName: product.sellerName || "Seller",
        buyerName: buyerName,
      },
      customer_email: user?.email || undefined,
    });

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id 
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { 
        error: "Failed to create checkout session",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

