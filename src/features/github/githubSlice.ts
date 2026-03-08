import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { githubService } from '@/api/githubService';
import { storage } from '@/utils/storage';

const BOOKMARKS_KEY = 'github_bookmarks';
const HISTORY_KEY = 'github_search_history';
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
      storage.delete(HISTORY_KEY);
    },
    clearUserData(state) {
      state.currentUser = null;
      state.repos = [];
      state.languageData = {};
      state.userError = null;
      state.reposError = null;
      state.languagesError = null;
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
} = githubSlice.actions;

export default githubSlice.reducer;
