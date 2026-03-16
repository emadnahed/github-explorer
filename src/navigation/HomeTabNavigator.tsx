import React from 'react';
import { useColorScheme } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { ExploreStackNavigator, type ExploreStackParamList } from './ExploreStackNavigator';
import { ShortlistsScreen } from '@/features/github/ShortlistsScreen';
import { CompareScreen } from '@/features/github/CompareScreen';
import { Colors } from '@/utils/theme';

export type HomeTabParamList = {
  Explore: NavigatorScreenParams<ExploreStackParamList>;
  Shortlists: { addUsername?: string };
  Compare: undefined;
};

const Tab = createBottomTabNavigator<HomeTabParamList>();

export function HomeTabNavigator() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const sharedHeaderOptions = {
    headerStyle: { backgroundColor: colors.headerBg },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 },
    headerShadowVisible: false,
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'];
          if (route.name === 'Explore') iconName = 'search-outline';
          else if (route.name === 'Shortlists') iconName = 'list-outline';
          else iconName = 'swap-horizontal-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreStackNavigator}
        options={{ headerShown: false, tabBarLabel: 'Explore', tabBarButtonTestID: 'home-tab-explore' }}
      />
      <Tab.Screen
        name="Shortlists"
        component={ShortlistsScreen}
        options={{
          ...sharedHeaderOptions,
          title: 'Shortlists',
          tabBarLabel: 'Shortlists',
          tabBarButtonTestID: 'home-tab-shortlists',
        }}
      />
      <Tab.Screen
        name="Compare"
        component={CompareScreen}
        options={{
          ...sharedHeaderOptions,
          title: 'Compare',
          tabBarLabel: 'Compare',
          tabBarButtonTestID: 'home-tab-compare',
        }}
      />
    </Tab.Navigator>
  );
}
