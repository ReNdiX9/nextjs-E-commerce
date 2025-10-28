//api/products/route.js

import { getCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const runtime = "nodejs";

//GET all products - method to display all products on the home page
export async function GET(req) {
  try {
    console.log("Attempting to fetch products...");
    
    //get searchParams from url
    const searchParams = req.nextUrl.searchParams;
    //Pagination params
    const page = parseInt(searchParams.get("page" || "1"));
    const limit = parseInt(searchParams.get("limit" || "12"));
    const skip = (page - 1) * limit;
    //Filter Params
    const q = searchParams.get("q") || "";
    const categories = searchParams.get("categories")?.split(",").filter(Boolean) || [];
    const conditions = searchParams.get("conditions")?.split(",").filter(Boolean) || [];
    const min = searchParams.get("min");
    const max = searchParams.get("max");

    const productsCollection = await getCollection("products");

    if (!productsCollection) {
      console.error("Failed to get products collection");
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // MongoDB query
    const query = {};

    // Search query by title
    if (q) {
      query.$or = [{ title: { $regex: q, $options: "i" } }];
    }
    // Category filter
    if (categories.length > 0) {
      query.category = { $in: categories };
    }
    // Condition filter
    if (conditions.length > 0) {
      query.condition = { $in: conditions };
    }
    // Price range filter
    if (min || max) {
      query.price = {};
      if (min) query.price.$gte = parseFloat(min);
      if (max) query.price.$lte = parseFloat(max);
    }
    // Execute query with pagination
    const [products, total] = await Promise.all([
      productsCollection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      productsCollection.countDocuments(query),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
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
      sellerId: userId,
      userId, // Keep both for backward compatibility
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
