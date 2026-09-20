import React from "react";
import { Link } from "react-router-dom";
import { Home, BookOpen, Code2, Search } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

interface NotFoundPageProps {
  onOpenSearch?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onOpenSearch }) => {
  useDocumentTitle("404 Page Not Found");

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center min-h-[70vh] max-w-xl mx-auto space-y-6">
      <div className="space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
          404 ERROR
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          Document Not Found
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
          The study note, PDF guide, or LeetCode solution you requested might have been reorganized,
          renamed, or does not exist.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Dashboard Hub</span>
        </Link>

        <Link
          to="/folder/01-Operating-Systems"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-blue-500" />
          <span>Study Notes</span>
        </Link>

        <Link
          to="/leetcode/folder/dsa"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Code2 className="w-4 h-4 text-emerald-500" />
          <span>LeetCode</span>
        </Link>
      </div>

      {onOpenSearch && (
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 w-full">
          <button
            onClick={onOpenSearch}
            className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Try searching keywords (Ctrl + K)</span>
          </button>
        </div>
      )}
    </div>
  );
};
