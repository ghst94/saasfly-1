import { NextRequest, NextResponse } from "next/server";

// Check if Clerk keys are configured
const hasClerkKeys = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.CLERK_SECRET_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "pk_test_placeholder" &&
  process.env.CLERK_SECRET_KEY !== "sk_test_placeholder"
);

let activeMiddleware: any;

if (hasClerkKeys) {
  // Import Clerk middleware only when keys are available
  const { middleware: clerkMw } = require("./utils/clerk");
  activeMiddleware = clerkMw;
} else {
  // Fallback: locale redirect only, no auth
  const { i18n } = require("./config/i18n-config");
  activeMiddleware = (req: NextRequest) => {
    const pathname = req.nextUrl.pathname;
    // Skip non-page routes
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.includes(".")
    ) {
      return NextResponse.next();
    }
    // Check if locale is present
    const pathnameIsMissingLocale = i18n.locales.every(
      (locale: string) =>
        !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
    );
    if (pathnameIsMissingLocale) {
      return NextResponse.redirect(
        new URL(`/${i18n.defaultLocale}${pathname}`, req.url),
      );
    }
    return NextResponse.next();
  };
}

export default activeMiddleware;

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"
  ],
};

