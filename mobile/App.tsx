import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ConvexClientProvider } from './src/providers/ConvexProvider';
import { AuthProvider } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigation';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ConvexClientProvider>
          <AuthProvider>
            <RootNavigator />
            <StatusBar style="dark" />
          </AuthProvider>
        </ConvexClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
