import type { MetadataRoute } from "next";
import { supabase } from "../lib/supabase/server";

const siteUrl = "https://tech-hunt-iota.vercel.app";

const categories = [
  "ai",
  "india-tech",
  "gadgets",
  "startups",
  "cybersecurity",
  "software",
  "research",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: articles, error } = await supabase
    .from("articles")
    .select("slug, updated_at, published_at, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load articles for sitemap:", error);
  }

  const articleUrls: MetadataRoute.Sitemap = (articles ?? []).map(
    (article) => ({
      url: `${siteUrl}/article/${article.slug}`,
      lastModified: new Date(
        article.updated_at ??
          article.published_at ??
          article.created_at
      ),
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  const categoryUrls: MetadataRoute.Sitemap = categories.map(
    (category) => ({
      url: `${siteUrl}/category/${category}`,
      changeFrequency: "daily",
      priority: 0.7,
    })
  );

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  return [
    ...staticUrls,
    ...categoryUrls,
    ...articleUrls,
  ];
}