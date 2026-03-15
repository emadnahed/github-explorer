import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { computeDeveloperScore, scoreColor, scoreLabel } from '@/utils/scoringHelpers';
import { formatNumber } from '@/utils/helpers';
import type { AppColors } from '@/utils/theme';
import type { GitHubUser, GitHubRepo } from '@/features/github/githubSlice';

interface Props {
  user: GitHubUser;
  repos: GitHubRepo[];
  onViewProfile?: () => void;
  onRemove?: () => void;
}

export const CompareCard = memo(({ user, repos, onViewProfile, onRemove }: Props) => {
  const colors = useTheme();
  const breakdown = repos.length > 0 ? computeDeveloperScore(user, repos) : null;
  const color = breakdown ? scoreColor(breakdown.total, colors) : colors.textMuted;
  const label = breakdown ? scoreLabel(breakdown.total) : '—';
  const totalStars = repos
    .filter((r) => !r.fork)
    .reduce((sum, r) => sum + r.stargazers_count, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {user.name ?? user.login}
        </Text>
        <Text style={[styles.login, { color: colors.accent }]} numberOfLines={1}>
          @{user.login}
        </Text>
        {user.location ? (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={10} color={colors.textMuted} />
            <Text style={[styles.location, { color: colors.textMuted }]} numberOfLines={1}>
              {user.location}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Score */}
      {breakdown && (
        <View style={[styles.scoreBadge, { backgroundColor: `${color}18`, borderColor: color }]}>
          <Text style={[styles.scoreNumber, { color }]}>{breakdown.total}</Text>
          <Text style={[styles.scoreLabel, { color }]}>{label}</Text>
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Score breakdown bars */}
      {breakdown && (
        <View style={styles.bars}>
          <MiniBar label="Stars" value={breakdown.starScore} max={40} color={colors.star} colors={colors} />
          <MiniBar label="Infl." value={breakdown.influenceScore} max={30} color={colors.accent} colors={colors} />
          <MiniBar label="Activ." value={breakdown.activityScore} max={20} color={colors.accentGreen} colors={colors} />
          <MiniBar label="Prof." value={breakdown.profileScore} max={10} color={colors.textSecondary} colors={colors} />
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Stats */}
      <View style={styles.stats}>
        <StatRow icon="git-branch-outline" label="Repos" value={user.public_repos} colors={colors} />
        <StatRow icon="people-outline" label="Followers" value={user.followers} colors={colors} />
        <StatRow icon="star-outline" label="Stars" value={totalStars} colors={colors} />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {onViewProfile && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.accent }]}
            onPress={onViewProfile}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnText}>Profile</Text>
          </TouchableOpacity>
        )}
        {onRemove && (
          <TouchableOpacity
            style={[styles.removeBtn, { borderColor: colors.border }]}
            onPress={onRemove}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

function MiniBar({
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
      <Text style={[styles.barVal, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function StatRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: number;
  colors: AppColors;
}) {
  return (
    <View style={styles.statRow}>
      <Ionicons name={icon} size={12} color={colors.textSecondary} />
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{formatNumber(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 10,
    paddingBottom: 12,
    gap: 3,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, marginBottom: 4 },
  name: { fontSize: 13, fontWeight: '700', textAlign: 'center', letterSpacing: -0.3 },
  login: { fontSize: 11, fontWeight: '500', textAlign: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  location: { fontSize: 10, textAlign: 'center' },
  scoreBadge: {
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  scoreNumber: { fontSize: 26, fontWeight: '800', letterSpacing: -1, lineHeight: 30 },
  scoreLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  divider: { height: 1, marginHorizontal: 12 },
  bars: { padding: 12, gap: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barLabel: { width: 36, fontSize: 10, fontWeight: '500' },
  track: { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  barVal: { width: 20, fontSize: 10, fontWeight: '600', textAlign: 'right' },
  stats: { padding: 12, gap: 7 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statLabel: { flex: 1, fontSize: 11, fontWeight: '500' },
  statValue: { fontSize: 11, fontWeight: '700' },
  actions: { padding: 10, flexDirection: 'row', gap: 8, alignItems: 'center' },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
