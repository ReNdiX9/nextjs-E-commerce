import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

//categories
export const Categories = [
  "Electronics",
  "Clothing",
  "Jewelry",
  "Home & Garden",
  "Sports & Outdoors",
  "Books",
  "Toys & Games",
  "Vehicles",
  "Other",
];

export const Conditions = ["New", "Like New", "Good", "Fair", "For Parts"];
