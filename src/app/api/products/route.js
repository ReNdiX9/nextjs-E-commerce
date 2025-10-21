//api/products/route.js

import { getCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const runtime = "nodejs";

//GET all products - method to display all products on the home page
export async function GET() {
  try {
    console.log("Attempting to fetch products...");
    const productsCollection = await getCollection("products");

    if (!productsCollection) {
      console.error("Failed to get products collection");
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    console.log("Products collection obtained, fetching products...");
    const products = await productsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    console.log(`Found ${products.length} products`);

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

//POST  - method to list new product
export async function POST(request) {
  try {
    console.log("Attempting to create new product...");

    const { userId } = await auth();
    if (!userId) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Request body received:", body);

    const productsCollection = await getCollection("products");
    if (!productsCollection) {
      console.error("Failed to get products collection");
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const newProduct = {
      ...body,
      userId,
      createdAt: new Date(),
    };

    console.log("Inserting product:", newProduct);
    const result = await productsCollection.insertOne(newProduct);
    console.log("Product inserted with ID:", result.insertedId);

    return NextResponse.json({
      message: "Product created successfully",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
