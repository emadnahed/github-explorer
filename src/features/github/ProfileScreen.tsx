import React, { useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useAppSelector } from '@/store/hooks';
import { ProfileHeader } from '@/components/ProfileHeader';
import { StatsCard } from '@/components/StatsCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useTheme } from '@/hooks/useTheme';
import type { ProfileTabParamList } from '@/navigation/ProfileNavigator';

type Props = BottomTabScreenProps<ProfileTabParamList, 'Profile'>;

export function ProfileScreen({ route }: Props) {
  const colors = useTheme();
  const { currentUser, userLoading, userError } = useAppSelector((state) => state.github);

  if (userLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SkeletonLoader />
      </View>
    );
  }

  if (userError || !currentUser) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {userError ?? 'No user loaded'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <ProfileHeader user={currentUser} />

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.statsSection}>
        <Text style={[styles.statsTitle, { color: colors.textSecondary }]}>Stats</Text>
        <View style={styles.statsRow}>
          <StatsCard
            icon="git-branch-outline"
            count={currentUser.public_repos}
            label="Repos"
            color={colors.accent}
          />
          <StatsCard
            icon="people-outline"
            count={currentUser.followers}
            label="Followers"
            color={colors.accentGreen}
          />
          <StatsCard
            icon="person-add-outline"
            count={currentUser.following}
            label="Following"
            color={colors.star}
          />
        </View>
      </View>

      {currentUser.public_gists > 0 && (
        <View style={[styles.gistRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.gistLabel, { color: colors.textSecondary }]}>Public Gists</Text>
          <Text style={[styles.gistCount, { color: colors.text }]}>
            {currentUser.public_gists}
          </Text>
        </View>
      )}

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 14, textAlign: 'center' },
  divider: { height: 1, marginHorizontal: 20, marginBottom: 20 },
  statsSection: { paddingHorizontal: 20, marginBottom: 16 },
  statsTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  statsRow: { flexDirection: 'row' },
  gistRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  gistLabel: { fontSize: 14, fontWeight: '500' },
  gistCount: { fontSize: 16, fontWeight: '700' },
  bottomPad: { height: 24 },
});
