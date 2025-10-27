// app/(app)/favorites/actions.js
"use server";

import { getCollection } from "@/lib/mongodb";

export async function getFavorites(userId) {
  try {
    const favoritesCollection = await getCollection("favorites");
    const productsCollection = await getCollection("products");

    // Get all favorite product IDs for this user
    const favorites = await favoritesCollection.find({ userId }).sort({ createdAt: -1 }).toArray();

    // If no favorites, return empty array
    if (favorites.length === 0) {
      return [];
    }

    // Get the full product details for each favorite item
    const productIds = favorites.map((fav) => fav.productId);
    const products = await productsCollection.find({ _id: { $in: productIds } }).toArray();

    // Map products with favorite info and serialize for client
    const favoritesWithProducts = favorites
      .map((fav) => {
        const product = products.find((p) => p._id.toString() === fav.productId.toString());

        // Skip if product not found
        if (!product) return null;

        // Serialize MongoDB objects to plain objects for client
        return {
          _id: product._id.toString(),
          title: product.title,
          category: product.category,
          images: product.images || (product.image ? [product.image] : []),
          price: product.price,
          favoriteId: fav._id.toString(),
          favoritedAt: fav.createdAt.toISOString(),
        };
      })
      .filter(Boolean); // Remove null values

    return favoritesWithProducts;
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
}
