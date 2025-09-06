"use client";

import React from "react";
import Link from "next/link";

const Cart = () => {
  const cartItems = [
    { id: 1, name: "Wireless Headphones", price: 79.99, quantity: 1, image: "Headphones" },
    { id: 2, name: "Smart Watch", price: 199.99, quantity: 1, image: "Smart Watch" },
    { id: 3, name: "Coffee Maker", price: 89.99, quantity: 2, image: "Coffee Maker" },
    { id: 4, name: "Running Shoes", price: 129.99, quantity: 1, image: "Running Shoes" },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  return (
    <>
      <style jsx>{`
        .quantity-btn:hover {
          background-color: #f0f0f0 !important;
          border-color: #999 !important;
        }
        .remove-btn:hover {
          color: #333 !important;
        }
        .continue-shopping:hover {
          background-color: #333 !important;
          color: white !important;
        }
        .checkout-btn:hover {
          background-color: #555 !important;
          transform: translateY(-1px) !important;
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
        }}>Simple shopping made easy</p>
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
          fontWeight: "600",
          backgroundColor: "#f0f0f0",
          transition: "all 0.2s ease"
        }}>Cart</Link>
      </nav>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "3rem" }}>
        {/* Cart Items */}
        <div>
          <div style={{ 
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: "2rem"
          }}>
            <h2 style={{ 
              margin: "0 0 2rem 0", 
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#333"
            }}>Shopping Cart ({cartItems.length} items)</h2>
            
            {cartItems.map((item) => (
              <div key={item.id} style={{ 
                display: "flex", 
                alignItems: "center", 
                padding: "1.5rem 0", 
                borderBottom: "1px solid #eee",
                gap: "1.5rem"
              }}>
                {/* Product Image */}
                <div style={{ 
                  width: "120px", 
                  height: "120px", 
                  background: "#f5f5f5", 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                  fontSize: "1.2rem",
                  textAlign: "center",
                  flexShrink: 0,
                  borderRadius: "6px",
                  border: "1px solid #ddd"
                }}>
                  {item.image}
                </div>

                {/* Product Info */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: "0 0 0.5rem 0", 
                    fontSize: "1.2rem",
                    fontWeight: "600",
                    color: "#333"
                  }}>{item.name}</h3>
                  <p style={{ 
                    margin: "0 0 1rem 0", 
                    color: "#666",
                    fontSize: "1rem"
                  }}>${item.price.toFixed(2)} each</p>
                  
                  {/* Quantity Controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <button className="quantity-btn" style={{ 
                      width: "36px", 
                      height: "36px", 
                      border: "1px solid #ddd", 
                      background: "white", 
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                      color: "#333",
                      transition: "all 0.2s ease"
                    }}
                    >
                      −
                    </button>
                    <span style={{ 
                      minWidth: "40px", 
                      textAlign: "center", 
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "#333"
                    }}>
                      {item.quantity}
                    </span>
                    <button className="quantity-btn" style={{ 
                      width: "36px", 
                      height: "36px", 
                      border: "1px solid #ddd", 
                      background: "white", 
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                      color: "#333",
                      transition: "all 0.2s ease"
                    }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price and Actions */}
                <div style={{ textAlign: "right", minWidth: "140px" }}>
                  <p style={{ 
                    margin: "0 0 1rem 0", 
                    fontWeight: "700", 
                    fontSize: "1.3rem",
                    color: "#333"
                  }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button className="remove-btn" style={{ 
                    background: "none", 
                    border: "none", 
                    color: "#666", 
                    cursor: "pointer",
                    textDecoration: "underline",
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

            {/* Continue Shopping */}
            <div style={{ marginTop: "2rem", textAlign: "center" }}>
              <Link href="/products" className="continue-shopping" style={{ 
                display: "inline-block", 
                padding: "1rem 2rem", 
                background: "white", 
                color: "#333", 
                textDecoration: "none",
                border: "2px solid #333",
                borderRadius: "6px",
                fontWeight: "600",
                fontSize: "1rem",
                transition: "all 0.2s ease"
              }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div style={{ 
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            position: "sticky",
            top: "2rem"
          }}>
            <h2 style={{ 
              margin: "0 0 2rem 0", 
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#333"
            }}>Order Summary</h2>
            
            {/* Order Details */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: "1rem",
                padding: "0.75rem 0",
                borderBottom: "1px solid #eee"
              }}>
                <span style={{ color: "#666", fontWeight: "500" }}>Subtotal ({cartItems.length} items):</span>
                <span style={{ fontWeight: "600", fontSize: "1.1rem", color: "#333" }}>${subtotal.toFixed(2)}</span>
              </div>
              
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: "1rem",
                padding: "0.75rem 0",
                borderBottom: "1px solid #eee"
              }}>
                <span style={{ color: "#666", fontWeight: "500" }}>Tax (8%):</span>
                <span style={{ fontWeight: "600", fontSize: "1.1rem", color: "#333" }}>${tax.toFixed(2)}</span>
              </div>
              
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: "1.5rem",
                padding: "0.75rem 0",
                borderBottom: "1px solid #eee"
              }}>
                <span style={{ color: "#666", fontWeight: "500" }}>Shipping:</span>
                <span style={{ 
                  fontWeight: "600", 
                  fontSize: "1.1rem",
                  color: shipping === 0 ? "#28a745" : "#333"
                }}>
                  {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              
              {shipping === 0 && (
                <div style={{ 
                  background: "#f0f8f0",
                  color: "#28a745",
                  padding: "1rem",
                  borderRadius: "6px",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  border: "1px solid #d4edda"
                }}>
                  🎉 Free shipping on orders over $100!
                </div>
              )}
            </div>
            
            {/* Total */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "1.5rem 0", 
              borderTop: "2px solid #ddd",
              marginBottom: "2rem"
            }}>
              <span style={{ 
                fontSize: "1.25rem",
                fontWeight: "700",
                color: "#333"
              }}>
                Total:
              </span>
              <span style={{ 
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "#333"
              }}>
                ${total.toFixed(2)}
              </span>
            </div>
            
            {/* Checkout Button */}
            <Link href="/checkout" className="checkout-btn" style={{ 
              display: "block",
              width: "100%", 
              background: "#333", 
              color: "white", 
              border: "none", 
              padding: "1rem 2rem", 
              cursor: "pointer",
              fontSize: "1.1rem",
              fontWeight: "600",
              textDecoration: "none",
              textAlign: "center",
              borderRadius: "6px",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}
            >
              Proceed to Checkout
            </Link>
            
            {/* Security Badge */}
            <div style={{ 
              marginTop: "1.5rem", 
              textAlign: "center",
              padding: "1rem",
              background: "#f9f9f9",
              borderRadius: "6px",
              border: "1px solid #eee"
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: "0.5rem",
                marginBottom: "0.5rem",
                color: "#28a745",
                fontWeight: "500"
              }}>
                🔒 Secure Checkout
              </div>
              <p style={{ 
                margin: 0, 
                fontSize: "0.8rem", 
                color: "#666" 
              }}>
                Your payment information is safe and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Cart;