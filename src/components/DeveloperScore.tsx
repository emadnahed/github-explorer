import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { computeDeveloperScore, scoreColor, scoreLabel } from '@/utils/scoringHelpers';
import type { AppColors } from '@/utils/theme';
import type { GitHubUser, GitHubRepo } from '@/features/github/githubSlice';

interface Props {
  user: GitHubUser;
  repos: GitHubRepo[];
}

export const DeveloperScore = memo(({ user, repos }: Props) => {
  const colors = useTheme();
  if (repos.length === 0) return null;

  const breakdown = computeDeveloperScore(user, repos);
  const color = scoreColor(breakdown.total, colors);
  const label = scoreLabel(breakdown.total);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.top}>
        <View style={styles.titleGroup}>
          <Text style={[styles.title, { color: colors.textSecondary }]}>Developer Score</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Stars · Influence · Activity · Profile
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: color }]}>
          <Text style={[styles.badgeScore, { color }]}>{breakdown.total}</Text>
          <Text style={[styles.badgeLabel, { color }]}>{label}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.rows}>
        <BarRow label="Stars" value={breakdown.starScore} max={40} color={colors.star} colors={colors} />
        <BarRow label="Influence" value={breakdown.influenceScore} max={30} color={colors.accent} colors={colors} />
        <BarRow label="Activity" value={breakdown.activityScore} max={20} color={colors.accentGreen} colors={colors} />
        <BarRow label="Profile" value={breakdown.profileScore} max={10} color={colors.textSecondary} colors={colors} />
      </View>
    </View>
  );
});

function BarRow({
  label,
  value,
  max,
  color,
  colors,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  colors: AppColors;
}) {
  const pct = max > 0 ? value / max : 0;
  return (
    <View style={styles.barRow}>
      <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.track, { backgroundColor: colors.skeleton }]}>
        {pct > 0 && (
          <View
            style={[
              styles.fill,
              { backgroundColor: color, width: `${Math.round(pct * 100)}%` as `${number}%` },
            ]}
          />
        )}
      </View>
      <Text style={[styles.barValue, { color: colors.text }]}>
        {value}
        <Text style={{ color: colors.textMuted }}>/{max}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  titleGroup: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  badge: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    minWidth: 80,
  },
  badgeScore: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 32,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  rows: {
    padding: 16,
    gap: 10,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barLabel: {
    width: 64,
    fontSize: 12,
    fontWeight: '500',
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  barValue: {
    width: 36,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
});
