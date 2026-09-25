export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { supabase } from "../../../lib/supabase/server";

const siteUrl = "https://tech-hunt-iota.vercel.app";

type CategoryPageProps = {
  params: {
    category: string;
  };
};

/* --------------------------------
   Supported Categories
--------------------------------- */

const categories = [
  {
    name: "AI",
    slug: "ai",
  },
  {
    name: "India Tech",
    slug: "india-tech",
  },
  {
    name: "Gadgets",
    slug: "gadgets",
  },
  {
    name: "Startups",
    slug: "startups",
  },
  {
    name: "Cybersecurity",
    slug: "cybersecurity",
  },
  {
    name: "Software",
    slug: "software",
  },
  {
    name: "Research",
    slug: "research",
  },
];

/* --------------------------------
   Category Helpers
--------------------------------- */

function getCategory(categorySlug: string) {
  return categories.find(
    (category) =>
      category.slug.toLowerCase() === categorySlug.toLowerCase()
  );
}

/* --------------------------------
   Dynamic Category SEO
--------------------------------- */

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const category = getCategory(params.category);

  if (!category) {
    return {
      title: "Category Not Found | TechHunt",
      description:
        "The requested TechHunt category could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${category.name} Technology News`;

  const description = `Latest ${category.name} technology news, developments, stories and updates from TechHunt.`;

  const categoryUrl = `${siteUrl}/category/${category.slug}`;

  return {
    title,

    description,

    alternates: {
      canonical: categoryUrl,
    },

    keywords: [
      `${category.name} news`,
      `${category.name} technology`,
      "technology news",
      "TechHunt",
    ],

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
      url: categoryUrl,
      siteName: "TechHunt",
      title: `${title} | TechHunt`,
      description,
      locale: "en_IN",
    },

    twitter: {
      card: "summary",
      title: `${title} | TechHunt`,
      description,
    },
  };
}

/* --------------------------------
   Category Page
--------------------------------- */

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const category = getCategory(params.category);

  /* --------------------------------
     Invalid Category
  --------------------------------- */

  if (!category) {
    notFound();
  }

  /* --------------------------------
     Fetch Only This Category
  --------------------------------- */

  const { data: articles, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("category", category.name)
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load category articles:", error);
  }

  /* --------------------------------
     Format Articles
  --------------------------------- */

  const categoryArticles = (articles ?? []).map((article) => ({
    ...article,

    date: new Date(
      article.published_at ?? article.created_at
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),

    readTime: `${Math.max(
      1,
      Math.ceil(
        (article.content?.split(/\s+/).length ?? 200) / 200
      )
    )} min read`,
  }));

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#07090d]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link
            href="/"
            className="text-xl font-black tracking-tight"
          >
            Tech<span className="text-cyan-400">Hunt</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Category Header */}
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-12 lg:pt-16">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
          TechHunt Category
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          {category.name}
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
          Latest stories and developments from the {category.name}{" "}
          section of TechHunt.
        </p>
      </section>

      {/* Articles */}
      <section className="mx-auto max-w-7xl px-5 pb-16">
        {categoryArticles.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {categoryArticles.map((article) => (
              <article
                key={article.id ?? article.slug}
                className="news-card overflow-hidden"
              >
                {/* Article Image */}
                {article.image_url ? (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="news-image">
                    <span>{article.category}</span>
                  </div>
                )}

                {/* Article Details */}
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
                    <span>{article.date}</span>

                    <span>{article.readTime}</span>
                  </div>

                  <h2 className="text-xl font-bold leading-7">
                    {article.title}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {article.excerpt ||
                      "Read the full technology story on TechHunt."}
                  </p>

                  <Link
                    href={`/article/${article.slug}`}
                    className="mt-5 flex items-center gap-1 text-sm font-bold text-cyan-400 transition hover:text-cyan-300"
                  >
                    Read story
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-[#0d1118] p-10 text-center">
            <h2 className="text-2xl font-bold">
              No articles found
            </h2>

            <p className="mt-3 text-zinc-400">
              There are currently no published articles in the{" "}
              {category.name} category.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-cyan-300"
            >
              Back to TechHunt
              <ArrowLeft size={16} />
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-8 text-sm text-zinc-500">
          © 2026 TechHunt. Technology. Innovation. What&apos;s Next.
        </div>
      </footer>
    </main>
  );
}