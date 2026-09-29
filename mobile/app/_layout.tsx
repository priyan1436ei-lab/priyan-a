import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MobileFinFamProvider } from '../src/context/MobileFinFamContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MobileFinFamProvider>
        <StatusBar style="light" backgroundColor="#0F172A" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F172A' } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </MobileFinFamProvider>
    </SafeAreaProvider>
  );
}
