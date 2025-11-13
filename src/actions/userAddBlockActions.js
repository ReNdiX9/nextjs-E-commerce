"use server";

import { getCollection } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function toggleBlockProduct(productId, currentlyBlocked) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };
    //get collection
    const blockedProducts = await getCollection("blockedProducts");

    if (currentlyBlocked) {
      //unblock
      await blockedProducts.deleteOne({
        userId,
        productId,
      });
    } else {
      //block
      await blockedProducts.insertOne({
        userId,
        productId,
        blockedAt: new Date(),
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Error blocking product:", err);
    return { error: "Failed to block product" };
  }
}

export async function getBlockedProductIds(userId) {
  try {
    if (!userId) return [];

    const blockedProducts = await getCollection("blockedProducts");
    const blocks = await blockedProducts.find({ userId }).project({ productId: 1, _id: 0 }).toArray();

    const productIds = blocks.map((b) => b.productId);
    if (!productIds.length) return [];

    const productsCollection = await getCollection("products");
    const products = await productsCollection
      .find({ _id: { $in: productIds.map((id) => (typeof id === "string" ? new ObjectId(id) : id)) } })
      .toArray();

    return products;
  } catch (error) {
    console.error("Error fetching blocked products:", error);
    return [];
  }
}
