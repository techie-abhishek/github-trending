import { Repository, SearchResult } from '../core/models/repository.model';

export function createMockRepo(overrides: Partial<Repository> = {}): Repository {
  return {
    id: 1,
    name: 'test-repo',
    full_name: 'octocat/test-repo',
    description: 'A test repository description',
    html_url: 'https://github.com/octocat/test-repo',
    stargazers_count: 12300,
    forks_count: 456,
    open_issues_count: 7,
    watchers_count: 200,
    language: 'TypeScript',
    topics: ['angular', 'typescript'],
    owner: {
      login: 'octocat',
      avatar_url: 'https://avatars.githubusercontent.com/u/583231',
      html_url: 'https://github.com/octocat',
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
    license: { name: 'MIT License' },
    default_branch: 'main',
    ...overrides,
  };
}

export function createMockSearchResult(count = 20): SearchResult {
  return {
    total_count: count,
    incomplete_results: false,
    items: Array.from({ length: count }, (_, i) =>
      createMockRepo({ id: i + 1, name: `repo-${i + 1}`, full_name: `octocat/repo-${i + 1}` })
    ),
  };
}
