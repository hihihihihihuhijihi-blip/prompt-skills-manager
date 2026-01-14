import { createServerClient } from "@/lib/auth/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Try to sign up first
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split("@")[0],
        },
        emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
      },
    });

    // If signup succeeded
    if (!error) {
      // Check if email confirmation is required
      if (data.user && !data.session) {
        return NextResponse.json({
          success: true,
          message: "Registration successful! Please check your email to confirm your account.",
          requireConfirmation: true,
        });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
        session: data.session ? {
          access_token: data.session.access_token,
          expires_at: data.session.expires_at,
        } : null,
      });
    }

    // If user already exists, try to sign in
    if (error.message.includes("already") || error.message.includes("registered")) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!signInError && signInData.session) {
        return NextResponse.json({
          success: true,
          user: {
            id: signInData.user.id,
            email: signInData.user.email,
          },
          session: {
            access_token: signInData.session.access_token,
            expires_at: signInData.session.expires_at,
          },
        });
      }

      return NextResponse.json(
        { error: "User already exists. Please sign in." },
        { status: 400 }
      );
    }

    // Other errors
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
