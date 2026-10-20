import { createClient } from "./client";

export interface AuthResponse {
  success: boolean;
  error?: string;
}

/**
 * Sign in with email and password using the Supabase client.
 */
export async function signInWithEmail(
  email: string,
  pass: string
): Promise<AuthResponse> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Sign up a new student with email, password, and full name.
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  fullName: string
): Promise<AuthResponse> {
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Initiate Google OAuth sign in flow.
 */
export async function signInWithGoogle(nextUrl = "/dashboard"): Promise<AuthResponse> {
  const supabase = createClient();
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
    nextUrl
  )}`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Sign out current user and clear local session state.
 */
export async function signOutUser(): Promise<AuthResponse> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
