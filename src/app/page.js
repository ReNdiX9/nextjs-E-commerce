//page.js
import React from "react";
import Homepage from "./homepage/page";

export default function Page() {
  console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
  return <Homepage />;
}
