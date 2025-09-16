"use client";

import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Header() {
  const publicLinks = [{ name: "Home", link: "/" }];

  const authedLinks = [
    { name: "Create New  Listing", link: "/createItem" },
    { name: "My Listings", link: "/mylistings" },
    { name: "Favorites", link: "/myfavorites" },
    { name: "Settings", link: "/settings" },
  ];

  return (
    <header className="flex justify-between px-5 items-center shadow-md py-3">
      <div>
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
        </Link>
      </div>

      <nav>
        <ul className="flex items-center gap-10">
          {publicLinks.map(({ name, link }) => (
            <li key={link}>
              <Link href={link} className="text-black hover:underline font-bold transition duration-300 ease-in-out">
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
                  className="text-black hover:underline font-bold transition duration-300 ease-in-out"
                >
                  {name}
                </Link>
              </li>
            ))}
          </SignedIn>

          <SignedOut>
            <li>
              <Link href="/signin" className="text-black hover:underline font-bold">
                Sign in
              </Link>
            </li>
          </SignedOut>
        </ul>
      </nav>
    </header>
  );
}
