import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, BookOpen, X } from "lucide-react";
import { searchFiles, type SearchResult } from "../../services/search";
import { useRepo } from "../../context/RepoContext";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { allFiles } = useRepo();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }
    const matches = searchFiles(allFiles, query);
    setResults(matches.slice(0, 15)); // Limit to top 15 results
    setSelectedIndex(0);
  }, [query, allFiles]);

  const handleSelect = (result: SearchResult) => {
    onClose();
    if (result.file.type === "pdf") {
      navigate(`/pdf/${encodeURIComponent(result.file.path)}`);
    } else {
      navigate(`/note/${encodeURIComponent(result.file.path)}`);
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-neutral-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-xl rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search notes, chapters, topics, or PDFs... (Esc to exit)"
            className="w-full bg-transparent text-sm md:text-base text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 border border-neutral-300 dark:border-neutral-700 rounded">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() && results.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 dark:text-neutral-400 text-sm">
              No matching notes found for <span className="font-semibold text-neutral-700 dark:text-neutral-300">"{query}"</span>.
            </div>
          ) : !query.trim() ? (
            <div className="py-8 text-center text-neutral-400 dark:text-neutral-500 text-xs">
              Type to search through all study guides and notes...
            </div>
          ) : (
            <ul className="space-y-1">
              {results.map((result, idx) => {
                const isSelected = idx === selectedIndex;
                const isPdf = result.file.type === "pdf";

                return (
                  <li
                    key={result.file.path}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isPdf ? (
                        <FileText className="w-4 h-4 text-red-500 shrink-0" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate">{result.file.name.replace(/\.md$/i, "")}</p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                          {result.category}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-neutral-400 shrink-0 ml-2 font-mono">
                      {isPdf ? "PDF" : "MD"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-50 dark:bg-neutral-800/60 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 font-sans">
          <span>Navigate with <kbd className="font-mono bg-neutral-200 dark:bg-neutral-700 px-1 rounded">↑</kbd> <kbd className="font-mono bg-neutral-200 dark:bg-neutral-700 px-1 rounded">↓</kbd></span>
          <span>Select with <kbd className="font-mono bg-neutral-200 dark:bg-neutral-700 px-1 rounded">Enter</kbd></span>
        </div>
      </div>
    </div>
  );
};
