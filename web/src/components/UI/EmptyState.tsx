import React from "react";
import { Link } from "react-router-dom";
import { FileQuestion, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FileQuestion,
  title,
  description,
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 my-4">
      <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 text-neutral-400 dark:text-neutral-500 flex items-center justify-center mb-4 shadow-2xs">
        <Icon className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
      </div>
      <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionText && (
        actionLink ? (
          <Link
            to={actionLink}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <span>{actionText}</span>
          </Link>
        ) : onAction ? (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <span>{actionText}</span>
          </button>
        ) : null
      )}
    </div>
  );
};
