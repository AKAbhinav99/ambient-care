import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, type, font } from '../theme/tokens';
import { useT } from '../i18n';
import { SeniorHome } from '../screens/senior/SeniorHome';
import { ScanScreen } from '../screens/senior/ScanScreen';
import { VoiceScreen } from '../screens/senior/VoiceScreen';
import { PairingScreen } from '../screens/senior/PairingScreen';
import { SeniorSettings } from '../screens/senior/SeniorSettings';
import { LanguageScreen } from '../screens/senior/LanguageScreen';
import { VoicePickerScreen } from '../screens/senior/VoicePickerScreen';
import { EmergencyCardScreen } from '../screens/shared/EmergencyCardScreen';
import { ChatScreen } from '../screens/shared/ChatScreen';
import type { SeniorStackParams } from './types';

const Stack = createNativeStackNavigator<SeniorStackParams>();

export function SeniorNavigator() {
  const { t, script } = useT();
  // Native header titles are rendered outside the <Text> patch, so drop the Latin
  // family for non-Latin scripts and let the system font render the glyphs.
  const headerFont = script === 'latin' ? font.heading : undefined;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.paper },
        headerShadowVisible: false,
        headerBackTitle: t.common.back,
        headerTintColor: colors.accentInk,
        headerTitleStyle: { color: colors.ink, fontFamily: headerFont, fontSize: type.bodyLg },
        contentStyle: { backgroundColor: colors.paper },
      }}
    >
      <Stack.Screen name="SeniorHome" component={SeniorHome} options={{ headerShown: false }} />
      <Stack.Screen name="Scan" component={ScanScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Voice" component={VoiceScreen} options={{ title: t.nav.talk }} />
      <Stack.Screen name="Pairing" component={PairingScreen} options={{ title: t.nav.connect }} />
      <Stack.Screen name="SeniorSettings" component={SeniorSettings} options={{ title: t.nav.settings }} />
      <Stack.Screen name="Language" component={LanguageScreen} options={{ title: t.nav.language }} />
      <Stack.Screen name="VoicePicker" component={VoicePickerScreen} options={{ title: t.nav.voice }} />
      <Stack.Screen name="EmergencyCard" component={EmergencyCardScreen} options={{ title: t.nav.emergencyCard }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: t.nav.chat }} />
    </Stack.Navigator>
  );
}
