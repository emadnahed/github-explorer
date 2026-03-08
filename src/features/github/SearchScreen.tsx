import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchUser,
  fetchRepos,
  addToHistory,
  clearHistory,
  setSearchQuery,
  type GitHubUser,
} from './githubSlice';
import { selectSearchHistory, selectBookmarks } from './githubSelectors';
import { SearchBar } from '@/components/SearchBar';
import { useTheme } from '@/hooks/useTheme';
import { formatNumber } from '@/utils/helpers';
import type { RootStackParamList } from '@/navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export function SearchScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const colors = useTheme();
  const [localQuery, setLocalQuery] = useState('');
  const searchHistory = useAppSelector(selectSearchHistory);
  const bookmarks = useAppSelector(selectBookmarks);
  const { currentUser, userLoading, userError, searchQuery } = useAppSelector(
    (state) => state.github,
  );

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'GitHub Explorer' });
  }, [navigation]);

  const handleSearch = useCallback(async () => {
    const username = localQuery.trim();
    if (!username) return;
    dispatch(setSearchQuery(username));
    const result = await dispatch(fetchUser(username));
    if (fetchUser.fulfilled.match(result)) {
      dispatch(addToHistory(username));
      dispatch(fetchRepos(username));
    }
  }, [localQuery, dispatch]);

  const handleSelectUser = useCallback(
    async (username: string) => {
      setLocalQuery(username);
      dispatch(setSearchQuery(username));
      const result = await dispatch(fetchUser(username));
      if (fetchUser.fulfilled.match(result)) {
        dispatch(addToHistory(username));
        dispatch(fetchRepos(username));
        navigation.navigate('ProfileTabs', { username });
      }
    },
    [dispatch, navigation],
  );

  const handleNavigateToProfile = useCallback(() => {
    if (currentUser) {
      navigation.navigate('ProfileTabs', { username: currentUser.login });
    }
  }, [currentUser, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchBar
        value={localQuery}
        onChangeText={setLocalQuery}
        onSubmit={handleSearch}
      />

      {/* Loading state */}
      {userLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Searching...
          </Text>
        </View>
      )}

      {/* Error state */}
      {userError && !userLoading && (
        <View style={[styles.errorBox, { backgroundColor: colors.surface, borderColor: colors.error }]}>
          <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>
            User not found: "{searchQuery}"
          </Text>
        </View>
      )}

      {/* Found user card */}
      {currentUser && !userLoading && !userError && (
        <UserResultCard user={currentUser} onPress={handleNavigateToProfile} />
      )}

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Search history */}
        {searchHistory.length > 0 && (
          <Section
            title="Recent Searches"
            action={
              <TouchableOpacity onPress={() => dispatch(clearHistory())}>
                <Text style={[styles.clearText, { color: colors.accent }]}>Clear</Text>
              </TouchableOpacity>
            }
          >
            <View style={styles.chips}>
              {searchHistory.map((username) => (
                <TouchableOpacity
                  key={username}
                  style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleSelectUser(username)}
                >
                  <Ionicons name="time-outline" size={12} color={colors.textSecondary} style={styles.chipIcon} />
                  <Text style={[styles.chipText, { color: colors.text }]}>{username}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>
        )}

        {/* Bookmarks */}
        {bookmarks.length > 0 && (
          <Section title="Bookmarked Developers">
            <View style={styles.chips}>
              {bookmarks.map((username) => (
                <TouchableOpacity
                  key={username}
                  style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleSelectUser(username)}
                >
                  <Ionicons name="bookmark" size={12} color={colors.accent} style={styles.chipIcon} />
                  <Text style={[styles.chipText, { color: colors.text }]}>{username}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>
        )}

        {/* Empty state */}
        {searchHistory.length === 0 && bookmarks.length === 0 && !currentUser && !userLoading && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Explore GitHub</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Search for any GitHub username to view their profile, repositories, and language insights.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function UserResultCard({ user, onPress }: { user: GitHubUser; onPress: () => void }) {
  const colors = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <Image source={{ uri: user.avatar_url }} style={styles.userAvatar} />
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
          {user.name ?? user.login}
        </Text>
        <Text style={[styles.userLogin, { color: colors.accent }]}>@{user.login}</Text>
        <View style={styles.userStats}>
          <Ionicons name="git-branch-outline" size={12} color={colors.textSecondary} />
          <Text style={[styles.userStatText, { color: colors.textSecondary }]}>
            {' '}{user.public_repos} repos
          </Text>
          <Text style={[styles.userStatSep, { color: colors.border }]}>  ·  </Text>
          <Ionicons name="people-outline" size={12} color={colors.textSecondary} />
          <Text style={[styles.userStatText, { color: colors.textSecondary }]}>
            {' '}{formatNumber(user.followers)} followers
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const colors = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 8,
    gap: 8,
  },
  loadingText: { fontSize: 14 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  errorText: { fontSize: 13, flex: 1 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  userAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
  userLogin: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
  userStats: { flexDirection: 'row', alignItems: 'center' },
  userStatText: { fontSize: 12 },
  userStatSep: { fontSize: 12 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  clearText: { fontSize: 12, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipIcon: { marginRight: 5 },
  chipText: { fontSize: 13, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
