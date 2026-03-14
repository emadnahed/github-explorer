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
  fetchUserSearch,
  setSearchFilters,
  clearSearchResults,
  type GitHubUser,
  type GitHubSearchUser,
} from './githubSlice';
import {
  selectSearchHistory,
  selectBookmarks,
  selectSearchResults,
  selectSearchFilters,
} from './githubSelectors';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { useTheme } from '@/hooks/useTheme';
import { formatNumber } from '@/utils/helpers';
import type { AppColors } from '@/utils/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;
type SearchMode = 'username' | 'talent';

export function SearchScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const colors = useTheme();
  const [mode, setMode] = useState<SearchMode>('username');
  const [localQuery, setLocalQuery] = useState('');
  const [talentKeyword, setTalentKeyword] = useState('');

  const searchHistory = useAppSelector(selectSearchHistory);
  const bookmarks = useAppSelector(selectBookmarks);
  const searchResults = useAppSelector(selectSearchResults);
  const searchFilters = useAppSelector(selectSearchFilters);
  const {
    currentUser,
    userLoading,
    userError,
    searchQuery,
    searchResultsLoading,
    searchResultsError,
  } = useAppSelector((state) => state.github);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'GitHub Talent Scout' });
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

  const handleTalentSearch = useCallback(() => {
    const hasContent =
      talentKeyword.trim() ||
      searchFilters.language ||
      searchFilters.location ||
      searchFilters.minFollowers;
    if (!hasContent) return;
    dispatch(fetchUserSearch({ query: talentKeyword, filters: searchFilters }));
  }, [talentKeyword, searchFilters, dispatch]);

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

  const handleModeChange = useCallback(
    (newMode: SearchMode) => {
      setMode(newMode);
      if (newMode === 'talent') dispatch(clearSearchResults());
    },
    [dispatch],
  );

  const handleFiltersChange = useCallback(
    (f: typeof searchFilters) => {
      dispatch(setSearchFilters(f));
    },
    [dispatch],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Mode toggle */}
      <View style={[styles.modeRow, { borderBottomColor: colors.border }]}>
        <ModeTab
          label="Username"
          icon="person-outline"
          active={mode === 'username'}
          onPress={() => handleModeChange('username')}
          colors={colors}
        />
        <ModeTab
          label="Talent Search"
          icon="people-outline"
          active={mode === 'talent'}
          onPress={() => handleModeChange('talent')}
          colors={colors}
        />
      </View>

      {mode === 'username' ? (
        <>
          <SearchBar
            value={localQuery}
            onChangeText={setLocalQuery}
            onSubmit={handleSearch}
          />

          {userLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Searching...
              </Text>
            </View>
          )}

          {userError && !userLoading && (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: colors.surface, borderColor: colors.error },
              ]}
            >
              <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>
                User not found: "{searchQuery}"
              </Text>
            </View>
          )}

          {currentUser && !userLoading && !userError && (
            <UserResultCard user={currentUser} onPress={handleNavigateToProfile} />
          )}

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
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
                      style={[
                        styles.chip,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}
                      onPress={() => handleSelectUser(username)}
                    >
                      <Ionicons
                        name="time-outline"
                        size={12}
                        color={colors.textSecondary}
                        style={styles.chipIcon}
                      />
                      <Text style={[styles.chipText, { color: colors.text }]}>{username}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Section>
            )}

            {bookmarks.length > 0 && (
              <Section title="Bookmarked Developers">
                <View style={styles.chips}>
                  {bookmarks.map((username) => (
                    <TouchableOpacity
                      key={username}
                      style={[
                        styles.chip,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}
                      onPress={() => handleSelectUser(username)}
                    >
                      <Ionicons
                        name="bookmark"
                        size={12}
                        color={colors.accent}
                        style={styles.chipIcon}
                      />
                      <Text style={[styles.chipText, { color: colors.text }]}>{username}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Section>
            )}

            {searchHistory.length === 0 &&
              bookmarks.length === 0 &&
              !currentUser &&
              !userLoading && (
                <View style={styles.emptyState}>
                  <Ionicons name="person-outline" size={48} color={colors.textMuted} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>Find a Developer</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    Enter a GitHub username to view their profile, score, and repositories.
                  </Text>
                </View>
              )}
          </ScrollView>
        </>
      ) : (
        <>
          <SearchBar
            value={talentKeyword}
            onChangeText={setTalentKeyword}
            onSubmit={handleTalentSearch}
            placeholder="Name, company, keyword..."
          />

          <FilterPanel
            filters={searchFilters}
            onChange={handleFiltersChange}
            onApply={handleTalentSearch}
          />

          {searchResultsLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Searching developers...
              </Text>
            </View>
          )}

          {searchResultsError && !searchResultsLoading && (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: colors.surface, borderColor: colors.error },
              ]}
            >
              <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>
                {searchResultsError}
              </Text>
            </View>
          )}

          {searchResults.length > 0 && !searchResultsLoading && (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TalentCard
                  user={item}
                  onPress={() => handleSelectUser(item.login)}
                  colors={colors}
                />
              )}
              style={styles.scroll}
              contentContainerStyle={styles.listContent}
              ListHeaderComponent={
                <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
                  {searchResults.length} developer
                  {searchResults.length !== 1 ? 's' : ''} found
                </Text>
              }
              showsVerticalScrollIndicator={false}
            />
          )}

          {!searchResultsLoading && !searchResultsError && searchResults.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Discover Talent</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Filter by language, location, and followers to find the right candidates.
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

function ModeTab({
  label,
  icon,
  active,
  onPress,
  colors,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  active: boolean;
  onPress: () => void;
  colors: AppColors;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.modeTab,
        active && { borderBottomColor: colors.accent, borderBottomWidth: 2 },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={15}
        color={active ? colors.accent : colors.textSecondary}
      />
      <Text
        style={[
          styles.modeTabText,
          { color: active ? colors.accent : colors.textSecondary },
          active && { fontWeight: '700' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function TalentCard({
  user,
  onPress,
  colors,
}: {
  user: GitHubSearchUser;
  onPress: () => void;
  colors: AppColors;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.talentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <Image source={{ uri: user.avatar_url }} style={styles.talentAvatar} />
      <View style={styles.talentInfo}>
        <Text style={[styles.talentLogin, { color: colors.text }]}>{user.login}</Text>
        <Text style={[styles.talentType, { color: colors.textMuted }]}>{user.type}</Text>
      </View>
      <View style={[styles.viewBtn, { backgroundColor: colors.accent + '18', borderColor: colors.accent }]}>
        <Text style={[styles.viewBtnText, { color: colors.accent }]}>View</Text>
        <Ionicons name="chevron-forward" size={13} color={colors.accent} />
      </View>
    </Pressable>
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
            {' '}
            {user.public_repos} repos
          </Text>
          <Text style={[styles.userStatSep, { color: colors.border }]}>  ·  </Text>
          <Ionicons name="people-outline" size={12} color={colors.textSecondary} />
          <Text style={[styles.userStatText, { color: colors.textSecondary }]}>
            {' '}
            {formatNumber(user.followers)} followers
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
  modeRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginRight: 24,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
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
  talentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  talentAvatar: { width: 42, height: 42, borderRadius: 21, marginRight: 12 },
  talentInfo: { flex: 1 },
  talentLogin: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
  talentType: { fontSize: 12, marginTop: 1 },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 3,
  },
  viewBtnText: { fontSize: 12, fontWeight: '600' },
  resultCount: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  listContent: { paddingTop: 12, paddingBottom: 24 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
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
