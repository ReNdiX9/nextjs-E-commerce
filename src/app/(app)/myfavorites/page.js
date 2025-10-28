// app/(app)/favorites/page.js
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getFavorites } from "./actions";
import FavoritesClient from "../../../components/FavoritesClient";

export default async function MyFavourites() {
  // Get userId from Clerk auth
  const { userId } = await auth();

  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect("/signin");
  }

  // Fetch favorites data on the server using server actions
  const items = await getFavorites(userId);

  return <FavoritesClient initialItems={items} />;
}
