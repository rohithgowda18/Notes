import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { RefreshCw, ChevronRight, Folder, AlertCircle } from "lucide-react";
import { fetchRawMarkdown } from "../services/github";
import { useRepo } from "../context/RepoContext";
import { MarkdownRenderer } from "../components/Markdown/MarkdownRenderer";
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
        {/* Subtle Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-6 font-sans flex-wrap">
          <Link to="/" className="hover:text-neutral-800 dark:hover:text-neutral-200">
            Study Library
          </Link>
          {pathParts.map((part, index) => {
            const isLast = index === pathParts.length - 1;
            const isFolder = !isLast;

            return (
              <React.Fragment key={index}>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                {isFolder ? (
                  <div className="flex items-center gap-1">
                    <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{part}</span>
                  </div>
                ) : (
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                    {part.replace(/\.(md|markdown)$/i, "")}
                  </span>
                )}
              </React.Fragment>
            );
          })}
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
