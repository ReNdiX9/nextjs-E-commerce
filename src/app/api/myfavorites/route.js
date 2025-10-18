// app/api/myfavorites/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

// GET - Fetch all favorites for the logged-in user
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favoritesCollection = await getCollection("favorites");
    const productsCollection = await getCollection("products");

    // Get all favorite product IDs for this user
    const favorites = await favoritesCollection.find({ userId }).sort({ createdAt: -1 }).toArray();

    // Get the full product details for each favorite item
    const productIds = favorites.map((fav) => fav.productId);
    const products = await productsCollection.find({ _id: { $in: productIds } }).toArray();

    // Map products with favorite info
    const favoritesWithProducts = favorites
      .map((fav) => {
        const product = products.find((p) => p._id.toString() === fav.productId.toString());
        return {
          ...product,
          favoriteId: fav._id,
          favoritedAt: fav.createdAt,
        };
      })
      .filter((item) => item._id);

    return NextResponse.json(favoritesWithProducts);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST - Add a product to favorites
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const favoritesCollection = await getCollection("favorites");
    const productsCollection = await getCollection("products");

    // Check if product exists
    const product = await productsCollection.findOne({
      _id: new ObjectId(productId),
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if already favorited
    const existingFavorite = await favoritesCollection.findOne({
      userId,
      productId: new ObjectId(productId),
    });

    if (existingFavorite) {
      return NextResponse.json({ error: "Product already in favorites" }, { status: 409 });
    }

    // Add to favorites
    const result = await favoritesCollection.insertOne({
      userId,
      productId: new ObjectId(productId),
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Added to favorites",
        favoriteId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
