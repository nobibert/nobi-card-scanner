import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Alert,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import QRCode from 'react-native-qrcode-svg';

import { colors, fonts, radius, myCard, buildVCard } from './theme';
import {
  HeartIcon,
  BookIcon,
  MailIcon,
  CalendarIcon,
  PersonIcon,
  CameraIcon,
  MicIcon,
  ArrowRightIcon,
  CheckIcon,
  QrIcon,
  CloseIcon,
  RetakeIcon,
} from './components/Icons';

type ActionId = 'thankyou' | 'brochure' | 'email' | 'meeting' | 'connect';

const ACTIONS: {
  id: ActionId;
  title: string;
  sub: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}[] = [
  { id: 'thankyou', title: 'Send a thank-you note', sub: 'Odoo task: thank-you with newsletter invite', Icon: HeartIcon },
  { id: 'brochure', title: 'Send a brochure', sub: 'Odoo task: send the Nobi product brochure', Icon: BookIcon },
  { id: 'email', title: 'Send a follow-up email', sub: 'Odoo task: draft & send a follow-up email', Icon: MailIcon },
  { id: 'meeting', title: 'Schedule a meeting', sub: 'Odoo task: plan a meeting with this contact', Icon: CalendarIcon },
  { id: 'connect', title: 'Connect on LinkedIn', sub: 'Odoo task: send a LinkedIn connection request', Icon: PersonIcon },
];

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, '0');
  return `${m}:${ss}`;
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [selectedActions, setSelectedActions] = useState<Set<ActionId>>(new Set());
  const [voiceUri, setVoiceUri] = useState<string | null>(null);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingStartRef = useRef(0);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sheet recording state
  const [sheetRecording, setSheetRecording] = useState(false);
  const [sheetRecTime, setSheetRecTime] = useState(0);
  const [sheetHasRec, setSheetHasRec] = useState(false);
  const sheetRecRef = useRef<Audio.Recording | null>(null);
  const sheetTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulse animation for recording mic
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Font.loadAsync({
      'Hanken-Light': require('./assets/fonts/HankenGrotesk-Light.ttf'),
      'Hanken': require('./assets/fonts/HankenGrotesk-Regular.ttf'),
      'Hanken-Bold': require('./assets/fonts/HankenGrotesk-Bold.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

  useEffect(() => {
    if (sheetRecording || isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.7, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.setValue(1);
    }
  }, [sheetRecording, isRecording]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.sand }} />;
  }

  const ready = !!photoUri && (selectedActions.size > 0 || !!voiceUri);

  const toggleAction = (id: ActionId) => {
    setSelectedActions((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera permission needed', 'Please allow camera access in Settings.');
      return;
    }
    const r = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });
    if (!r.canceled && r.assets?.[0]) setPhotoUri(r.assets[0].uri);
  };

  const startRec = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Microphone permission needed', 'Please allow microphone access in Settings.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      recordingStartRef.current = Date.now();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - recordingStartRef.current) / 1000));
      }, 250);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRec = async () => {
    if (!isRecording) return;
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    const dur = Math.max(1, Math.floor((Date.now() - recordingStartRef.current) / 1000));
    try {
      await recordingRef.current?.stopAndUnloadAsync();
      const uri = recordingRef.current?.getURI() ?? null;
      setVoiceUri(uri);
      setVoiceDuration(dur);
    } catch (e) {
      console.error(e);
    }
  };

  const clearVoice = () => {
    setVoiceUri(null);
    setVoiceDuration(0);
  };

  const onProcess = () => {
    Alert.alert(
      'Processing…',
      `• Photo: ${photoUri ? 'OK' : '—'}\n` +
        `• Tasks: ${selectedActions.size ? Array.from(selectedActions).join(', ') : '—'}\n` +
        `• Voice note: ${voiceUri ? `OK (${fmt(voiceDuration)})` : '—'}\n\n` +
        `Next: enrich contact → create in Odoo → add task(s).`,
      [
        {
          text: 'OK',
          onPress: () => {
            // reset
            setPhotoUri(null);
            setSelectedActions(new Set());
            setVoiceUri(null);
            setVoiceDuration(0);
          },
        },
      ]
    );
  };

  // Sheet recording
  const sheetStartRec = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      sheetRecRef.current = recording;
      const start = Date.now();
      setSheetRecording(true);
      setSheetRecTime(0);
      sheetTimerRef.current = setInterval(() => {
        setSheetRecTime(Math.floor((Date.now() - start) / 1000));
      }, 250);
    } catch (e) {
      console.error(e);
    }
  };

  const sheetStopRec = async () => {
    if (!sheetRecording) return;
    if (sheetTimerRef.current) clearInterval(sheetTimerRef.current);
    setSheetRecording(false);
    try {
      await sheetRecRef.current?.stopAndUnloadAsync();
      setSheetHasRec(true);
    } catch (e) {
      console.error(e);
    }
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setSheetHasRec(false);
    setSheetRecTime(0);
    setSheetRecording(false);
  };

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor={colors.sand} barStyle="dark-content" />
      <SafeAreaView style={styles.root} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Image source={require('./assets/nobi_logo.png')} style={styles.logo} resizeMode="contain" />
            <Pressable onPress={() => setQrOpen(true)} style={styles.myCardBtn} hitSlop={8}>
              <QrIcon size={16} color={colors.nightGreen} />
              <Text style={styles.myCardBtnText}>My Card</Text>
            </Pressable>
          </View>

          {/* Step 1 — Capture */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={styles.cardTitle}>Take a photo of the card or badge</Text>
            </View>

            <Pressable onPress={takePhoto} style={[styles.captureZone, photoUri && styles.captureZoneFilled]}>
              {photoUri ? (
                <>
                  <Image source={{ uri: photoUri }} style={styles.capturePreview} />
                  <Pressable onPress={() => setPhotoUri(null)} style={styles.retakeBtn}>
                    <RetakeIcon />
                    <Text style={styles.retakeText}>Retake</Text>
                  </Pressable>
                </>
              ) : (
                <View style={styles.captureEmpty}>
                  <CameraIcon />
                  <Text style={styles.captureHint}>Tap to take a photo</Text>
                  <Text style={styles.captureSub}>business card · badge · name tag</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Step 2 — Actions */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.cardTitle}>Pick follow-up tasks</Text>
            </View>

            <View style={{ gap: 6 }}>
              {ACTIONS.map((a) => {
                const checked = selectedActions.has(a.id);
                return (
                  <Pressable
                    key={a.id}
                    onPress={() => toggleAction(a.id)}
                    style={[styles.actionRow, checked && styles.actionRowChecked]}
                  >
                    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                      {checked && <CheckIcon />}
                    </View>
                    <View style={styles.actionIcon}>
                      <a.Icon />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.actionTitle}>{a.title}</Text>
                      <Text style={styles.actionSub}>{a.sub}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Step 3 — Voice note */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <Text style={styles.cardTitle}>Optional — add a voice note</Text>
            </View>

            <Pressable
              onPressIn={startRec}
              onPressOut={stopRec}
              style={[styles.voiceBtn, isRecording && styles.voiceBtnRecording]}
            >
              <View style={[styles.voiceBtnIcon, isRecording && { backgroundColor: colors.danger }]}>
                <MicIcon />
              </View>
              <Text style={[styles.voiceBtnLabel, isRecording && { color: '#b3402a' }]}>
                {isRecording ? 'Recording…' : 'Hold to record'}
              </Text>
              <Text style={[styles.voiceBtnTime, isRecording && { color: '#b3402a' }]}>
                {fmt(recordingTime)}
              </Text>
            </Pressable>

            {voiceUri && !isRecording && (
              <View style={styles.voiceResult}>
                <View style={styles.wave}>
                  {[30, 60, 80, 50, 90, 70, 40, 65, 45, 75].map((h, i) => (
                    <View key={i} style={[styles.waveBar, { height: `${h}%` }]} />
                  ))}
                </View>
                <Text style={styles.voiceResultTime}>{fmt(voiceDuration)}</Text>
                <Pressable onPress={clearVoice} style={styles.voiceClear}>
                  <CloseIcon size={14} color={colors.muted} />
                </Pressable>
              </View>
            )}
          </View>

          {/* Process button */}
          <View style={{ marginTop: 6 }}>
            <Pressable
              onPress={onProcess}
              disabled={!ready}
              style={[styles.processBtn, !ready && styles.processBtnDisabled]}
            >
              <Text style={styles.processBtnText}>Process</Text>
              <ArrowRightIcon />
            </Pressable>
            <Text style={styles.processPipeline}>Enrich contact · Create in Odoo · Add task</Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Floating Quick To-do */}
        <Pressable onPress={() => setSheetOpen(true)} style={styles.fab}>
          <MicIcon size={22} />
          <Text style={styles.fabText}>Quick to-do</Text>
        </Pressable>

        {/* Quick To-do bottom sheet */}
        <Modal visible={sheetOpen} transparent animationType="slide" onRequestClose={closeSheet}>
          <Pressable style={styles.sheetBackdrop} onPress={closeSheet} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetKicker}>— Quick to-do</Text>
            <Text style={styles.sheetTitle}>Speak a to-do for Odoo</Text>
            <Text style={styles.sheetSub}>
              Just like calling <Text style={{ fontFamily: fonts.bold, color: colors.nightGreen }}>+32 460 25 80 17</Text> — we transcribe and create the task(s) in your Odoo inbox.
            </Text>

            <View style={{ alignItems: 'center', marginTop: 6 }}>
              <Pressable onPressIn={sheetStartRec} onPressOut={sheetStopRec} style={[styles.bigMic, sheetRecording && styles.bigMicRecording]}>
                {sheetRecording && (
                  <Animated.View
                    style={[
                      styles.bigMicPulse,
                      { backgroundColor: colors.danger, transform: [{ scale: pulse }], opacity: pulse.interpolate({ inputRange: [1, 1.7], outputRange: [0.5, 0] }) },
                    ]}
                  />
                )}
                <MicIcon size={40} />
              </Pressable>
              <Text style={styles.bigMicHint}>
                {sheetRecording ? `Recording… ${fmt(sheetRecTime)}` : sheetHasRec ? 'Recorded — release to send' : 'Tap and hold to record'}
              </Text>
            </View>

            <View style={styles.sheetActions}>
              <Pressable onPress={closeSheet} style={[styles.btn, styles.btnGhost]}>
                <Text style={[styles.btnText, { color: colors.nightGreen }]}>Cancel</Text>
              </Pressable>
              <Pressable
                disabled={!sheetHasRec}
                onPress={() => {
                  Alert.alert('Sent to Odoo', 'Task will appear in your inbox.');
                  closeSheet();
                }}
                style={[styles.btn, styles.btnPrimary, !sheetHasRec && { backgroundColor: '#b9c2c1' }]}
              >
                <Text style={[styles.btnText, { color: colors.white }]}>Send to Odoo</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* My Card QR modal */}
        <Modal visible={qrOpen} transparent animationType="fade" onRequestClose={() => setQrOpen(false)}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setQrOpen(false)} />
          <View style={styles.qrModal}>
            <Text style={styles.sheetKicker}>— My Card</Text>
            <Text style={styles.sheetTitle}>Share your contact</Text>
            <Text style={styles.sheetSub}>Let others scan this QR to add you to their contacts.</Text>

            <View style={styles.qrBox}>
              <QRCode value={buildVCard(myCard)} size={220} backgroundColor="#ffffff" color={colors.nightGreen} />
            </View>

            <View style={styles.vcardSummary}>
              <Text style={styles.vcardName}>{myCard.firstName} {myCard.lastName}</Text>
              <Text style={styles.vcardLine}>{myCard.function} · {myCard.company}</Text>
              <Text style={styles.vcardLine}>{myCard.email}</Text>
              {!!myCard.mobile && <Text style={styles.vcardLine}>{myCard.mobile}</Text>}
            </View>

            <Pressable onPress={() => setQrOpen(false)} style={[styles.btn, styles.btnPrimary, { marginTop: 18 }]}>
              <Text style={[styles.btnText, { color: colors.white }]}>Close</Text>
            </Pressable>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  scroll: { padding: 18, paddingBottom: 140, gap: 14 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  logo: { width: 64, height: 30 },
  myCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.sandBorder,
  },
  myCardBtnText: { fontFamily: fonts.bold, fontSize: 12, color: colors.nightGreen },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    padding: 16,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.morningGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: { color: colors.white, fontFamily: fonts.bold, fontSize: 12 },
  cardTitle: { color: colors.nightGreen, fontFamily: fonts.bold, fontSize: 14, flex: 1 },

  // Capture
  captureZone: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: colors.sand,
    borderWidth: 1.5,
    borderColor: colors.sandBorder,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  captureZoneFilled: { borderStyle: 'solid', borderColor: colors.morningGreen, padding: 0 },
  captureEmpty: { alignItems: 'center', gap: 6, paddingHorizontal: 20 },
  captureHint: { fontFamily: fonts.bold, fontSize: 14, color: colors.nightGreen, marginTop: 4 },
  captureSub: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
  capturePreview: { width: '100%', height: '100%' },
  retakeBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(46,68,71,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  retakeText: { color: colors.white, fontFamily: fonts.bold, fontSize: 12 },

  // Action row
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    backgroundColor: colors.white,
  },
  actionRowChecked: { backgroundColor: colors.sand, borderColor: colors.morningGreen },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.sandBorder,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.morningGreen, borderColor: colors.morningGreen },
  actionIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.nightGreen },
  actionSub: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.muted, marginTop: 1 },

  // Voice
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    backgroundColor: colors.sand,
  },
  voiceBtnRecording: { backgroundColor: colors.dangerBg, borderColor: colors.danger },
  voiceBtnIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.morningGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceBtnLabel: { flex: 1, fontFamily: fonts.bold, fontSize: 14, color: colors.nightGreen },
  voiceBtnTime: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  voiceResult: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.morningGreen,
    backgroundColor: colors.white,
  },
  wave: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 24, flex: 1 },
  waveBar: { width: 3, backgroundColor: colors.morningGreen, borderRadius: 2 },
  voiceResultTime: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  voiceClear: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },

  // Process
  processBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.nightGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  processBtnDisabled: { backgroundColor: '#b9c2c1' },
  processBtnText: { color: colors.white, fontFamily: fonts.bold, fontSize: 16 },
  processPipeline: { textAlign: 'center', fontSize: 11, color: colors.muted, marginTop: 6 },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 14,
    paddingRight: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.morningGreen,
    shadowColor: colors.morningGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: { color: colors.white, fontFamily: fonts.bold, fontSize: 13 },

  // Sheet
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(46,68,71,0.45)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: colors.sandBorder, alignSelf: 'center', marginBottom: 14 },
  sheetKicker: { fontFamily: fonts.bold, fontSize: 11, color: colors.morningGreen },
  sheetTitle: { fontFamily: fonts.light, fontSize: 22, color: colors.nightGreen, marginVertical: 4 },
  sheetSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, lineHeight: 19, marginBottom: 22 },
  bigMic: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.morningGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bigMicRecording: { backgroundColor: colors.danger },
  bigMicPulse: { ...StyleSheet.absoluteFillObject, borderRadius: 48 },
  bigMicHint: { textAlign: 'center', fontFamily: fonts.bold, fontSize: 13, color: colors.muted, marginBottom: 22 },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btn: { flex: 1, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnGhost: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandBorder },
  btnPrimary: { backgroundColor: colors.nightGreen },
  btnText: { fontFamily: fonts.bold, fontSize: 14 },

  // QR modal
  qrModal: {
    position: 'absolute',
    top: '8%',
    left: 18,
    right: 18,
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
  },
  qrBox: {
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    marginTop: 8,
  },
  vcardSummary: { marginTop: 16, alignItems: 'center', gap: 2 },
  vcardName: { fontFamily: fonts.bold, fontSize: 16, color: colors.nightGreen },
  vcardLine: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
});
