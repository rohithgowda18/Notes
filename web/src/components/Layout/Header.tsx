import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  Moon,
  Sun,
  Search,
  RefreshCw,
  Menu,
  PanelLeft,
  Code2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useRepo } from "../../context/RepoContext";
import { useLeetcode } from "../../context/LeetcodeContext";
import { GITHUB_OWNER, GITHUB_REPO } from "../../config/github";

interface HeaderProps {
  onOpenSearch: () => void;
  onToggleMobileNav: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onToggleMobileNav,
  onToggleSidebar,
}) => {
  const location = useLocation();
  const isLeetcode = location.pathname.startsWith("/leetcode");
  const { theme, toggleTheme } = useTheme();
  const { refresh: refreshNotes, loading: notesLoading, lastSynced } = useRepo();
  const { refresh: refreshLeetcode, loading: lcLoading } = useLeetcode();
  const [timeAgo, setTimeAgo] = useState<string>("just now");

  const isLoading = isLeetcode ? lcLoading : notesLoading;
  const handleRefresh = isLeetcode ? refreshLeetcode : refreshNotes;

  useEffect(() => {
    if (!lastSynced) return;

    const updateRelativeTime = () => {
      const diffSecs = Math.floor((Date.now() - lastSynced) / 1000);
      if (diffSecs < 60) {
        setTimeAgo("just now");
      } else if (diffSecs < 3600) {
        const mins = Math.floor(diffSecs / 60);
        setTimeAgo(`${mins}m ago`);
      } else {
        const hours = Math.floor(diffSecs / 3600);
        setTimeAgo(`${hours}h ago`);
      }
    };

    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 30000);
    return () => clearInterval(interval);
  }, [lastSynced]);

  return (
    <header className="sticky top-0 z-40 w-full h-14 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between">
      {/* Left: Sidebar toggles & Brand Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleMobileNav}
          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop sidebar collapse toggle */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            title="Toggle Sidebar"
            aria-label="Toggle Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        <Link
          to="/"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2.5 group cursor-pointer"
          title="Return to Dashboard"
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xs transition-colors ${
              isLeetcode ? "bg-emerald-600" : "bg-blue-600"
            }`}
          >
            {isLeetcode ? (
              <Code2 className="w-3.5 h-3.5" />
            ) : (
              <BookOpen className="w-3.5 h-3.5" />
            )}
          </div>
          <span
            className={`font-semibold text-sm tracking-tight transition-colors ${
              isLeetcode
                ? "text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                : "text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            }`}
          >
            {isLeetcode ? "LeetCode Solutions" : "Knowledge Hub"}
          </span>
        </Link>
      </div>

      {/* Middle: Search input trigger */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 hover:border-neutral-300 dark:hover:border-neutral-700 text-xs text-neutral-400 dark:text-neutral-500 transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Search notes, headings, and code...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded text-neutral-500 dark:text-neutral-300 shrink-0">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Search, Refresh, Theme Toggle, GitHub */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mobile Search button */}
        <button
          onClick={onOpenSearch}
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden cursor-pointer"
          title="Search"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Refresh Notes / LeetCode with relative timestamp */}
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
          title={isLeetcode ? "Fetch latest LeetCode solutions" : "Fetch latest notes from GitHub"}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? `animate-spin ${isLeetcode ? "text-emerald-500" : "text-blue-500"}` : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 hidden xl:inline">
            ({timeAgo})
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* GitHub Repository Link */}
        <a
          href={`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="View GitHub repository"
          aria-label="View on GitHub"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </div>
    </header>
  );
};
