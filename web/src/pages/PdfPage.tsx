import React from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Folder } from "lucide-react";
import { PdfViewer } from "../components/Viewer/PdfViewer";

export const PdfPage: React.FC = () => {
  const { "*": rawPath } = useParams();
  const filePath = rawPath ? decodeURIComponent(rawPath) : "";

  const pathParts = filePath.split("/");

  return (
    <div className="flex-1 max-w-[1150px] mx-auto px-6 sm:px-12 py-8 md:py-10 w-full flex flex-col">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-4 font-sans flex-wrap">
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
                  <Folder className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>{part}</span>
                </div>
              ) : (
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                  {part}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Embedded PDF Viewer */}
      <PdfViewer filePath={filePath} />
    </div>
  );
};
