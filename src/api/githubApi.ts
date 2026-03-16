import axios from 'axios';

const BASE_URL = 'https://api.github.com';

const GITHUB_TOKEN = process.env.EXPO_PUBLIC_GITHUB_TOKEN;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github.v3+json',
    ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
  },
});

export const githubApi = {
  fetchUser: (username: string) =>
    apiClient.get(`/users/${username}`),

  fetchRepos: (username: string) =>
    apiClient.get(`/users/${username}/repos?per_page=100&sort=updated`),

  fetchFollowers: (username: string) =>
    apiClient.get(`/users/${username}/followers?per_page=30`),

  fetchFollowing: (username: string) =>
    apiClient.get(`/users/${username}/following?per_page=30`),

  fetchRepoLanguages: (owner: string, repo: string) =>
    apiClient.get(`/repos/${owner}/${repo}/languages`),

  searchUsers: (query: string, page = 1) =>
    apiClient.get('/search/users', { params: { q: query, per_page: 20, page } }),
};
