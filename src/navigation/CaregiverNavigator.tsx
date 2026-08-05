import React from 'react';
import { Pressable, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useStore } from '../lib/store';
import { colors, type, font } from '../theme/tokens';
import { RecipientsScreen } from '../screens/caregiver/RecipientsScreen';
import { AddRecipientScreen } from '../screens/caregiver/AddRecipientScreen';
import { CaregiverDashboard } from '../screens/caregiver/CaregiverDashboard';
import { LovedOneSetup } from '../screens/caregiver/LovedOneSetup';
import { MedicationSetup } from '../screens/caregiver/MedicationSetup';
import { DailyLog } from '../screens/caregiver/DailyLog';
import { Adherence } from '../screens/caregiver/Adherence';
import { Interactions } from '../screens/caregiver/Interactions';
import { EmergencyCardScreen } from '../screens/shared/EmergencyCardScreen';
import type { CaregiverStackParams } from './types';

const Stack = createNativeStackNavigator<CaregiverStackParams>();

function SwitchButton() {
  const signOut = useStore((s) => s.signOut);
  return (
    <Pressable onPress={signOut} hitSlop={10}>
      <Text style={{ color: colors.accentInk, fontWeight: '700', fontSize: type.body }}>Switch</Text>
    </Pressable>
  );
}

export function CaregiverNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.paper },
        headerShadowVisible: false,
        headerTintColor: colors.accentInk,
        headerTitleStyle: { color: colors.ink, fontFamily: font.heading, fontSize: type.bodyLg },
        contentStyle: { backgroundColor: colors.paper },
      }}
    >
      <Stack.Screen name="Recipients" component={RecipientsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddRecipient" component={AddRecipientScreen} options={{ title: 'Add recipient' }} />
      <Stack.Screen
        name="CaregiverHome"
        component={CaregiverDashboard}
        options={{ title: 'Ambient Care', headerRight: () => <SwitchButton /> }}
      />
      <Stack.Screen name="LovedOne" component={LovedOneSetup} options={{ title: 'Loved one' }} />
      <Stack.Screen name="Medications" component={MedicationSetup} options={{ title: 'Medications' }} />
      <Stack.Screen name="DailyLog" component={DailyLog} options={{ title: 'Activity' }} />
      <Stack.Screen name="Adherence" component={Adherence} options={{ title: 'Adherence' }} />
      <Stack.Screen name="Interactions" component={Interactions} options={{ title: 'Interactions' }} />
      <Stack.Screen name="EmergencyCard" component={EmergencyCardScreen} options={{ title: 'Emergency card' }} />
    </Stack.Navigator>
  );
}
