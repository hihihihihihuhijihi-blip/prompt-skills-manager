import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Step 1: Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "服务器配置错误：缺少环境变量" },
      { status: 500 }
    );
  }

  // Step 2: Parse request body with error handling
  let body: any;
  try {
    body = await request.json();
  } catch (parseError) {
    return NextResponse.json(
      { error: "无效的请求数据" },
      { status: 400 }
    );
  }

  const { email, password, name } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "邮箱和密码不能为空" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "密码至少需要6个字符" },
      { status: 400 }
    );
  }

  // Step 3: Create Supabase client
  let supabase: any;
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (clientError) {
    console.error("[SIGNUP] Supabase client creation failed:", clientError);
    return NextResponse.json(
      { error: "数据库连接失败" },
      { status: 500 }
    );
  }

  // Step 4: Attempt signup with timeout
  let data: any, error: any;
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Signup timeout")), 15000)
    );

    const signupPromise = supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split("@")[0],
        },
      },
    });

    const result: any = await Promise.race([signupPromise, timeoutPromise]);
    data = result.data;
    error = result.error;
  } catch (timeoutError: any) {
    console.error("[SIGNUP] Signup timeout or error:", timeoutError?.message || timeoutError);
    return NextResponse.json(
      { error: "注册超时，请稍后重试" },
      { status: 504 }
    );
  }

  // Step 5: Handle Supabase errors
  if (error) {
    console.error("[SIGNUP] Supabase auth error:", error.message);
    return NextResponse.json(
      { error: error.message || "注册失败" },
      { status: 400 }
    );
  }

  // Step 6: Check if email confirmation is required
  if (data.user && !data.session) {
    return NextResponse.json({
      success: true,
      requireConfirmation: true,
      message: "请检查您的邮箱以确认注册",
    });
  }

  // Step 7: Return success
  return NextResponse.json({
    success: true,
    user: {
      id: data.user?.id,
      email: data.user?.email,
      name: data.user?.user_metadata?.name,
    },
    session: data.session ? {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    } : null,
  });
}
