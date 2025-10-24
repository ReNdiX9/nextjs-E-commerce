"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import Loading from "@/app/loading";

export default function MyListingsPage() {
  const { userId } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const deleteNotification = () => toast.success("Your listing was successfully deleted!");

  useEffect(() => {
    const fetchMyListings = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/mylistings");

        if (!response.ok) {
          throw new Error("Failed to fetch listings");
        }

        const data = await response.json();
        setListings(data);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError("Failed to load your listings");
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, [userId]);

  //Delete function
  const handleDelete = async (productId) => {
    setDeletingId(productId);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete listing");
      }

      // Remove the deleted item from the list
      setListings((prev) => prev.filter((item) => item._id !== productId));

      // Show success message
      deleteNotification();
    } catch (err) {
      console.error("Error deleting listing:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // If not logged in
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

  // Loading state
  if (loading) <Loading />;

  return (
    <div className="min-h-screen bg-background">
      {/* Toast message*/}
      <ToastContainer position="top-center" theme="colored" style={{ zIndex: 10000 }} draggable autoClose={2000} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-card-bg rounded-2xl shadow-md border border-card-border p-6 md:p-8">
          <h1 className="text-3xl font-bold text-text-primary mb-6">My Listings</h1>

          {error && (
            <div className="mb-4 p-4  border  rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {listings.length === 0 ? (
            <div className="text-center py-12">
              <h1 className="text-text-secondary text-lg mb-2">No listings yet</h1>
              <p className="text-text-secondary text-sm mb-6">Start by creating your first listing!</p>
              <Link
                href="/createItem"
                className="inline-block px-6 py-3 bg-text-primary text-background rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                Create Listing
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((item) => (
                <div
                  key={item._id}
                  className="border border-card-border rounded-xl p-4 hover:shadow-lg transition-all duration-200 bg-card-bg flex gap-4"
                >
                  {/* Image */}
                  {item.images && item.images.length > 0 && (
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-text-primary font-semibold text-xl mb-1 truncate">{item.title}</h3>
                    <p className="text-text-secondary text-sm mb-2">Category: {item.category}</p>
                    <p className="text-text-secondary text-sm mb-2">Condition: {item.condition}</p>
                    <p className="text-green-600 font-bold text-xl">${item.price.toFixed(2)}</p>
                    <p className="text-text-secondary text-xs mt-2">
                      Listed: {new Date(item.createdAt).toLocaleDateString() ?? Date(item.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 justify-center">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="px-4 py-2 cursor-pointer text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              <div className="text-center pt-4 border-t border-card-border mt-6">
                <p className="text-text-secondary text-sm">
                  Total: {listings.length} listing{listings.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
