import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

function Bone({ width, height, style }: { width: number | string; height: number; style?: object }) {
  const colors = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: 8, backgroundColor: colors.skeleton, opacity },
        style,
      ]}
    />
  );
}

export function SkeletonLoader() {
  return (
    <View style={styles.container}>
      {/* Profile header skeleton */}
      <View style={styles.header}>
        <Bone width={80} height={80} style={styles.avatar} />
        <View style={styles.headerText}>
          <Bone width={160} height={20} style={styles.mb8} />
          <Bone width={120} height={14} style={styles.mb8} />
          <Bone width={200} height={12} />
        </View>
      </View>

      {/* Stats skeleton */}
      <View style={styles.statsRow}>
        <Bone width="30%" height={72} />
        <Bone width="30%" height={72} />
        <Bone width="30%" height={72} />
      </View>

      {/* List item skeletons */}
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.listItem}>
          <Bone width="70%" height={16} style={styles.mb8} />
          <Bone width="90%" height={12} style={styles.mb8} />
          <Bone width="40%" height={12} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { flexDirection: 'row', marginBottom: 24 },
  avatar: { borderRadius: 40, marginRight: 16 },
  headerText: { flex: 1, justifyContent: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  listItem: {
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  mb8: { marginBottom: 8 },
});
