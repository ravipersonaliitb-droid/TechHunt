import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "../../../lib/supabase/server";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const categoryName =
    category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const { data: articles, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load category articles:", error);
  }

  const categoryArticles = (articles ?? [])
    .filter(
      (article) =>
        article.category.toLowerCase().replace(/\s+/g, "-") ===
        category.toLowerCase()
    )
    .map((article) => ({
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
            className="flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white"
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
          {categoryName}
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
          Latest stories and developments from the {categoryName} section
          of TechHunt.
        </p>
      </section>

      {/* Articles */}
      <section className="mx-auto max-w-7xl px-5 pb-16">
        {categoryArticles.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {categoryArticles.map((article) => (
              <article
                key={article.slug}
                className="news-card"
              >
                <div className="news-image">
                  <span>{article.category}</span>
                </div>

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
            <h2 className="text-2xl font-bold">
              No articles found
            </h2>

            <p className="mt-3 text-zinc-400">
              There are currently no published articles in this category.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black hover:bg-cyan-300"
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