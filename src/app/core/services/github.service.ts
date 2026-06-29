import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Repository, SearchResult, TrendingPeriod, PERIOD_DAYS } from '../models/repository.model';

const RESULTS_PER_PAGE = 20;

const GITHUB_SEARCH_URL = 'https://api.github.com/search/repositories';

const GITHUB_REPO_URL = 'https://api.github.com/repos';

@Injectable({ providedIn: 'root' })
export class GithubService {

  private readonly http = inject(HttpClient);

  private repoCache = new Map<string, Observable<Repository>>();

  private trendingCache = new Map<string, Observable<SearchResult>>();

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

          shareReplay(1)
        );

      this.trendingCache.set(cacheKey, request$);
    }

    return this.trendingCache.get(cacheKey)!;
  }

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

  clearCache(): void {
    this.trendingCache.clear();
    this.repoCache.clear();
  }

  private getDateBefore(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }
}
