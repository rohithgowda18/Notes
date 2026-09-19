/**
 * Centralized GitHub Repository Configuration
 *
 * Source of truth for where study notes and PDFs are hosted.
 * Modify these values to switch repositories or target branches.
 */
export const GITHUB_OWNER = "rohithgowda18";
export const GITHUB_REPO = "Notes";
export const GITHUB_BRANCH = "main";

/**
 * Optional GitHub Personal Access Token (for private repos or higher API rate limits).
 * NOTE: For public repositories, this is NOT required.
 * In a frontend application, never commit sensitive tokens to source control.
 */
export const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || "";

/**
 * Base URL for fetching raw file contents directly from GitHub
 */
export const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;

/**
 * GitHub API base endpoint for repository tree traversal
 */
export const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;
