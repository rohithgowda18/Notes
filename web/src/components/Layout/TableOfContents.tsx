import React, { useEffect, useState } from "react";
import type { TocItem } from "../../types";
import { AlignLeft } from "lucide-react";

interface TableOfContentsProps {
  content: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // Extract headings from markdown content
  useEffect(() => {
    const lines = content.split("\n");
    const extracted: TocItem[] = [];

    // Simple heading parser
    for (const line of lines) {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const rawText = match[2].trim();

        // Strip markdown links or formatting from heading text
        const text = rawText
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // strip links
          .replace(/[*_`]/g, "") // strip formatting
          .replace(/^[0-9.]+\s*/, ""); // optional prefix

        // Generate slug matching rehype-slug
        const id = rawText
          .toLowerCase()
          .replace(/<[^>]*>/g, "")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");

        if (id && text) {
          extracted.push({ id, text: rawText.replace(/[*_`]/g, ""), level });
        }
      }
    }

    setHeadings(extracted);
  }, [content]);

  // Scroll spy to highlight active heading
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;

      for (let i = headings.length - 1; i >= 0; i--) {
        const el = document.getElementById(headings[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(headings[i].id);
          return;
        }
      }

      if (headings.length > 0) {
        setActiveId(headings[0].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  if (headings.length <= 1) {
    return null;
  }

  const scrollToHeading = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -85;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      history.pushState(null, "", `#${id}`);
      setActiveId(id);
    }
  };

  return (
    <nav className="w-64 shrink-0 hidden xl:block pl-6 pr-2 py-4 sticky top-16 max-h-[calc(100vh-4.5rem)] overflow-y-auto text-sm">
      <div className="flex items-center gap-2 pb-2 mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
        <AlignLeft className="w-3.5 h-3.5" />
        <span>On this page</span>
      </div>
      <ul className="space-y-1.5 text-[13px] leading-snug">
        {headings.map((item) => {
          const isActive = activeId === item.id;
          const indentClass =
            item.level === 1 ? "pl-0 font-medium" : item.level === 2 ? "pl-3" : "pl-6 text-xs";

          return (
            <li key={item.id} className={indentClass}>
              <a
                href={`#${item.id}`}
                onClick={(e) => scrollToHeading(item.id, e)}
                className={`block py-1 transition-colors duration-150 line-clamp-1 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                }`}
                title={item.text}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
