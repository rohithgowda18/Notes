import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, BookOpen, X, Hash, Loader2 } from "lucide-react";
import {
  searchNotesAndContent,
  warmSearchIndex,
  type SearchResult,
} from "../../services/search";
import { useRepo } from "../../context/RepoContext";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { allFiles } = useRepo();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setSelectedIndex(0);

      // Pre-warm search index in background
      if (allFiles.length > 0) {
        warmSearchIndex(allFiles);
      }
    }
  }, [isOpen, allFiles]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const matches = await searchNotesAndContent(allFiles, query);
        setResults(matches);
        setSelectedIndex(0);
      } finally {
        setSearching(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query, allFiles]);

  const handleSelect = (result: SearchResult) => {
    onClose();
    if (result.file.type === "pdf") {
      navigate(`/pdf/${encodeURIComponent(result.file.path)}`);
    } else {
      const hash = result.headingId ? `#${result.headingId}` : "";
      navigate(`/note/${encodeURIComponent(result.file.path)}${hash}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-neutral-950/65 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search notes, chapters, topics, or full content... (e.g. @Transactional)"
            className="w-full bg-transparent text-sm sm:text-base text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
          />
          {searching ? (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
          ) : query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 border border-neutral-300 dark:border-neutral-700 rounded">
            ESC
          </span>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.trim() && !searching && results.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 dark:text-neutral-400 text-sm">
              No matching notes or content found for <span className="font-semibold text-neutral-700 dark:text-neutral-300">"{query}"</span>.
            </div>
          ) : !query.trim() ? (
            <div className="py-10 text-center text-neutral-400 dark:text-neutral-500 text-xs space-y-1">
              <p>Type keywords to search titles, folder names, and full Markdown text.</p>
              <p className="text-[11px] text-neutral-400">Try searching for: <span className="font-mono text-blue-500">@Transactional</span>, <span className="font-mono text-blue-500">DispatcherServlet</span>, or <span className="font-mono text-blue-500">JWT</span></p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {results.map((result, idx) => {
                const isSelected = idx === selectedIndex;
                const isPdf = result.file.type === "pdf";

                return (
                  <li
                    key={`${result.file.path}-${idx}`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-xl cursor-pointer transition-colors border ${
                      isSelected
                        ? "bg-blue-50/90 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-100"
                        : "border-transparent hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {/* Header Row: Category & Filename */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {isPdf ? (
                          <FileText className="w-4 h-4 text-red-500 shrink-0" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                        )}
                        <span className="font-semibold text-sm truncate">
                          {result.file.name.replace(/\.(md|markdown|pdf)$/i, "")}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono tracking-wider text-neutral-400 dark:text-neutral-500 shrink-0 truncate max-w-[220px]">
                        {result.category}
                      </span>
                    </div>

                    {/* Subtitle / Heading Match */}
                    {result.headingText && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 mb-1 pl-6">
                        <Hash className="w-3 h-3 shrink-0" />
                        <span className="truncate">{result.headingText}</span>
                      </div>
                    )}

                    {/* Content Snippet */}
                    {result.snippet && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 pl-6 leading-relaxed line-clamp-2 italic font-sans">
                        "{result.snippet}"
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 dark:bg-neutral-850 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 font-sans">
          <span>Search in files & content</span>
          <span>Press <kbd className="font-mono bg-neutral-200 dark:bg-neutral-700 px-1 rounded">Enter</kbd> to open</span>
        </div>
      </div>
    </div>
  );
};
