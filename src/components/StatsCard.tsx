import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { formatNumber } from '@/utils/helpers';

interface Props {
  icon: string;
  count: number;
  label: string;
  color?: string;
}

export const StatsCard = memo(({ icon, count, label, color }: Props) => {
  const colors = useTheme();
  const iconColor = color ?? colors.accent;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name={icon as any} size={20} color={iconColor} style={styles.icon} />
      <Text style={[styles.count, { color: colors.text }]}>{formatNumber(count)}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  icon: {
    marginBottom: 6,
  },
  count: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
