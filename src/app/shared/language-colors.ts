/**
 * Dot colors for programming languages, matching GitHub's own color palette.
 * Only the 30 most common languages are listed; anything else falls back to gray.
 */
export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Scala: '#c22d40',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Dockerfile: '#384d54',
  Jupyter: '#DA5B0B',
  R: '#198CE7',
  Lua: '#000080',
  Haskell: '#5e5086',
  Elixir: '#6e4a7e',
  Clojure: '#db5855',
  Erlang: '#B83998',
  OCaml: '#3be133',
  Nix: '#7e7eff',
};

/** Returns the color for a language, or a neutral gray as fallback. */
export function getLanguageColor(language: string | null): string {
  if (!language) return '#8b949e';
  return LANGUAGE_COLORS[language] ?? '#8b949e';
}

/** Formats a large number with K/M suffix (e.g. 12300 → "12.3k"). */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
