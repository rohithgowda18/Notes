import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, FileText, Folder, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import { useRepo } from "../context/RepoContext";
import { GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } from "../config/github";
import type { RepoFile, RepoFolder } from "../types";

export const HomePage: React.FC = () => {
  const { tree, loading, error, refresh } = useRepo();

  const totalNotes = tree?.allFiles.filter((f: RepoFile) => f.type === "markdown").length || 0;
  const totalPdfs = tree?.allFiles.filter((f: RepoFile) => f.type === "pdf").length || 0;
  const totalFolders = tree?.folders.length || 0;

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-8 py-8 md:py-12 w-full">
      {/* Hero Header */}
      <div className="mb-10 pb-8 border-b border-neutral-200 dark:border-neutral-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Synced with GitHub: {GITHUB_BRANCH}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-3">
          Personal Study Library
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
          Clean, distraction-free reader for technical notes and PDFs fetched directly from{" "}
          <span className="font-mono text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            {GITHUB_OWNER}/{GITHUB_REPO}
          </span>
          .
        </p>

        {/* Quick Stats */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-amber-500" />
            <span>
              <strong>{totalFolders}</strong> Categories
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>
              <strong>{totalNotes}</strong> Markdown Guides
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-red-500" />
            <span>
              <strong>{totalPdfs}</strong> PDF Handbooks
            </span>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-8 p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
          <div>
            <p className="font-semibold">Unable to fetch notes from GitHub</p>
            <p className="text-xs mt-1 text-red-600 dark:text-red-400">{error}</p>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading state skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 animate-pulse space-y-3"
            >
              <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            Browse by Topic
          </h2>

          {/* Folder Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tree?.folders.map((folder: RepoFolder) => {
              const cleanTitle = folder.name.replace(/^[0-9]+[-_]/, "").replace(/-/g, " ");
              const mdCount = folder.files.filter((f: RepoFile) => f.type === "markdown").length;
              const pdfCount = folder.files.filter((f: RepoFile) => f.type === "pdf").length;
              const firstFile = folder.files[0];

              return (
                <div
                  key={folder.path}
                  className="flex flex-col justify-between p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                        <Folder className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-base text-neutral-800 dark:text-neutral-100 line-clamp-1">
                        {cleanTitle}
                      </h3>
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                      {mdCount > 0 && `${mdCount} notes`}
                      {mdCount > 0 && pdfCount > 0 && " • "}
                      {pdfCount > 0 && `${pdfCount} PDF`}
                    </p>

                    {/* Preview list */}
                    <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400 mb-4">
                      {folder.files.slice(0, 3).map((f: RepoFile) => (
                        <li key={f.path} className="truncate flex items-center gap-1.5">
                          {f.type === "pdf" ? (
                            <FileText className="w-3 h-3 text-red-500 shrink-0" />
                          ) : (
                            <BookOpen className="w-3 h-3 text-blue-500 shrink-0" />
                          )}
                          <span className="truncate">{f.name.replace(/\.md$/i, "")}</span>
                        </li>
                      ))}
                      {folder.files.length > 3 && (
                        <li className="text-[11px] text-neutral-400 italic">
                          +{folder.files.length - 3} more files
                        </li>
                      )}
                    </ul>
                  </div>

                  {firstFile && (
                    <Link
                      to={
                        firstFile.type === "pdf"
                          ? `/pdf/${encodeURIComponent(firstFile.path)}`
                          : `/note/${encodeURIComponent(firstFile.path)}`
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline mt-2 group"
                    >
                      <span>Start Reading</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* Root Level Notes if any */}
          {tree && tree.rootFiles.length > 0 && (
            <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
                General Handbooks & Guides
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tree.rootFiles.map((file: RepoFile) => {
                  const isPdf = file.type === "pdf";
                  const route = isPdf
                    ? `/pdf/${encodeURIComponent(file.path)}`
                    : `/note/${encodeURIComponent(file.path)}`;

                  return (
                    <Link
                      key={file.path}
                      to={route}
                      className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                        {isPdf ? (
                          <FileText className="w-4 h-4 text-red-500" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {file.name.replace(/\.md$/i, "")}
                        </p>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {isPdf ? "PDF Document" : "Markdown Note"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
