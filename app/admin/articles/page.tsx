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

export default function ManageArticlesPage() {
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-zinc-400">
          Loading articles...
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
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-400">
              TechHunt Admin
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Manage Articles
            </h1>

            <p className="mt-3 text-zinc-400">
              View, publish, edit, and delete your TechHunt stories.
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

        {/* Articles */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
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
                    {articles.map((article) => (
                      <tr
                        key={article.id}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="px-6 py-5">
                          <div className="max-w-md">
                            <p className="font-semibold">
                              {article.title}
                            </p>

                            <p className="mt-1 truncate text-sm text-zinc-600">
                              /article/{article.slug}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                            {article.category}
                          </span>
                        </td>

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

                        <td className="whitespace-nowrap px-6 py-5 text-sm text-zinc-500">
                          {formatDate(
                            article.published_at ||
                              article.created_at
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/articles/${article.id}/edit`}
                              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
                            >
                              Edit
                            </Link>

                            <button
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
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-semibold">
                          {article.title}
                        </h2>

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
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300"
                      >
                        Edit
                      </Link>

                      <button
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