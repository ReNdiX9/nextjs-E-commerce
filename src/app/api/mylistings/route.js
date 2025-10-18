import { getCollection } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const productsCollection = await getCollection("products");
    if (!productsCollection) return NextResponse.json({ error: "DB not available" }, { status: 500 });
    // Find all products where sellerId matches the current user
    const myListings = await productsCollection.find({ sellerId: userId }).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(myListings);
  } catch (error) {
    console.log("Error fetching user listings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
