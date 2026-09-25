"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase/client";

const categories = [
  "AI",
  "India Tech",
  "Gadgets",
  "Startups",
  "Cybersecurity",
  "Software",
  "Research",
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_TITLE_LENGTH = 120;
const MAX_EXCERPT_LENGTH = 300;

export default function CreateArticlePage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("AI");
  const [author, setAuthor] = useState("TechHunt");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [featured, setFeatured] = useState(false);

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const titleCount = title.length;
  const excerptCount = excerpt.length;
  const wordCount = content.trim()
    ? content.trim().split(/\s+/).length
    : 0;

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleTitleChange(value: string) {
    if (value.length > MAX_TITLE_LENGTH) {
      return;
    }

    setTitle(value);

    if (!slug || slug === createSlug(title)) {
      setSlug(createSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlug(createSlug(value));
  }

  function handleExcerptChange(value: string) {
    if (value.length > MAX_EXCERPT_LENGTH) {
      return;
    }

    setExcerpt(value);
  }

  function handleImageChange(file: File | null) {
    if (!file) {
      clearImage();
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image must be smaller than 10 MB.");
      return;
    }

    setError("");
    setImage(file);
    setImageUrl("");

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(URL.createObjectURL(file));
  }

  function handleImageUrlChange(value: string) {
    setImageUrl(value);

    if (value.trim()) {
      setImage(null);

      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      setImagePreview(value.trim());
    } else if (!image) {
      setImagePreview("");
    }
  }

  function clearImage() {
    setImage(null);
    setImageUrl("");

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview("");
  }

  async function uploadImage() {
    if (!image) {
      return "";
    }

    const fileExtension =
      image.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}.${fileExtension}`;

    const filePath = `articles/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("article-images")
      .upload(filePath, image, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(
        `Image upload failed: ${uploadError.message}`
      );
    }

    const { data } = supabase.storage
      .from("article-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const cleanTitle = title.trim();
      const cleanSlug = slug.trim();
      const cleanExcerpt = excerpt.trim();
      const cleanContent = content.trim();
      const cleanAuthor = author.trim() || "TechHunt";

      if (!cleanTitle) {
        throw new Error("Please enter an article title.");
      }

      if (cleanTitle.length < 10) {
        throw new Error(
          "Article title should contain at least 10 characters."
        );
      }

      if (!cleanSlug) {
        throw new Error("Please enter an article slug.");
      }

      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
        throw new Error(
          "Slug can contain only lowercase letters, numbers, and hyphens."
        );
      }

      if (!cleanExcerpt) {
        throw new Error("Please enter an article excerpt.");
      }

      if (cleanExcerpt.length < 30) {
        throw new Error(
          "Article excerpt should contain at least 30 characters."
        );
      }

      if (!cleanContent) {
        throw new Error("Please enter article content.");
      }

      if (cleanContent.length < 100) {
        throw new Error(
          "Article content should contain at least 100 characters."
        );
      }

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw new Error(
          "You are not logged in. Please log in again."
        );
      }

      // Check whether the slug already exists.
      const { data: existingArticle, error: slugCheckError } =
        await supabase
          .from("articles")
          .select("id")
          .eq("slug", cleanSlug)
          .maybeSingle();

      if (slugCheckError) {
        throw new Error(slugCheckError.message);
      }

      if (existingArticle) {
        throw new Error(
          "This slug is already in use. Please choose a different slug."
        );
      }

      let finalImageUrl = imageUrl.trim();

      if (image) {
        finalImageUrl = await uploadImage();
      }

      // Create the article first.
      const { data: insertedArticle, error: insertError } =
        await supabase
          .from("articles")
          .insert({
            slug: cleanSlug,
            title: cleanTitle,
            excerpt: cleanExcerpt,
            content: cleanContent,
            category,
            author: cleanAuthor,
            image_url: finalImageUrl || null,
            status,
            featured: false,
            published_at:
              status === "published"
                ? new Date().toISOString()
                : null,
          })
          .select("id")
          .single();

      if (insertError || !insertedArticle) {
        throw new Error(
          insertError?.message ||
            "Article could not be created."
        );
      }

      // If this article is being featured, remove Featured
      // status from other articles first.
      if (featured) {
        const { error: clearFeaturedError } = await supabase
          .from("articles")
          .update({ featured: false })
          .eq("featured", true)
          .neq("id", insertedArticle.id);

        if (clearFeaturedError) {
          throw new Error(
            `Article was created, but Featured status could not be updated: ${clearFeaturedError.message}`
          );
        }

        const { error: featureError } = await supabase
          .from("articles")
          .update({ featured: true })
          .eq("id", insertedArticle.id);

        if (featureError) {
          throw new Error(
            `Article was created, but Featured status could not be updated: ${featureError.message}`
          );
        }
      }

      router.push("/admin/articles");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the article."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
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

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Page heading */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            TechHunt Admin
          </p>

          <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Create Article
              </h1>

              <p className="mt-4 max-w-2xl text-lg text-zinc-400">
                Write, prepare, and publish your next TechHunt
                story.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
              <span className="text-white">
                {wordCount}
              </span>{" "}
              words
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10"
        >
          {/* Article information */}
          <div>
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-bold">
                  Article Information
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Enter the basic information for your article.
                </p>
              </div>

              <span className="text-xs uppercase tracking-wider text-zinc-600">
                Required fields marked by validation
              </span>
            </div>

            <div className="mt-8 space-y-7">
              {/* Title */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium"
                  >
                    Title
                  </label>

                  <span
                    className={`text-xs ${
                      titleCount >= MAX_TITLE_LENGTH
                        ? "text-red-400"
                        : "text-zinc-600"
                    }`}
                  >
                    {titleCount}/{MAX_TITLE_LENGTH}
                  </span>
                </div>

                <input
                  id="title"
                  type="text"
                  value={title}
                  maxLength={MAX_TITLE_LENGTH}
                  required
                  onChange={(event) =>
                    handleTitleChange(event.target.value)
                  }
                  placeholder="Enter article title"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-400"
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Use a clear, specific headline that tells readers
                  what the story is about.
                </p>
              </div>

              {/* Slug */}
              <div>
                <label
                  htmlFor="slug"
                  className="mb-2 block text-sm font-medium"
                >
                  Slug
                </label>

                <div className="flex items-center rounded-xl border border-white/10 bg-black focus-within:border-cyan-400">
                  <span className="hidden px-4 text-sm text-zinc-600 sm:block">
                    /article/
                  </span>

                  <input
                    id="slug"
                    type="text"
                    value={slug}
                    required
                    onChange={(event) =>
                      handleSlugChange(event.target.value)
                    }
                    placeholder="article-url-slug"
                    className="w-full bg-transparent px-4 py-4 text-white outline-none placeholder:text-zinc-600 sm:px-0"
                  />
                </div>

                <p className="mt-2 text-sm text-zinc-600">
                  This becomes the article URL. Use lowercase words
                  separated by hyphens.
                </p>
              </div>

              {/* Category + Author */}
              <div className="grid gap-7 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-medium"
                  >
                    Category
                  </label>

                  <select
                    id="category"
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none focus:border-cyan-400"
                  >
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="author"
                    className="mb-2 block text-sm font-medium"
                  >
                    Author
                  </label>

                  <input
                    id="author"
                    type="text"
                    value={author}
                    onChange={(event) =>
                      setAuthor(event.target.value)
                    }
                    placeholder="TechHunt"
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="excerpt"
                    className="block text-sm font-medium"
                  >
                    Excerpt
                  </label>

                  <span
                    className={`text-xs ${
                      excerptCount >= MAX_EXCERPT_LENGTH
                        ? "text-red-400"
                        : "text-zinc-600"
                    }`}
                  >
                    {excerptCount}/{MAX_EXCERPT_LENGTH}
                  </span>
                </div>

                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(event) =>
                    handleExcerptChange(event.target.value)
                  }
                  maxLength={MAX_EXCERPT_LENGTH}
                  rows={4}
                  required
                  placeholder="Write a short summary of the article..."
                  className="w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-4 leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-400"
                />

                <p className="mt-2 text-xs text-zinc-600">
                  This summary can appear on article cards and
                  search results.
                </p>
              </div>

              {/* Image */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Article Image
                </label>

                <div className="rounded-2xl border border-dashed border-white/15 bg-black p-5">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(event) =>
                      handleImageChange(
                        event.target.files?.[0] || null
                      )
                    }
                    className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-semibold file:text-black"
                  />

                  <p className="mt-3 text-sm text-zinc-600">
                    Recommended: JPG, PNG or WebP. Maximum 10 MB.
                  </p>

                  <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-xs uppercase tracking-wider text-zinc-600">
                      or use image URL
                    </span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(event) =>
                      handleImageUrlChange(event.target.value)
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-400"
                  />

                  {imagePreview && (
                    <div className="mt-5">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-300">
                          Image Preview
                        </span>

                        <button
                          type="button"
                          onClick={clearImage}
                          className="text-sm text-red-400 transition hover:text-red-300"
                        >
                          Remove image
                        </button>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-white/10">
                        <img
                          src={imagePreview}
                          alt="Article preview"
                          className="max-h-96 w-full object-cover"
                          onError={() => {
                            setError(
                              "The image URL could not be loaded."
                            );
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium"
                  >
                    Article Content
                  </label>

                  <span className="text-xs text-zinc-600">
                    {wordCount} words
                  </span>
                </div>

                <textarea
                  id="content"
                  value={content}
                  onChange={(event) =>
                    setContent(event.target.value)
                  }
                  rows={18}
                  required
                  placeholder="Write your full article here..."
                  className="w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-4 leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-400"
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Write the complete article content. You can use
                  paragraphs and line breaks.
                </p>
              </div>

              {/* Publishing */}
              <div className="rounded-2xl border border-white/10 bg-black/50 p-5">
                <h3 className="text-lg font-semibold">
                  Publishing
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Choose how this article should appear on
                  TechHunt.
                </p>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="status"
                      className="mb-2 block text-sm font-medium"
                    >
                      Publishing Status
                    </label>

                    <select
                      id="status"
                      value={status}
                      onChange={(event) =>
                        setStatus(
                          event.target.value as
                            | "draft"
                            | "published"
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none focus:border-cyan-400"
                    >
                      <option value="draft">
                        Save as Draft
                      </option>
                      <option value="published">
                        Publish Article
                      </option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex w-full cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4 transition hover:border-cyan-400/40">
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(event) =>
                          setFeatured(event.target.checked)
                        }
                        className="h-5 w-5 accent-cyan-400"
                      />

                      <span>
                        <span className="block text-sm font-medium text-white">
                          Feature on homepage
                        </span>

                        <span className="mt-1 block text-xs text-zinc-500">
                          This will replace the current featured
                          article.
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                {featured && (
                  <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-sm text-cyan-300">
                    ★ This article will be featured on the
                    TechHunt homepage.
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300"
                >
                  <div className="font-semibold">
                    Unable to save article
                  </div>

                  <div className="mt-1">{error}</div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col gap-3 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/admin/articles"
                  className="rounded-xl border border-white/10 px-6 py-3 text-center text-sm font-semibold transition hover:bg-white/5"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-cyan-400 px-8 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : status === "published"
                      ? "Publish Article"
                      : "Save Draft"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}