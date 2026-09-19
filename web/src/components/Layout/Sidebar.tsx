import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  BookOpen,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useRepo } from "../../context/RepoContext";
import type { RepoFolder } from "../../types";

interface SidebarProps {
  onItemClick?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const FOLDERS_STORAGE_KEY = "study_notes_expanded_folders";

function getFileDisplayName(fileName: string): string {
  return fileName.replace(/\.(md|markdown|pdf)$/i, "");
}

interface FolderTreeItemProps {
  folder: RepoFolder;
  level: number;
  expandedFolders: Record<string, boolean>;
  onToggleFolder: (folderPath: string, level: number) => void;
  onItemClick?: () => void;
  currentPath: string;
}

const FolderTreeItem: React.FC<FolderTreeItemProps> = ({
  folder,
  level,
  expandedFolders,
  onToggleFolder,
  onItemClick,
  currentPath,
}) => {
  const isOpen =
    expandedFolders[folder.path] !== undefined
      ? expandedFolders[folder.path]
      : level === 0; // Root folders open by default, nested folders collapsed

  return (
    <div className="space-y-0.5">
      {/* Folder Row */}
      <button
        onClick={() => onToggleFolder(folder.path, level)}
        className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors cursor-pointer text-left"
        title={folder.name}
      >
        <div className="flex items-center gap-1.5 truncate min-w-0">
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          )}
          {isOpen ? (
            <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <span className="truncate">{folder.name}</span>
        </div>
      </button>

      {/* Folder Children */}
      {isOpen && (
        <div className="pl-2 ml-3 border-l border-neutral-200 dark:border-neutral-800 space-y-0.5">
          {/* Direct files inside this folder */}
          {folder.files.map((file) => {
            const isPdf = file.type === "pdf";
            const route = isPdf
              ? `/pdf/${encodeURIComponent(file.path)}`
              : `/note/${encodeURIComponent(file.path)}`;
            const isActive = currentPath === file.path;

            return (
              <Link
                key={file.path}
                to={route}
                onClick={onItemClick}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors truncate ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-medium"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60"
                }`}
                title={file.name}
              >
                {isPdf ? (
                  <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                ) : (
                  <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                )}
                <span className="truncate">{getFileDisplayName(file.name)}</span>
              </Link>
            );
          })}

          {/* Subfolders inside this folder */}
          {folder.subfolders.map((sub) => (
            <FolderTreeItem
              key={sub.path}
              folder={sub}
              level={level + 1}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              onItemClick={onItemClick}
              currentPath={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  onItemClick,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { tree, loading } = useRepo();
  const location = useLocation();

  // Load expanded folders from localStorage
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(FOLDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const currentPath = decodeURIComponent(location.pathname).replace(/^\/(note|pdf)\//, "");

  const toggleFolder = (folderPath: string, level: number) => {
    setExpandedFolders((prev) => {
      const currentIsOpen = prev[folderPath] !== undefined ? prev[folderPath] : level === 0;
      const updated = {
        ...prev,
        [folderPath]: !currentIsOpen,
      };
      try {
        localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save folder state", e);
      }
      return updated;
    });
  };

  // Auto-expand all parent folders of current active file on mount or route change
  useEffect(() => {
    if (!currentPath) return;

    const parts = currentPath.split("/");
    if (parts.length > 1) {
      const pathsToOpen: string[] = [];
      let acc = "";
      for (let i = 0; i < parts.length - 1; i++) {
        acc = acc ? `${acc}/${parts[i]}` : parts[i];
        pathsToOpen.push(acc);
      }

      setExpandedFolders((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const p of pathsToOpen) {
          if (next[p] !== true) {
            next[p] = true;
            changed = true;
          }
        }
        if (changed) {
          try {
            localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(next));
          } catch (e) {
            console.warn("Could not save folder state", e);
          }
          return next;
        }
        return prev;
      });
    }
  }, [currentPath]);

  if (isCollapsed) {
    return (
      <aside className="w-12 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md h-[calc(100vh-3.5rem)] sticky top-14 flex flex-col items-center py-4 select-none">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          title="Expand Sidebar"
          aria-label="Expand Sidebar"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-72 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md h-[calc(100vh-3.5rem)] sticky top-14 flex flex-col select-none">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Study Library
        </span>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            title="Collapse Sidebar"
            aria-label="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Files & Folders Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 text-sm">
        {loading ? (
          <div className="space-y-3 py-4">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-1/2" />
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-5/6" />
          </div>
        ) : !tree || (tree.folders.length === 0 && tree.rootFiles.length === 0) ? (
          <div className="text-xs text-neutral-400 dark:text-neutral-500 py-6 text-center">
            No study notes found.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Category Folders & Subfolders */}
            {tree.folders.map((folder) => (
              <FolderTreeItem
                key={folder.path}
                folder={folder}
                level={0}
                expandedFolders={expandedFolders}
                onToggleFolder={toggleFolder}
                onItemClick={onItemClick}
                currentPath={currentPath}
              />
            ))}

            {/* Root Files */}
            {tree.rootFiles.length > 0 && (
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  General
                </div>
                <ul className="space-y-0.5">
                  {tree.rootFiles.map((file) => {
                    const isPdf = file.type === "pdf";
                    const route = isPdf
                      ? `/pdf/${encodeURIComponent(file.path)}`
                      : `/note/${encodeURIComponent(file.path)}`;
                    const isActive = currentPath === file.path;

                    return (
                      <li key={file.path}>
                        <Link
                          to={route}
                          onClick={onItemClick}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] transition-colors truncate ${
                            isActive
                              ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-medium"
                              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60"
                          }`}
                          title={file.name}
                        >
                          {isPdf ? (
                            <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          ) : (
                            <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          )}
                          <span className="truncate">{getFileDisplayName(file.name)}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
