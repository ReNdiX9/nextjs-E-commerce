// app/api/users/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    let body = {};
    try {
      body = await request.json();
    } catch {}

    const email = user?.emailAddresses?.[0]?.emailAddress;
    const firstName = body.firstName || user?.firstName || "";
    const lastName = body.lastName || user?.lastName || "";
    const phone = body.phone || "";

    const userCollections = await getCollection("users");

    // Check if user already exists in MongoDB
    const existingUser = await userCollections.findOne({ clerkId: userId });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" });
    }

    // Create new user document
    const newUser = {
      clerkId: userId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      createdAt: new Date(),
    };

    await userCollections.insertOne(newUser);
    return NextResponse.json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error creating user:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
