import React from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Folder } from "lucide-react";
import { PdfViewer } from "../components/Viewer/PdfViewer";

export const PdfPage: React.FC = () => {
  const { "*": rawPath } = useParams();
  const filePath = rawPath ? decodeURIComponent(rawPath) : "";

  const pathParts = filePath.split("/");
  const fileName = pathParts[pathParts.length - 1] || "Document.pdf";
  const folderName = pathParts.length > 1 ? pathParts[0] : "";

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-4 md:py-6 w-full flex flex-col">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-4 font-sans">
        <Link to="/" className="hover:text-neutral-800 dark:hover:text-neutral-200">
          Library
        </Link>
        {folderName && (
          <>
            <ChevronRight className="w-3 h-3 text-neutral-400" />
            <div className="flex items-center gap-1">
              <Folder className="w-3 h-3 text-amber-500" />
              <span>{folderName.replace(/^[0-9]+[-_]/, "")}</span>
            </div>
          </>
        )}
        <ChevronRight className="w-3 h-3 text-neutral-400" />
        <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
          {fileName}
        </span>
      </nav>

      {/* Embedded PDF Viewer */}
      <PdfViewer filePath={filePath} />
    </div>
  );
};
