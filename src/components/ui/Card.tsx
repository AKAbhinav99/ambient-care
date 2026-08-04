import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { colors, radius, space, shadow, type, font } from '../../theme/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  raised?: boolean;
}

export function Card({ children, style, raised = true }: CardProps) {
  return <View style={[styles.card, raised && shadow.card, style]}>{children}</View>;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.section}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  section: {
    fontFamily: font.bodyBold,
    fontSize: type.caption,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.inkFaint,
    marginBottom: space.sm,
  },
});
