import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ShareButton from "./ShareButton";
import { supabase } from "../../../lib/supabase/server";

type ArticlePageProps = {
  params: {
    slug: string;
  };
};

function isHeading(text: string) {
  const clean = text.trim();

  if (!clean) return false;

  return (
    clean.length <= 80 &&
    !/[.!?,;:]$/.test(clean) &&
    !clean.includes("→")
  );
}

export default async function ArticlePage({
  params,
}: ArticlePageProps) {
  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (error || !article) {
    return (
      <main className="min-h-screen bg-[#07090d] px-5 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
            TechHunt
          </p>

          <h1 className="mt-4 text-4xl font-black">
            Article not found
          </h1>

          <p className="mt-4 text-zinc-400">
            This article may have been removed, unpublished, or does not
            exist.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-cyan-300"
          >
            <ArrowLeft size={17} />
            Back to TechHunt
          </Link>
        </div>
      </main>
    );
  }

  const publishedDate = new Date(
    article.published_at ?? article.created_at
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const paragraphs = article.content
    .split(/\n\s*\n/)
    .map((paragraph: string) => paragraph.trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07090d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="logo-mark">T</div>

            <span className="text-xl font-black tracking-tight">
              Tech<span className="text-cyan-400">Hunt</span>
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Home
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="mx-auto max-w-5xl px-5 py-12 lg:py-16">
        {/* Category */}
        <div className="mb-6">
          <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-cyan-300">
            {article.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="max-w-4xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="mt-7 max-w-4xl text-lg leading-8 text-zinc-400 sm:text-xl">
            {article.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-white/10 pb-8 text-sm text-zinc-500">
          <span>
            By{" "}
            <span className="font-semibold text-zinc-300">
              {article.author}
            </span>
          </span>

          <span>•</span>

          <span>{publishedDate}</span>

          <ShareButton
            title={article.title}
            excerpt={article.excerpt}
          />
        </div>

        {/* Article Image */}
        {article.image_url ? (
          <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
            <img
              src={article.image_url}
              alt={article.title}
              className="h-auto max-h-[680px] w-full object-cover"
            />
          </div>
        ) : (
          <div className="article-hero mt-10">
            <div className="article-hero-grid" />
            <div className="article-orb" />

            <div className="relative z-10 flex min-h-[360px] items-end p-7 sm:p-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
                  TechHunt
                </p>

                <p className="mt-2 max-w-xl text-2xl font-black sm:text-3xl">
                  Technology. Innovation. What&apos;s Next.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="mx-auto mt-14 max-w-3xl">
          <div className="space-y-8">
            {paragraphs.map((paragraph: string, index: number) => {
              const heading = isHeading(paragraph);

              if (heading) {
                return (
                  <h2
                    key={index}
                    className="pt-5 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl"
                  >
                    {paragraph}
                  </h2>
                );
              }

              return (
                <p
                  key={index}
                  className="text-[17px] leading-8 text-zinc-300 sm:text-[18px] sm:leading-9"
                >
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Bottom Navigation */}
          <div className="mt-16 border-t border-white/10 pt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400 transition hover:text-cyan-300"
            >
              <ArrowLeft size={16} />
              Back to latest stories
            </Link>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/">
            <span className="font-black text-white">
              Tech<span className="text-cyan-400">Hunt</span>
            </span>
          </Link>

          <p>
            © 2026 TechHunt. Technology. Innovation. What&apos;s Next.
          </p>
        </div>
      </footer>
    </main>
  );
}