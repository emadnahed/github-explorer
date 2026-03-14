import type { GitHubUser, GitHubRepo } from '@/features/github/githubSlice';
import type { AppColors } from '@/utils/theme';

export interface ScoreBreakdown {
  total: number;
  starScore: number;
  influenceScore: number;
  activityScore: number;
  profileScore: number;
}

const STAR_NORMALIZE = 1000;
const FOLLOWER_NORMALIZE = 5000;
const MAX_ACTIVE_REPOS = 5;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function computeDeveloperScore(
  user: GitHubUser,
  repos: GitHubRepo[],
): ScoreBreakdown {
  const originalRepos = repos.filter((r) => !r.fork);

  const totalStars = originalRepos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const starScore = Math.round(Math.min(totalStars / STAR_NORMALIZE, 1) * 40);

  const influenceScore = Math.round(Math.min(user.followers / FOLLOWER_NORMALIZE, 1) * 30);

  const now = Date.now();
  const recentlyActive = originalRepos.filter(
    (r) => now - new Date(r.updated_at).getTime() < THIRTY_DAYS_MS,
  ).length;
  const activityScore = Math.round(Math.min(recentlyActive / MAX_ACTIVE_REPOS, 1) * 20);

  const profileFields = [user.bio, user.location, user.company, user.blog];
  const filledFields = profileFields.filter(Boolean).length;
  const profileScore = Math.round((filledFields / profileFields.length) * 10);

  return {
    total: starScore + influenceScore + activityScore + profileScore,
    starScore,
    influenceScore,
    activityScore,
    profileScore,
  };
}

export function scoreColor(score: number, colors: AppColors): string {
  if (score >= 80) return colors.accentGreen;
  if (score >= 50) return colors.star;
  return colors.textMuted;
}

export function scoreLabel(score: number): 'Strong' | 'Promising' | 'Limited Activity' {
  if (score >= 80) return 'Strong';
  if (score >= 50) return 'Promising';
  return 'Limited Activity';
}
