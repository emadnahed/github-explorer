import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCompareList, toggleCompare } from './githubSlice';
import type { GitHubUser, GitHubRepo } from './githubSlice';
import { selectCompareList } from './githubSelectors';
import { CompareCard } from '@/components/CompareCard';
import { useTheme } from '@/hooks/useTheme';
import { githubService } from '@/api/githubService';
import type { HomeTabParamList } from '@/navigation/HomeTabNavigator';

type Props = BottomTabScreenProps<HomeTabParamList, 'Compare'>;

interface UserData {
  user: GitHubUser | null;
  repos: GitHubRepo[];
  loading: boolean;
  error: string | null;
}

export function CompareScreen({ navigation }: Props) {
  const colors = useTheme();
  const dispatch = useAppDispatch();
  const compareList = useAppSelector(selectCompareList);
  const [userData, setUserData] = useState<Record<string, UserData>>({});
  const fetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    const toFetch = compareList.filter((u) => !fetchedRef.current.has(u));
    if (toFetch.length === 0) return;

    for (const username of toFetch) {
      fetchedRef.current.add(username);
      setUserData((prev) => ({
        ...prev,
        [username]: { user: null, repos: [], loading: true, error: null },
      }));

      Promise.all([githubService.getUser(username), githubService.getRepos(username)])
        .then(([user, repos]) => {
          if (!isMounted) return;
          setUserData((prev) => ({
            ...prev,
            [username]: { user, repos, loading: false, error: null },
          }));
        })
        .catch((err) => {
          if (!isMounted) return;
          fetchedRef.current.delete(username);
          setUserData((prev) => ({
            ...prev,
            [username]: {
              user: null,
              repos: [],
              loading: false,
              error: (err as Error).message,
            },
          }));
        });
    }

    return () => {
      isMounted = false;
    };
  }, [compareList]);

  const anyLoading = compareList.some((u) => userData[u]?.loading);

  if (compareList.length < 2) {
    return (
      <View testID="compare-empty-state" style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="swap-horizontal-outline" size={56} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Compare Candidates</Text>
        <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
          {compareList.length === 0
            ? 'Add two developers to compare their scores and stats side by side.'
            : `You've added @${compareList[0]} — add one more developer to compare.`}
        </Text>
        <TouchableOpacity
          style={[styles.browseBtn, { backgroundColor: colors.accent }]}
          onPress={() => navigation.navigate('Explore', { screen: 'Search' })}
          activeOpacity={0.8}
        >
          <Text style={styles.browseBtnText}>Browse Developers</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (anyLoading) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading candidates…
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      testID="compare-scroll"
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <Text style={[styles.toolbarTitle, { color: colors.textSecondary }]}>
          SIDE-BY-SIDE COMPARISON
        </Text>
        <TouchableOpacity
          testID="compare-clear-btn"
          onPress={() => dispatch(clearCompareList())}
          style={[styles.clearBtn, { borderColor: colors.border }]}
        >
          <Ionicons name="trash-outline" size={13} color={colors.textSecondary} />
          <Text style={[styles.clearBtnText, { color: colors.textSecondary }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Cards row */}
      <View style={styles.cardsRow}>
        {compareList.map((username) => {
          const data = userData[username];

          if (!data || !data.user) {
            return (
              <View
                key={username}
                style={[
                  styles.errorCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {data?.error ?? 'Failed to load'}
                </Text>
                <TouchableOpacity onPress={() => dispatch(toggleCompare(username))}>
                  <Text style={[styles.removeLink, { color: colors.accent }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            );
          }

          const { user, repos } = data;
          return (
            <CompareCard
              key={username}
              user={user}
              repos={repos}
              onViewProfile={() =>
                navigation.navigate('Explore', {
                  screen: 'ProfileTabs',
                  params: { username: user.login },
                })
              }
              onRemove={() => dispatch(toggleCompare(username))}
            />
          );
        })}
      </View>

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    gap: 12,
  },
  emptyTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5, textAlign: 'center' },
  emptyBody: { fontSize: 14, lineHeight: 20, textAlign: 'center', maxWidth: 280 },
  loadingText: { fontSize: 14, marginTop: 12 },
  browseBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  toolbarTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  clearBtnText: { fontSize: 12, fontWeight: '500' },
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 10,
    alignItems: 'flex-start',
  },
  errorCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  errorText: { fontSize: 12, textAlign: 'center' },
  removeLink: { fontSize: 12, fontWeight: '600' },
  bottomPad: { height: 40 },
});
