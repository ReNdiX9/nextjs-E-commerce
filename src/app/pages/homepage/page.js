"use client";

import React, { useState } from "react";
import Link from "next/link";

const Homepage = () => {
  const [products, setProducts] = useState([
    { id: 1, name: "Wireless Headphones", price: 79.99, description: "High-quality wireless headphones", image: "🎧" },
    { id: 2, name: "Smart Watch", price: 199.99, description: "Advanced fitness tracking smartwatch", image: "⌚" },
    { id: 3, name: "Coffee Maker", price: 89.99, description: "Premium coffee brewing machine", image: "☕" },
    { id: 4, name: "Running Shoes", price: 129.99, description: "Comfortable athletic running shoes", image: "👟" },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    image: ""
  });

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (newProduct.name && newProduct.price && newProduct.description) {
      const product = {
        id: products.length + 1,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        description: newProduct.description,
        image: newProduct.image || "📦"
      };
      setProducts([...products, product]);
      setNewProduct({ name: "", price: "", description: "", image: "" });
      setShowAddForm(false);
    }
  };

  const handleRemoveProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  return (
    <>
      <style jsx>{`
        input::placeholder,
        textarea::placeholder {
          color: #999 !important;
          opacity: 1;
        }
        input:focus,
        textarea:focus {
          outline: none;
          border-color: #333;
          box-shadow: 0 0 0 2px rgba(51, 51, 51, 0.1);
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
        }}>Simple shopping made easy - List your own products!</p>
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
          fontWeight: "500",
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

      {/* Main Content */}
      <main>
        <div style={{ 
          textAlign: "center", 
          marginBottom: "3rem",
          padding: "2rem",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ 
            marginBottom: "1rem", 
            fontSize: "1.8rem",
            fontWeight: "600",
            color: "#333"
          }}>Welcome to our store</h2>
          <p style={{ 
            color: "#666", 
            marginBottom: "2rem",
            fontSize: "1.1rem"
          }}>Find everything you need in one place - or list your own products!</p>
          
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/products" style={{ 
              display: "inline-block", 
              padding: "0.75rem 1.5rem", 
              background: "#333", 
              color: "white", 
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: "500",
              transition: "all 0.2s ease"
            }}>
              Browse Products
            </Link>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              style={{ 
                display: "inline-block", 
                padding: "0.75rem 1.5rem", 
                background: "#28a745", 
                color: "white", 
                border: "none",
                borderRadius: "6px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {showAddForm ? "Cancel" : "➕ List Your Product"}
            </button>
          </div>
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <div style={{ 
            marginBottom: "3rem",
            padding: "2rem",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ 
              marginBottom: "1.5rem", 
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#333",
              textAlign: "center"
            }}>Add Your Product</h3>
            <form onSubmit={handleAddProduct} style={{ maxWidth: "600px", margin: "0 auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "0.5rem", 
                    fontWeight: "500",
                    color: "#333"
                  }}>Product Name *</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Enter product name"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "1rem",
                      color: "#333"
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "0.5rem", 
                    fontWeight: "500",
                    color: "#333"
                  }}>Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="0.00"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "1rem",
                      color: "#333"
                    }}
                    required
                  />
                </div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "0.5rem", 
                  fontWeight: "500",
                  color: "#333"
                }}>Description *</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Describe your product..."
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    resize: "vertical",
                    color: "#333"
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "0.5rem", 
                  fontWeight: "500",
                  color: "#333"
                }}>Product Icon (emoji)</label>
                <input
                  type="text"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                  placeholder="📦 (optional)"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    color: "#333"
                  }}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <button
                  type="submit"
                  style={{
                    padding: "0.75rem 2rem",
                    background: "#333",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Grid */}
        <div style={{ 
          marginBottom: "2rem",
          padding: "2rem",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ 
            marginBottom: "2rem", 
            fontSize: "1.5rem",
            fontWeight: "600",
            color: "#333",
            textAlign: "center"
          }}>Available Products ({products.length})</h3>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
            gap: "1.5rem" 
          }}>
            {products.map((product) => (
              <div key={product.id} style={{ 
                border: "1px solid #e0e0e0", 
                padding: "1.5rem",
                textAlign: "center",
                borderRadius: "8px",
                backgroundColor: "#fafafa",
                transition: "all 0.2s ease"
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
                <h4 style={{ 
                  margin: "0 0 0.5rem 0", 
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  color: "#333"
                }}>{product.name}</h4>
                <p style={{ 
                  margin: "0 0 0.5rem 0", 
                  color: "#666",
                  fontSize: "0.9rem",
                  minHeight: "40px"
                }}>{product.description}</p>
                <p style={{ 
                  margin: "0 0 1rem 0", 
                  color: "#333",
                  fontSize: "1.3rem",
                  fontWeight: "700"
                }}>${product.price.toFixed(2)}</p>
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                  <Link href="/cart" style={{ 
                    display: "inline-block",
                    background: "#333", 
                    color: "white", 
                    border: "none", 
                    padding: "0.5rem 1rem", 
                    cursor: "pointer",
                    textDecoration: "none",
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    transition: "all 0.2s ease"
                  }}>
                    Add to Cart
                  </Link>
                  <button 
                    onClick={() => handleRemoveProduct(product.id)}
                    style={{ 
                      display: "inline-block",
                      background: "#e53e3e", 
                      color: "white", 
                      border: "none", 
                      padding: "0.5rem 1rem", 
                      cursor: "pointer",
                      borderRadius: "4px",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      transition: "all 0.2s ease"
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      </div>
    </>
  );
};

export default Homepage;
