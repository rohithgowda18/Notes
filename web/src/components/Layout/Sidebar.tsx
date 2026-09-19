import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  BookOpen,
  FileText,
  Library,
} from "lucide-react";
import { useRepo } from "../../context/RepoContext";

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const { tree, loading } = useRepo();
  const location = useLocation();

  // Track expanded state for folders, default open all
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: prev[folderName] === undefined ? false : !prev[folderName],
    }));
  };

  const isFolderExpanded = (folderName: string) => {
    return expandedFolders[folderName] !== false; // Default true (expanded)
  };

  const cleanTitle = (fileName: string) => {
    return fileName
      .replace(/\.md$/i, "")
      .replace(/\.pdf$/i, "")
      .replace(/^[0-9]+[-_]/, "")
      .replace(/-/g, " ");
  };

  return (
    <aside className="w-72 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto p-4 select-none">
      {/* Home Link */}
      <div className="mb-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <Link
          to="/"
          onClick={onItemClick}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            location.pathname === "/"
              ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold"
              : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <Library className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Study Library</span>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 py-4">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-1/2" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-5/6" />
        </div>
      ) : !tree || (tree.folders.length === 0 && tree.rootFiles.length === 0) ? (
        <div className="text-xs text-neutral-400 dark:text-neutral-500 py-6 text-center">
          No study files found.
        </div>
      ) : (
        <div className="space-y-4 text-sm">
          {/* Folders & Categories */}
          {tree.folders.map((folder) => {
            const isOpen = isFolderExpanded(folder.name);
            const cleanFolderName = folder.name.replace(/^[0-9]+[-_]/, "").replace(/-/g, " ");

            return (
              <div key={folder.path} className="space-y-1">
                {/* Folder Header */}
                <button
                  onClick={() => toggleFolder(folder.name)}
                  className="flex items-center justify-between w-full px-2 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    {isOpen ? (
                      <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <span className="truncate">{cleanFolderName}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                  )}
                </button>

                {/* Folder Files */}
                {isOpen && (
                  <ul className="pl-3 space-y-0.5 border-l border-neutral-200 dark:border-neutral-800/80 ml-2.5">
                    {folder.files.map((file) => {
                      const isPdf = file.type === "pdf";
                      const route = isPdf
                        ? `/pdf/${encodeURIComponent(file.path)}`
                        : `/note/${encodeURIComponent(file.path)}`;
                      const isActive =
                        location.pathname === route ||
                        decodeURIComponent(location.pathname) === `/note/${file.path}` ||
                        decodeURIComponent(location.pathname) === `/pdf/${file.path}`;

                      return (
                        <li key={file.path}>
                          <Link
                            to={route}
                            onClick={onItemClick}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] transition-colors truncate ${
                              isActive
                                ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-medium"
                                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                            }`}
                            title={file.name}
                          >
                            {isPdf ? (
                              <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            ) : (
                              <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            )}
                            <span className="truncate">{cleanTitle(file.name)}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}

          {/* Root Level Notes */}
          {tree.rootFiles.length > 0 && (
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                General
              </div>
              <ul className="space-y-0.5">
                {tree.rootFiles.map((file) => {
                  const isPdf = file.type === "pdf";
                  const route = isPdf
                    ? `/pdf/${encodeURIComponent(file.path)}`
                    : `/note/${encodeURIComponent(file.path)}`;
                  const isActive =
                    decodeURIComponent(location.pathname) === `/note/${file.path}` ||
                    decodeURIComponent(location.pathname) === `/pdf/${file.path}`;

                  return (
                    <li key={file.path}>
                      <Link
                        to={route}
                        onClick={onItemClick}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] transition-colors truncate ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-medium"
                            : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                        }`}
                        title={file.name}
                      >
                        {isPdf ? (
                          <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        ) : (
                          <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        )}
                        <span className="truncate">{cleanTitle(file.name)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
