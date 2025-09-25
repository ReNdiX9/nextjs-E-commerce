"use client";

import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import ThemeToggle from "./themetoggle";

export default function Header() {
  const publicLinks = [{ name: "Home", link: "/" }];

  const authedLinks = [
    { name: "Create New  Listing", link: "/createItem" },
    { name: "My Listings", link: "/mylistings" },
    { name: "Favorites", link: "/myfavorites" },
    { name: "Profile", link: "/settings/profile" },
    { name: "Settings", link: "/settings" },
  ];

  return (
    <header className="flex justify-between px-5 items-center shadow-md py-3 bg-background">
      <div>
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
        </Link>
      </div>
      
      <nav className="flex items-center gap-6">
        <ul className="flex items-center gap-10">
          {publicLinks.map(({ name, link }) => (
            <li key={link}>
              <Link href={link} className="text-text-primary hover:underline font-bold transition duration-300 ease-in-out">
                {name}
              </Link>
            </li>
          ))}

          <SignedIn>
            {authedLinks.map(({ name, link }) => (
              <li key={link}>
                <Link
                  prefetch={false}
                  href={link}
                  className="text-text-primary hover:underline font-bold transition duration-300 ease-in-out"
                >
                  {name}
                </Link>
              </li>
            ))}
          </SignedIn>

          <SignedOut>
            <li>
              <Link href="/signin" className="text-text-primary hover:underline font-bold">
                Sign in
              </Link>
            </li>
          </SignedOut>
        </ul>
        
        {/* Theme Toggle positioned after navigation */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
