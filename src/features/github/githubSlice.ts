import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { githubService } from '@/api/githubService';
import { storage } from '@/utils/storage';

const BOOKMARKS_KEY = 'github_bookmarks';
const HISTORY_KEY = 'github_search_history';
const NOTES_KEY = 'github_recruiter_notes';
const SHORTLISTS_KEY = 'github_shortlists';
const MAX_HISTORY = 10;

function loadFromStorage<T>(key: string): T[] {
  try {
    const raw = storage.getString(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function loadObjectFromStorage<T extends object>(key: string): T {
  try {
    const raw = storage.getString(key);
    return raw ? (JSON.parse(raw) as T) : ({} as T);
  } catch {
    return {} as T;
  }
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  pushed_at: string;
  topics: string[];
  license: { name: string } | null;
  open_issues_count: number;
}

export interface GitHubSearchUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  score: number;
  type: string;
}

export interface SearchFilters {
  language: string;
  location: string;
  minFollowers: string;
}

export type RepoSort = 'stars' | 'updated' | 'name';

interface GitHubState {
  searchQuery: string;
  searchHistory: string[];
  currentUser: GitHubUser | null;
  userLoading: boolean;
  userError: string | null;
  repos: GitHubRepo[];
  reposLoading: boolean;
  reposError: string | null;
  repoSort: RepoSort;
  languageData: Record<string, number>;
  languagesLoading: boolean;
  languagesError: string | null;
  bookmarks: string[];
  recruiterNotes: Record<string, string>;
  shortlists: Record<string, string[]>;
  compareList: string[];
  searchResults: GitHubSearchUser[];
  searchResultsLoading: boolean;
  searchResultsError: string | null;
  searchFilters: SearchFilters;
}

const initialState: GitHubState = {
  searchQuery: '',
  searchHistory: loadFromStorage<string>(HISTORY_KEY),
  currentUser: null,
  userLoading: false,
  userError: null,
  repos: [],
  reposLoading: false,
  reposError: null,
  repoSort: 'stars',
  languageData: {},
  languagesLoading: false,
  languagesError: null,
  bookmarks: loadFromStorage<string>(BOOKMARKS_KEY),
  recruiterNotes: loadObjectFromStorage<Record<string, string>>(NOTES_KEY),
  shortlists: loadObjectFromStorage<Record<string, string[]>>(SHORTLISTS_KEY),
  compareList: [],
  searchResults: [],
  searchResultsLoading: false,
  searchResultsError: null,
  searchFilters: { language: '', location: '', minFollowers: '' },
};

export const fetchUser = createAsyncThunk(
  'github/fetchUser',
  async (username: string, { rejectWithValue }) => {
    try {
      return await githubService.getUser(username);
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const fetchRepos = createAsyncThunk(
  'github/fetchRepos',
  async (username: string, { rejectWithValue }) => {
    try {
      return await githubService.getRepos(username);
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const fetchLanguages = createAsyncThunk(
  'github/fetchLanguages',
  async (username: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { github: GitHubState };
      return await githubService.getAggregatedLanguages(username, state.github.repos);
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const fetchUserSearch = createAsyncThunk(
  'github/fetchUserSearch',
  async (
    { query, filters }: { query: string; filters: SearchFilters },
    { rejectWithValue },
  ) => {
    try {
      const parts: string[] = [];
      if (query.trim()) parts.push(query.trim());
      if (filters.language) parts.push(`language:${filters.language}`);
      if (filters.location) parts.push(`location:${filters.location}`);
      if (filters.minFollowers) parts.push(`followers:>=${filters.minFollowers}`);
      if (parts.length === 0) parts.push('type:user');
      return await githubService.searchUsers(parts.join(' '));
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

const githubSlice = createSlice({
  name: 'github',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setRepoSort(state, action: PayloadAction<RepoSort>) {
      state.repoSort = action.payload;
    },
    toggleBookmark(state, action: PayloadAction<string>) {
      const username = action.payload.toLowerCase();
      const idx = state.bookmarks.indexOf(username);
      if (idx >= 0) {
        state.bookmarks.splice(idx, 1);
      } else {
        state.bookmarks.unshift(username);
      }
      storage.set(BOOKMARKS_KEY, JSON.stringify(state.bookmarks));
    },
    addToHistory(state, action: PayloadAction<string>) {
      const username = action.payload.toLowerCase();
      state.searchHistory = [
        username,
        ...state.searchHistory.filter((h) => h !== username),
      ].slice(0, MAX_HISTORY);
      storage.set(HISTORY_KEY, JSON.stringify(state.searchHistory));
    },
    clearHistory(state) {
      state.searchHistory = [];
      // Use set instead of delete to avoid a TurboModule void-method exception
      // that occurs in release builds when delete() is called from within a reducer.
      storage.set(HISTORY_KEY, JSON.stringify([]));
    },
    clearUserData(state) {
      state.currentUser = null;
      state.repos = [];
      state.languageData = {};
      state.userError = null;
      state.reposError = null;
      state.languagesError = null;
    },
    setNote(state, action: PayloadAction<{ username: string; note: string }>) {
      const key = action.payload.username.toLowerCase();
      if (action.payload.note.trim()) {
        state.recruiterNotes[key] = action.payload.note.trim();
      } else {
        delete state.recruiterNotes[key];
      }
      storage.set(NOTES_KEY, JSON.stringify(state.recruiterNotes));
    },
    setSearchFilters(state, action: PayloadAction<SearchFilters>) {
      state.searchFilters = action.payload;
    },
    clearSearchResults(state) {
      state.searchResults = [];
      state.searchResultsError = null;
    },
    createShortlist(state, action: PayloadAction<string>) {
      const name = action.payload.trim();
      if (!name || state.shortlists[name] !== undefined) return;
      state.shortlists[name] = [];
      storage.set(SHORTLISTS_KEY, JSON.stringify(state.shortlists));
    },
    deleteShortlist(state, action: PayloadAction<string>) {
      delete state.shortlists[action.payload];
      storage.set(SHORTLISTS_KEY, JSON.stringify(state.shortlists));
    },
    addToShortlist(state, action: PayloadAction<{ name: string; username: string }>) {
      const { name, username } = action.payload;
      const uname = username.toLowerCase();
      if (!state.shortlists[name]) return;
      if (!state.shortlists[name].includes(uname)) {
        state.shortlists[name].push(uname);
        storage.set(SHORTLISTS_KEY, JSON.stringify(state.shortlists));
      }
    },
    removeFromShortlist(state, action: PayloadAction<{ name: string; username: string }>) {
      const { name, username } = action.payload;
      if (!state.shortlists[name]) return;
      state.shortlists[name] = state.shortlists[name].filter(
        (u) => u !== username.toLowerCase(),
      );
      storage.set(SHORTLISTS_KEY, JSON.stringify(state.shortlists));
    },
    toggleCompare(state, action: PayloadAction<string>) {
      const username = action.payload.toLowerCase();
      const idx = state.compareList.indexOf(username);
      if (idx >= 0) {
        state.compareList.splice(idx, 1);
      } else if (state.compareList.length < 2) {
        state.compareList.push(username);
      }
    },
    clearCompareList(state) {
      state.compareList = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.userLoading = true;
        state.userError = null;
        state.currentUser = null;
        state.repos = [];
        state.languageData = {};
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.userLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.userLoading = false;
        state.userError = action.payload as string;
      })
      .addCase(fetchRepos.pending, (state) => {
        state.reposLoading = true;
        state.reposError = null;
      })
      .addCase(fetchRepos.fulfilled, (state, action) => {
        state.reposLoading = false;
        state.repos = action.payload;
      })
      .addCase(fetchRepos.rejected, (state, action) => {
        state.reposLoading = false;
        state.reposError = action.payload as string;
      })
      .addCase(fetchLanguages.pending, (state) => {
        state.languagesLoading = true;
        state.languagesError = null;
      })
      .addCase(fetchLanguages.fulfilled, (state, action) => {
        state.languagesLoading = false;
        state.languageData = action.payload;
      })
      .addCase(fetchLanguages.rejected, (state, action) => {
        state.languagesLoading = false;
        state.languagesError = action.payload as string;
      })
      .addCase(fetchUserSearch.pending, (state) => {
        state.searchResultsLoading = true;
        state.searchResultsError = null;
      })
      .addCase(fetchUserSearch.fulfilled, (state, action) => {
        state.searchResultsLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(fetchUserSearch.rejected, (state, action) => {
        state.searchResultsLoading = false;
        state.searchResultsError = action.payload as string;
      });
  },
});

export const {
  setSearchQuery,
  setRepoSort,
  toggleBookmark,
  addToHistory,
  clearHistory,
  clearUserData,
  setNote,
  setSearchFilters,
  clearSearchResults,
  createShortlist,
  deleteShortlist,
  addToShortlist,
  removeFromShortlist,
  toggleCompare,
  clearCompareList,
} = githubSlice.actions;

export default githubSlice.reducer;
