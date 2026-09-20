import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { RefreshCw, ChevronRight, Folder, AlertCircle, ArrowLeft, Clock } from "lucide-react";
import { fetchRawMarkdown } from "../services/github";
import { useRepo } from "../context/RepoContext";
import { MarkdownRenderer } from "../components/Markdown/MarkdownRenderer";
import { PrevNextNav } from "../components/Navigation/PrevNextNav";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { RepoFile, RepoFolder } from "../types";

const SCROLL_POS_PREFIX = "study_notes_scroll_";

export const NotePage: React.FC = () => {
  const { "*": rawPath } = useParams();
  const filePath = rawPath ? decodeURIComponent(rawPath) : "";
  const { allFiles, tree } = useRepo();

  const noteFileName = filePath.split("/").pop() || "Study Note";
  const noteTitle = noteFileName
    .replace(/\.(md|markdown)$/i, "")
    .replace(/^[0-9]+[-_]/, "")
    .replace(/[-_]/g, " ");
  useDocumentTitle(noteTitle);

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const readingTimeMins = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  // Load note content
  const loadNote = async (forceRefresh = false) => {
    if (!filePath) return;
    setLoading(true);
    setError(null);
    try {
      const text = await fetchRawMarkdown(filePath, forceRefresh);
      setContent(text);

      // Restore scroll position or scroll to hash after render
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

  // Find current file and sibling files for Prev/Next
  const currentFile: RepoFile | undefined = allFiles.find((f: RepoFile) => f.path === filePath) || {
    path: filePath,
    name: filePath.split("/").pop() || "Note.md",
    type: "markdown",
  };

  const pathParts = filePath.split("/");
  const parentFolderPath = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : "";
  const parentFolder = parentFolderPath ? findFolderByPath(tree?.folders || [], parentFolderPath) : undefined;
  const siblingFiles = parentFolder ? parentFolder.files : (parentFolderPath === "" ? tree?.rootFiles || [] : []);

  return (
    <div className="flex-1 flex justify-center w-full min-w-0">
      {/* Central Reading Column (Two-column layout, max-w ~1100px) */}
      <div className="flex-1 max-w-[1100px] px-6 sm:px-12 md:px-16 py-8 md:py-12 min-w-0">
        {/* Breadcrumb & Folder Back Navigation */}
        <div className="flex flex-col gap-2 mb-6">
          {parentFolderPath ? (
            <Link
              to={`/folder/${encodeURIComponent(parentFolderPath)}`}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group w-fit cursor-pointer"
              title={`Back to ${parentFolderPath.split("/").pop()}`}
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to {parentFolderPath.split("/").pop()?.replace(/^[0-9]+[-_]/, "").replace(/[-_]/g, " ")}</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group w-fit cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Dashboard</span>
            </Link>
          )}

          <nav className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-sans flex-wrap">
            <Link
              to="/"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              title="Dashboard"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <Link
              to="/notes"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-neutral-600 dark:text-neutral-400"
              title="All Study Modules"
            >
              Study Notes
            </Link>
            {pathParts.map((part, index) => {
              const isLast = index === pathParts.length - 1;
              const isFolder = !isLast;
              const subFolderPath = pathParts.slice(0, index + 1).join("/");

              return (
                <React.Fragment key={index}>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  {isFolder ? (
                    <Link
                      to={`/folder/${encodeURIComponent(subFolderPath)}`}
                      className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title={`Open ${part} notes`}
                    >
                      <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{part.replace(/^[0-9]+[-_]/, "").replace(/[-_]/g, " ")}</span>
                    </Link>
                  ) : (
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-sm sm:max-w-md">
                      {part.replace(/\.(md|markdown)$/i, "")}
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
              <span>Unable to load this note</span>
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
            {/* Reading Metadata */}
            {content.trim().length > 0 && (
              <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mb-6 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{readingTimeMins} min read</span>
                </span>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <span>{wordCount.toLocaleString()} words</span>
              </div>
            )}

            <article className="min-w-0">
              <MarkdownRenderer content={content} currentFilePath={filePath} />
            </article>

            {/* Previous / Next Chapter Navigation */}
            <PrevNextNav currentFile={currentFile} siblingFiles={siblingFiles} />
          </>
        )}
      </div>
    </div>
  );
};
