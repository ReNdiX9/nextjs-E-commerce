"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { FiUpload, FiX } from "react-icons/fi";
import { Categories, Conditions } from "@/lib/utils";
import { ToastContainer, toast } from "react-toastify";

export default function CreateListingPage() {
  const { userId } = useAuth();

  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    location: "",
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onListed = () => toast.success("Your item has been listed successfully!");

  const categories = useMemo(() => Categories, []);
  const conditions = useMemo(() => Conditions, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setLoadingUser(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 4) {
      setError("Maximum 4 images allowed");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setError("Valid price is required");
      return;
    }
    if (!formData.category) {
      setError("Category is required");
      return;
    }
    if (!formData.condition) {
      setError("Condition is required");
      return;
    }
    if (!formData.location.trim()) {
      setError("Location is required");
      return;
    }
    //Logic for images count
    if (images.length === 0) {
      setError("At least one image is required");
      return;
    }

    setLoading(true);

    try {
      // STEP 1: Upload images to Cloudinary
      const imageFormData = new FormData();
      images.forEach((image) => {
        imageFormData.append("images", image);
      });

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: imageFormData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to upload images");
      }

      const { imageUrls } = await uploadResponse.json();

      // STEP 2: Build seller name
      const sellerName =
        userData?.firstName && userData?.lastName
          ? `${userData.firstName} ${userData.lastName}`
          : userData?.firstName || "Anonymous User";

      // STEP 3: Create product listing with Cloudinary URLs
      const listingData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        location: formData.location.trim() || "Not specified",
        images: imageUrls,
        sellerId: userId,
        sellerName: sellerName,
        sellerEmail: userData?.email || "",
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create listing");
      }

      // Success!
      onListed();

      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        category: "",
        condition: "",
        location: "",
      });
      setImages([]);
      setImagePreviews([]);
    } catch (err) {
      setError(err.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full px-4 py-3 border border-input-border rounded-lg text-text-primary bg-input-bg outline-none focus:border-text-primary hover:border-text-primary transition-all";

  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Please sign in to list an item</h2>
          <a href="/signin" className="text-text-secondary underline">
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer draggable position="top-center" theme="colored" autoClose={2000} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-card-bg rounded-2xl shadow-md border border-card-border p-6 md:p-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">List Your Item</h1>
          <p className="text-text-secondary mb-6">Fill in the details to list your item for sale</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Photos * (Max 4)</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden border border-input-border"
                  >
                    <Image src={preview} alt={`Preview ${index + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                    >
                      <FiX size={16} />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        Cover
                      </div>
                    )}
                  </div>
                ))}
                {images.length < 4 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-input-border hover:border-text-primary transition-colors cursor-pointer flex flex-col items-center justify-center bg-input-bg">
                    <FiUpload size={24} className="text-text-secondary mb-1" />
                    <span className="text-xs text-text-secondary text-center px-2">Add Photo</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
              <p className="text-xs text-text-secondary">First photo will be the cover image</p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                className={inputBase}
                placeholder="e.g. iPhone 13 Pro Max 256GB"
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-input-border rounded-lg text-text-primary bg-input-bg outline-none focus:border-text-primary hover:border-text-primary max-h-72"
                rows={3}
                placeholder="Describe your item and any important details..."
                maxLength={1000}
              />
              <p className="text-xs text-text-secondary ">{formData.description.length}/1000 characters</p>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2" htmlFor="price">
                Price($)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className={inputBase}
                placeholder="0.00"
              />
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2" htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={inputBase}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2" htmlFor="condition">
                  Condition
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className={inputBase}
                >
                  <option value="">Select condition</option>
                  {conditions.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2" htmlFor="location">
                Location(City)
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
                className={inputBase}
                placeholder="e.g. Los Angeles, CA"
              />
              <p className="text-xs text-text-secondary mt-1">Helps buyers find local items</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-lg text-lg font-semibold text-background bg-text-primary hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer hover:scale-103"
            >
              {loading ? "Posting..." : "Post Listing"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
