import React, { memo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { donutSlicePath } from '@/utils/chartHelpers';
import type { LanguageSegment } from '@/features/github/githubSelectors';

interface Props {
  segments: LanguageSegment[];
  size?: number;
}

export const LanguageChart = memo(({ segments, size = 220 }: Props) => {
  const colors = useTheme();
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 10;
  const innerR = outerR * 0.58;

  if (segments.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No language data available
        </Text>
      </View>
    );
  }

  let currentAngle = 0;

  return (
    <View style={styles.wrapper}>
      {/* Donut chart */}
      <View style={styles.chartWrap}>
        <Svg width={size} height={size}>
          {segments.map((seg) => {
            const sliceDeg = (seg.percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + sliceDeg;
            currentAngle = endAngle;
            return (
              <Path
                key={seg.language}
                d={donutSlicePath(cx, cy, outerR, innerR, startAngle, endAngle)}
                fill={seg.color}
              />
            );
          })}
        </Svg>

        {/* Center label */}
        <View
          style={[
            styles.centerLabel,
            {
              width: innerR * 2 * 0.72,
              height: innerR * 2 * 0.72,
              borderRadius: innerR,
              backgroundColor: colors.background,
            },
          ]}
        >
          <Text style={[styles.centerCount, { color: colors.text }]}>{segments.length}</Text>
          <Text style={[styles.centerSub, { color: colors.textSecondary }]}>languages</Text>
        </View>
      </View>

      {/* Legend */}
      <ScrollView style={styles.legend} showsVerticalScrollIndicator={false}>
        {segments.map((seg) => (
          <View key={seg.language} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: seg.color }]} />
            <Text style={[styles.langName, { color: colors.text }]}>{seg.language}</Text>
            <Text style={[styles.pct, { color: colors.textSecondary }]}>
              {seg.percentage.toFixed(1)}%
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', paddingBottom: 16 },
  chartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCount: { fontSize: 30, fontWeight: '800', letterSpacing: -1 },
  centerSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  legend: { width: '100%', paddingHorizontal: 20 },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  langName: { flex: 1, fontSize: 14, fontWeight: '500' },
  pct: { fontSize: 14, fontWeight: '600' },
  empty: {
    margin: 20,
    padding: 32,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14 },
});
