import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  createShortlist,
  deleteShortlist,
  addToShortlist,
  removeFromShortlist,
  toggleCompare,
} from './githubSlice';
import { selectShortlists, selectCompareList } from './githubSelectors';
import { useTheme } from '@/hooks/useTheme';
import type { HomeTabParamList } from '@/navigation/HomeTabNavigator';

type Props = BottomTabScreenProps<HomeTabParamList, 'Shortlists'>;

export function ShortlistsScreen({ route, navigation }: Props) {
  const colors = useTheme();
  const dispatch = useAppDispatch();
  const shortlists = useAppSelector(selectShortlists);
  const compareList = useAppSelector(selectCompareList);

  const addUsername = route.params.addUsername;
  const [newName, setNewName] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const shortlistNames = Object.keys(shortlists);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    if (shortlists[name] !== undefined) {
      Alert.alert('Already Exists', `A shortlist named "${name}" already exists.`);
      return;
    }
    dispatch(createShortlist(name));
    setNewName('');
    setExpanded((prev) => new Set(prev).add(name));
    if (addUsername) {
      dispatch(addToShortlist({ name, username: addUsername }));
      navigation.goBack();
    }
  };

  const handleDelete = (name: string) => {
    Alert.alert('Delete Shortlist', `Remove "${name}" and all its members?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch(deleteShortlist(name));
          setExpanded((prev) => {
            const next = new Set(prev);
            next.delete(name);
            return next;
          });
        },
      },
    ]);
  };

  const toggleExpand = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleAddToShortlist = (name: string) => {
    if (!addUsername) return;
    dispatch(addToShortlist({ name, username: addUsername }));
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Add-mode banner */}
      {addUsername && (
        <View
          style={[
            styles.banner,
            { backgroundColor: `${colors.accent}18`, borderColor: colors.accent },
          ]}
        >
          <Ionicons name="list-outline" size={16} color={colors.accent} />
          <Text style={[styles.bannerText, { color: colors.accent }]}>
            Adding <Text style={{ fontWeight: '700' }}>@{addUsername}</Text> — pick a shortlist or
            create a new one.
          </Text>
        </View>
      )}

      {/* New shortlist input */}
      <View style={[styles.inputRow, { borderBottomColor: colors.border }]}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="New shortlist name…"
          placeholderTextColor={colors.textMuted}
          value={newName}
          onChangeText={setNewName}
          onSubmitEditing={handleCreate}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[
            styles.addBtn,
            { backgroundColor: colors.accent, opacity: newName.trim() ? 1 : 0.4 },
          ]}
          onPress={handleCreate}
          activeOpacity={0.8}
          disabled={!newName.trim()}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Empty state */}
      {shortlistNames.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="list-outline" size={52} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Shortlists Yet</Text>
          <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
            Create a shortlist to organise candidates for a role or search.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {shortlistNames.map((name) => {
            const members = shortlists[name];
            const isExpanded = expanded.has(name);
            const alreadyAdded = addUsername && members.includes(addUsername.toLowerCase());

            return (
              <View
                key={name}
                style={[
                  styles.shortlistCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                {/* Card header row */}
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => (addUsername ? handleAddToShortlist(name) : toggleExpand(name))}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeaderLeft}>
                    {!addUsername && (
                      <Ionicons
                        name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                        size={16}
                        color={colors.textMuted}
                      />
                    )}
                    <View>
                      <Text style={[styles.shortlistName, { color: colors.text }]}>{name}</Text>
                      <Text style={[styles.memberCount, { color: colors.textSecondary }]}>
                        {members.length} {members.length === 1 ? 'member' : 'members'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardHeaderRight}>
                    {addUsername ? (
                      <View
                        style={[
                          styles.addTag,
                          {
                            backgroundColor: alreadyAdded
                              ? `${colors.accentGreen}18`
                              : `${colors.accent}18`,
                            borderColor: alreadyAdded ? colors.accentGreen : colors.accent,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.addTagText,
                            { color: alreadyAdded ? colors.accentGreen : colors.accent },
                          ]}
                        >
                          {alreadyAdded ? 'Added ✓' : '+ Add'}
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleDelete(name)}
                        hitSlop={{ top: 8, bottom: 8, left: 12, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Expanded members list */}
                {isExpanded && !addUsername && (
                  <View style={[styles.membersList, { borderTopColor: colors.border }]}>
                    {members.length === 0 ? (
                      <Text style={[styles.noMembers, { color: colors.textMuted }]}>
                        No members yet. Browse profiles and tap the list icon to add.
                      </Text>
                    ) : (
                      members.map((username) => {
                        const inCompare = compareList.includes(username);
                        return (
                          <View
                            key={username}
                            style={[styles.memberRow, { borderBottomColor: colors.border }]}
                          >
                            <TouchableOpacity
                              style={styles.memberName}
                              onPress={() =>
                                navigation.navigate('Explore', {
                                  screen: 'ProfileTabs',
                                  params: { username },
                                })
                              }
                            >
                              <Ionicons
                                name="person-outline"
                                size={14}
                                color={colors.textSecondary}
                              />
                              <Text style={[styles.memberText, { color: colors.text }]}>
                                @{username}
                              </Text>
                            </TouchableOpacity>

                            <View style={styles.memberActions}>
                              <TouchableOpacity
                                onPress={() => dispatch(toggleCompare(username))}
                                style={[
                                  styles.memberBtn,
                                  {
                                    backgroundColor: inCompare
                                      ? `${colors.accent}18`
                                      : 'transparent',
                                    borderColor: colors.border,
                                  },
                                ]}
                              >
                                <Ionicons
                                  name="swap-horizontal-outline"
                                  size={14}
                                  color={inCompare ? colors.accent : colors.textSecondary}
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() =>
                                  dispatch(removeFromShortlist({ name, username }))
                                }
                                style={[styles.memberBtn, { borderColor: colors.border }]}
                              >
                                <Ionicons name="close" size={14} color={colors.textSecondary} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 18 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
  },
  input: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 10,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  emptyBody: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  scrollContent: { paddingTop: 10, paddingBottom: 40 },
  shortlistCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  shortlistName: { fontSize: 15, fontWeight: '700' },
  memberCount: { fontSize: 12, marginTop: 1 },
  cardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  addTagText: { fontSize: 12, fontWeight: '600' },
  membersList: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 10,
  },
  noMembers: { fontSize: 12, textAlign: 'center', paddingVertical: 10 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  memberName: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberText: { fontSize: 13, fontWeight: '500' },
  memberActions: { flexDirection: 'row', gap: 6 },
  memberBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
