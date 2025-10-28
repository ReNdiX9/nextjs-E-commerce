// app/providers.tsx
"use client";

import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";

export default function Providers({ children }) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange storageKey="theme">
        {children}
      </ThemeProvider>
    </ClerkProvider>
  );
}
