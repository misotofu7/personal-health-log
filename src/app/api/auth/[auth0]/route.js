import { auth0 } from '../../../../lib/auth0';

export async function GET(request, { params }) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const auth0Route = params?.auth0 || pathname.split('/').pop();
    
    // Log to both console and return in response for debugging
    const logMessage = `🔍 Auth0 route handler called: ${pathname}, auth0 param: ${auth0Route}`;
    console.log(logMessage);
    console.log("📋 Request headers:", Object.fromEntries(request.headers.entries()));
    
    // The middleware method handles routing based on the request URL
    // It automatically detects /api/auth/login, /api/auth/logout, /api/auth/callback, /api/auth/me, etc.
    const response = await auth0.middleware(request);
    
    // Debug: log callback and profile handling
    if (pathname.includes('callback')) {
      console.log("✅ Auth0 callback processed, response status:", response.status);
      // Check if Set-Cookie header is present
      const setCookieHeaders = response.headers.getSetCookie?.() || [];
      console.log("Set-Cookie headers:", setCookieHeaders.length > 0 ? "Present" : "Missing");
    }
    if (pathname.includes('me') || pathname.includes('profile')) {
      const cookies = request.headers.get('cookie') || '';
      const hasSession = cookies.includes('__session');
      console.log("🔍 Auth0 profile request - has __session cookie:", hasSession, "response status:", response.status);
      
      // Try to read the response body to see what's being returned
      if (response.status === 200) {
        const clonedResponse = response.clone();
        try {
          const body = await clonedResponse.json();
          console.log("✅ Profile response body:", JSON.stringify(body, null, 2));
        } catch (e) {
          console.log("⚠️ Could not parse profile response as JSON");
        }
      } else {
        console.log("❌ Profile request failed with status:", response.status);
      }
    }
    
    return response;
  } catch (error) {
    console.error("Auth0 middleware error:", error);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
