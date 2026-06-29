import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Repository, SearchResult, TrendingPeriod, PERIOD_DAYS } from '../models/repository.model';

// How many repos to fetch per request
const RESULTS_PER_PAGE = 20;

// GitHub Search API base URL
const GITHUB_SEARCH_URL = 'https://api.github.com/search/repositories';

// GitHub REST API base URL for single-repo lookups
const GITHUB_REPO_URL = 'https://api.github.com/repos';

@Injectable({ providedIn: 'root' })
export class GithubService {
  // Modern Angular DI: inject() replaces constructor injection
  private readonly http = inject(HttpClient);

  // In-memory cache: maps "owner/repo" → cached Observable.
  // shareReplay(1) means the last response is replayed to any late subscriber
  // without making a second HTTP call — this is what makes back-navigation instant.
  private repoCache = new Map<string, Observable<Repository>>();

  // Cache trending results per period so the period toggle doesn't re-fetch
  // if the user switches back to a period they already loaded.
  private trendingCache = new Map<string, Observable<SearchResult>>();

  /**
   * Fetch the top N repositories created within the given period, sorted by stars.
   * GitHub has no official "trending" endpoint, so we approximate it:
   *   q=created:>YYYY-MM-DD&sort=stars&order=desc
   */
  getTrendingRepos(period: TrendingPeriod): Observable<SearchResult> {
    const cacheKey = period;

    if (!this.trendingCache.has(cacheKey)) {
      const since = this.getDateBefore(PERIOD_DAYS[period]);
      const params = {
        q: `created:>${since}`,
        sort: 'stars',
        order: 'desc',
        per_page: String(RESULTS_PER_PAGE),
      };

      const request$ = this.http
        .get<SearchResult>(GITHUB_SEARCH_URL, { params })
        .pipe(
          // Cache the result — replays the response to any future subscriber
          // without hitting the network again
          shareReplay(1)
        );

      this.trendingCache.set(cacheKey, request$);
    }

    return this.trendingCache.get(cacheKey)!;
  }

  /**
   * Fetch full details for a single repository.
   * The search result already contains most fields, but this call returns
   * a slightly richer object (e.g. topics are always populated here).
   */
  getRepoDetails(owner: string, name: string): Observable<Repository> {
    const cacheKey = `${owner}/${name}`;

    if (!this.repoCache.has(cacheKey)) {
      const request$ = this.http
        .get<Repository>(`${GITHUB_REPO_URL}/${owner}/${name}`)
        .pipe(shareReplay(1));

      this.repoCache.set(cacheKey, request$);
    }

    return this.repoCache.get(cacheKey)!;
  }

  /** Clears both caches — useful if the user wants fresh data. */
  clearCache(): void {
    this.trendingCache.clear();
    this.repoCache.clear();
  }

  /** Returns an ISO date string N days before today, used in the search query. */
  private getDateBefore(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
  }
}
