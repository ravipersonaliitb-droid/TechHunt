import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ShareButton from "./ShareButton";
import { supabase } from "../../../lib/supabase/server";

type ArticlePageProps = {
  params: {
    slug: string;
  };
};

const siteUrl = "https://tech-hunt-iota.vercel.app";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* --------------------------------
   Article Data
--------------------------------- */

async function getArticle(slug: string) {
  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    console.error("Failed to load article:", error);
  }

  return article;
}

async function getRelatedArticles(
  currentSlug: string,
  currentCategory: string
) {
  const { data: articles, error } = await supabase
    .from("articles")
    .select(
      "id, slug, title, excerpt, category, image_url, published_at, created_at"
    )
    .eq("status", "published")
    .neq("slug", currentSlug)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Failed to load related articles:", error);
    return [];
  }

  const sortedArticles = [...(articles ?? [])].sort((a, b) => {
    const aSameCategory = a.category === currentCategory ? 1 : 0;
    const bSameCategory = b.category === currentCategory ? 1 : 0;

    if (aSameCategory !== bSameCategory) {
      return bSameCategory - aSameCategory;
    }

    const aDate = new Date(
      a.published_at ?? a.created_at
    ).getTime();

    const bDate = new Date(
      b.published_at ?? b.created_at
    ).getTime();

    return bDate - aDate;
  });

  return sortedArticles.slice(0, 3);
}

/* --------------------------------
   Date Helper
--------------------------------- */

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* --------------------------------
   Dynamic SEO Metadata
--------------------------------- */

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const article = await getArticle(params.slug);

  if (!article) {
    return {
      title: "Article Not Found",
      description:
        "The requested TechHunt article could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    article.excerpt ||
    `Read the latest ${article.category} technology story on TechHunt.`;

  const articleUrl = `${siteUrl}/article/${article.slug}`;

  const metadata: Metadata = {
    title: article.title,

    description,

    alternates: {
      canonical: articleUrl,
    },

    keywords: [
      article.category,
      "technology news",
      "TechHunt",
    ],

    authors: [
      {
        name: article.author || "TechHunt",
      },
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
      type: "article",
      url: articleUrl,
      siteName: "TechHunt",
      title: article.title,
      description,
      locale: "en_IN",

      publishedTime:
        article.published_at ?? article.created_at,

      modifiedTime:
        article.updated_at ??
        article.published_at ??
        article.created_at,

      authors: [article.author || "TechHunt"],

      section: article.category,

      ...(article.image_url
        ? {
            images: [
              {
                url: article.image_url,
                width: 1200,
                height: 630,
                alt: article.title,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: article.image_url
        ? "summary_large_image"
        : "summary",

      title: article.title,

      description,

      ...(article.image_url
        ? {
            images: [article.image_url],
          }
        : {}),
    },
  };

  return metadata;
}

/* --------------------------------
   Article Content Helpers
--------------------------------- */

function getHeadingLevel(text: string) {
  const clean = text.trim();

  if (clean.startsWith("### ")) return 3;
  if (clean.startsWith("## ")) return 2;

  /*
    Preserve the previous behavior for headings
    that were written without Markdown markers.
  */
  if (
    clean &&
    clean.length <= 80 &&
    !/[.!?,;:]$/.test(clean) &&
    !clean.includes("→")
  ) {
    return 2;
  }

  return 0;
}

function cleanHeadingText(text: string) {
  return text.trim().replace(/^#{2,3}\s+/, "");
}

/* --------------------------------
   Article Structured Data
--------------------------------- */

function createArticleStructuredData(article: any) {
  const articleUrl = `${siteUrl}/article/${article.slug}`;

  const publishedDate =
    article.published_at ?? article.created_at;

  const modifiedDate =
    article.updated_at ??
    article.published_at ??
    article.created_at;

  const authorName = article.author || "TechHunt";

  const author =
    authorName === "TechHunt"
      ? {
          "@type": "Organization",
          name: "TechHunt",
          url: siteUrl,
        }
      : {
          "@type": "Person",
          name: authorName,
        };

  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",

    headline: article.title,

    description:
      article.excerpt ||
      `Read the latest ${article.category} technology story on TechHunt.`,

    url: articleUrl,

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },

    datePublished: publishedDate,

    dateModified: modifiedDate,

    author,

    publisher: {
      "@type": "Organization",
      name: "TechHunt",
      url: siteUrl,
    },

    articleSection: article.category,

    keywords: [
      article.category,
      "technology news",
      "TechHunt",
    ],

    inLanguage: "en-IN",

    isAccessibleForFree: true,
  };

  if (article.image_url) {
    structuredData.image = [article.image_url];
  }

  return structuredData;
}

/* --------------------------------
   Article Page
--------------------------------- */

export default async function ArticlePage({
  params,
}: ArticlePageProps) {
  const article = await getArticle(params.slug);

  if (!article) {
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
            This article may have been removed, unpublished, or does
            not exist.
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

  const relatedArticles = await getRelatedArticles(
    article.slug,
    article.category
  );

  const structuredData = createArticleStructuredData(article);

  const publishedDate = formatDate(
    article.published_at ?? article.created_at
  );

  const paragraphs = article.content
    .split(/\n\s*\n/)
    .map((paragraph: string) => paragraph.trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      {/* Article Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

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
              {article.author || "TechHunt"}
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
        <div className="mx-auto mt-14 max-w-5xl">
          <div className="mx-auto max-w-3xl space-y-8">
            {paragraphs.map(
              (paragraph: string, index: number) => {
                const headingLevel = getHeadingLevel(paragraph);
                const headingText = cleanHeadingText(paragraph);

                if (headingLevel === 3) {
                  return (
                    <h3
                      key={index}
                      className="pt-5 text-xl font-black leading-tight tracking-tight text-white sm:text-2xl"
                    >
                      {headingText}
                    </h3>
                  );
                }

                if (headingLevel === 2) {
                  return (
                    <h2
                      key={index}
                      className="pt-5 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl"
                    >
                      {headingText}
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
              }
            )}
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-20 border-t border-white/10 pt-12">
              <div className="mb-7 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                    Keep Reading
                  </p>

                  <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                    You May Also Like
                  </h2>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {relatedArticles.map((relatedArticle) => (
                  <Link
                    key={relatedArticle.id ?? relatedArticle.slug}
                    href={`/article/${relatedArticle.slug}`}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.05]"
                  >
                    {/* Card Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#10141c]">
                      {relatedArticle.image_url ? (
                        <img
                          src={relatedArticle.image_url}
                          alt={relatedArticle.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="article-hero h-full">
                          <div className="article-hero-grid" />
                          <div className="article-orb" />

                          <div className="relative z-10 flex h-full items-end p-5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                              TechHunt
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="absolute left-3 top-3">
                        <span className="rounded-full border border-cyan-400/30 bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-300 backdrop-blur-md">
                          {relatedArticle.category}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                      <p className="text-xs text-zinc-500">
                        {formatDate(
                          relatedArticle.published_at ??
                            relatedArticle.created_at
                        )}
                      </p>

                      <h3 className="mt-2 line-clamp-3 text-lg font-black leading-tight text-white transition group-hover:text-cyan-300">
                        {relatedArticle.title}
                      </h3>

                      {relatedArticle.excerpt && (
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">
                          {relatedArticle.excerpt}
                        </p>
                      )}

                      <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-400">
                        Read article
                        <ArrowRight
                          size={15}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

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