"use server";

import { getCollection } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Get blocked products
export async function getBlockedProducts() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { products: [], error: "Unauthorized" };
    }

    const blockedProducts = await getCollection("blockedProducts");

    // Just get the blocked products collection data
    const products = await blockedProducts.find({ userId }).sort({ blockedAt: -1 }).toArray();

    // Convert ObjectIds to strings
    const serializedProducts = products.map((product) => ({
      _id: product._id.toString(),
      userId: product.userId,
      productId: product.productId,
      sellerId: product.sellerId,
      blockedAt: product.blockedAt,
    }));

    return { products: serializedProducts };
  } catch (error) {
    console.error("Error fetching blocked products:", error);
    return { products: [], error: "Failed to fetch blocked products" };
  }
}
//block products
export async function blockProduct(productId, sellerId) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const blockedProducts = await getCollection("blockedProducts");

    // Check if already blocked
    const existing = await blockedProducts.findOne({
      userId,
      productId,
      sellerId,
    });
    if (existing) {
      return { error: "Product already blocked" };
    }

    // Block the product
    await blockedProducts.insertOne({
      userId,
      productId,
      sellerId,
      blockedAt: new Date(),
    });
    revalidatePath("/");
    return { success: true, message: "Product blocked successfully" };
  } catch (error) {
    console.error("Error blocking product:", error);
    return { error: "Failed to block product" };
  }
}
//unblock products
export async function unblockProducts(productId, sellerId) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const blockedProducts = await getCollection("blockedProducts");

    // Remove the block
    const result = await blockedProducts.deleteOne({
      userId,
      productId,
      sellerId,
    });

    if (result.deletedCount === 0) {
      return { error: "Product was not blocked" };
    }

    revalidatePath("/");
    return { success: true, message: "Product unblocked successfully" };
  } catch (error) {
    console.error("Error unblocking product:", error);
    return { error: "Failed to unblock product" };
  }
}
//Check if a product is blocked by the current user
export async function isProductBlocked(productId, sellerId) {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const blockedProducts = await getCollection("blockedProducts");
    const block = await blockedProducts.findOne({
      userId,
      productId,
      sellerId,
    });

    return !!block;
  } catch (error) {
    console.error("Error checking if product is blocked:", error);
    return false;
  }
}
