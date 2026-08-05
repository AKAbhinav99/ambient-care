import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, type Theme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold } from '@expo-google-fonts/lexend';
import {
  SourceSans3_400Regular,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
} from '@expo-google-fonts/source-sans-3';
import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible';
import './src/theme/applyFonts';
import { useStore } from './src/lib/store';
import { I18nProvider } from './src/i18n';
import { colors } from './src/theme/tokens';
import { RoleSelectScreen } from './src/screens/RoleSelectScreen';
import { CaregiverNavigator } from './src/navigation/CaregiverNavigator';
import { SeniorNavigator } from './src/navigation/SeniorNavigator';

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.paper,
    card: colors.paper,
    text: colors.ink,
    primary: colors.accent,
    border: colors.line,
  },
};

/** Wait for the persisted store to rehydrate before deciding which surface to show. */
function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useStore.persist.hasHydrated());
    return unsub;
  }, []);
  return hydrated;
}

export default function App() {
  const hydrated = useHydrated();
  const role = useStore((s) => s.role);
  const reconcileDoses = useStore((s) => s.reconcileDoses);
  const [fontsLoaded] = useFonts({
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
    SourceSans3_400Regular,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
  });

  const ready = hydrated && fontsLoaded;

  // Catch any doses that lapsed while the app was closed, once state is ready.
  useEffect(() => {
    if (ready) reconcileDoses();
  }, [ready, reconcileDoses]);

  const surface = !ready ? (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  ) : role === 'senior' ? (
    <SeniorNavigator />
  ) : role === 'caregiver' ? (
    <CaregiverNavigator />
  ) : (
    <RoleSelectScreen />
  );

  return (
    <SafeAreaProvider>
      <I18nProvider>
        <StatusBar style="dark" />
        <NavigationContainer theme={navTheme}>{surface}</NavigationContainer>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper },
});
