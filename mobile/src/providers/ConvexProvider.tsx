import React from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import Constants from 'expo-constants';

const convexUrl =
  Constants.expoConfig?.extra?.convexUrl ??
  process.env.EXPO_PUBLIC_CONVEX_URL ??
  '';

const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
