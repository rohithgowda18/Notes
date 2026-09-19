import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Home } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
      <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 mb-4">
        <BookOpen className="w-10 h-10" />
      </div>
      <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">
        Note Not Found
      </h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mb-6">
        The study note or PDF you are looking for might have been moved, renamed, or does not exist.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Return to Library</span>
      </Link>
    </div>
  );
};
