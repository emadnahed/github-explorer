import React, { memo, useCallback, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

const AnimatedView = Animated.createAnimatedComponent(View);

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export const SearchBar = memo(({ value, onChangeText, onSubmit, placeholder = 'Search GitHub username...' }: Props) => {
  const colors = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useSharedValue(0);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    focusAnim.value = withTiming(1, { duration: 200 });
  }, [focusAnim]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    focusAnim.value = withTiming(0, { duration: 200 });
  }, [focusAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: colors.accent,
    borderWidth: focusAnim.value * 1.5,
    opacity: focusAnim.value * 0.4,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.inputRow,
          { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
        ]}
      >
        <Ionicons
          name="search"
          size={18}
          color={isFocused ? colors.accent : colors.textSecondary}
          style={styles.icon}
        />
        <TextInput
          testID="search-input"
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          clearButtonMode="while-editing"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onSubmit} style={styles.searchBtn}>
            <Ionicons name="arrow-forward-circle" size={28} color={colors.accent} />
          </TouchableOpacity>
        )}
        <AnimatedView
          style={[StyleSheet.absoluteFill, styles.focusRing, animatedStyle]}
          pointerEvents="none"
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  focusRing: {
    borderRadius: 14,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  searchBtn: {
    marginLeft: 6,
  },
});
