import React, { useLayoutEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileScreen } from '@/features/github/ProfileScreen';
import { RepositoriesScreen } from '@/features/github/RepositoriesScreen';
import { LanguageInsightsScreen } from '@/features/github/LanguageInsightsScreen';
import { useTheme } from '@/hooks/useTheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleBookmark } from '@/features/github/githubSlice';
import type { RootStackParamList } from './RootNavigator';

export type ProfileTabParamList = {
  Profile: { username: string };
  Repositories: { username: string };
  LanguageInsights: { username: string };
};

const Tab = createBottomTabNavigator<ProfileTabParamList>();

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileTabs'>;

export function ProfileNavigator({ route, navigation }: Props) {
  const { username } = route.params;
  const colors = useTheme();
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector((state) => state.github.bookmarks);
  const isBookmarked = bookmarks.includes(username.toLowerCase());

  useLayoutEffect(() => {
    navigation.setOptions({
      title: username,
      headerRight: () => (
        <TouchableOpacity
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
      ),
    });
  }, [navigation, username, isBookmarked, colors.accent, dispatch]);

  return (
    <Tab.Navigator
      screenOptions={({ route: tabRoute }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          let iconName: string;
          if (tabRoute.name === 'Profile') iconName = 'person-outline';
          else if (tabRoute.name === 'Repositories') iconName = 'git-branch-outline';
          else iconName = 'pie-chart-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{ username }}
        options={{ tabBarLabel: 'Profile' }}
      />
      <Tab.Screen
        name="Repositories"
        component={RepositoriesScreen}
        initialParams={{ username }}
        options={{ tabBarLabel: 'Repos' }}
      />
      <Tab.Screen
        name="LanguageInsights"
        component={LanguageInsightsScreen}
        initialParams={{ username }}
        options={{ tabBarLabel: 'Languages' }}
      />
    </Tab.Navigator>
  );
}
