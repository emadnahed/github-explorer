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

const WEIGHT_STAR = 40;
const WEIGHT_INFLUENCE = 30;
const WEIGHT_ACTIVITY = 20;
const WEIGHT_PROFILE = 10;

const SCORE_THRESHOLD_STRONG = 80;
const SCORE_THRESHOLD_PROMISING = 50;

export function computeDeveloperScore(
  user: GitHubUser,
  repos: GitHubRepo[],
): ScoreBreakdown {
  const originalRepos = repos.filter((r) => !r.fork);

  const totalStars = originalRepos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const starScore = Math.round(Math.min(totalStars / STAR_NORMALIZE, 1) * WEIGHT_STAR);

  const influenceScore = Math.round(Math.min(user.followers / FOLLOWER_NORMALIZE, 1) * WEIGHT_INFLUENCE);

  const now = Date.now();
  const recentlyActive = originalRepos.filter(
    (r) => now - new Date(r.updated_at).getTime() < THIRTY_DAYS_MS,
  ).length;
  const activityScore = Math.round(Math.min(recentlyActive / MAX_ACTIVE_REPOS, 1) * WEIGHT_ACTIVITY);

  const profileFields = [user.bio, user.location, user.company, user.blog];
  const filledFields = profileFields.filter(Boolean).length;
  const profileScore = Math.round((filledFields / profileFields.length) * WEIGHT_PROFILE);

  return {
    total: starScore + influenceScore + activityScore + profileScore,
    starScore,
    influenceScore,
    activityScore,
    profileScore,
  };
}

export function scoreColor(score: number, colors: AppColors): string {
  if (score >= SCORE_THRESHOLD_STRONG) return colors.accentGreen;
  if (score >= SCORE_THRESHOLD_PROMISING) return colors.star;
  return colors.textMuted;
}

export function scoreLabel(score: number): 'Strong' | 'Promising' | 'Limited Activity' {
  if (score >= SCORE_THRESHOLD_STRONG) return 'Strong';
  if (score >= SCORE_THRESHOLD_PROMISING) return 'Promising';
  return 'Limited Activity';
}
