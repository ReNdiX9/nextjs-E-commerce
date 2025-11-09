"use server";

import { getCollection } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function blockProduct(productId) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };
    //get collection
    const blockedProducts = await getCollection("blockedProducts");
    //check if exist
    const exist = await blockedProducts.findOne({ userId: userId, productId: productId });
    if (exist) {
      return { error: "Product already blocked" };
    }
    await blockedProducts.insertOne({
      userId: userId,
      productId: productId,
      blockedAt: new Date(),
    });
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Error blocking product:", err);
    return { error: "Failed to block product" };
  }
}

export async function unblockProduct(productId) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };
    //get collection
    const blockedProducts = await getCollection("blockedProducts");
    //delete
    await blockedProducts.deleteOne({
      userId: userId,
      productId: productId,
    });
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Error fetching blocked products:", err);
    return { error: "Failed to unblock product" };
  }
}

export async function getBlockedProductIds(userId) {
  try {
    if (!userId) return [];

    const blockedProducts = await getCollection("blockedProducts");

    const blocks = await blockedProducts.find({ userId: userId }).project({ productId: 1 }).toArray();

    return blocks.map((block) => block.productId);
  } catch (error) {
    console.error("Error fetching blocked products:", error);
    return [];
  }
}
