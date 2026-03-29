"use client";

import { useState } from "react";

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className={`rounded-full px-6 py-2 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 active:scale-95 ${
        copied ? "bg-honey-green" : "bg-honey-gold"
      }`}
    >
      {copied ? "Copied!" : "Copy Link"}
    </button>
  );
}
