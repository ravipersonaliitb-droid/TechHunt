import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TechHunt — Technology. Innovation. What's Next.",
  description: "TechHunt brings you the latest technology, AI, startup, gadget and cybersecurity stories.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
