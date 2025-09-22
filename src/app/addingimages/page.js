
"use client";
import { useState } from "react";
export default function ImageUploading({ onImageSelect }) {
  const [preview, setPreview] = useState("");
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MaxMB = 2;
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPEG, PNG, and GIF files are allowed.");
      e.target.value = ""; // Clear the input
      return;
    }

    if (file.size > MaxMB * 1024 * 1024) {
      alert(`File size exceeds ${MaxMB}MB limit.`);
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      onImageSelect(file);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full px-3 py-3 border border-gray-300 rounded text-black text-lg"
      />

      {preview && (
        <div className="mt-2">
          <image
            src={preview}
            alt="preview"
            className="max-h-40 rounded border border-gray-200"
          />
        </div>
      )}
    </div>
  );
}
