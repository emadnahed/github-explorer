import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ProfileHeader } from '@/components/ProfileHeader';
import { StatsCard } from '@/components/StatsCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { DeveloperScore } from '@/components/DeveloperScore';
import { useTheme } from '@/hooks/useTheme';
import { setNote } from './githubSlice';
import { selectRecruiterNote } from './githubSelectors';

export function ProfileScreen() {
  const colors = useTheme();
  const { currentUser, userLoading, userError, repos, reposLoading } = useAppSelector(
    (state) => state.github,
  );

  if (userLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SkeletonLoader />
      </View>
    );
  }

  if (userError || !currentUser) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {userError ?? 'No user loaded'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
    <ScrollView
      testID="profile-scroll"
      style={styles.scrollFill}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
    >
      <ProfileHeader user={currentUser} />
      <View style={{ marginVertical: 10 }} />
      {!reposLoading && repos.length > 0 && (
        <DeveloperScore user={currentUser} repos={repos} />
      )}

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.statsSection}>
        <Text style={[styles.statsTitle, { color: colors.textSecondary }]}>Stats</Text>
        <View style={styles.statsRow}>
          <StatsCard
            icon="git-branch-outline"
            count={currentUser.public_repos}
            label="Repos"
            color={colors.accent}
          />
          <StatsCard
            icon="people-outline"
            count={currentUser.followers}
            label="Followers"
            color={colors.accentGreen}
          />
          <StatsCard
            icon="person-add-outline"
            count={currentUser.following}
            label="Following"
            color={colors.star}
          />
        </View>
      </View>

      {currentUser.public_gists > 0 && (
        <View style={[styles.gistRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.gistLabel, { color: colors.textSecondary }]}>Public Gists</Text>
          <Text style={[styles.gistCount, { color: colors.text }]}>
            {currentUser.public_gists}
          </Text>
        </View>
      )}

      <RecruiterNotes username={currentUser.login} />

      <View style={styles.bottomPad} />
    </ScrollView>
    </View>
  );
}

function RecruiterNotes({ username }: { username: string }) {
  const dispatch = useAppDispatch();
  const colors = useTheme();
  const storedNote = useAppSelector(selectRecruiterNote(username));
  const [text, setText] = useState(storedNote);
  const [saved, setSaved] = useState(false);
  const prevUsernameRef = useRef(username);

  useEffect(() => {
    if (prevUsernameRef.current !== username) {
      prevUsernameRef.current = username;
      setText(storedNote);
      setSaved(false);
    }
  }, [username, storedNote]);

  useEffect(() => {
    if (!saved) return;
    const timerId = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(timerId);
  }, [saved]);

  const handleSave = useCallback(() => {
    dispatch(setNote({ username, note: text }));
    setSaved(true);
  }, [dispatch, username, text]);

  return (
    <View style={styles.notesSection}>
      <Text style={[styles.notesTitle, { color: colors.textSecondary }]}>Recruiter Notes</Text>
      <TextInput
        testID="recruiter-notes-input"
        style={[
          styles.notesInput,
          {
            backgroundColor: colors.inputBg,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        placeholder="Add private notes about this candidate..."
        placeholderTextColor={colors.textMuted}
        multiline
        textAlignVertical="top"
        value={text}
        onChangeText={(v) => {
          setText(v);
          setSaved(false);
        }}
      />
      <TouchableOpacity
        testID="recruiter-notes-save-btn"
        style={[
          styles.saveBtn,
          { backgroundColor: saved ? colors.accentGreen : colors.accent },
        ]}
        onPress={handleSave}
        activeOpacity={0.8}
      >
        <Text style={styles.saveBtnText}>{saved ? 'Saved!' : 'Save Note'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollFill: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 14, textAlign: 'center' },
  divider: { height: 1, marginHorizontal: 20, marginBottom: 20 },
  statsSection: { paddingHorizontal: 20, marginBottom: 16 },
  statsTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  statsRow: { flexDirection: 'row' },
  gistRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  gistLabel: { fontSize: 14, fontWeight: '500' },
  gistCount: { fontSize: 16, fontWeight: '700' },
  notesSection: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 96,
  },
  saveBtn: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPad: { height: 32 },
});
