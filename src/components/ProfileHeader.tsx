import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { formatDate } from '@/utils/helpers';
import type { GitHubUser } from '@/features/github/githubSlice';

interface Props {
  user: GitHubUser;
}

export const ProfileHeader = memo(({ user }: Props) => {
  const colors = useTheme();

  const handleBlogPress = () => {
    if (user.blog) {
      const url = user.blog.startsWith('http') ? user.blog : `https://${user.blog}`;
      Linking.openURL(url);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Image source={{ uri: user.avatar_url }} style={styles.avatar} />

      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {user.name ?? user.login}
      </Text>
      <Text style={[styles.login, { color: colors.accent }]}>@{user.login}</Text>

      {user.bio ? (
        <Text style={[styles.bio, { color: colors.textSecondary }]} numberOfLines={3}>
          {user.bio}
        </Text>
      ) : null}

      <View style={styles.metaContainer}>
        {user.company ? (
          <MetaRow icon="business-outline" text={user.company} color={colors.textSecondary} />
        ) : null}
        {user.location ? (
          <MetaRow icon="location-outline" text={user.location} color={colors.textSecondary} />
        ) : null}
        {user.email ? (
          <MetaRow icon="mail-outline" text={user.email} color={colors.textSecondary} />
        ) : null}
        {user.blog ? (
          <TouchableOpacity onPress={handleBlogPress}>
            <MetaRow icon="link-outline" text={user.blog} color={colors.accent} />
          </TouchableOpacity>
        ) : null}
        <MetaRow
          icon="calendar-outline"
          text={`Joined ${formatDate(user.created_at)}`}
          color={colors.textSecondary}
        />
      </View>
    </View>
  );
});

function MetaRow({ icon, text, color }: { icon: string; text: string; color: string }) {
  return (
    <View style={styles.metaRow}>
      <Ionicons name={icon as any} size={14} color={color} style={styles.metaIcon} />
      <Text style={[styles.metaText, { color }]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 14,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  login: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
    maxWidth: 300,
  },
  metaContainer: {
    width: '100%',
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 8,
    width: 16,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});
