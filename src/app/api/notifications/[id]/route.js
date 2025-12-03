import { getCollection } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

//PATCH method to edit read field
export async function PATCH(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    //extract id and read field from body
    const { id } = await params;
    const { read } = await request.json();

    const notifications = await getCollection("notifications");

    const result = await notifications.updateOne(
      {
        _id: new ObjectId(id),
        userId, // Make sure user owns this notification
      },
      {
        $set: { read },
      }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: " Failed to update notification" }, { status: 500 });
  }
}

// DELETE  to Delete a notification
export async function DELETE(_request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const notifications = await getCollection("notifications");

    const result = await notifications.deleteOne({
      _id: new ObjectId(id),
      userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}
