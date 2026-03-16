import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
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
import { apiClient } from '@/api/githubApi';
import { storage } from '@/utils/storage';
import type { ExploreStackParamList } from '@/navigation/ExploreStackNavigator';

type Props = NativeStackScreenProps<ExploreStackParamList, 'Search'>;

// ─── Types ───────────────────────────────────────────────────────────────────

interface TrendingUser {
  login: string;
  avatar_url: string;
}

interface TrendingRepo {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  owner: { login: string; avatar_url: string };
}

// ─── Static data ─────────────────────────────────────────────────────────────

const LANG_COLORS: Record<string, string> = {
  JavaScript: '#F7DF1E',
  TypeScript: '#3178C6',
  Python: '#3572A5',
  Java: '#B07219',
  Go: '#00ADD8',
  Rust: '#CE412B',
  Ruby: '#CC342D',
  'C++': '#F34B7D',
  C: '#555555',
  Swift: '#FA7343',
  Kotlin: '#A97BFF',
  'C#': '#178600',
  PHP: '#4F5D95',
  Shell: '#89E051',
  Dart: '#00B4AB',
};

const EXPLORE_TOPICS: Array<{
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}> = [
  { label: 'JavaScript', icon: 'logo-javascript', color: '#F7DF1E' },
  { label: 'Python', icon: 'logo-python', color: '#3572A5' },
  { label: 'TypeScript', icon: 'code-slash-outline', color: '#3178C6' },
  { label: 'Rust', icon: 'hardware-chip-outline', color: '#CE412B' },
  { label: 'Go', icon: 'aperture-outline', color: '#00ADD8' },
  { label: 'React', icon: 'logo-react', color: '#61DAFB' },
  { label: 'ML / AI', icon: 'analytics-outline', color: '#FF6B35' },
  { label: 'DevOps', icon: 'git-branch-outline', color: '#7C3AED' },
  { label: 'Mobile', icon: 'phone-portrait-outline', color: '#34C759' },
  { label: 'Security', icon: 'shield-checkmark-outline', color: '#FF3B30' },
];

const TRENDING_DEVS_URL =
  '/search/users?q=followers:>50000&sort=followers&order=desc&per_page=8';
const TRENDING_REPOS_URL =
  '/search/repositories?q=stars:>100000&sort=stars&order=desc&per_page=8';

// ─── Trending cache ───────────────────────────────────────────────────────────
// Two-level cache to minimise GitHub search API usage (10 req/min limit):
//  1. Module-level var: survives React Navigation remounts within a session.
//  2. MMKV: survives device.reloadReactNative() (JS bundle reload in tests).
// Both caches are reset when the native app restarts (device.launchApp newInstance).
const TRENDING_MMKV_KEY = 'trending_cache_v1';
const TRENDING_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface TrendingCachePayload {
  devs: TrendingUser[];
  repos: TrendingRepo[];
  ts: number;
}

let trendingMemCache: TrendingCachePayload | null = null;

function readTrendingCache(): TrendingCachePayload | null {
  if (trendingMemCache) return trendingMemCache;
  try {
    const raw = storage.getString(TRENDING_MMKV_KEY);
    if (!raw) return null;
    const parsed: TrendingCachePayload = JSON.parse(raw);
    if (Date.now() - parsed.ts > TRENDING_TTL_MS) return null;
    trendingMemCache = parsed;
    return parsed;
  } catch {
    return null;
  }
}

function writeTrendingCache(devs: TrendingUser[], repos: TrendingRepo[]): void {
  const payload: TrendingCachePayload = { devs, repos, ts: Date.now() };
  trendingMemCache = payload;
  try {
    storage.set(TRENDING_MMKV_KEY, JSON.stringify(payload));
  } catch {
    // Non-fatal — in-memory cache still works
  }
}

const GITHUB_STATS: Array<{
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}> = [
  { icon: 'git-branch-outline', label: 'Repos', value: '420M+' },
  { icon: 'people-outline', label: 'Developers', value: '100M+' },
  { icon: 'star-outline', label: 'Stars', value: '10B+' },
  { icon: 'globe-outline', label: 'Countries', value: '200+' },
];

// ─── Screen ──────────────────────────────────────────────────────────────────

