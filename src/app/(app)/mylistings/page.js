import { auth } from "@clerk/nextjs/server";

import { getMyListings } from "../../../actions/myListingsActions";
import MyListingsClient from "@/components/MyListingsClient";
import Link from "next/link";

export default async function MyListingsPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Please sign in to view your listings</h2>
          <Link href="/signin" className="text-text-secondary underline">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }
  //fetching listing with server actions
  const result = await getMyListings();
  if (!result.success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">{result.error}</p>
        </div>
      </div>
    );
  }
  return <MyListingsClient initialListings={result.data} />;
}
