// src/components/Footer.jsx
import Link from "next/link";
import Image from "next/image";

import { FaInstagram, FaTwitter, FaGithub } from "react-icons/fa";

export default function Footer() {
  // Navigation links
  const shop = [
    { name: "Home", href: "/" },
    { name: "Create new listing", href: "/createItem" },
  ];

  const support = [
    { name: "FAQ", href: "/faq" },
    { name: "Contact Us", href: "/contact" },
  ];

  const legal = [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Feedback", href: "/feedback" },
  ];

  return (
    <footer className="border-t border-card-border text-sm bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 items-center  place-items-center">
          {/* logo*/}
          <div>
            <Link href="/" className="flex items-center gap-4 justify-center">
              <Image src="/logo.png" alt="ShopEase logo" width={32} height={32} />
              <span className="text-base font-semibold text-text-primary">ShopEase</span>
            </Link>
            <p className="mt-3 text-text-secondary">Simple shopping made easy.</p>

            {/* Socials */}
            <div className="mt-4 flex items-center gap-6 text-text-secondary justify-center">
              <Link href="https://instagram.com" className="hover:text-text-primary" aria-label="Instagram">
                <FaInstagram size={24} />
              </Link>
              <Link href="https://twitter.com" className="hover:text-text-primary" aria-label="Twitter / X">
                <FaTwitter size={24} />
              </Link>
              <Link href="https://github.com" className="hover:text-text-primary" aria-label="GitHub">
                <FaGithub size={24} />
              </Link>
            </div>
          </div>

          {/* Links*/}
          <NavColumn title="Shop" items={shop} />
          <NavColumn title="Support" items={support} />
        </div>

        <div className="mt-8 border-t border-card-border pt-6 flex flex-col gap-8 md:flex-row md:items-center md:justify-between text-text-secondary justify-center items-center">
          <p>© {new Date().getFullYear()} ShopEase. All rights reserved.</p>
          <nav className="flex flex-wrap gap-4">
            {legal.map(({ name, href }) => (
              <Link key={href} href={href} className="hover:text-text-primary">
                {name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

function NavColumn({ title, items }) {
  return (
    <div>
      <h4 className="mb-3 text-base font-semibold text-text-primary text-center">{title}</h4>
      <ul className="space-y-2 text-center">
        {items.map(({ name, href }) => (
          <li key={href}>
            <Link href={href} className="text-text-secondary hover:text-text-primary">
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
