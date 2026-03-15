import React from 'react';
import { useColorScheme } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SearchScreen } from '@/features/github/SearchScreen';
import { ProfileNavigator } from './ProfileNavigator';
import { Colors } from '@/utils/theme';

export type ExploreStackParamList = {
  Search: undefined;
  ProfileTabs: { username: string };
};

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export function ExploreStackNavigator() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <Stack.Navigator
      initialRouteName="Search"
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'GitHub Explorer' }}
      />
      <Stack.Screen
        name="ProfileTabs"
        component={ProfileNavigator}
        options={{ title: '' }}
      />
    </Stack.Navigator>
  );
}
