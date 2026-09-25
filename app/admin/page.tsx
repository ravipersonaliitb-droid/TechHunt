"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

type Article = {
  id: number;
  slug: string;
  title: string;
  category: string;
  status: "draft" | "published";
  featured: boolean;
  created_at: string;
  published_at: string | null;
};

type Stats = {
  total: number;
  published: number;
  drafts: number;
  featured: number;
};

export default function AdminDashboard() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    drafts: 0,
    featured: 0,
  });

  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<
    { name: string; count: number }[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      setEmail(user.email ?? "");

      const totalResult = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true });

      const publishedResult = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");

      const draftsResult = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft");

      const featuredResult = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("featured", true);

      const recentResult = await supabase
        .from("articles")
        .select(
          "id, slug, title, category, status, featured, created_at, published_at"
        )
        .order("created_at", { ascending: false })
        .limit(5);

      if (
        totalResult.error ||
        publishedResult.error ||
        draftsResult.error ||
        featuredResult.error ||
        recentResult.error
      ) {
        setErrorMessage(
          totalResult.error?.message ||
            publishedResult.error?.message ||
            draftsResult.error?.message ||
            featuredResult.error?.message ||
            recentResult.error?.message ||
            "Unable to load dashboard data."
        );

        setLoading(false);
        return;
      }

      setStats({
        total: totalResult.count ?? 0,
        published: publishedResult.count ?? 0,
        drafts: draftsResult.count ?? 0,
        featured: featuredResult.count ?? 0,
      });

      setRecentArticles((recentResult.data ?? []) as Article[]);

      const categoryMap: Record<string, number> = {};

      (recentResult.data ?? []).forEach((article) => {
        categoryMap[article.category] =
          (categoryMap[article.category] ?? 0) + 1;
      });

      const allArticlesResult = await supabase
        .from("articles")
        .select("category");

      if (!allArticlesResult.error) {
        const allCategoryMap: Record<string, number> = {};

        (allArticlesResult.data ?? []).forEach((article) => {
          allCategoryMap[article.category] =
            (allCategoryMap[article.category] ?? 0) + 1;
        });

        setCategoryCounts(
          Object.entries(allCategoryMap)
            .map(([name, count]) => ({
              name,
              count,
            }))
            .sort((a, b) => b.count - a.count)
        );
      }

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/admin/login");
    router.refresh();
  }

  function formatDate(date: string | null) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-zinc-400">
          Loading admin dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            Tech<span className="text-cyan-400">Hunt</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-zinc-500 sm:block">
              {email}
            </span>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Heading */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-400">
              TechHunt Admin
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-zinc-400">
              Manage your TechHunt content, monitor articles, and
              control what appears on the website.
            </p>
          </div>

          <Link
            href="/admin/articles/new"
            className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-black transition hover:bg-cyan-300"
          >
            + Create Article
          </Link>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {/* Stats */}
        <section className="mt-10">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-start justify-between">
                <p className="text-sm text-zinc-500">
                  Total Articles
                </p>

                <span className="text-lg text-cyan-400">
                  ◉
                </span>
              </div>

              <p className="mt-3 text-4xl font-bold">
                {stats.total}
              </p>

              <p className="mt-2 text-sm text-zinc-600">
                All articles in TechHunt
              </p>
            </div>

            {/* Published */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-start justify-between">
                <p className="text-sm text-zinc-500">
                  Published
                </p>

                <span className="text-lg text-emerald-400">
                  ●
                </span>
              </div>

              <p className="mt-3 text-4xl font-bold">
                {stats.published}
              </p>

              <p className="mt-2 text-sm text-zinc-600">
                Live on the website
              </p>
            </div>

            {/* Drafts */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-start justify-between">
                <p className="text-sm text-zinc-500">
                  Drafts
                </p>

                <span className="text-lg text-amber-400">
                  ●
                </span>
              </div>

              <p className="mt-3 text-4xl font-bold">
                {stats.drafts}
              </p>

              <p className="mt-2 text-sm text-zinc-600">
                Waiting to be published
              </p>
            </div>

            {/* Featured */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-start justify-between">
                <p className="text-sm text-zinc-500">
                  Featured
                </p>

                <span className="text-lg text-cyan-400">
                  ★
                </span>
              </div>

              <p className="mt-3 text-4xl font-bold">
                {stats.featured}
              </p>

              <p className="mt-2 text-sm text-zinc-600">
                Featured article status
              </p>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Recent Articles */}
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold">
                  Recent Articles
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Your latest content
                </p>
              </div>

              <Link
                href="/admin/articles"
                className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
              >
                View all →
              </Link>
            </div>

            {recentArticles.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-zinc-500">
                  No articles yet.
                </p>

                <Link
                  href="/admin/articles/new"
                  className="mt-4 inline-flex rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-black"
                >
                  Create your first article
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentArticles.map((article) => (
                  <div
                    key={article.id}
                    className="px-6 py-5 transition hover:bg-white/[0.02]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-white">
                            {article.title}
                          </h3>

                          {article.featured && (
                            <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-400">
                              ★ Featured
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                          <span>
                            {article.category}
                          </span>

                          <span>•</span>

                          <span>
                            {formatDate(
                              article.published_at ||
                                article.created_at
                            )}
                          </span>

                          <span>•</span>

                          <span
                            className={
                              article.status === "published"
                                ? "text-emerald-400"
                                : "text-amber-400"
                            }
                          >
                            {article.status === "published"
                              ? "Published"
                              : "Draft"}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        {article.status === "published" && (
                          <Link
                            href={`/article/${article.slug}`}
                            target="_blank"
                            className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
                          >
                            View
                          </Link>
                        )}

                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Category Overview */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="border-b border-white/10 px-6 py-5">
              <h2 className="text-xl font-semibold">
                Categories
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Articles by category
              </p>
            </div>

            {categoryCounts.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-zinc-500">
                No category data available.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {categoryCounts.map((category) => (
                  <div
                    key={category.name}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <span className="text-sm text-zinc-300">
                      {category.name}
                    </span>

                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-400">
                      {category.count}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-white/10 p-5">
              <Link
                href="/admin/articles"
                className="block rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
              >
                Manage All Articles
              </Link>
            </div>
          </section>
        </div>

        {/* Quick Actions */}
        <section className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Common admin tasks
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Create */}
            <Link
              href="/admin/articles/new"
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-cyan-400/30 hover:bg-white/[0.06]"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Create Article
                </h3>

                <span className="text-xl text-cyan-400 transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <p className="mt-2 text-sm text-zinc-500">
                Write and publish a new TechHunt story.
              </p>
            </Link>

            {/* Manage */}
            <Link
              href="/admin/articles"
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-cyan-400/30 hover:bg-white/[0.06]"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Manage Articles
                </h3>

                <span className="text-xl text-cyan-400 transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <p className="mt-2 text-sm text-zinc-500">
                Search, filter, edit, publish, feature, and delete.
              </p>
            </Link>

            {/* Website */}
            <Link
              href="/"
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-cyan-400/30 hover:bg-white/[0.06]"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  View Website
                </h3>

                <span className="text-xl text-cyan-400 transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <p className="mt-2 text-sm text-zinc-500">
                Open the public TechHunt website.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}