"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

type Stats = {
  total: number;
  published: number;
  drafts: number;
};

export default function AdminDashboard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    drafts: 0,
  });

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

      if (
        totalResult.error ||
        publishedResult.error ||
        draftsResult.error
      ) {
        setErrorMessage(
          totalResult.error?.message ||
            publishedResult.error?.message ||
            draftsResult.error?.message ||
            "Unable to load article statistics."
        );

        setLoading(false);
        return;
      }

      setStats({
        total: totalResult.count ?? 0,
        published: publishedResult.count ?? 0,
        drafts: draftsResult.count ?? 0,
      });

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
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-400">
            TechHunt Admin
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Manage your TechHunt articles, drafts, and published
            stories from one place.
          </p>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-zinc-500">
              Articles
            </p>

            <p className="mt-2 text-4xl font-bold">
              {stats.total}
            </p>

            <p className="mt-2 text-sm text-zinc-600">
              Total articles in TechHunt
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-zinc-500">
              Published
            </p>

            <p className="mt-2 text-4xl font-bold">
              {stats.published}
            </p>

            <p className="mt-2 text-sm text-zinc-600">
              Articles visible on the website
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-zinc-500">
              Drafts
            </p>

            <p className="mt-2 text-4xl font-bold">
              {stats.drafts}
            </p>

            <p className="mt-2 text-sm text-zinc-600">
              Articles waiting to be published
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold">
            Quick Actions
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                View, edit, publish, and delete articles.
              </p>
            </Link>

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