export function SearchScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const colors = useTheme();
  const [localQuery, setLocalQuery] = useState('');
  const searchHistory = useAppSelector(selectSearchHistory);
  const bookmarks = useAppSelector(selectBookmarks);
  const { currentUser, userLoading, userError, searchQuery } = useAppSelector(
    (state) => state.github,
  );

  const cached = readTrendingCache();
  const [trendingDevs, setTrendingDevs] = useState<TrendingUser[]>(cached?.devs ?? []);
  const [trendingRepos, setTrendingRepos] = useState<TrendingRepo[]>(cached?.repos ?? []);
  const [trendingLoading, setTrendingLoading] = useState(!cached);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'GitHub Explorer' });
  }, [navigation]);

  useEffect(() => {
    if (readTrendingCache()) return; // Cache hit — skip network call
    let cancelled = false;
    async function loadTrending() {
      setTrendingLoading(true);
      try {
        const [devsRes, reposRes] = await Promise.all([
          apiClient.get(TRENDING_DEVS_URL, { timeout: 5000 }),
          apiClient.get(TRENDING_REPOS_URL, { timeout: 5000 }),
        ]);
        if (!cancelled) {
          const devs = (devsRes.data.items as TrendingUser[]) ?? [];
          const repos = (reposRes.data.items as TrendingRepo[]) ?? [];
          writeTrendingCache(devs, repos);
          setTrendingDevs(devs);
          setTrendingRepos(repos);
        }
      } catch (error) {
        console.error('Failed to load trending data:', error);
      } finally {
        if (!cancelled) setTrendingLoading(false);
      }
    }
    loadTrending();
    return () => {
      cancelled = true;
    };
  }, []);

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
          testID="search-error-box"
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
        {/* Recent searches */}
        {searchHistory.length > 0 && (
          <Section
            title="Recent Searches"
            action={
              <TouchableOpacity testID="history-clear-btn" onPress={() => dispatch(clearHistory())}>
                <Text style={[styles.clearText, { color: colors.accent }]}>Clear</Text>
              </TouchableOpacity>
            }
          >
            <View style={styles.chips}>
              {searchHistory.map((username) => (
                <TouchableOpacity
                  key={username}
                  testID={`history-chip-${username}`}
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

        {/* Bookmarks */}
        {bookmarks.length > 0 && (
          <Section title="Bookmarked Developers">
            <View style={styles.chips}>
              {bookmarks.map((username) => (
                <TouchableOpacity
                  key={username}
                  testID={`bookmark-chip-${username}`}
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

        {/* Top Developers */}
        <Section title="Top Developers on GitHub">
          {trendingLoading ? (
            <View style={styles.trendingPlaceholder}>
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
          ) : trendingDevs.length > 0 ? (
            <FlatList
              horizontal
              data={trendingDevs}
              keyExtractor={(item) => item.login}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList}
              renderItem={({ item }) => (
                <TrendingDevCard dev={item} onPress={() => handleSelectUser(item.login)} />
              )}
            />
          ) : null}
        </Section>

        {/* Most Starred Repos */}
        <Section title="Most Starred Repositories">
          {trendingLoading ? (
            <View style={styles.trendingPlaceholder}>
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
          ) : trendingRepos.length > 0 ? (
            <FlatList
              horizontal
              data={trendingRepos}
              keyExtractor={(item) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList}
              renderItem={({ item }) => <TrendingRepoCard repo={item} />}
            />
          ) : null}
        </Section>

        {/* Explore by Topic */}
        <Section title="Explore by Topic">
          <View style={styles.topicWrap}>
            {EXPLORE_TOPICS.map((topic) => (
              <TopicChip
                  key={topic.label}
                  topic={topic}
                  onPress={() => setLocalQuery(topic.label)}
                />
            ))}
          </View>
        </Section>

        {/* GitHub by the Numbers */}
        <GitHubStatsBanner />

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function UserResultCard({ user, onPress }: { user: GitHubUser; onPress: () => void }) {
  const colors = useTheme();
  return (
    <Pressable
      testID="user-result-card"
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

function TrendingDevCard({ dev, onPress }: { dev: TrendingUser; onPress: () => void }) {
  const colors = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.devCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <Image source={{ uri: dev.avatar_url }} style={styles.devAvatar} />
      <Text style={[styles.devLogin, { color: colors.text }]} numberOfLines={1}>
        @{dev.login}
      </Text>
      <View style={[styles.devBadge, { backgroundColor: colors.accent + '18' }]}>
        <Ionicons name="trending-up" size={10} color={colors.accent} />
        <Text style={[styles.devBadgeText, { color: colors.accent }]}>Top</Text>
      </View>
    </Pressable>
  );
}

function TrendingRepoCard({ repo }: { repo: TrendingRepo }) {
  const colors = useTheme();
  const langColor = repo.language
    ? (LANG_COLORS[repo.language] ?? colors.accent)
    : colors.textMuted;
  return (
    <View
      style={[styles.repoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.repoCardHeader}>
        <Image source={{ uri: repo.owner.avatar_url }} style={styles.repoOwnerAvatar} />
        <Text style={[styles.repoOwner, { color: colors.textSecondary }]} numberOfLines={1}>
          {repo.owner.login}
        </Text>
      </View>
      <Text style={[styles.repoName, { color: colors.text }]} numberOfLines={1}>
        {repo.name}
      </Text>
      {repo.description ? (
        <Text style={[styles.repoDesc, { color: colors.textSecondary }]} numberOfLines={2}>
          {repo.description}
        </Text>
      ) : null}
      <View style={styles.repoFooter}>
        <Ionicons name="star" size={12} color={colors.star} />
        <Text style={[styles.repoStat, { color: colors.textSecondary }]}>
          {' '}
          {formatNumber(repo.stargazers_count)}
        </Text>
        {repo.language ? (
          <>
            <View style={[styles.langDot, { backgroundColor: langColor }]} />
            <Text style={[styles.repoStat, { color: colors.textSecondary }]}>{repo.language}</Text>
          </>
        ) : null}
      </View>
    </View>
  );
}

function TopicChip({
  topic,
  onPress,
}: {
  topic: (typeof EXPLORE_TOPICS)[number];
  onPress: () => void;
}) {
  const colors = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.topicChip,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Ionicons name={topic.icon} size={14} color={topic.color} />
      <Text style={[styles.topicLabel, { color: colors.text }]}>{topic.label}</Text>
    </TouchableOpacity>
  );
}

function GitHubStatsBanner() {
  const colors = useTheme();
  return (
    <View
      style={[
        styles.statsBanner,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.statsBannerTitle, { color: colors.textMuted }]}>
        GITHUB BY THE NUMBERS
      </Text>
      <View style={styles.statsRow}>
        {GITHUB_STATS.map((s) => (
          <View key={s.label} style={styles.statItem}>
            <Ionicons name={s.icon} size={20} color={colors.accent} />
            <Text style={[styles.statValue, { color: colors.text }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
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

// ─── Styles ──────────────────────────────────────────────────────────────────

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
  // User result card
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
  // Section
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  clearText: { fontSize: 12, fontWeight: '600' },
  // Chips
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
  // Trending placeholders
  trendingPlaceholder: { height: 130, justifyContent: 'center', alignItems: 'center' },
  hList: { gap: 10, paddingRight: 20 },
  // Trending dev card
  devCard: {
    width: 96,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  devAvatar: { width: 52, height: 52, borderRadius: 26 },
  devLogin: { fontSize: 11, fontWeight: '600', textAlign: 'center', width: 76 },
  devBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  devBadgeText: { fontSize: 10, fontWeight: '600' },
  // Trending repo card
  repoCard: {
    width: 224,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 130,
  },
  repoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  repoOwnerAvatar: { width: 18, height: 18, borderRadius: 9 },
  repoOwner: { fontSize: 11, fontWeight: '500', flex: 1 },
  repoName: { fontSize: 14, fontWeight: '700', letterSpacing: -0.3, marginBottom: 4 },
  repoDesc: { fontSize: 12, lineHeight: 17, marginBottom: 8 },
  repoFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  repoStat: { fontSize: 11 },
  langDot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 6 },
  // Topic chips
  topicWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  topicLabel: { fontSize: 13, fontWeight: '500' },
  // Stats banner
  statsBanner: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  statsBannerTitle: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 14,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 15, fontWeight: '700', letterSpacing: -0.5 },
  statLabel: { fontSize: 10 },
  bottomPad: { height: 24 },
});
