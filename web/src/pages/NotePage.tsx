import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { RefreshCw, ChevronRight, Folder, AlertCircle } from "lucide-react";
import { fetchRawMarkdown } from "../services/github";
import { useRepo } from "../context/RepoContext";
import { MarkdownRenderer } from "../components/Markdown/MarkdownRenderer";
import { TableOfContents } from "../components/Layout/TableOfContents";
import { PrevNextNav } from "../components/Navigation/PrevNextNav";
import type { RepoFile, RepoFolder } from "../types";

const SCROLL_POS_PREFIX = "study_notes_scroll_";

export const NotePage: React.FC = () => {
  const { "*": rawPath } = useParams();
  const filePath = rawPath ? decodeURIComponent(rawPath) : "";
  const { allFiles, tree } = useRepo();

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load note content
  const loadNote = async (forceRefresh = false) => {
    if (!filePath) return;
    setLoading(true);
    setError(null);
    try {
      const text = await fetchRawMarkdown(filePath, forceRefresh);
      setContent(text);

      // Restore scroll position after short render delay
      setTimeout(() => {
        const savedScroll = localStorage.getItem(`${SCROLL_POS_PREFIX}${filePath}`);
        if (savedScroll) {
          window.scrollTo({ top: parseInt(savedScroll, 10), behavior: "instant" });
        } else {
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      }, 80);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to load this note.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNote(false);
  }, [filePath]);

  // Save scroll position on unmount or navigate
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

  // Find current file and sibling files for Prev/Next
  const currentFile: RepoFile | undefined = allFiles.find((f: RepoFile) => f.path === filePath) || {
    path: filePath,
    name: filePath.split("/").pop() || "Note.md",
    type: "markdown",
  };

  const pathParts = filePath.split("/");
  const folderName = pathParts.length > 1 ? pathParts[0] : "";
  const folderObj = tree?.folders.find((f: RepoFolder) => f.name === folderName);
  const siblingFiles = folderObj ? folderObj.files : tree?.rootFiles || [];

  return (
    <div className="flex-1 flex justify-center w-full min-w-0">
      <div className="flex-1 max-w-4xl px-4 sm:px-8 py-6 md:py-10 min-w-0">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-6 font-sans">
          <Link to="/" className="hover:text-neutral-800 dark:hover:text-neutral-200">
            Library
          </Link>
          {folderName && (
            <>
              <ChevronRight className="w-3 h-3 text-neutral-400" />
              <div className="flex items-center gap-1">
                <Folder className="w-3 h-3 text-amber-500" />
                <span>{folderName.replace(/^[0-9]+[-_]/, "")}</span>
              </div>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
            {currentFile.name.replace(/\.md$/i, "")}
          </span>
        </nav>

        {/* Error State */}
        {error && (
          <div className="p-6 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300">
            <div className="flex items-center gap-2 mb-2 font-semibold">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>Unable to load this note</span>
            </div>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={() => loadNote(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Refresh</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !error && (
          <div className="space-y-6 animate-pulse py-4">
            <div className="h-9 bg-neutral-200 dark:bg-neutral-800 rounded-md w-3/4" />
            <div className="space-y-2">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-4/6" />
            </div>
            <div className="h-44 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl" />
          </div>
        )}

        {/* Rendered Markdown Body */}
        {!loading && !error && (
          <>
            <article className="min-w-0">
              <MarkdownRenderer content={content} currentFilePath={filePath} />
            </article>

            {/* Previous / Next Chapter Navigation */}
            <PrevNextNav currentFile={currentFile} siblingFiles={siblingFiles} />
          </>
        )}
      </div>

      {/* Right Table of Contents */}
      {!loading && !error && <TableOfContents content={content} />}
    </div>
  );
};
