"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex mb-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full"
        />
      </div>
      {/* Loading text */}
      <p className="text-gray-600 text-lg">Loading, please wait...</p>
    </div>
  );
}
