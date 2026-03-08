import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { store } from '@/store/store';
import { RootNavigator } from '@/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
