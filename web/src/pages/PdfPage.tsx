import React from "react";
import { useParams } from "react-router-dom";
import { PdfViewer } from "../components/Viewer/PdfViewer";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export const PdfPage: React.FC = () => {
  const { "*": rawPath } = useParams();
  const filePath = rawPath ? decodeURIComponent(rawPath) : "";
  const pathParts = filePath.split("/");
  const fileName = pathParts[pathParts.length - 1] || "Document";
  const pdfTitle = fileName
    .replace(/\.pdf$/i, "")
    .replace(/^[0-9]+[-_]/, "")
    .replace(/[-_]/g, " ");
  useDocumentTitle(`${pdfTitle} (PDF)`);

  return (
    <div className="flex-1 w-full h-[calc(100vh-3.5rem)] flex flex-col min-w-0 overflow-hidden">
      <PdfViewer filePath={filePath} pathParts={pathParts} />
    </div>
  );
};
