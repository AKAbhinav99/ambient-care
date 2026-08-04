import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type CaregiverStackParams = {
  CaregiverHome: undefined;
  LovedOne: undefined;
  Medications: undefined;
  DailyLog: undefined;
  Adherence: undefined;
  Interactions: undefined;
  EmergencyCard: undefined;
};

export type SeniorStackParams = {
  SeniorHome: undefined;
  Pairing: undefined;
  Scan: undefined;
  Voice: undefined;
  SeniorSettings: undefined;
  EmergencyCard: undefined;
  Language: undefined;
  VoicePicker: undefined;
};

export type CaregiverProps<T extends keyof CaregiverStackParams> = NativeStackScreenProps<
  CaregiverStackParams,
  T
>;
export type SeniorProps<T extends keyof SeniorStackParams> = NativeStackScreenProps<
  SeniorStackParams,
  T
>;
