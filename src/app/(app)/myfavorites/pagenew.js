// app/(app)/myfavorites/page.js

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import FavoritesClient from "./FavoritesClient";

export default async function MyFavoritesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }
  console.log("myfavorites API: userId =", userId);

  const baseUrl = "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/myfavorites`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch favorites");
  }
  const data = await response.json();

  return <FavoritesClient initialItems={data} />;
}
