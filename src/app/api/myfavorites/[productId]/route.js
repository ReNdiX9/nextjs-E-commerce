//app/api/myfavorites/[productId]/route.js

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

// DELETE - Remove a product from favorites
export async function DELETE(_request, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await params;

    // Validate ObjectId format
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const favoritesCollection = await getCollection("favorites");

    // Delete the favorite
    const result = await favoritesCollection.deleteOne({
      userId,
      productId: new ObjectId(productId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Favorite not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Removed from favorites",
      productId: productId,
    });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
