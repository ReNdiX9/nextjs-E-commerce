import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
const mongoClientPromise = client.connect();

export async function POST(req) {
  try {
    const body = await req.json();

    if (body.type !== "user.created" || !body.data) {
      return new Response(JSON.stringify({ ignored: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = {
      clerkId: body.data.id,
      primaryEmailId: body.data.primary_email_address_id || null,
      email: body.data.email_addresses?.[0]?.email_address || "no-email-provided",
      firstName: body.data.first_name || "Unknown",
      lastName: body.data.last_name || "Unknown",
      imageUrl: body.data.image_url || null,
      createdAt: new Date(),
    };

    const client = await mongoClientPromise;
    const db = client.db("shopease");
    await db.collection("users").insertOne(user);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
