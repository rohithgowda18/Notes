import React from "react";
import { Link } from "react-router-dom";
import { X, BookOpen, Mail, Phone } from "lucide-react";
import { Sidebar } from "./Sidebar";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-neutral-900 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-neutral-200 dark:border-neutral-800">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-2 font-semibold text-sm text-neutral-900 dark:text-neutral-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            title="Knowledge Hub Dashboard"
          >
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span>Knowledge Hub</span>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <Sidebar onItemClick={onClose} className="w-full h-full flex flex-col" />
        </div>

        {/* Mobile Contact Quick Links */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 flex items-center justify-around text-xs">
          <a
            href="mailto:rohithgowda.ks@gmail.com"
            className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors cursor-pointer"
            title="Send email"
          >
            <Mail className="w-3.5 h-3.5 text-blue-500" />
            <span>Email</span>
          </a>
          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <a
            href="tel:+919902634351"
            className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors cursor-pointer"
            title="Call"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-500" />
            <span>+91 9902634351</span>
          </a>
        </div>
      </div>
    </div>
  );
};
