import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { RefreshCw, ChevronRight, Folder, AlertCircle, ArrowLeft, Code2 } from "lucide-react";
import { fetchLeetcodeMarkdown } from "../services/leetcode";
import { useLeetcode } from "../context/LeetcodeContext";
import { MarkdownRenderer } from "../components/Markdown/MarkdownRenderer";
import { PrevNextNav } from "../components/Navigation/PrevNextNav";
import type { RepoFile, RepoFolder } from "../types";

const SCROLL_POS_PREFIX = "leetcode_scroll_";

export const LeetcodeNotePage: React.FC = () => {
  const { "*": rawPath } = useParams();
  const filePath = rawPath ? decodeURIComponent(rawPath) : "";
  const { allFiles, tree } = useLeetcode();

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadNote = async (forceRefresh = false) => {
    if (!filePath) return;
    setLoading(true);
    setError(null);
    try {
      const text = await fetchLeetcodeMarkdown(filePath, forceRefresh);
      setContent(text);

      setTimeout(() => {
        const hash = window.location.hash;
        if (hash) {
          const el = document.getElementById(hash.substring(1));
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
            return;
          }
        }

        const savedScroll = localStorage.getItem(`${SCROLL_POS_PREFIX}${filePath}`);
        if (savedScroll) {
          window.scrollTo({ top: parseInt(savedScroll, 10), behavior: "instant" });
        } else {
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      }, 90);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to load this solution.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNote(false);
  }, [filePath]);

  useEffect(() => {
    if (!filePath) return;

    const handleScrollSave = () => {
      localStorage.setItem(`${SCROLL_POS_PREFIX}${filePath}`, window.scrollY.toString());
    };

    window.addEventListener("scroll", handleScrollSave, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScrollSave);
      handleScrollSave();
    };
  }, [filePath]);

  function findFolderByPath(folders: RepoFolder[], targetPath: string): RepoFolder | undefined {
    for (const folder of folders) {
      if (folder.path === targetPath) return folder;
      if (folder.subfolders && folder.subfolders.length > 0) {
        const found = findFolderByPath(folder.subfolders, targetPath);
        if (found) return found;
      }
    }
    return undefined;
  }

  const currentFile: RepoFile | undefined = allFiles.find((f: RepoFile) => f.path === filePath) || {
    path: filePath,
    name: filePath.split("/").pop() || "Solution.md",
    type: "markdown",
  };

  const pathParts = filePath.split("/");
  const parentFolderPath = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : "";
  const parentFolder = parentFolderPath
    ? findFolderByPath(tree?.folders || [], parentFolderPath)
    : undefined;
  const siblingFiles = parentFolder
    ? parentFolder.files
    : parentFolderPath === ""
      ? tree?.rootFiles || []
      : [];

  // Format display name: "0001-two-sum" → "1. Two Sum"
  function formatSolutionName(name: string): string {
    const clean = name.replace(/\.(md|markdown)$/i, "");
    const match = clean.match(/^(\d+)-(.+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      const title = match[2]
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      return `${num}. ${title}`;
    }
    return clean;
  }

  // Format category label
  function formatCategory(cat: string): string {
    if (cat === "dsa") return "DSA";
    if (cat === "database") return "Database";
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  }

  return (
    <div className="flex-1 flex justify-center w-full min-w-0">
      <div className="flex-1 max-w-[1100px] px-6 sm:px-12 md:px-16 py-8 md:py-12 min-w-0">
        {/* Breadcrumb & Category Back Navigation */}
        <div className="flex flex-col gap-2 mb-6">
          <Link
            to={parentFolderPath ? `/leetcode/folder/${encodeURIComponent(parentFolderPath)}` : "/leetcode/folder/dsa"}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group w-fit cursor-pointer"
            title={`Back to ${formatCategory(parentFolderPath || "all")}`}
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to {formatCategory(parentFolderPath || "Solutions")}</span>
          </Link>

          <nav className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-sans flex-wrap">
            <Link
              to="/"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
              title="Dashboard"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <Link
              to="/leetcode/folder/dsa"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium flex items-center gap-1"
              title="LeetCode Solutions"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>LeetCode</span>
            </Link>
            {pathParts.map((part, index) => {
              const isLast = index === pathParts.length - 1;
              return (
                <React.Fragment key={index}>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  {!isLast ? (
                    <Link
                      to={`/leetcode/folder/${encodeURIComponent(part)}`}
                      className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      title={`Open ${formatCategory(part)} problems`}
                    >
                      <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{formatCategory(part)}</span>
                    </Link>
                  ) : (
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-sm sm:max-w-md">
                      {formatSolutionName(part)}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-6 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300">
            <div className="flex items-center gap-2 mb-2 font-semibold">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>Unable to load this solution</span>
            </div>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={() => loadNote(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Refresh</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !error && (
          <div className="space-y-6 animate-pulse py-4">
            <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-md w-3/4" />
            <div className="space-y-3 pt-4">
              <div className="h-4.5 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
              <div className="h-4.5 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6" />
              <div className="h-4.5 bg-neutral-200 dark:bg-neutral-800 rounded w-4/6" />
            </div>
            <div className="h-48 bg-neutral-100 dark:bg-neutral-850 rounded-xl" />
          </div>
        )}

        {/* Rendered Markdown Body */}
        {!loading && !error && (
          <>
            <article className="min-w-0">
              <MarkdownRenderer content={content} currentFilePath={`leetcode/${filePath}`} />
            </article>

            {/* Previous / Next Solution Navigation */}
            <PrevNextNav
              currentFile={currentFile}
              siblingFiles={siblingFiles}
              routePrefix="/leetcode/note"
            />
          </>
        )}
      </div>
    </div>
  );
};
