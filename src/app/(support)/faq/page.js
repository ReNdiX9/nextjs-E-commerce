"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useState } from "react";

const faqs = [
  {
    question: "What is ShopEase?",
    response:
      "ShopEase is an online platform where users can buy and sell items locally. You can post ads for products, browse listings, message sellers, and arrange purchases or sales directly.",
  },
  {
    question: "How do I create an account?",
    response:
      "Click the “Sign Up” button at the top right of the page, fill in your details, and follow the verification instructions sent to your email.",
  },
  {
    question: "How do I post an item for sale?",
    response:
      "After logging in, click “Post an Ad” or “Sell” and fill out the item details, including photos, price, and description. Once you submit, your listing will appear to buyers.",
  },
  {
    question: "How do I contact a seller or buyer?",
    response:
      "Open the listing you’re interested in and click “Message Seller.” You can chat directly through our secure messaging system.",
  },
  {
    question: "How are payments handled?",
    response:
      "Payments can be arranged directly between buyer and seller, either in person (cash) or through our secure online payment system (if supported). Always meet in safe, public locations for in-person transactions.",
  },
  {
    question: "Are there any fees to use the platform?",
    response:
      "Browsing and posting basic ads are free. We may offer premium features (like promoted listings or payment processing) for an additional fee.",
  },
  {
    question: "How do I edit or delete my listing?",
    response: "Go to your profile, find the listing under “My Ads” or “My Listings,” and click “Edit” or “Delete.”",
  },
  {
    question: "Is it safe to buy and sell on ShopEase?",
    response:
      "We recommend only meeting in public places and never sharing sensitive information. We have tools to report suspicious users or listings.",
  },
  {
    question: "What should I do if I suspect a scam or fraud?",
    response:
      "Report the user or listing using the “Report” button. Our team will investigate and take appropriate action.",
  },
  {
    question: "Can I promote my listings for more visibility?",
    response:
      "Yes! You can purchase premium features like “Bump” or “Promoted Listings” to show your ad to more buyers.",
  },
  {
    question: "I forgot my password. How can I reset it?",
    response: "Click “Forgot Password” on the login page and follow the instructions to reset your password via email.",
  },
  {
    question: "How do I contact customer support?",
    response:
      "You can reach us via the “Contact Support” form in the Support section, or email us at support@shopease.com.",
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState(null);

  const handleClick = (index) => {
    setOpen(open === index ? null : index);
  };
  return (
    <>
      <Header />
      <div className="flex justify-center my-8">
        <h1 className="text-3xl font-bold  text-center drop-shadow">Frequently Asked Questions</h1>
      </div>
      <div className="max-w-2xl mx-auto px-4 grid grid-cols-1">
        {faqs.map((item, index) => (
          <div key={item.question} className="m-4 rounded-2xl shadow-xl backdrop-blur-sm transition hover:shadow-2xl">
            <button
              onClick={() => handleClick(index)}
              className="w-full flex justify-between items-center px-6 py-5 text-lg font-semibold outline-none focus:ring-2 rounded focus:ring-indigo-300 transition-all"
              aria-expanded={open === index}
              aria-controls={`faq-${index}`}
            >
              <span>{item.question}</span>
              <svg
                className={`w-5 h-5 ml-2 transform transition-transform duration-300 ${
                  open === index ? "rotate-180" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div
              id={`faq-${index}`}
              className={`overflow-hidden transition-all duration-300 ${
                open === index ? "max-h-96 py-4 px-8 opacity-100" : "max-h-0 py-0 px-8 opacity-0"
              }`}
              x
            >
              <p className="text-base">{item.response}</p>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </>
  );
}
