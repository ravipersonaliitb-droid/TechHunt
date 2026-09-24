import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { supabase } from "../../lib/supabase/server";

export const metadata: Metadata = {
  title: "Search Technology News",

  description:
    "Search TechHunt for the latest technology, AI, startup, gadget, cybersecurity, software and research stories.",

  robots: {
    index: false,
    follow: true,

    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";

  const { data: articles, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load search articles:", error);
  }

  const publishedArticles = (articles ?? []).map((article) => ({
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

  const results = query
    ? publishedArticles.filter((article) => {
        const searchableText = `
          ${article.title}
          ${article.excerpt ?? ""}
          ${article.category}
          ${article.content ?? ""}
        `.toLowerCase();

        return searchableText.includes(query.toLowerCase());
      })
    : publishedArticles;

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
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

      {/* Search Header */}
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-12 lg:pt-16">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
          TechHunt Search
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Search Technology News
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
          Search TechHunt stories across AI, gadgets, startups,
          cybersecurity, software, research and more.
        </p>

        {/* Search Form */}
        <form
          action="/search"
          method="GET"
          className="mt-7 flex max-w-3xl gap-3"
        >
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search AI, gadgets, startups..."
              className="w-full rounded-full border border-white/10 bg-[#0d1118] py-4 pl-12 pr-5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cyan-400/50"
            />
          </div>

          <button
            type="submit"
            className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-bold text-black transition hover:bg-cyan-300"
          >
            Search
          </button>
        </form>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-5 pb-16">
        <div className="mb-7">
          {query ? (
            <p className="text-sm text-zinc-400">
              Search results for{" "}
              <span className="font-semibold text-white">
                &quot;{query}&quot;
              </span>

              <span className="ml-2 text-zinc-600">
                ({results.length}{" "}
                {results.length === 1 ? "story" : "stories"})
              </span>
            </p>
          ) : (
            <p className="text-sm text-zinc-400">
              Browse all TechHunt stories
            </p>
          )}
        </div>

        {results.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {results.map((article) => (
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

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
                    <span>{article.date}</span>

                    <span>{article.readTime}</span>
                  </div>

                  <div className="mb-3">
                    <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                      {article.category}
                    </span>
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
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
              <Search size={24} className="text-zinc-500" />
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              No stories found
            </h2>

            <p className="mt-3 text-zinc-400">
              Try searching for another technology topic.
            </p>

            <Link
              href="/search"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-cyan-300"
            >
              View all stories
              <ArrowRight size={16} />
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