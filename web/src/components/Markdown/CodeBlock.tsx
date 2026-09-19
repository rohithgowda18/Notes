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

  const displayLang = language.replace("language-", "").toLowerCase();

  return (
    <div className="relative my-5 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs group">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-neutral-100 dark:bg-neutral-800/90 border-b border-neutral-200 dark:border-neutral-700/60 text-xs font-mono text-neutral-600 dark:text-neutral-400">
        <span className="uppercase font-semibold tracking-wider">{displayLang || "CODE"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-sans transition-colors bg-white dark:bg-neutral-700/80 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-600 shadow-2xs cursor-pointer"
          title="Copy code to clipboard"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Syntax Highlighting Container */}
      <div className="text-[13.5px] leading-relaxed">
        <SyntaxHighlighter
          language={displayLang || "text"}
          style={theme === "dark" ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            padding: "1.1rem",
            fontSize: "0.9rem",
            lineHeight: "1.6",
            borderRadius: 0,
            backgroundColor: theme === "dark" ? "#18181b" : "#fafafa",
          }}
          showLineNumbers={value.split("\n").length > 4}
          wrapLongLines={false}
        >
          {value.trimEnd()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
