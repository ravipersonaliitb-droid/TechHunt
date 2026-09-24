import type { MetadataRoute } from "next";

const siteUrl = "https://tech-hunt-iota.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin/",
    },

    sitemap: `${siteUrl}/sitemap.xml`,
  };
}