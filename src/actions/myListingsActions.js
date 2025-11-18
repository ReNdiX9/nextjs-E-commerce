"use server";

import { getCollection } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";

export async function getMyListings() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }
    //get products collection
    const productsCollection = await getCollection("products");
    //sort  products by user id
    const myListings = await productsCollection.find({ sellerId: userId }).sort({ createdAt: -1 }).toArray();
    //if not return empty array
    if (myListings.length === 0) return { success: true, data: [] };
    //converting mongodb obj to obj
    const listings = myListings.map((listing) => ({
      ...listing,
      _id: listing._id.toString(),
      createdAt: listing.createdAt.toISOString(),
    }));
    return { success: true, data: listings };
  } catch (error) {
    console.error("Error fetching mylistings:", error);
    return { success: false, error: "Failed to fetch listings" };
  }
}
