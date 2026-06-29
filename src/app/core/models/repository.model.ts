
export interface RepoOwner {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
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

export interface SearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: Repository[];
}

export type TrendingPeriod = 'daily' | 'weekly' | 'monthly';

export const PERIOD_DAYS: Record<TrendingPeriod, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
};
