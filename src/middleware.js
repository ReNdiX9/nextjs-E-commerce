// middleware.js
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  publicRoutes: ["/", "/signin(.*)", "/signup(.*)", "/sso-callback(.*)"],
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
