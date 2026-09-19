import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { Link } from "react-router-dom";
import { CodeBlock } from "./CodeBlock";
import { MermaidRenderer } from "./MermaidRenderer";
import { GITHUB_RAW_BASE } from "../../config/github";

interface MarkdownRendererProps {
  content: string;
  currentFilePath: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  currentFilePath,
}) => {
  // Extract folder directory for relative assets resolution
  const pathParts = currentFilePath.split("/");
  const currentDir = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : "";

  return (
    <div className="markdown-body dark:text-neutral-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          // Code block and Mermaid handling
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            const language = match ? match[1] : "";

            if (language === "mermaid") {
              return <MermaidRenderer chart={codeString} />;
            }

            // Check if inline code
            const isInline = !className && !codeString.includes("\n");
            if (isInline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }

            return <CodeBlock language={language} value={codeString} />;
          },

          // Link rewriting for internal repo navigation
          a({ href, children, ...props }) {
            if (!href) return <a {...props}>{children}</a>;

            // Anchor links on page
            if (href.startsWith("#")) {
              return (
                <a
                  href={href}
                  className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  {...props}
                >
                  {children}
                </a>
              );
            }

            // Internal Markdown or PDF file links
            if (href.endsWith(".md") || href.endsWith(".markdown") || href.endsWith(".pdf")) {
              // Normalize relative path
              let targetPath = href;
              if (href.startsWith("./")) {
                targetPath = href.substring(2);
              }
              if (!targetPath.startsWith("/") && currentDir) {
                targetPath = `${currentDir}/${targetPath}`;
              } else if (targetPath.startsWith("/")) {
                targetPath = targetPath.substring(1);
              }

              const isPdf = targetPath.endsWith(".pdf");
              const route = isPdf ? `/pdf/${encodeURIComponent(targetPath)}` : `/note/${encodeURIComponent(targetPath)}`;

              return (
                <Link
                  to={route}
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  {children}
                </Link>
              );
            }

            // External links
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                {...props}
              >
                {children}
              </a>
            );
          },

          // Images: resolve relative paths to GitHub raw content URL
          img({ src, alt, ...props }) {
            if (!src) return null;
            let resolvedSrc = src;

            if (!src.startsWith("http://") && !src.startsWith("https://") && !src.startsWith("data:")) {
              let cleanPath = src.startsWith("./") ? src.substring(2) : src;
              if (cleanPath.startsWith("/")) cleanPath = cleanPath.substring(1);

              if (currentDir) {
                resolvedSrc = `${GITHUB_RAW_BASE}/${encodeURI(currentDir)}/${encodeURI(cleanPath)}`;
              } else {
                resolvedSrc = `${GITHUB_RAW_BASE}/${encodeURI(cleanPath)}`;
              }
            }

            return (
              <img
                src={resolvedSrc}
                alt={alt || "Illustration"}
                loading="lazy"
                className="rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm mx-auto my-6 max-h-[550px] object-contain"
                {...props}
              />
            );
          },

          // Headings with anchor link support
          h1({ id, children }) {
            return (
              <h1 id={id} className="group scroll-mt-20 relative">
                {children}
                {id && (
                  <a
                    href={`#${id}`}
                    className="opacity-0 group-hover:opacity-100 ml-2 text-neutral-400 dark:text-neutral-500 hover:text-blue-500 transition-opacity text-base no-underline"
                    aria-label="Link to this section"
                  >
                    #
                  </a>
                )}
              </h1>
            );
          },
          h2({ id, children }) {
            return (
              <h2 id={id} className="group scroll-mt-20 relative">
                {children}
                {id && (
                  <a
                    href={`#${id}`}
                    className="opacity-0 group-hover:opacity-100 ml-2 text-neutral-400 dark:text-neutral-500 hover:text-blue-500 transition-opacity text-base no-underline"
                    aria-label="Link to this section"
                  >
                    #
                  </a>
                )}
              </h2>
            );
          },
          h3({ id, children }) {
            return (
              <h3 id={id} className="group scroll-mt-20 relative">
                {children}
                {id && (
                  <a
                    href={`#${id}`}
                    className="opacity-0 group-hover:opacity-100 ml-2 text-neutral-400 dark:text-neutral-500 hover:text-blue-500 transition-opacity text-sm no-underline"
                    aria-label="Link to this section"
                  >
                    #
                  </a>
                )}
              </h3>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
