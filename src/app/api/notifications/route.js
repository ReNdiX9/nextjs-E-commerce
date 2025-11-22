import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

//POST
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sellerId, productId, productTitle, offerAmount } = await request.json();

    // Validation
    if (!sellerId || !productId || !productTitle || !offerAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    //  Getting sender name from users collection
    const users = await getCollection("users");
    const sender = await users.findOne({ clerkId: userId });

    const senderName =
      sender?.firstName && sender?.lastName
        ? `${sender.firstName} ${sender.lastName}`
        : sender?.firstName || "Anonymous";

    const notifications = await getCollection("notifications");
    const notification = await notifications.insertOne({
      userId: sellerId, //seller
      senderId: userId,
      senderName: senderName,
      productId,
      productTitle,
      offerAmount: Number(offerAmount),
      read: false,
      createdAt: new Date(),
    });
    return NextResponse.json({
      success: true,
      notificationId: notification.insertedId.toString(),
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}

//GET to get notifications for the user
export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await getCollection("notifications");

    const userNotifications = await notifications.find({ userId }).sort({ createdAt: -1 }).limit(50).toArray();

    // Serialize MongoDB documents
    const serializedNotifications = userNotifications.map((notif) => ({
      _id: notif._id.toString(),
      userId: notif.userId,
      senderId: notif.senderId,
      senderName: notif.senderName,
      productId: notif.productId,
      productTitle: notif.productTitle,
      offerAmount: notif.offerAmount,
      read: notif.read,
      createdAt: notif.createdAt.toISOString(),
    }));

    const unreadCount = serializedNotifications.filter((n) => !n.read).length;

    return NextResponse.json({
      notifications: serializedNotifications,
      unreadCount: unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
