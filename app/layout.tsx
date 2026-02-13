import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";

export const metadata: Metadata = {
  title: "Santos Bravos — Artist Intelligence Dashboard",
  description: "Real-time streaming, social, PR & sentiment analytics for Santos Bravos · HYBE Latin America",
  metadataBase: new URL("https://santos-bravos-dashboard.vercel.app"),
  openGraph: {
    title: "Santos Bravos — Artist Intelligence Dashboard",
    description: "Real-time streaming, social, PR & sentiment analytics for Santos Bravos · HYBE Latin America",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Santos Bravos Dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Santos Bravos — Artist Intelligence Dashboard",
    description: "Real-time streaming, social, PR & sentiment analytics for Santos Bravos",
    images: ["/api/og"],
  },
  icons: {
    icon: "/sb-avatar.jpg",
    apple: "/icon-512.jpg",
  },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className="antialiased min-h-screen">
        <div className="ambient-orbs" aria-hidden="true"><div className="ambient-orb-3" /></div>
        <div className="relative z-10">
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>
  );
}
