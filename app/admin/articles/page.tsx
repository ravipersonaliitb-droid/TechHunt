"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/client";

type Article = {
  id: number;
  slug: string;
  title: string;
  category: string;
  author: string;
  status: "draft" | "published";
  featured: boolean;
  created_at: string;
  published_at: string | null;
};

const categories = [
  "All",
  "AI",
  "India Tech",
  "Gadgets",
  "Startups",
  "Cybersecurity",
  "Software",
  "Research",
];

export default function ManageArticlesPage() {
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [busyId, setBusyId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");

  async function loadArticles() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/admin/login");
      return;
    }

    const { data, error } = await supabase
      .from("articles")
      .select(
        "id, slug, title, category, author, status, featured, created_at, published_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setArticles((data ?? []) as Article[]);
    setLoading(false);
  }

  useEffect(() => {
    loadArticles();
  }, []);

  async function togglePublish(article: Article) {
    setBusyId(article.id);
    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const newStatus =
      article.status === "published" ? "draft" : "published";

    const { error } = await supabase
      .from("articles")
      .update({
        status: newStatus,
        published_at:
          newStatus === "published"
            ? new Date().toISOString()
            : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", article.id);

    if (error) {
      setErrorMessage(error.message);
      setBusyId(null);
      return;
    }

    setMessage(
      newStatus === "published"
        ? "Article published successfully."
        : "Article moved back to draft."
    );

    await loadArticles();
    setBusyId(null);
  }

  async function toggleFeatured(article: Article) {
    setBusyId(article.id);
    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    /*
      Only one article is kept as featured at a time.
      If this article is being featured, remove featured
      status from any other article first.
    */
    if (!article.featured) {
      const { error: clearError } = await supabase
        .from("articles")
        .update({
          featured: false,
          updated_at: new Date().toISOString(),
        })
        .eq("featured", true);

      if (clearError) {
        setErrorMessage(clearError.message);
        setBusyId(null);
        return;
      }
    }

    const { error } = await supabase
      .from("articles")
      .update({
        featured: !article.featured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", article.id);

    if (error) {
      setErrorMessage(error.message);
      setBusyId(null);
      return;
    }

    setMessage(
      article.featured
        ? "Article removed from Featured."
        : "Article is now Featured on the homepage."
    );

    await loadArticles();
    setBusyId(null);
  }

  async function deleteArticle(article: Article) {
    const confirmed = window.confirm(
      `Delete "${article.title}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setBusyId(article.id);
    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", article.id);

    if (error) {
      setErrorMessage(error.message);
      setBusyId(null);
      return;
    }

    setMessage("Article deleted successfully.");

    await loadArticles();
    setBusyId(null);
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

  const filteredArticles = articles.filter((article) => {
    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !query ||
      article.title.toLowerCase().includes(query) ||
      article.slug.toLowerCase().includes(query) ||
      article.category.toLowerCase().includes(query) ||
      article.author.toLowerCase().includes(query);

    const matchesCategory =
      categoryFilter === "All" ||
      article.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      article.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-zinc-400">Loading articles...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/admin"
            className="text-2xl font-black tracking-tight"
          >
            Tech<span className="text-cyan-400">Hunt</span>
          </Link>

          <Link
            href="/admin"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-400">
              TechHunt Admin
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Manage Articles
            </h1>

            <p className="mt-3 text-zinc-400">
              View, search, filter, publish, feature, edit, and delete
              your TechHunt stories.
            </p>
          </div>

          <Link
            href="/admin/articles/new"
            className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-black transition hover:bg-cyan-300"
          >
            + Create Article
          </Link>
        </div>

        {/* Messages */}
        {message && (
          <div className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-300">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {/* Filters */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_180px]">
            {/* Search */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">
                Search Articles
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search by title, slug, category or author..."
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 pr-10 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-400/50"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">
                Category
              </label>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "all"
                      | "published"
                      | "draft"
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Filter summary */}
          <div className="mt-4 flex flex-col gap-2 border-t border-white/5 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-zinc-500">
              Showing{" "}
              <span className="font-semibold text-zinc-300">
                {filteredArticles.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-zinc-300">
                {articles.length}
              </span>{" "}
              articles
            </p>

            {(searchQuery ||
              categoryFilter !== "All" ||
              statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("All");
                  setStatusFilter("all");
                }}
                className="text-left text-cyan-400 transition hover:text-cyan-300 sm:text-right"
              >
                Clear all filters
              </button>
            )}
          </div>
        </section>

        {/* Articles */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          {articles.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h2 className="text-xl font-semibold">
                No articles yet
              </h2>

              <p className="mt-2 text-zinc-500">
                Create your first TechHunt article.
              </p>

              <Link
                href="/admin/articles/new"
                className="mt-6 inline-flex rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-black"
              >
                Create Article
              </Link>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h2 className="text-xl font-semibold">
                No matching articles
              </h2>

              <p className="mt-2 text-zinc-500">
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("All");
                  setStatusFilter("all");
                }}
                className="mt-6 rounded-xl border border-cyan-400/30 px-5 py-3 font-semibold text-cyan-400 transition hover:bg-cyan-400/10"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-sm text-zinc-500">
                      <th className="px-6 py-4 font-medium">
                        Article
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Category
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Status
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Date
                      </th>

                      <th className="px-6 py-4 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredArticles.map((article) => (
                      <tr
                        key={article.id}
                        className="border-b border-white/5 last:border-0"
                      >
                        {/* Article */}
                        <td className="px-6 py-5">
                          <div className="max-w-md">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold">
                                {article.title}
                              </p>

                              {article.featured && (
                                <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-400">
                                  ★ Featured
                                </span>
                              )}
                            </div>

                            <p className="mt-1 truncate text-sm text-zinc-600">
                              /article/{article.slug}
                            </p>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-5">
                          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                            {article.category}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              article.status === "published"
                                ? "bg-emerald-400/10 text-emerald-400"
                                : "bg-amber-400/10 text-amber-400"
                            }`}
                          >
                            {article.status === "published"
                              ? "Published"
                              : "Draft"}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="whitespace-nowrap px-6 py-5 text-sm text-zinc-500">
                          {formatDate(
                            article.published_at ||
                              article.created_at
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap items-center justify-end gap-2">
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

                            <button
                              type="button"
                              onClick={() =>
                                toggleFeatured(article)
                              }
                              disabled={busyId === article.id}
                              className={`rounded-lg border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                article.featured
                                  ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20"
                                  : "border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              {busyId === article.id
                                ? "..."
                                : article.featured
                                  ? "Unfeature"
                                  : "Feature"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                togglePublish(article)
                              }
                              disabled={busyId === article.id}
                              className="rounded-lg border border-cyan-400/20 px-3 py-2 text-xs font-medium text-cyan-400 transition hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {busyId === article.id
                                ? "..."
                                : article.status === "published"
                                  ? "Unpublish"
                                  : "Publish"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteArticle(article)
                              }
                              disabled={busyId === article.id}
                              className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-white/5 md:hidden">
                {filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold">
                            {article.title}
                          </h2>

                          {article.featured && (
                            <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-400">
                              ★ Featured
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-zinc-600">
                          {article.category}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          article.status === "published"
                            ? "bg-emerald-400/10 text-emerald-400"
                            : "bg-amber-400/10 text-amber-400"
                        }`}
                      >
                        {article.status === "published"
                          ? "Published"
                          : "Draft"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-zinc-500">
                      {formatDate(
                        article.published_at ||
                          article.created_at
                      )}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {article.status === "published" && (
                        <Link
                          href={`/article/${article.slug}`}
                          target="_blank"
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300"
                        >
                          View
                        </Link>
                      )}

                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          toggleFeatured(article)
                        }
                        disabled={busyId === article.id}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium disabled:opacity-50 ${
                          article.featured
                            ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-400"
                            : "border-white/10 text-zinc-400"
                        }`}
                      >
                        {busyId === article.id
                          ? "..."
                          : article.featured
                            ? "Unfeature"
                            : "Feature"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          togglePublish(article)
                        }
                        disabled={busyId === article.id}
                        className="rounded-lg border border-cyan-400/20 px-3 py-2 text-xs font-medium text-cyan-400 disabled:opacity-50"
                      >
                        {article.status === "published"
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteArticle(article)
                        }
                        disabled={busyId === article.id}
                        className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-400 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}