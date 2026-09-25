"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../../../lib/supabase/client";

type Article = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  author: string;
  status: "draft" | "published";
  featured: boolean;
  image_url: string | null;
  published_at: string | null;
};

const categories = [
  "AI",
  "India Tech",
  "Gadgets",
  "Startups",
  "Cybersecurity",
  "Software",
  "Research",
];

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();

  const articleId = Number(params.id);

  const [article, setArticle] = useState<Article | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("AI");
  const [author, setAuthor] = useState("TechHunt");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] =
    useState<"draft" | "published">("draft");
  const [featured, setFeatured] = useState(false);

  const [imageUrl, setImageUrl] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadArticle() {
      if (!articleId || Number.isNaN(articleId)) {
        setErrorMessage("Invalid article ID.");
        setLoading(false);
        return;
      }

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
        .select("*")
        .eq("id", articleId)
        .single();

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage("Article not found.");
        setLoading(false);
        return;
      }

      const loadedArticle = data as Article;

      setArticle(loadedArticle);

      setTitle(loadedArticle.title ?? "");
      setSlug(loadedArticle.slug ?? "");
      setCategory(loadedArticle.category ?? "AI");
      setAuthor(loadedArticle.author ?? "TechHunt");
      setExcerpt(loadedArticle.excerpt ?? "");
      setContent(loadedArticle.content ?? "");
      setStatus(loadedArticle.status ?? "draft");
      setFeatured(loadedArticle.featured ?? false);
      setImageUrl(loadedArticle.image_url ?? "");
      setImagePreview(loadedArticle.image_url ?? "");

      setLoading(false);
    }

    loadArticle();
  }, [articleId, router]);

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setMessage("");
    setErrorMessage("");

    if (!file.type.startsWith("image/")) {
      setErrorMessage(
        "Please select a valid image file."
      );
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      setErrorMessage(
        "Image must be smaller than 6 MB."
      );
      return;
    }

    setImage(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  async function uploadImage() {
    if (!image) {
      return imageUrl.trim();
    }

    setUploading(true);

    try {
      const supabase = createClient();

      const fileExtension =
        image.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeFileName = image.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .toLowerCase();

      const fileName = `${safeFileName}-${Date.now()}.${fileExtension}`;

      const filePath = `articles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("article-images")
        .upload(filePath, image, {
          cacheControl: "3600",
          contentType: image.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data } = supabase.storage
        .from("article-images")
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error(
          "Image uploaded, but the public URL could not be generated."
        );
      }

      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Please enter an article title.");
      setSaving(false);
      return;
    }

    if (!slug.trim()) {
      setErrorMessage("Please enter an article slug.");
      setSaving(false);
      return;
    }

    if (!content.trim()) {
      setErrorMessage("Please enter article content.");
      setSaving(false);
      return;
    }

    try {
      const supabase = createClient();

      let finalImageUrl = imageUrl.trim();

      if (image) {
        finalImageUrl = await uploadImage();
      }

      const { error } = await supabase
        .from("articles")
        .update({
          title: title.trim(),
          slug: slug.trim(),
          category,
          author: author.trim() || "TechHunt",
          excerpt: excerpt.trim() || null,
          content: content.trim(),
          status,
          featured,
          image_url: finalImageUrl || null,
          published_at:
            status === "published"
              ? article?.published_at ||
                new Date().toISOString()
              : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", articleId);

      if (error) {
        throw new Error(error.message);
      }

      setMessage(
        "Article updated successfully."
      );

      setImage(null);

      setTimeout(() => {
        router.push("/admin/articles");
        router.refresh();
      }, 800);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the article."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-zinc-400">
          Loading article...
        </p>
      </main>
    );
  }

  if (errorMessage && !article) {
    return (
      <main className="min-h-screen bg-black text-white">
        <header className="border-b border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <Link
              href="/admin"
              className="text-2xl font-black tracking-tight"
            >
              Tech<span className="text-cyan-400">Hunt</span>
            </Link>

            <Link
              href="/admin/articles"
              className="text-sm text-zinc-400 hover:text-white"
            >
              ← Back to Articles
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <h1 className="text-xl font-semibold text-red-300">
              Unable to load article
            </h1>

            <p className="mt-2 text-sm text-red-200/80">
              {errorMessage}
            </p>
          </div>
        </div>
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
            href="/admin/articles"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            ← Back to Articles
          </Link>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-400">
            TechHunt Admin
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl">
            Edit Article
          </h1>

          <p className="mt-3 text-zinc-400">
            Update your article and save the changes to TechHunt.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-300">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="space-y-6"
        >
          {/* Basic information */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="text-xl font-semibold">
              Article Information
            </h2>

            <div className="mt-6 space-y-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Title
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400/50"
                  placeholder="Enter article title"
                />
              </div>

              {/* Slug */}
              <div>
                <label
                  htmlFor="slug"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Slug
                </label>

                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    setSlug(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400/50"
                  placeholder="article-url-slug"
                />

                <p className="mt-2 text-xs text-zinc-600">
                  This becomes the article URL.
                </p>
              </div>

              {/* Category + Author */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                  >
                    Category
                  </label>

                  <select
                    id="category"
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-cyan-400/50"
                  >
                    {categories.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="author"
                    className="mb-2 block text-sm font-medium text-zinc-300"
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
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-cyan-400/50"
                    placeholder="TechHunt"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label
                  htmlFor="excerpt"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Excerpt
                </label>

                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(event) =>
                    setExcerpt(event.target.value)
                  }
                  rows={4}
                  className="w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-700 focus:border-cyan-400/50"
                  placeholder="Write a short summary of the article..."
                />
              </div>

              {/* Article Image */}
              <div>
                <label
                  htmlFor="image"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Article Image
                </label>

                <div className="rounded-2xl border border-dashed border-white/15 bg-black p-5">
                  <input
                    id="image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-semibold file:text-black"
                  />

                  <p className="mt-3 text-sm text-zinc-500">
                    Select JPG, PNG, WebP or GIF. Maximum 6 MB.
                  </p>

                  {imagePreview && (
                    <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
                      <img
                        src={imagePreview}
                        alt="Article image preview"
                        className="max-h-96 w-full object-cover"
                      />
                    </div>
                  )}

                  {imageUrl && !image && (
                    <p className="mt-3 text-xs text-zinc-600 break-all">
                      Current image:
                      <br />
                      {imageUrl}
                    </p>
                  )}

                  {image && (
                    <p className="mt-3 text-sm text-cyan-300">
                      New image selected. It will be uploaded when you
                      click "Save Changes".
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="text-xl font-semibold">
              Article Content
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Write the complete article here. Separate paragraphs
              with blank lines.
            </p>

            <textarea
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              rows={20}
              className="mt-6 w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none placeholder:text-zinc-700 focus:border-cyan-400/50"
              placeholder="Write your article..."
            />
          </section>

          {/* Publishing */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="text-xl font-semibold">
              Publishing
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Status
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
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-cyan-400/50"
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="published">
                    Published
                  </option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(event) =>
                      setFeatured(event.target.checked)
                    }
                    className="h-4 w-4 accent-cyan-400"
                  />

                  <span className="text-sm text-zinc-300">
                    Feature this article on the homepage
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Link
              href="/admin/articles"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 px-6 py-3 font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-7 py-3 font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading
                ? "Uploading Image..."
                : saving
                  ? "Saving..."
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}