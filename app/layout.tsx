import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://tech-hunt-iota.vercel.app"),

  title: {
    default: "TechHunt | Technology News, AI, Startups & Gadgets",
    template: "%s | TechHunt",
  },

  description:
    "TechHunt brings you the latest technology news, AI developments, Indian and global tech, startups, gadgets, cybersecurity, software and research.",

  keywords: [
    "technology news",
    "AI news",
    "artificial intelligence",
    "India technology",
    "tech startups",
    "gadgets",
    "cybersecurity",
    "software",
    "technology research",
    "TechHunt",
  ],

  authors: [
    {
      name: "TechHunt",
    },
  ],

  creator: "TechHunt",
  publisher: "TechHunt",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://tech-hunt-iota.vercel.app",
    siteName: "TechHunt",
    title: "TechHunt | Technology News, AI, Startups & Gadgets",
    description:
      "Latest technology news, AI developments, Indian and global tech, startups, gadgets, cybersecurity, software and research.",
  },

  twitter: {
    card: "summary_large_image",
    title: "TechHunt | Technology News, AI, Startups & Gadgets",
    description:
      "Latest technology news, AI developments, startups, gadgets, cybersecurity, software and research.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}