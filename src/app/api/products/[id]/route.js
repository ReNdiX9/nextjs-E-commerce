import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

// GET  a single product
export async function GET(_request, { params }) {
  try {
    const { id } = params;
    const productsCollection = await getCollection("products");
    const product = await productsCollection.findOne({ _id: ObjectId(id) });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT update product(i am not sure if we will have it )
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const productsCollection = await getCollection("products");

    const result = await productsCollection.updateOne(
      { _id: ObjectId(id) },
      { $set: { ...body, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product updated" });
  } catch (err) {
    console.error("Error updating product:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE product by ID
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

    const productsCollection = await getCollection("products");

    // First, check if the product exists and belongs to the user
    const product = await productsCollection.findOne({
      _id: ObjectId(productId),
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Verify that the user owns this listing
    if (product.sellerId !== userId) {
      return NextResponse.json(
        {
          error: "Forbidden: You can only delete your own listings",
        },
        { status: 403 }
      );
    }

    // Delete the product
    const result = await productsCollection.deleteOne({
      _id: ObjectId(productId),
      sellerId: userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Product deleted successfully",
      deletedId: productId,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
//TODO fix delete a product functionality !!! Invalid product ID !!!
