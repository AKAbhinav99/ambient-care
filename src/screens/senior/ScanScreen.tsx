import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useStore } from '../../lib/store';
import { say } from '../../lib/speech';
import { fireAlert } from '../../lib/notifications';
import { nearestSlot } from '../../lib/adherence';
import { matchByBarcode, confirmationText, mismatchText } from '../../lib/medMatch';
import { BigButton } from '../../components/ui/BigButton';
import { Icon } from '../../components/ui/Icon';
import { colors, space, type, radius, font } from '../../theme/tokens';
import type { Medication } from '../../types';
import type { SeniorProps } from '../../navigation/types';

type Result = { matched: true; med: Medication } | { matched: false; code: string } | null;

export function ScanScreen({ navigation }: SeniorProps<'Scan'>) {
  const [permission, requestPermission] = useCameraPermissions();
  const lovedOne = useStore((s) => s.lovedOne);
  const medications = useStore((s) => s.medications);
  const logEvent = useStore((s) => s.logEvent);
  const markDoseTaken = useStore((s) => s.markDoseTaken);

  const [result, setResult] = useState<Result>(null);
  const [manual, setManual] = useState(false);
  const lockRef = useRef(false);

  const familyName = lovedOne ? `your ${lovedOne.relationship.toLowerCase()}` : 'your family';
  const first = lovedOne?.name?.split(' ')[0] ?? 'Your loved one';

  const finishMatch = (med: Medication) => {
    setResult({ matched: true, med });
    const text = confirmationText(med);
    say(text);
    logEvent({
      kind: 'scan_match',
      severity: 'info',
      title: `${first} scanned ${med.name}`,
      detail: med.dosage,
    });
    // Count the scan as taking the nearest scheduled dose for this med.
    const slot = nearestSlot(med, Date.now());
    if (slot !== undefined) markDoseTaken(med.id, slot, 'scan');
  };

  const finishMismatch = (code: string) => {
    setResult({ matched: false, code });
    say(mismatchText(familyName));
    logEvent({
      kind: 'scan_mismatch',
      severity: 'checkIn',
      title: `${first} scanned something not on the list`,
      detail: code ? `Unrecognized code ${code}` : 'No match found',
    });
  };

  const onBarcode = ({ data }: { data: string }) => {
    if (lockRef.current) return;
    lockRef.current = true;
    const m = matchByBarcode(medications, data);
    if (m.matched && m.med) finishMatch(m.med);
    else finishMismatch(data);
  };

  const reset = () => {
    lockRef.current = false;
    setResult(null);
    setManual(false);
  };

  const alertFamily = () => {
    const ev = logEvent({
      kind: 'scan_mismatch',
      severity: 'urgent',
      title: `${first} asked to alert you about an unknown medicine`,
      detail: 'Requested help identifying a medication.',
    });
    if (lovedOne) fireAlert(ev, first);
    say(`Okay, I've let ${familyName} know.`);
    setResult(null);
    lockRef.current = false;
  };

  // ---- Result view ----
  if (result) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.resultScroll}>
          {result.matched ? (
            <View style={[styles.resultCard, { backgroundColor: colors.calmSoft, borderColor: colors.calm }]}>
              <View style={[styles.resultIconCircle, { backgroundColor: colors.calm }]}>
                <Icon name="check" size={44} color="#fff" strokeWidth={2.6} />
              </View>
              <Text style={styles.resultTitle}>{result.med.friendlyName}</Text>
              <Text style={styles.resultBig}>Take {result.med.dosage.toLowerCase()} now</Text>
              <Text style={styles.resultName}>{result.med.name}</Text>
            </View>
          ) : (
            <View style={[styles.resultCard, { backgroundColor: colors.checkInSoft, borderColor: colors.checkIn }]}>
              <View style={[styles.resultIconCircle, { backgroundColor: colors.checkIn }]}>
                <Icon name="help-circle" size={44} color="#fff" strokeWidth={2.2} />
              </View>
              <Text style={styles.resultTitle}>Hmm, I don't recognize this</Text>
              <Text style={styles.resultBig}>It's not on your list</Text>
              <BigButton
                icon="phone"
                label={`Tell ${lovedOne?.relationship ?? 'family'}`}
                variant="urgent"
                onPress={alertFamily}
                style={{ marginTop: space.lg, alignSelf: 'stretch' }}
              />
            </View>
          )}
          <BigButton icon="rotate" label="Scan another" variant="neutral" onPress={reset} style={{ marginTop: space.lg }} />
          <BigButton label="Done" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: space.sm }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---- Manual pick fallback (no barcode / simulator) ----
  if (manual) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.manualTitle}>Which one are you holding?</Text>
          {medications.length === 0 ? (
            <Text style={styles.note}>No medications on file yet.</Text>
          ) : (
            medications.map((m) => (
              <Pressable key={m.id} style={styles.pick} onPress={() => finishMatch(m)}>
                <View style={styles.pickIconWell}>
                  <Icon name="pill" size={24} color={colors.accentInk} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickName}>{m.name}</Text>
                  <Text style={styles.pickMeta}>{m.dosage}</Text>
                </View>
              </Pressable>
            ))
          )}
          <BigButton label="Back to camera" variant="ghost" onPress={() => setManual(false)} style={{ marginTop: space.lg }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---- Camera view ----
  if (!permission) {
    return <Centered text="Preparing camera…" />;
  }
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.permWrap}>
          <View style={styles.permIconCircle}>
            <Icon name="camera" size={40} color={colors.accentInk} strokeWidth={2} />
          </View>
          <Text style={styles.permTitle}>Camera access needed</Text>
          <Text style={styles.note}>
            To read your medicine bottle, this device needs to use the camera — briefly and only when
            you tap scan. No photos are saved.
          </Text>
          <BigButton label="Allow camera" variant="accent" onPress={requestPermission} style={{ marginTop: space.lg }} />
          <BigButton label="Pick from my list instead" variant="ghost" onPress={() => setManual(true)} style={{ marginTop: space.sm }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.cameraWrap}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
        }}
        onBarcodeScanned={onBarcode}
      />
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <Text style={styles.instruct}>Point at the barcode on the bottle</Text>
        <View style={styles.reticle} />
        <View style={styles.overlayButtons}>
          <Pressable style={styles.overlayBtn} onPress={() => setManual(true)}>
            <Text style={styles.overlayBtnText}>Can't scan? Pick from list</Text>
          </Pressable>
          <Pressable style={styles.overlayBtnGhost} onPress={() => navigation.goBack()}>
            <Text style={styles.overlayBtnGhostText}>Cancel</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Centered({ text }: { text: string }) {
  return (
    <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={styles.note}>{text}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg },
  resultScroll: { padding: space.lg, flexGrow: 1, justifyContent: 'center' },

  resultCard: {
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: space.xl,
    alignItems: 'center',
  },
  resultIconCircle: { width: 84, height: 84, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontFamily: font.headingMed, fontSize: type.seniorBody, color: colors.inkSoft, marginTop: space.md, textAlign: 'center' },
  resultBig: { fontFamily: font.display, fontSize: type.seniorTitle, color: colors.ink, marginTop: space.xs, textAlign: 'center' },
  resultName: { fontFamily: font.body, fontSize: type.bodyLg, color: colors.inkSoft, marginTop: space.sm },

  manualTitle: { fontFamily: font.display, fontSize: type.seniorTitle, color: colors.ink, marginBottom: space.lg },
  pick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
    marginBottom: space.md,
  },
  pickIconWell: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickName: { fontFamily: font.headingMed, fontSize: type.seniorBody, color: colors.ink },
  pickMeta: { fontFamily: font.body, fontSize: type.body, color: colors.inkSoft },

  permWrap: { flex: 1, padding: space.xl, justifyContent: 'center', alignItems: 'center' },
  permIconCircle: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permTitle: { fontFamily: font.display, fontSize: type.seniorTitle, color: colors.ink, marginTop: space.md, textAlign: 'center' },
  note: { fontSize: type.body, color: colors.inkSoft, textAlign: 'center', marginTop: space.sm, lineHeight: type.body * 1.5 },

  cameraWrap: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center', padding: space.lg },
  instruct: {
    fontSize: type.bodyLg,
    color: '#fff',
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    overflow: 'hidden',
    textAlign: 'center',
  },
  reticle: {
    width: 260,
    height: 180,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: radius.lg,
  },
  overlayButtons: { alignSelf: 'stretch', gap: space.sm },
  overlayBtn: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  overlayBtnText: { color: colors.ink, fontWeight: '800', fontSize: type.bodyLg },
  overlayBtnGhost: { paddingVertical: space.sm, alignItems: 'center' },
  overlayBtnGhostText: { color: '#fff', fontWeight: '600', fontSize: type.body },
});
