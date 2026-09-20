import { useEffect } from "react";

const BASE_TITLE = "Knowledge Hub";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    if (title && title.trim()) {
      document.title = `${title} | ${BASE_TITLE}`;
    } else {
      document.title = `Engineering Knowledge Hub | Study Notes & LeetCode`;
    }
  }, [title]);
}
