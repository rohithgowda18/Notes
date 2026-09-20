import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { RepoFile } from "../../types";

interface PrevNextNavProps {
  currentFile: RepoFile;
  siblingFiles: RepoFile[];
  routePrefix?: string;
}

export const PrevNextNav: React.FC<PrevNextNavProps> = ({ currentFile, siblingFiles, routePrefix = "/note" }) => {
  // Only consider markdown notes for chapter sequential navigation
  const markdownSiblings = siblingFiles.filter((f) => f.type === "markdown");
  const currentIndex = markdownSiblings.findIndex((f) => f.path === currentFile.path);

  if (currentIndex === -1 || markdownSiblings.length <= 1) {
    return null;
  }

  const prevFile = currentIndex > 0 ? markdownSiblings[currentIndex - 1] : null;
  const nextFile = currentIndex < markdownSiblings.length - 1 ? markdownSiblings[currentIndex + 1] : null;

  const cleanName = (name: string) => name.replace(/\.md$/i, "").replace(/^[0-9]+[-_]/, "");

  return (
    <div className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {prevFile ? (
        <Link
          to={`${routePrefix}/${encodeURIComponent(prevFile.path)}`}
          className="group flex flex-col p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-2xs text-left"
        >
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Previous</span>
          </div>
          <span className="font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {cleanName(prevFile.name)}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {nextFile && (
        <Link
          to={`${routePrefix}/${encodeURIComponent(nextFile.path)}`}
          className="group flex flex-col p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-2xs text-right sm:col-start-2"
        >
          <div className="flex items-center justify-end gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span className="font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {cleanName(nextFile.name)}
          </span>
        </Link>
      )}
    </div>
  );
};
