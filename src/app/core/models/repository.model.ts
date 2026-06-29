/** The owner (user or org) of a GitHub repository. */
export interface RepoOwner {
  login: string;
  avatar_url: string;
  html_url: string;
}

/**
 * A GitHub repository as returned by the Search API.
 * Only the fields we actually display are typed here — extra fields
 * from the API are silently ignored by TypeScript's structural typing.
 */
export interface Repository {
  id: number;
  name: string;
  full_name: string;          // "owner/repo"
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  language: string | null;
  topics: string[];
  owner: RepoOwner;
  created_at: string;
  updated_at: string;
  license: { name: string } | null;
  default_branch: string;
}

/** The envelope GitHub wraps search results in. */
export interface SearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: Repository[];
}

/** How far back to look when calculating "trending". */
export type TrendingPeriod = 'daily' | 'weekly' | 'monthly';

/** Maps a period to the number of days to look back. */
export const PERIOD_DAYS: Record<TrendingPeriod, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
};
