"use client";

import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function Header() {
  const publicLinks = [{ name: "Home", link: "/" }];

  const authedLinks = [
    { name: "Create New  Listing", link: "/createItem" },
    { name: "My Listings", link: "/mylistings" },
    { name: "Favorites", link: "/myfavorites" },
    { name: "Messages", link: "/messages" },
    { name: "Chat", link: "/chat" },
    { name: "Settings", link: "/settings" },
  ];

  return (
    <header className="flex justify-between px-5 items-center shadow-md py-3 bg-background border-b">
      <div>
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
        </Link>
      </div>

      <nav className="flex items-center gap-6">
        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-10">
          {publicLinks.map(({ name, link }) => (
            <li key={link}>
              <Link
                href={link}
                className="text-text-primary hover:underline font-bold transition duration-300 ease-in-out"
              >
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
              <Link
                href="/signin"
                className="text-text-primary hover:underline font-bold"
              >
                Sign in
              </Link>
            </li>
          </SignedOut>
          {/* Debug: show user email when available */}
          <li className="ml-2 text-sm text-text-secondary hidden md:block">
            <UserEmailDebug />
          </li>
        </ul>

        {/* Mobile Navigation Dropdown */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-text-primary"
                suppressHydrationWarning
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {publicLinks.map(({ name, link }) => (
                <DropdownMenuItem key={link} asChild>
                  <Link href={link} className="w-full">
                    {name}
                  </Link>
                </DropdownMenuItem>
              ))}

              <SignedIn>
                <DropdownMenuSeparator />
                {authedLinks.map(({ name, link }) => (
                  <DropdownMenuItem key={link} asChild>
                    <Link href={link} className="w-full">
                      {name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </SignedIn>

              <SignedOut>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/signin" className="w-full">
                    Sign in
                  </Link>
                </DropdownMenuItem>
              </SignedOut>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}

function UserEmailDebug() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) return null;

  if (!user) return <span className="text-text-secondary">Not signed in</span>;

  const email =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress ||
    user.email ||
    "";
  return <span className="text-text-secondary">{email}</span>;
}
