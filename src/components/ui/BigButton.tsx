import React, { useRef } from 'react';
import { Animated, Easing, Pressable, Text, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, space, shadow, type, font } from '../../theme/tokens';
import { Icon, type IconName } from './Icon';

type Variant = 'accent' | 'urgent' | 'neutral' | 'ghost';

interface BigButtonProps {
  label: string;
  sublabel?: string;
  icon?: IconName;
  onPress: () => void;
  variant?: Variant;
  size?: 'md' | 'xl'; // xl = senior-scale
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  accent: { bg: colors.accent, fg: colors.onAccent, border: colors.accent },
  urgent: { bg: colors.urgent, fg: colors.onUrgent, border: colors.urgent },
  neutral: { bg: colors.surface, fg: colors.ink, border: colors.lineStrong },
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
  // A single 0→1 "pressed" driver, eased quickly on the way in and a touch
  // slower on release. Interpolated into a subtle scale + dim — a designed
  // press transition that stays quiet rather than showy.
  const press = useRef(new Animated.Value(0)).current;
  const p = palette[variant];
  const isXl = size === 'xl';
  const iconSize = isXl ? 34 : 22;
  const onColor = variant === 'accent' || variant === 'urgent';
  const wellBg = onColor ? 'rgba(255,255,255,0.18)' : colors.accentSoft;
  const iconColor = onColor ? p.fg : colors.accentInk;

  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.98] });
  const pressOpacity = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.92] });

  const animate = (to: number) =>
    Animated.timing(press, {
      toValue: to,
      duration: to ? 90 : 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }], opacity: pressOpacity }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={sublabel ? `${label}. ${sublabel}` : label}
        onPress={onPress}
        onPressIn={() => animate(1)}
        onPressOut={() => animate(0)}
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
          variant === 'neutral' && shadow.card,
        ]}
      >
        {icon ? (
          <View style={[styles.iconWrap, isXl && styles.iconWrapXl, isXl && { backgroundColor: wellBg }]}>
            <Icon name={icon} size={iconSize} color={isXl ? iconColor : p.fg} strokeWidth={isXl ? 2.2 : 2} />
          </View>
        ) : null}
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
    borderWidth: 1,
    minHeight: 60,
  },
  xl: {
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    minHeight: 112,
    gap: space.lg,
  },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  iconWrapXl: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
  },
  labels: { flexShrink: 1 },
  label: { fontFamily: font.headingBold, fontSize: type.bodyLg },
  labelXl: { fontFamily: font.headingBold, fontSize: type.title },
  sub: { fontFamily: font.body, fontSize: type.caption, opacity: 0.9, marginTop: 2 },
  subXl: { fontFamily: font.body, fontSize: type.bodyLg, opacity: 0.92, marginTop: 4 },
});
