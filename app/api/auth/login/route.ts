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

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "邮箱和密码不能为空" },
      { status: 400 }
    );
  }

  // Step 3: Create Supabase client
  let supabase: any;
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (clientError) {
    console.error("[LOGIN] Supabase client creation failed:", clientError);
    return NextResponse.json(
      { error: "数据库连接失败" },
      { status: 500 }
    );
  }

  // Step 4: Attempt login with timeout
  let data: any, error: any;
  try {
    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Login timeout")), 15000)
    );

    const loginPromise = supabase.auth.signInWithPassword({
      email,
      password,
    });

    const result: any = await Promise.race([loginPromise, timeoutPromise]);
    data = result.data;
    error = result.error;
  } catch (timeoutError: any) {
    console.error("[LOGIN] Login timeout or error:", timeoutError?.message || timeoutError);
    return NextResponse.json(
      { error: "登录超时，请稍后重试" },
      { status: 504 }
    );
  }

  // Step 5: Handle Supabase errors
  if (error) {
    console.error("[LOGIN] Supabase auth error:", error.message);
    return NextResponse.json(
      { error: error.message || "登录失败" },
      { status: 401 }
    );
  }

  // Step 6: Validate response
  if (!data?.user || !data?.session) {
    console.error("[LOGIN] Invalid response from Supabase");
    return NextResponse.json(
      { error: "登录响应无效" },
      { status: 500 }
    );
  }

  // Step 7: Return success
  return NextResponse.json({
    success: true,
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name,
    },
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    },
  });
}
