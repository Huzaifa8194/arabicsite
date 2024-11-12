import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export default async function middleware(req: NextRequest) {
  const auth = getAuth(req);

  // Check if the route is public
  const url = req.nextUrl.pathname;
  const publicRoutes = ["/sign-in", "/sign-up", "/api/uploadthing"];
  const isPublic = publicRoutes.some((route) => url.startsWith(route));

  if (!isPublic) {
    // Protect private routes
    if (!auth.userId) {
      return NextResponse.redirect("/sign-in");
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
