import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = "text", value }) => {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  // Clean and normalize language name
  const rawLang = language.replace(/^language-/, "").toLowerCase();
  const langMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    tsx: "tsx",
    jsx: "jsx",
    py: "python",
    sh: "bash",
    shell: "bash",
    zsh: "bash",
    yml: "yaml",
    docker: "dockerfile",
  };
  const normalizedLang = langMap[rawLang] || rawLang || "text";
  const displayLang = (rawLang || "code").toUpperCase();

  const lineCount = value.trimEnd().split("\n").length;

  return (
    <div className="w-full my-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#11141d] overflow-hidden shadow-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-100/90 dark:bg-[#161b26] border-b border-neutral-200 dark:border-neutral-800/80 select-none">
        <span className="text-[11px] font-mono font-bold tracking-wider text-neutral-600 dark:text-neutral-300">
          {displayLang}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all bg-white dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 shadow-2xs cursor-pointer active:scale-95"
          title="Copy code to clipboard"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Viewport with Horizontal Scroll */}
      <div className="overflow-x-auto text-[14.5px] leading-relaxed font-mono">
        <SyntaxHighlighter
          language={normalizedLang}
          style={theme === "dark" ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            padding: "1.1rem 1.35rem",
            fontSize: "14.5px",
            lineHeight: "1.65",
            borderRadius: 0,
            border: "none",
            backgroundColor: theme === "dark" ? "#11141d" : "#fafafa",
            fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          }}
          codeTagProps={{
            style: {
              fontSize: "14.5px",
              lineHeight: "1.65",
              fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              background: "transparent",
              border: "none",
            },
          }}
          showLineNumbers={lineCount > 1}
          lineNumberStyle={{
            minWidth: "2.5em",
            paddingRight: "1.25em",
            color: theme === "dark" ? "#525e75" : "#94a3b8",
            textAlign: "right",
            userSelect: "none",
            border: "none",
          }}
          wrapLongLines={false}
        >
          {value.trimEnd()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
