import { useColorScheme } from 'react-native';
import { Colors, type AppColors } from '@/utils/theme';

export function useTheme(): AppColors {
  const scheme = useColorScheme();
  return Colors[scheme === 'dark' ? 'dark' : 'light'];
}
