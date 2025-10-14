//api/products/route.js

import { getCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const runtime = "nodejs";

//GET all products
export async function GET() {
  try {
    const productsCollection = await getCollection("products");
    if (!productsCollection) {
      return NextResponse.json({ error: "DB not available" }, { status: 500 });
    }
    const products = await productsCollection.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

//POST new product
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const body = await request.json();
    const productsCollection = await getCollection("products");

    const newProduct = {
      ...body,
      createdAt: new Date(),
    };
    const result = await productsCollection.insertOne(newProduct);
    return NextResponse.json({ message: "Product created", id: result.insertedId });
  } catch (error) {
    console.log("Error creating product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
