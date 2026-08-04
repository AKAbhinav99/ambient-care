import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { checkInteractions, DISCLAIMER } from '../../lib/interactions';
import { InteractionWarning } from '../../components/InteractionWarning';
import { colors, space, type, radius, font } from '../../theme/tokens';

export function Interactions() {
  const medications = useStore((s) => s.medications);
  const warnings = useMemo(() => checkInteractions(medications), [medications]);

  const majors = warnings.filter((w) => w.severity === 'major').length;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Interaction check</Text>
        <Text style={styles.sub}>
          {warnings.length === 0
            ? 'No known interactions among the current medications.'
            : `${warnings.length} to review${majors ? ` · ${majors} major` : ''}.`}
        </Text>

        {warnings.map((w, i) => (
          <InteractionWarning key={`${w.a}-${w.b}-${i}`} warning={w} />
        ))}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>{DISCLAIMER}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg },
  title: { fontFamily: font.display, fontSize: type.headline, color: colors.ink },
  sub: { fontFamily: font.body, fontSize: type.body, color: colors.inkSoft, marginTop: 4, marginBottom: space.lg },
  disclaimer: {
    marginTop: space.md,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.sm,
    padding: space.md,
  },
  disclaimerText: { fontSize: type.caption, color: colors.inkSoft, lineHeight: type.caption * 1.5 },
});
