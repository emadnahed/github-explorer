import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchRepos, setRepoSort, type GitHubRepo, type RepoSort } from './githubSlice';
import { selectSortedRepos } from './githubSelectors';
import { RepoCard } from '@/components/RepoCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useTheme } from '@/hooks/useTheme';

const SORT_OPTIONS: { key: RepoSort; label: string }[] = [
  { key: 'stars', label: 'Stars' },
  { key: 'updated', label: 'Updated' },
  { key: 'name', label: 'A-Z' },
];

export function RepositoriesScreen({ username }: { username: string }) {
  const dispatch = useAppDispatch();
  const colors = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const sortedRepos = useAppSelector(selectSortedRepos);
  const { reposLoading, reposError, repoSort } = useAppSelector((state) => state.github);

  useEffect(() => {
    if (sortedRepos.length === 0 && !reposLoading) {
      dispatch(fetchRepos(username));
    }
  }, [username]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchRepos(username));
    setRefreshing(false);
  }, [dispatch, username]);

  const keyExtractor = useCallback((item: GitHubRepo) => String(item.id), []);

  const renderItem: ListRenderItem<GitHubRepo> = useCallback(
    ({ item }) => <RepoCard repo={item} />,
    [],
  );

  if (reposLoading && sortedRepos.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SkeletonLoader />
      </View>
    );
  }

  if (reposError && sortedRepos.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load repositories
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sort bar */}
      <View style={[styles.sortBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {SORT_OPTIONS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            testID={`repo-sort-${key}`}
            onPress={() => dispatch(setRepoSort(key))}
            style={[
              styles.sortBtn,
              repoSort === key && { backgroundColor: colors.accent },
            ]}
          >
            <Text
              style={[
                styles.sortLabel,
                { color: repoSort === key ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}

        {reposLoading && <ActivityIndicator size="small" color={colors.accent} style={styles.loadingIndicator} />}
      </View>

      <FlatList
        testID="repos-list"
        data={sortedRepos}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          !reposLoading ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No public repositories
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 14, textAlign: 'center' },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  sortBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sortLabel: { fontSize: 13, fontWeight: '600' },
  loadingIndicator: { marginLeft: 'auto' },
  list: { paddingTop: 8, paddingBottom: 32 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14 },
});
