import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import { LANGUAGE_COLORS } from '@/utils/chartHelpers';

export const selectCurrentUser = (state: RootState) => state.github.currentUser;
export const selectRepos = (state: RootState) => state.github.repos;
export const selectRepoSort = (state: RootState) => state.github.repoSort;
export const selectLanguageData = (state: RootState) => state.github.languageData;
export const selectBookmarks = (state: RootState) => state.github.bookmarks;
export const selectSearchHistory = (state: RootState) => state.github.searchHistory;

export const selectSortedRepos = createSelector(
  selectRepos,
  selectRepoSort,
  (repos, sort) =>
    [...repos].sort((a, b) => {
      switch (sort) {
        case 'stars':
          return b.stargazers_count - a.stargazers_count;
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    }),
);

export interface LanguageSegment {
  language: string;
  bytes: number;
  percentage: number;
  color: string;
}

export const selectLanguageSegments = createSelector(
  selectLanguageData,
  (data): LanguageSegment[] => {
    const total = Object.values(data).reduce((sum, b) => sum + b, 0);
    if (total === 0) return [];
    return Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 12)
      .map(([language, bytes]) => ({
        language,
        bytes,
        percentage: (bytes / total) * 100,
        color: LANGUAGE_COLORS[language] ?? '#8B949E',
      }));
  },
);

export const selectIsBookmarked = (username: string) =>
  createSelector(selectBookmarks, (bookmarks) =>
    bookmarks.includes(username.toLowerCase()),
  );

export const selectSearchResults = (state: RootState) => state.github.searchResults;
export const selectSearchFilters = (state: RootState) => state.github.searchFilters;

export const selectRecruiterNote =
  (username: string) =>
  (state: RootState): string =>
    state.github.recruiterNotes[username.toLowerCase()] ?? '';

export const selectShortlists = (state: RootState) => state.github.shortlists;
export const selectCompareList = (state: RootState) => state.github.compareList;

export const selectIsInCompare = (username: string) =>
  createSelector(selectCompareList, (list) => list.includes(username.toLowerCase()));
