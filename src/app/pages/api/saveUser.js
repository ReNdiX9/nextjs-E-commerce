import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const client = await clientPromise;
        const db = client.db("ShopEase");
        const users = db.collection("users");

        const { name, email, phone, supabaseId } = req.body;

        const result = await users.insertOne({
            name,
            email,
            phone,
            supabaseId,
            createdAt: new Date(),
            accountStatus: "active"
        });

        res.status(201).json({ message: "User saved to MongoDB", userId: result.insertedId });
    } catch (err) {
        console.error("MongoDB error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}