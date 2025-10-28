// app/api/myfavorites/check/[productId]/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

// GET - Check if a single product is favorited
export async function GET(_request, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ isFavorite: false });
    }

    const { productId } = await params;

    // Validate ObjectId format
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json({ isFavorite: false });
    }

    const favoritesCollection = await getCollection("favorites");

    // Only check if this ONE product exists - very fast!
    const favorite = await favoritesCollection.findOne({
      userId,
      productId: new ObjectId(productId),
    });

    return NextResponse.json({
      isFavorite: !!favorite,
    });
  } catch (error) {
    console.error("Error checking favorite:", error);
    return NextResponse.json({ isFavorite: false });
  }
}
