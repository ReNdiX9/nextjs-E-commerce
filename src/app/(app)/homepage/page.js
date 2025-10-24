//homepage.js
"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductsPage from "@/app/(app)/products/page";
import SideBar from "@/components/SideBar";
import { useState } from "react";

export default function Homepage() {
  const [filters, setFilters] = useState({ q: "", categories: [], min: null, max: null, conditions: [] });

  return (
    <div className="px-2 bg-background w-full h-full">
      <Header />
      <main className="grid grid-cols-1 md:grid-cols-5 gap-4 my-4">
        {/*Sidebar*/}
        <div className="md:col-span-1">
          <SideBar onApply={setFilters} />
        </div>
        {/*Products */}
        <section className="md:col-span-4">
          <ProductsPage filters={filters} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
