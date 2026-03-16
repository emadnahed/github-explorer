import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleBookmark, toggleCompare } from '@/features/github/githubSlice';
import { ProfileScreen } from './ProfileScreen';
import { RepositoriesScreen } from './RepositoriesScreen';
import { LanguageInsightsScreen } from './LanguageInsightsScreen';
import { useTheme } from '@/hooks/useTheme';
import type { ExploreStackParamList } from '@/navigation/ExploreStackNavigator';
import type { HomeTabParamList } from '@/navigation/HomeTabNavigator';

type Props = NativeStackScreenProps<ExploreStackParamList, 'ProfileTabs'>;

type Tab = 'Profile' | 'Repos' | 'Languages';

const TABS: { key: Tab; label: string; testID: string }[] = [
  { key: 'Profile', label: 'Profile', testID: 'profile-tab-profile' },
  { key: 'Repos', label: 'Repos', testID: 'profile-tab-repos' },
  { key: 'Languages', label: 'Languages', testID: 'profile-tab-languages' },
];

export function ProfileTabsScreen({ route, navigation }: Props) {
  const { username } = route.params;
  const colors = useTheme();
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<Tab>('Profile');
  const [tabBarWidth, setTabBarWidth] = useState(0);
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  const bookmarks = useAppSelector((state) => state.github.bookmarks);
  const compareList = useAppSelector((state) => state.github.compareList);
  const isBookmarked = bookmarks.includes(username.toLowerCase());
  const isInCompare = compareList.includes(username.toLowerCase());
  const canAddToCompare = compareList.length < 2 || isInCompare;

  const handleTabPress = useCallback(
    (tab: Tab, index: number) => {
      setActiveTab(tab);
      Animated.timing(indicatorAnim, {
        toValue: index,
        duration: 200,
        useNativeDriver: true,
      }).start();
    },
    [indicatorAnim],
  );

  useLayoutEffect(() => {
    const parentNav = navigation.getParent<BottomTabNavigationProp<HomeTabParamList>>();

    navigation.setOptions({
      title: username,
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            testID="profile-header-list-btn"
            onPress={() => parentNav?.navigate('Shortlists', { addUsername: username })}
            style={{ padding: 6 }}
            accessibilityLabel="Add to shortlist"
          >
            <Ionicons name="list-outline" size={22} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            testID="profile-header-compare-btn"
            onPress={() => dispatch(toggleCompare(username))}
            style={{ padding: 6 }}
            disabled={!canAddToCompare}
            accessibilityLabel={isInCompare ? 'Remove from compare' : 'Add to compare'}
          >
            <Ionicons
              name="swap-horizontal-outline"
              size={22}
              color={
                isInCompare
                  ? colors.accentGreen
                  : canAddToCompare
                    ? colors.accent
                    : colors.textMuted
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            testID="profile-header-bookmark-btn"
            onPress={() => dispatch(toggleBookmark(username))}
            style={{ marginRight: 4, padding: 6 }}
            accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark developer'}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={colors.accent}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [
    navigation,
    username,
    isBookmarked,
    isInCompare,
    canAddToCompare,
    colors.accent,
    colors.accentGreen,
    colors.textMuted,
    dispatch,
  ]);

  const tabWidth = tabBarWidth / TABS.length;
  const translateX = indicatorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, tabWidth, tabWidth * 2],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Top tab bar ── */}
      <View
        style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
        onLayout={(e) => setTabBarWidth(e.nativeEvent.layout.width)}
      >
        {TABS.map(({ key, label, testID }, index) => {
          const isActive = activeTab === key;
          return (
            <TouchableOpacity
              key={key}
              testID={testID}
              style={styles.tab}
              onPress={() => handleTabPress(key, index)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? colors.accent : colors.textSecondary },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Animated underline indicator */}
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: colors.accent, width: tabWidth || `${100 / TABS.length}%`, transform: [{ translateX }] },
          ]}
        />
      </View>

      {/* ── Tab content ── */}
      <View style={styles.content}>
        {activeTab === 'Profile' && <ProfileScreen />}
        {activeTab === 'Repos' && <RepositoriesScreen username={username} />}
        {activeTab === 'Languages' && <LanguageInsightsScreen username={username} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    height: 44,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    borderRadius: 1,
  },
  content: { flex: 1 },
});
