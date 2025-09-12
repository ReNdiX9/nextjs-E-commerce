"use client";

// Styling implemented using Tailwind CSS based on prompt: "implement the tailwind css in the page but keep the pattern of designing same"
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MyListingsPage() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const savedItems = localStorage.getItem('userListings');
    if (savedItems) {
      setListings(JSON.parse(savedItems));
    }
  }, []);

  // implement the tailwind css in the page but keep the pattern of designing same  like background color, font color, font size, font weight, etc. 
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            My Listings
          </h1>
          
          {listings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No items yet</p>
              <p className="text-gray-400 text-sm mt-2">Start by creating your first listing!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <p className="text-gray-900 font-semibold text-lg">{item.name}</p>
                  <p className="text-green-600 font-bold text-xl">${item.price}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
