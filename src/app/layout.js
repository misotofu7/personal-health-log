import { Geist, Geist_Mono } from "next/font/google";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Personal Health Log",
  description: "Created in CruzHacks 2026",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Auth0Provider
          baseUrl={process.env.NEXT_PUBLIC_AUTH0_BASE_URL || "http://localhost:3000"}
          profileUrl="/api/auth/me"
        >
          {children}
        </Auth0Provider>
      </body>
    </html>
  );
}
