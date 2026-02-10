import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Santos Bravos — Artist Analytics",
  description: "Real-time analytics dashboard for Santos Bravos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
