"use client";

import { Share2 } from "lucide-react";

type ShareButtonProps = {
  title: string;
  excerpt?: string | null;
};

export default function ShareButton({
  title,
  excerpt,
}: ShareButtonProps) {
  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: excerpt ?? "",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Article link copied.");
      }
    } catch {
      // User cancelled the share dialog.
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="ml-auto flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-zinc-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
    >
      <Share2 size={16} />
      Share
    </button>
  );
}