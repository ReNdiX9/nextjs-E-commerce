"use client";
import { useState } from "react";

export default function CreateItemPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter a name");
      return;
    }

    if (!description.trim()) {
      alert("Please enter a description");
      return;
    }

    if (Number(price) <= 0 || price === "") {
      alert("Please enter a valid price 0 or higher");
      return;
    }

    if (!image) {
      alert("Please select an image");
      return;
    }

    setTimeout(() => {
      const Item = {
        name: name,
        description: description,
        price: price,
      };
      // append the new item to the existing items in local storage and save it
      const existingItems = JSON.parse(localStorage.getItem("userListings")) || [];
      const updateditems = [...existingItems, Item];
      localStorage.setItem("userListings", JSON.stringify(updateditems));

      alert("Item saved to local storage");
      setName("");
      setDescription("");
      setPrice("");
      setImage("");
    }, 1000);
  };

  // implement the tailwind css in the page but keep the pattern of designing same  like background color, font color, font size, font weight, etc.

  return (
    <div className="min-h-screen bg-background">
      {/* header is called from the layout  */}

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-card-bg rounded-lg shadow-sm border border-card-border p-6">
          <h1 className="text-2xl font-semibold text-text-primary mb-6">List Your Item</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-3 border border-input-border rounded text-text-primary text-lg bg-input-bg"
                placeholder="name"
              />
            </div>
            <div>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-3 border border-input-border rounded text-text-primary text-lg bg-input-bg"
                placeholder="description"
              />
            </div>
            <div>
              <input
                type="number"
                value={price}
                min="0"
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-3 border border-input-border rounded text-text-primary text-lg bg-input-bg"
                placeholder="price"
              />
            </div>
            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded text-lg font-medium text-background bg-text-primary hover:opacity-80 transition-opacity"
              >
                Post Item
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
