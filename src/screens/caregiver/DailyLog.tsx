import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { LogRow } from '../../components/LogRow';
import { Card } from '../../components/ui/Card';
import { colors, space, type } from '../../theme/tokens';

export function DailyLog() {
  const events = useStore((s) => s.events);
  const clearEvents = useStore((s) => s.clearEvents);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.head}>
          <Text style={styles.title}>Activity log</Text>
          {events.length > 0 ? (
            <Pressable
              onPress={() =>
                Alert.alert('Clear log?', 'This removes all logged events.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', style: 'destructive', onPress: clearEvents },
                ])
              }
            >
              <Text style={styles.clear}>Clear</Text>
            </Pressable>
          ) : null}
        </View>

        {events.length === 0 ? (
          <Text style={styles.empty}>No events yet.</Text>
        ) : (
          <Card raised={false} style={styles.card}>
            {events.map((e, i) => (
              <View key={e.id}>
                {i > 0 ? <View style={styles.divider} /> : null}
                <LogRow event={e} />
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.md },
  title: { fontSize: type.headline, fontWeight: '800', color: colors.ink },
  clear: { color: colors.urgent, fontWeight: '600', fontSize: type.body },
  card: { paddingVertical: space.xs },
  divider: { height: 1, backgroundColor: colors.line },
  empty: { fontSize: type.body, color: colors.inkFaint, marginTop: space.xl, textAlign: 'center' },
});
