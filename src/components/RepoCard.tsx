import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { formatNumber, timeAgo } from '@/utils/helpers';
import { LANGUAGE_COLORS } from '@/utils/chartHelpers';
import type { GitHubRepo } from '@/features/github/githubSlice';

interface Props {
  repo: GitHubRepo;
}

function RepoCardComponent({ repo }: Props) {
  const colors = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, { damping: 14, stiffness: 300 });
    opacity.value = withTiming(0.85, { duration: 100 });
  }, [scale, opacity]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 200 });
  }, [scale, opacity]);

  const handlePress = useCallback(() => {
    Linking.openURL(repo.html_url);
  }, [repo.html_url]);

  const langColor = repo.language ? (LANGUAGE_COLORS[repo.language] ?? '#8B949E') : colors.textMuted;

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        <View style={styles.headerRow}>
          <Ionicons name="git-branch-outline" size={16} color={colors.accent} style={styles.repoIcon} />
          <Text style={[styles.repoName, { color: colors.accent }]} numberOfLines={1}>
            {repo.name}
          </Text>
          {repo.fork && (
            <View style={[styles.forkBadge, { borderColor: colors.border }]}>
              <Text style={[styles.forkText, { color: colors.textSecondary }]}>fork</Text>
            </View>
          )}
        </View>

        {repo.description ? (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
            {repo.description}
          </Text>
        ) : null}

        <View style={styles.statsRow}>
          {repo.language ? (
            <View style={styles.statItem}>
              <View style={[styles.langDot, { backgroundColor: langColor }]} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {repo.language}
              </Text>
            </View>
          ) : null}

          <View style={styles.statItem}>
            <Ionicons name="star-outline" size={14} color={colors.star} style={styles.statIcon} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {formatNumber(repo.stargazers_count)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="git-merge-outline" size={14} color={colors.fork} style={styles.statIcon} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {formatNumber(repo.forks_count)}
            </Text>
          </View>

          <View style={[styles.statItem, styles.timeItem]}>
            <Ionicons name="time-outline" size={13} color={colors.textMuted} style={styles.statIcon} />
            <Text style={[styles.statText, { color: colors.textMuted }]}>
              {timeAgo(repo.updated_at)}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export const RepoCard = memo(RepoCardComponent);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressable: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  repoIcon: {
    marginRight: 6,
  },
  repoName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    letterSpacing: -0.2,
  },
  forkBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 8,
  },
  forkText: {
    fontSize: 10,
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeItem: {
    marginLeft: 'auto',
  },
  langDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  statIcon: {
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
