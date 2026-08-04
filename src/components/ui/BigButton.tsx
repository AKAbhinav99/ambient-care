import React, { useRef } from 'react';
import { Animated, Pressable, Text, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, space, shadow, type } from '../../theme/tokens';

type Variant = 'accent' | 'urgent' | 'neutral' | 'ghost';

interface BigButtonProps {
  label: string;
  sublabel?: string;
  icon?: string; // emoji glyph — no icon font dependency, reads big and clear
  onPress: () => void;
  variant?: Variant;
  size?: 'md' | 'xl'; // xl = senior-scale
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  accent: { bg: colors.accent, fg: colors.onAccent, border: colors.accent },
  urgent: { bg: colors.urgent, fg: colors.onUrgent, border: colors.urgent },
  neutral: { bg: colors.surface, fg: colors.ink, border: colors.line },
  ghost: { bg: 'transparent', fg: colors.accentInk, border: colors.accentSoft },
};

export function BigButton({
  label,
  sublabel,
  icon,
  onPress,
  variant = 'accent',
  size = 'md',
  disabled,
  style,
}: BigButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const p = palette[variant];
  const isXl = size === 'xl';

  const animate = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={sublabel ? `${label}. ${sublabel}` : label}
        onPress={onPress}
        onPressIn={() => animate(0.96)}
        onPressOut={() => animate(1)}
        disabled={disabled}
        style={[
          styles.base,
          isXl && styles.xl,
          {
            backgroundColor: p.bg,
            borderColor: p.border,
            opacity: disabled ? 0.45 : 1,
          },
          variant !== 'ghost' && variant !== 'neutral' && shadow.lift,
        ]}
      >
        {icon ? <Text style={[styles.icon, isXl && styles.iconXl]}>{icon}</Text> : null}
        <View style={styles.labels}>
          <Text style={[styles.label, isXl && styles.labelXl, { color: p.fg }]}>{label}</Text>
          {sublabel ? (
            <Text style={[styles.sub, isXl && styles.subXl, { color: p.fg }]}>{sublabel}</Text>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    minHeight: 60,
  },
  xl: {
    paddingVertical: space.xl,
    paddingHorizontal: space.xl,
    borderRadius: radius.lg,
    minHeight: 132,
  },
  labels: { flexShrink: 1 },
  icon: { fontSize: 26 },
  iconXl: { fontSize: 56 },
  label: { fontSize: type.bodyLg, fontWeight: '700' },
  labelXl: { fontSize: type.seniorTitle, fontWeight: '800' },
  sub: { fontSize: type.caption, fontWeight: '500', opacity: 0.85, marginTop: 2 },
  subXl: { fontSize: type.seniorBody, opacity: 0.9, marginTop: 4 },
});
