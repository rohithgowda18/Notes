import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Terminal,
  Database,
  ArrowLeft,
  Search,
  ChevronRight,
} from "lucide-react";
import { useLeetcode } from "../context/LeetcodeContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { EmptyState } from "../components/UI/EmptyState";

function formatLeetcodeName(fileName: string): { number: string; title: string } {
  const clean = fileName.replace(/\.(md|markdown)$/i, "");
  const match = clean.match(/^(\d+)-(.+)$/);
  if (match) {
    const num = parseInt(match[1], 10).toString();
    const title = match[2]
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return { number: `#${num}`, title };
  }
  return { number: "#", title: clean };
}

function formatCategory(cat: string): string {
  if (cat.toLowerCase() === "dsa") return "Data Structures & Algorithms";
  if (cat.toLowerCase() === "database") return "Database & SQL Queries";
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

export const LeetcodeFolderPage: React.FC = () => {
  const { "*": rawCategory } = useParams();
  const category = (rawCategory ? decodeURIComponent(rawCategory) : "dsa").toLowerCase();
  const { allFiles, loading } = useLeetcode();
  const [searchQuery, setSearchQuery] = useState("");

  const isDsa = category === "dsa";
  const isDb = category === "database";

  useDocumentTitle(
    isDsa ? "DSA Solutions" : isDb ? "Database & SQL Solutions" : "LeetCode Solutions"
  );

  const categoryFiles = useMemo(() => {
    return allFiles.filter((f) => {
      if (isDsa) return f.path.startsWith("dsa/");
      if (isDb) return f.path.startsWith("database/");
      return true;
    });
  }, [allFiles, isDsa, isDb]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return categoryFiles;
    const q = searchQuery.toLowerCase();
    return categoryFiles.filter(
      (f) => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q)
    );
  }, [categoryFiles, searchQuery]);

  if (loading) {
    return (
      <div className="flex-1 max-w-6xl mx-auto px-6 py-12 space-y-6 animate-pulse">
        <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
        <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-neutral-100 dark:bg-neutral-900 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8 w-full min-w-0">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <nav className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-sans flex-wrap">
          <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">
            Dashboard
          </Link>
          <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
          <span className="text-neutral-600 dark:text-neutral-400">LeetCode Solutions</span>
          <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            {isDsa ? "DSA" : isDb ? "Database" : category}
          </span>
        </nav>
      </div>

      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              {isDb ? <Database className="w-5 h-5" /> : <Terminal className="w-5 h-5" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                {formatCategory(category)}
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {categoryFiles.length} curated solution{categoryFiles.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Category Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Category Switcher Tabs */}
          <div className="inline-flex p-1 bg-neutral-100 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs">
            <Link
              to="/leetcode/folder/dsa"
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                isDsa
                  ? "bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
              }`}
            >
              DSA
            </Link>
            <Link
              to="/leetcode/folder/database"
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                isDb
                  ? "bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
              }`}
            >
              Database
            </Link>
          </div>

          {/* In-category search */}
          <div className="w-full sm:w-64">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problem # or name..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Solutions Grid */}
      <div className="space-y-3">
        {filteredFiles.length === 0 ? (
          <EmptyState
            title="No solutions found"
            description={
              searchQuery
                ? `No problems matching "${searchQuery}" in this category.`
                : "No LeetCode solutions found in this category."
            }
            actionLabel={searchQuery ? "Clear Search" : undefined}
            onAction={searchQuery ? () => setSearchQuery("") : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredFiles.map((file) => {
              const { number, title } = formatLeetcodeName(file.name);
              return (
                <Link
                  key={file.path}
                  to={`/leetcode/note/${encodeURIComponent(file.path)}`}
                  className="flex flex-col justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-emerald-300 dark:hover:border-emerald-800/80 hover:shadow-xs transition-all group cursor-pointer space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/40">
                        {number}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">Solution</span>
                    </div>

                    <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/60 text-xs font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    <span>View Solution</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
