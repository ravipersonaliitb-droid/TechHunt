"use client";

import { FormEvent, useState } from "react";
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

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slug) {
      setSlug(createSlug(value));
    }
  }

  function handleImageChange(file: File | null) {
    if (!file) {
      setImage(null);
      setImagePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10 MB.");
      return;
    }

    setError("");
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage() {
    if (!image) {
      return "";
    }

    const fileExtension = image.name.split(".").pop()?.toLowerCase() || "jpg";

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
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("article-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      if (!title.trim()) {
        throw new Error("Please enter an article title.");
      }

      if (!slug.trim()) {
        throw new Error("Please enter an article slug.");
      }

      if (!content.trim()) {
        throw new Error("Please enter article content.");
      }

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw new Error("You are not logged in. Please log in again.");
      }

      let finalImageUrl = imageUrl;

      if (image) {
        finalImageUrl = await uploadImage();
      }

      const { error: insertError } = await supabase
        .from("articles")
        .insert({
          slug: slug.trim(),
          title: title.trim(),
          excerpt: excerpt.trim(),
          content: content.trim(),
          category,
          author: author.trim() || "TechHunt",
          image_url: finalImageUrl || null,
          status,
          featured: false,
          published_at:
            status === "published" ? new Date().toISOString() : null,
        });

      if (insertError) {
        throw new Error(insertError.message);
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
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight">
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
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            TechHunt Admin
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Create Article
          </h1>

          <p className="mt-4 text-lg text-zinc-400">
            Write your story and publish it directly to TechHunt.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10"
        >
          <h2 className="text-2xl font-bold">Article Information</h2>

          <div className="mt-8 space-y-7">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => handleTitleChange(event.target.value)}
                placeholder="Enter article title"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Slug
              </label>

              <input
                type="text"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="article-url-slug"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-400"
              />

              <p className="mt-2 text-sm text-zinc-600">
                This becomes the article URL.
              </p>
            </div>

            <div className="grid gap-7 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
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
                <label className="mb-2 block text-sm font-medium">
                  Author
                </label>

                <input
                  type="text"
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Excerpt
              </label>

              <textarea
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                rows={4}
                placeholder="Write a short summary of the article..."
                className="w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Article Image
              </label>

              <div className="rounded-2xl border border-dashed border-white/15 bg-black p-5">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    handleImageChange(event.target.files?.[0] || null)
                  }
                  className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-semibold file:text-black"
                />

                <p className="mt-3 text-sm text-zinc-600">
                  Recommended: JPG, PNG or WebP. Maximum 10 MB.
                </p>

                {imagePreview && (
                  <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
                    <img
                      src={imagePreview}
                      alt="Article preview"
                      className="max-h-80 w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Content
              </label>

              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={14}
                placeholder="Write your full article here..."
                className="w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-4 leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Publishing Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "draft" | "published")
                }
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none focus:border-cyan-400"
              >
                <option value="draft">Save as Draft</option>
                <option value="published">Publish Article</option>
              </select>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-white/10 pt-7 sm:flex-row sm:justify-end">
              <Link
                href="/admin/articles"
                className="rounded-xl border border-white/10 px-6 py-3 text-center text-sm font-semibold transition hover:bg-white/5"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : status === "published"
                    ? "Publish Article"
                    : "Save Draft"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}