import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user?.emailAddresses?.[0]?.emailAddress;
    const name = user?.firstName || user?.publicMetadata?.firstName || "User";
    const phone = user?.publicMetadata?.phone || "";
    const userCollections = await getCollection("users");
    const existingUser = await userCollections.findOne({ clerkId: userId });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" });
    }
    const newUser = {
      clerkId: userId,
      name: name,
      email: email,
      phone: phone,
      createdAt: new Date(),
    };
    await userCollections.insertOne(newUser);
    return NextResponse.json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
