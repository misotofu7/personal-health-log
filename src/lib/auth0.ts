import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Auth0Client automatically reads from environment variables:
// AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_SECRET
// APP_BASE_URL or AUTH0_BASE_URL (defaults to http://localhost:3000 if not set)
// Configure routes to match our API structure
export const auth0 = new Auth0Client({
  appBaseUrl: process.env.AUTH0_BASE_URL || process.env.APP_BASE_URL || "http://localhost:3000",
  signInReturnToPath: "/", // Redirect to home page after login
  routes: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    callback: "/api/auth/callback",
    profile: "/api/auth/me",
  },
  session: {
    cookie: {
      path: "/",
      sameSite: "lax",
      secure: false, // Set to false for localhost, true for production
    },
  },
});
