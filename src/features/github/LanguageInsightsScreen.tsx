import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchLanguages } from './githubSlice';
import { selectLanguageSegments } from './githubSelectors';
import { LanguageChart } from '@/components/LanguageChart';
import { useTheme } from '@/hooks/useTheme';
import { formatBytes } from '@/utils/chartHelpers';

export function LanguageInsightsScreen({ username }: { username: string }) {
  const dispatch = useAppDispatch();
  const colors = useTheme();

  const segments = useAppSelector(selectLanguageSegments);
  const repos = useAppSelector((state) => state.github.repos);
  const { languagesLoading, languagesError } = useAppSelector((state) => state.github);

  // Fetch languages once repos are loaded and we have no data yet
  useEffect(() => {
    if (repos.length > 0 && segments.length === 0 && !languagesLoading) {
      dispatch(fetchLanguages(username));
    }
  }, [repos.length, segments.length, languagesLoading, username, dispatch]);

  if (languagesLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Analyzing languages...
        </Text>
      </View>
    );
  }

  if (languagesError) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load language data
        </Text>
      </View>
    );
  }

  const totalBytes = segments.reduce((sum, s) => sum + s.bytes, 0);
  const nonForkRepos = repos.filter((r) => !r.fork).length;

  return (
    <ScrollView
      testID="language-insights-scroll"
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header summary */}
      <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <SummaryItem label="Repositories Analyzed" value={String(Math.min(nonForkRepos, 10))} colors={colors} />
        <SummaryItem label="Languages Found" value={String(segments.length)} colors={colors} />
        <SummaryItem label="Total Code" value={formatBytes(totalBytes)} colors={colors} />
      </View>

      {/* Donut chart */}
      <View style={[styles.chartSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Language Distribution</Text>
        <LanguageChart segments={segments} size={220} />
      </View>

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

function SummaryItem({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  loadingText: { fontSize: 14 },
  errorText: { fontSize: 14, textAlign: 'center' },
  summary: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 18, fontWeight: '700', letterSpacing: -0.5 },
  summaryLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center', marginTop: 3 },
  chartSection: {
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  bottomPad: { height: 32 },
});
