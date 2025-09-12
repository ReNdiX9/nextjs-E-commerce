// app/providers.tsx
"use client";

import { ClerkProvider } from "@clerk/nextjs";

export default function Providers({ children }) {
  return <ClerkProvider afterSignOutUrl="/">{children}</ClerkProvider>;
}
