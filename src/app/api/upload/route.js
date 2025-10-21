import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

//Cloudinary Config
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//POST method for uploading images to Cloudinary
export async function POST(request) {
  try {
    //Clerk Id
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    //Form Data from createItem component, where we getting images from
    const formData = await request.formData();
    const files = formData.getAll("images");

    //check for lenght
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    if (files.length > 4) {
      return NextResponse.json({ error: "Maximum 4 images allowed" }, { status: 400 });
    }

    // Uploading each image to Cloudinary
    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "marketplace-listings",
            resource_type: "image",
            transformation: [
              { width: 1200, height: 1200, crop: "limit" },
              { quality: "auto" },
              { fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        uploadStream.end(buffer);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);

    return NextResponse.json({ imageUrls });
  } catch (error) {
    console.error("Error uploading images:", error);
    return NextResponse.json({ error: "Failed to upload images" }, { status: 500 });
  }
}
