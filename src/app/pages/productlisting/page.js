"use client";

import React, { useState } from "react";
import Link from "next/link";

const ProductListing = () => {
  const [products, setProducts] = useState([
    { id: 1, name: "Wireless Headphones", price: 79.99, description: "High-quality wireless headphones", image: "🎧", category: "Electronics" },
    { id: 2, name: "Smart Watch", price: 199.99, description: "Advanced fitness tracking smartwatch", image: "⌚", category: "Electronics" },
    { id: 3, name: "Coffee Maker", price: 89.99, description: "Premium coffee brewing machine", image: "☕", category: "Appliances" },
    { id: 4, name: "Running Shoes", price: 129.99, description: "Comfortable athletic running shoes", image: "👟", category: "Sports" },
    { id: 5, name: "Laptop", price: 899.99, description: "High-performance laptop for work and gaming", image: "💻", category: "Electronics" },
    { id: 6, name: "Bluetooth Speaker", price: 59.99, description: "Portable wireless speaker with great sound", image: "🔊", category: "Electronics" },
    { id: 7, name: "Yoga Mat", price: 39.99, description: "Non-slip premium yoga mat", image: "🧘", category: "Sports" },
    { id: 8, name: "Air Fryer", price: 149.99, description: "Healthy cooking with less oil", image: "🍟", category: "Appliances" },
  ]);

  const [sortBy, setSortBy] = useState("name");
  const [filterCategory, setFilterCategory] = useState("all");

  // Get unique categories
  const categories = ["all", ...new Set(products.map(product => product.category))];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => filterCategory === "all" || product.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <>
      <style jsx>{`
        .product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important;
        }
        .filter-btn:hover {
          background-color: #333 !important;
          color: white !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .sort-select:focus {
          outline: none;
          border-color: #333;
          box-shadow: 0 0 0 2px rgba(51, 51, 51, 0.1);
        }
        h1, h2, h3, h4, h5, h6 {
          color: #333 !important;
        }
        p, span, label {
          color: #333 !important;
        }
        .sort-select {
          color: #333 !important;
        }
        .sort-select option {
          color: #333 !important;
        }
      `}</style>
      <div style={{ 
        fontFamily: "Arial, sans-serif", 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: "2rem",
        backgroundColor: "#f9f9f9",
        minHeight: "100vh"
      }}>
        {/* Header */}
        <header style={{ 
          textAlign: "center", 
          marginBottom: "3rem",
          padding: "2rem",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h1 style={{ 
            margin: "0 0 0.5rem 0", 
            fontSize: "2.8rem",
            fontWeight: "700",
            color: "#333"
          }}>ShopEase</h1>
          <p style={{ 
            color: "#666", 
            margin: 0, 
            fontSize: "1.1rem",
            fontWeight: "400"
          }}>Browse our complete product catalog</p>
        </header>

        {/* Navigation */}
        <nav style={{ 
          textAlign: "center", 
          marginBottom: "3rem",
          padding: "1rem",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <Link href="/" style={{ 
            margin: "0 1.5rem", 
            textDecoration: "none", 
            color: "#333",
            padding: "0.75rem 1.5rem",
            borderRadius: "4px",
            fontWeight: "500",
            transition: "all 0.2s ease"
          }}>Home</Link>
          <Link href="/products" style={{ 
            margin: "0 1.5rem", 
            textDecoration: "none", 
            color: "#333",
            padding: "0.75rem 1.5rem",
            borderRadius: "4px",
            fontWeight: "600",
            backgroundColor: "#f0f0f0",
            transition: "all 0.2s ease"
          }}>Products</Link>
          <Link href="/cart" style={{ 
            margin: "0 1.5rem", 
            textDecoration: "none", 
            color: "#333",
            padding: "0.75rem 1.5rem",
            borderRadius: "4px",
            fontWeight: "500",
            transition: "all 0.2s ease"
          }}>Cart</Link>
        </nav>

        {/* Filters and Sorting */}
        <div style={{ 
          marginBottom: "2rem",
          padding: "1.5rem",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            {/* Category Filter */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "0.5rem", 
                fontWeight: "600",
                color: "#333"
              }}>Filter by Category:</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setFilterCategory(category)}
                    className="filter-btn"
                    style={{
                      padding: "0.5rem 1rem",
                      border: "1px solid #ddd",
                      background: filterCategory === category ? "#333" : "white",
                      color: filterCategory === category ? "white" : "#333",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      textTransform: "capitalize",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "0.5rem", 
                fontWeight: "600",
                color: "#333"
              }}>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  backgroundColor: "white"
                }}
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div style={{ 
          marginBottom: "1.5rem",
          padding: "1rem",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <p style={{ 
            margin: 0, 
            color: "#666",
            fontSize: "1rem",
            fontWeight: "500"
          }}>
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            {filterCategory !== "all" && ` in ${filterCategory}`}
          </p>
        </div>

        {/* Products Grid */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
          gap: "1.5rem",
          marginBottom: "2rem"
        }}>
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card" style={{ 
              border: "1px solid #e0e0e0", 
              padding: "1.5rem",
              textAlign: "center",
              borderRadius: "8px",
              backgroundColor: "white",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}>
              <div style={{ 
                height: "120px", 
                background: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)", 
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4a5568",
                fontSize: "3rem",
                borderRadius: "6px",
                border: "2px solid #e2e8f0"
              }}>
                {product.image}
              </div>
              <h3 style={{ 
                margin: "0 0 0.5rem 0", 
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#333"
              }}>{product.name}</h3>
              <p style={{ 
                margin: "0 0 0.5rem 0", 
                color: "#666",
                fontSize: "0.9rem",
                minHeight: "40px"
              }}>{product.description}</p>
              <p style={{ 
                margin: "0 0 0.5rem 0", 
                color: "#28a745",
                fontSize: "0.8rem",
                fontWeight: "500",
                textTransform: "uppercase"
              }}>{product.category}</p>
              <p style={{ 
                margin: "0 0 1rem 0", 
                color: "#333",
                fontSize: "1.3rem",
                fontWeight: "700"
              }}>${product.price.toFixed(2)}</p>
              <Link href="/cart" style={{ 
                display: "inline-block",
                background: "#333", 
                color: "white", 
                border: "none", 
                padding: "0.75rem 1.5rem", 
                cursor: "pointer",
                textDecoration: "none",
                borderRadius: "4px",
                fontSize: "0.9rem",
                fontWeight: "500",
                transition: "all 0.2s ease",
                width: "100%"
              }}>
                Add to Cart
              </Link>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredProducts.length === 0 && (
          <div style={{ 
            textAlign: "center",
            padding: "3rem",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ 
              margin: "0 0 1rem 0", 
              color: "#666",
              fontSize: "1.5rem"
            }}>No products found</h3>
            <p style={{ 
              margin: "0 0 2rem 0", 
              color: "#999"
            }}>Try adjusting your filters or browse all products</p>
            <button
              onClick={() => setFilterCategory("all")}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#333",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "500"
              }}
            >
              Show All Products
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductListing;
