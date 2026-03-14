import { githubApi } from './githubApi';
import { storage } from '@/utils/storage';
import type { GitHubUser, GitHubRepo, GitHubSearchUser } from '@/features/github/githubSlice';

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function cacheKey(type: string, username: string): string {
  return `github_${type}_${username.toLowerCase()}`;
}

function tsKey(type: string, username: string): string {
  return `github_${type}_ts_${username.toLowerCase()}`;
}

function readCache<T>(type: string, username: string): T | null {
  const ts = storage.getNumber(tsKey(type, username));
  if (!ts || Date.now() - ts > CACHE_TTL) return null;
  const raw = storage.getString(cacheKey(type, username));
  return raw ? (JSON.parse(raw) as T) : null;
}

function writeCache(type: string, username: string, data: unknown): void {
  storage.set(cacheKey(type, username), JSON.stringify(data));
  storage.set(tsKey(type, username), Date.now());
}

class GitHubService {
  async getUser(username: string): Promise<GitHubUser> {
    const cached = readCache<GitHubUser>('user', username);
    if (cached) return cached;
    const { data } = await githubApi.fetchUser(username);
    writeCache('user', username, data);
    return data as GitHubUser;
  }

  async getRepos(username: string): Promise<GitHubRepo[]> {
    const cached = readCache<GitHubRepo[]>('repos', username);
    if (cached) return cached;
    const { data } = await githubApi.fetchRepos(username);
    writeCache('repos', username, data);
    return data as GitHubRepo[];
  }

  async getAggregatedLanguages(
    username: string,
    repos: GitHubRepo[],
  ): Promise<Record<string, number>> {
    const cached = readCache<Record<string, number>>('languages', username);
    if (cached) return cached;

    const topRepos = [...repos]
      .filter((r) => !r.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 10);

    const results = await Promise.allSettled(
      topRepos.map((repo) => githubApi.fetchRepoLanguages(username, repo.name)),
    );

    const aggregated: Record<string, number> = {};
    for (const result of results) {
      if (result.status === 'fulfilled') {
        for (const [lang, bytes] of Object.entries(
          result.value.data as Record<string, number>,
        )) {
          aggregated[lang] = (aggregated[lang] ?? 0) + bytes;
        }
      }
    }

    writeCache('languages', username, aggregated);
    return aggregated;
  }

  async searchUsers(query: string): Promise<GitHubSearchUser[]> {
    const { data } = await githubApi.searchUsers(query);
    return (data as { total_count: number; items: GitHubSearchUser[] }).items;
  }

  clearUserCache(username: string): void {
    ['user', 'repos', 'languages'].forEach((type) => {
      storage.delete(cacheKey(type, username));
      storage.delete(tsKey(type, username));
    });
  }
}

export const githubService = new GitHubService();
