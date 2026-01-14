import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Step 1: Log the request
  console.log("[LOGIN] Login endpoint called");

  // Step 2: Parse request body
  let body: any;
  try {
    body = await request.json();
    console.log("[LOGIN] Received email:", body.email);
  } catch (parseError) {
    console.error("[LOGIN] JSON parse error:", parseError);
    return NextResponse.json(
      { error: "无效的请求数据", debug: "parse_error" },
      { status: 400 }
    );
  }

  const { email, password } = body;

  if (!email || !password) {
    console.log("[LOGIN] Missing email or password");
    return NextResponse.json(
      { error: "邮箱和密码不能为空", debug: "missing_credentials" },
      { status: 400 }
    );
  }

  // Step 3: Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("[LOGIN] Env check:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "服务器配置错误：缺少环境变量", debug: "missing_env" },
      { status: 500 }
    );
  }

  // Step 4: Try to import and use Supabase
  try {
    const { createClient } = await import("@supabase/supabase-js");
    console.log("[LOGIN] Supabase imported successfully");

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("[LOGIN] Supabase client created");

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((_, reject) =>
      setTimeout(() => reject(new Error("Login timeout after 15s")), 15000)
    );

    const loginPromise = supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("[LOGIN] Calling signInWithPassword...");
    const result: any = await Promise.race([loginPromise, timeoutPromise]);
    console.log("[LOGIN] Got result from Supabase:", { hasData: !!result.data, hasError: !!result.error });

    if (result.error) {
      console.error("[LOGIN] Supabase error:", result.error.message);
      return NextResponse.json(
        { error: result.error.message || "登录失败" },
        { status: 401 }
      );
    }

    if (!result.data?.user || !result.data?.session) {
      console.error("[LOGIN] Invalid response data");
      return NextResponse.json(
        { error: "登录响应无效", debug: "invalid_response" },
        { status: 500 }
      );
    }

    console.log("[LOGIN] Login successful for user:", result.data.user.id);
    return NextResponse.json({
      success: true,
      user: {
        id: result.data.user.id,
        email: result.data.user.email,
        name: result.data.user.user_metadata?.name,
      },
      session: {
        access_token: result.data.session.access_token,
        refresh_token: result.data.session.refresh_token,
        expires_at: result.data.session.expires_at,
      },
    });
  } catch (error: any) {
    console.error("[LOGIN] Exception:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "登录失败", debug: "exception" },
      { status: 500 }
    );
  }
}
