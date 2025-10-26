// Test database connection
import { getCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Testing database connection...");

    // Test the connection
    const testCollection = await getCollection("test");
    if (!testCollection) {
      return NextResponse.json(
        { error: "Failed to connect to database" },
        { status: 500 }
      );
    }

    // Try to ping the database
    const adminDb = testCollection.db.admin();
    const pingResult = await adminDb.ping();

    console.log("Database ping successful:", pingResult);

    return NextResponse.json({
      message: "Database connection successful",
      ping: pingResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database connection test failed:", error);
    return NextResponse.json(
      {
        error: "Database connection failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
