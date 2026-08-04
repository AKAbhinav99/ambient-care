import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, type, font } from '../theme/tokens';
import { SeniorHome } from '../screens/senior/SeniorHome';
import { ScanScreen } from '../screens/senior/ScanScreen';
import { VoiceScreen } from '../screens/senior/VoiceScreen';
import { PairingScreen } from '../screens/senior/PairingScreen';
import { SeniorSettings } from '../screens/senior/SeniorSettings';
import { EmergencyCardScreen } from '../screens/shared/EmergencyCardScreen';
import type { SeniorStackParams } from './types';

const Stack = createNativeStackNavigator<SeniorStackParams>();

export function SeniorNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.paper },
        headerShadowVisible: false,
        headerBackTitle: 'Back',
        headerTintColor: colors.accentInk,
        headerTitleStyle: { color: colors.ink, fontFamily: font.heading, fontSize: type.bodyLg },
        contentStyle: { backgroundColor: colors.paper },
      }}
    >
      <Stack.Screen name="SeniorHome" component={SeniorHome} options={{ headerShown: false }} />
      <Stack.Screen name="Scan" component={ScanScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Voice" component={VoiceScreen} options={{ title: 'Talk to me' }} />
      <Stack.Screen name="Pairing" component={PairingScreen} options={{ title: 'Connect' }} />
      <Stack.Screen name="SeniorSettings" component={SeniorSettings} options={{ title: 'Settings' }} />
      <Stack.Screen name="EmergencyCard" component={EmergencyCardScreen} options={{ title: 'Emergency card' }} />
    </Stack.Navigator>
  );
}
