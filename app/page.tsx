export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  ChevronRight,
  Menu,
  Search,
  TrendingUp,
} from "lucide-react";
import { supabase } from "../lib/supabase/server";

const categories = [
  { name: "All", slug: "" },
  { name: "AI", slug: "ai" },
  { name: "India Tech", slug: "india-tech" },
  { name: "Gadgets", slug: "gadgets" },
  { name: "Startups", slug: "startups" },
  { name: "Cybersecurity", slug: "cybersecurity" },
  { name: "Software", slug: "software" },
  { name: "Research", slug: "research" },
];

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="logo-mark">T</div>

      <span className="text-xl font-black tracking-tight">
        Tech<span className="text-cyan-400">Hunt</span>
      </span>
    </div>
  );
}

export default async function Home() {
  const { data: dbArticles, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load articles:", error);
  }

  const stories = (dbArticles ?? []).map((article) => ({
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
      Math.ceil((article.content?.split(/\s+/).length ?? 200) / 200)
    )} min read`,
  }));

  const featuredArticle = stories[0];

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07090d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-zinc-300 lg:flex">
            <a className="text-white" href="#">
              Home
            </a>

            <a href="#latest">Latest</a>

            <a href="#trending">Trending</a>

            <a href="#categories">Categories</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="icon-button"
              aria-label="Search"
            >
              <Search size={19} />
            </Link>

            <button
              type="button"
              className="icon-button"
              aria-label="Notifications"
            >
              <Bell size={19} />
            </button>

            <button
              type="button"
              className="icon-button lg:hidden"
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-10 lg:pt-14">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
              Technology News
            </p>

            <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Technology. Innovation.{" "}
              <span className="text-cyan-400">What&apos;s Next.</span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              TechHunt covers AI, Indian and global technology, startups,
              gadgets, cybersecurity and research.
            </p>
          </div>
        </div>

        {featuredArticle ? (
          <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
            {/* Featured Story */}
            <article className="hero-card">
              <div className="hero-glow" />

              <div className="relative flex h-full min-h-[390px] flex-col justify-end p-7 sm:p-10">
                <span className="tag">
                  Featured • {featuredArticle.category}
                </span>

                <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
                  {featuredArticle.title}
                </h2>

                <p className="mt-4 max-w-2xl text-zinc-300">
                  {featuredArticle.excerpt ||
                    "Read the latest technology story from TechHunt."}
                </p>

                <Link
                  href={`/article/${featuredArticle.slug}`}
                  className="mt-7 flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-cyan-300"
                >
                  Read featured story
                  <ArrowRight size={17} />
                </Link>
              </div>
            </article>

            {/* Trending */}
            <aside
              id="trending"
              className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#0d1118] p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold">Trending</h3>

                <TrendingUp
                  className="text-cyan-400"
                  size={19}
                />
              </div>

              <div className="space-y-5">
                {stories.slice(0, 4).map((story, index) => (
                  <Link
                    key={story.slug}
                    href={`/article/${story.slug}`}
                    className="group flex min-w-0 gap-4"
                  >
                    <span className="shrink-0 text-2xl font-black text-zinc-700">
                      0{index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold leading-6 text-zinc-200 group-hover:text-cyan-300">
                        {story.title}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {story.category}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-[#0d1118] p-10 text-center">
            <p className="text-lg font-semibold text-zinc-300">
              No published stories yet.
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Your published TechHunt articles will appear here.
            </p>
          </div>
        )}
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="border-y border-white/10 bg-[#0a0d12]"
      >
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-4">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              href={
                category.slug
                  ? `/category/${category.slug}`
                  : "#latest"
              }
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
                index === 0
                  ? "bg-cyan-400 text-black"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Latest News */}
      <section
        id="latest"
        className="mx-auto max-w-7xl px-5 py-12 lg:py-16"
      >
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              Fresh from TechHunt
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Latest News
            </h2>
          </div>

          <button
            type="button"
            className="hidden items-center gap-1 text-sm font-semibold text-zinc-400 hover:text-white sm:flex"
          >
            View all
            <ChevronRight size={17} />
          </button>
        </div>

        {stories.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <article
                key={story.slug}
                className="news-card"
              >
                <div className="news-image">
                  <span>{story.category}</span>
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
                    <span>{story.date}</span>

                    <span>{story.readTime}</span>
                  </div>

                  <h3 className="text-xl font-bold leading-7">
                    {story.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {story.excerpt ||
                      "Read the full technology story on TechHunt."}
                  </p>

                  <Link
                    href={`/article/${story.slug}`}
                    className="mt-5 flex items-center gap-1 text-sm font-bold text-cyan-400"
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
            <p className="text-zinc-400">
              No published articles available.
            </p>
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-5 pb-16">
        <div className="newsletter">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              Coming soon
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Get the biggest tech stories in your inbox.
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              Newsletter signup will be connected after the publishing
              system is added.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              className="hidden rounded-full border border-white/10 bg-black/30 px-5 py-3 text-sm outline-none placeholder:text-zinc-600 sm:block"
              placeholder="Your email address"
            />

            <button
              type="button"
              className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-bold text-black"
            >
              Notify me
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/">
            <Logo />
          </Link>

          <p>
            © 2026 TechHunt. Technology. Innovation. What&apos;s Next.
          </p>
        </div>
      </footer>
    </main>
  );
}