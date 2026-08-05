import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParams = {
  Login: undefined;
  SignUp: undefined;
};

export type CaregiverStackParams = {
  Recipients: undefined;
  AddRecipient: undefined;
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

export type AuthProps<T extends keyof AuthStackParams> = NativeStackScreenProps<AuthStackParams, T>;

export type CaregiverProps<T extends keyof CaregiverStackParams> = NativeStackScreenProps<
  CaregiverStackParams,
  T
>;
export type SeniorProps<T extends keyof SeniorStackParams> = NativeStackScreenProps<
  SeniorStackParams,
  T
>;
