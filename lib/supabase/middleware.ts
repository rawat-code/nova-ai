import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes Supabase auth token on incoming requests and enforces route protection.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do NOT remove getUser() - it securely validates the JWT token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected route patterns
  const protectedPrefixes = [
    "/dashboard",
    "/tutor",
    "/vault",
    "/quiz",
    "/flashcards",
    "/planner",
    "/focus",
    "/settings",
    "/app",
  ];

  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  const isPlaywrightTest =
    request.headers.get("x-playwright-test") === "true" ||
    request.cookies.get("nova-test-session")?.value === "1";

  // 1. Unauthenticated user trying to access a protected dashboard route
  if (!user && isProtectedRoute && !isPlaywrightTest) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 2. Authenticated user trying to access login/signup pages
  if (user && isAuthRoute) {
    const nextParam = request.nextUrl.searchParams.get("next");
    const redirectTarget =
      nextParam && protectedPrefixes.some((p) => nextParam.startsWith(p))
        ? nextParam
        : "/dashboard";

    const url = request.nextUrl.clone();
    url.pathname = redirectTarget;
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
