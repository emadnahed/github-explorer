import React, { memo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { SearchFilters } from '@/features/github/githubSlice';

const POPULAR_LANGUAGES = [
  'TypeScript', 'Python', 'Go', 'Rust', 'Java',
  'Swift', 'Kotlin', 'Ruby', 'C++', 'C#',
];

interface Props {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onApply: () => void;
}

export const FilterPanel = memo(({ filters, onChange, onApply }: Props) => {
  const colors = useTheme();
  const [expanded, setExpanded] = useState(false);

  const hasActive = !!(filters.language || filters.location || filters.minFollowers);

  const handleReset = () => onChange({ language: '', location: '', minFollowers: '' });

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.toggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.7}
      >
        <View style={styles.toggleLeft}>
          <Ionicons
            name="options-outline"
            size={15}
            color={hasActive ? colors.accent : colors.textSecondary}
          />
          <Text style={[styles.toggleText, { color: hasActive ? colors.accent : colors.textSecondary }]}>
            {hasActive ? 'Filters (active)' : 'Filters'}
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Language</Text>
          <View style={styles.chips}>
            {POPULAR_LANGUAGES.map((lang) => {
              const selected = filters.language === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.accent : colors.inputBg,
                      borderColor: selected ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => onChange({ ...filters, language: selected ? '' : lang })}
                >
                  <Text style={[styles.chipText, { color: selected ? '#fff' : colors.text }]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Location</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
            ]}
            placeholder="e.g. London, San Francisco"
            placeholderTextColor={colors.textMuted}
            value={filters.location}
            onChangeText={(v) => onChange({ ...filters, location: v })}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Min Followers</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
            ]}
            placeholder="e.g. 50"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            value={filters.minFollowers}
            onChangeText={(v) => onChange({ ...filters, minFollowers: v.replace(/\D/g, '') })}
          />

          <View style={styles.actions}>
            {hasActive && (
              <TouchableOpacity
                style={[styles.btn, { borderColor: colors.border }]}
                onPress={handleReset}
              >
                <Text style={[styles.btnText, { color: colors.textSecondary }]}>Reset</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, { backgroundColor: colors.accent, flex: 1 }]}
              onPress={() => {
                onApply();
                setExpanded(false);
              }}
            >
              <Ionicons name="search" size={14} color="#fff" />
              <Text style={[styles.btnText, { color: '#fff' }]}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '500',
  },
  panel: {
    marginTop: 6,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  btnPrimary: {
    borderWidth: 0,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
