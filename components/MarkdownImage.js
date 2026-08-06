"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function MarkdownImage({ src, alt }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      <img
        src={src}
        alt={alt}
        onClick={() => setIsOpen(true)}
        className="max-w-full h-auto rounded-lg border border-gray-700 my-4 cursor-zoom-in hover:border-blue-400 transition-colors"
      />

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt || "Expanded image"}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 p-4 sm:p-8 overflow-auto cursor-zoom-out"
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close image"
            className="fixed top-4 right-4 z-10 rounded-full bg-slate-800/90 border border-gray-700 p-2 text-gray-300 hover:text-white hover:border-blue-400 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto max-w-none sm:max-w-full h-auto rounded-lg cursor-default"
          />
        </div>
      )}
    </>
  );
}
