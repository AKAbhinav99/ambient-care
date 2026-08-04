import React from 'react';
import { Pressable, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useStore } from '../lib/store';
import { colors, type } from '../theme/tokens';
import { CaregiverDashboard } from '../screens/caregiver/CaregiverDashboard';
import { LovedOneSetup } from '../screens/caregiver/LovedOneSetup';
import { MedicationSetup } from '../screens/caregiver/MedicationSetup';
import { DailyLog } from '../screens/caregiver/DailyLog';
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
        headerTitleStyle: { color: colors.ink, fontWeight: '700' },
        contentStyle: { backgroundColor: colors.paper },
      }}
    >
      <Stack.Screen
        name="CaregiverHome"
        component={CaregiverDashboard}
        options={{ title: 'Ambient Care', headerRight: () => <SwitchButton /> }}
      />
      <Stack.Screen name="LovedOne" component={LovedOneSetup} options={{ title: 'Loved one' }} />
      <Stack.Screen name="Medications" component={MedicationSetup} options={{ title: 'Medications' }} />
      <Stack.Screen name="DailyLog" component={DailyLog} options={{ title: 'Activity' }} />
    </Stack.Navigator>
  );
}
