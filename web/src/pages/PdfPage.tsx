import React from "react";
import { useParams } from "react-router-dom";
import { PdfViewer } from "../components/Viewer/PdfViewer";

export const PdfPage: React.FC = () => {
  const { "*": rawPath } = useParams();
  const filePath = rawPath ? decodeURIComponent(rawPath) : "";
  const pathParts = filePath.split("/");

  return (
    <div className="flex-1 w-full h-[calc(100vh-3.5rem)] flex flex-col min-w-0 overflow-hidden">
      <PdfViewer filePath={filePath} pathParts={pathParts} />
    </div>
  );
};
