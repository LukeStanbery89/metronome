import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BeatDots } from '../components/BeatDots';
import { BpmControl } from '../components/BpmControl';
import { Card } from '../components/Card';
import { TimeSignatureControl } from '../components/TimeSignatureControl';
import { Toggle } from '../components/Toggle';
import { TransportButton } from '../components/TransportButton';
import { buildMetronomePlan } from '../engine/sequence';
import { Transport } from '../state/useTransport';
import { colors, spacing } from '../theme';
import { TimeSignature } from '../types';

interface Settings {
  bpm: number;
  displayBpm: number;
  sig: TimeSignature;
  countIn: boolean;
}

interface Props {
  transport: Transport;
}

export function MetronomeScreen({ transport }: Props) {
  const [settings, setSettings] = useState<Settings>({
    bpm: 120,
    displayBpm: 120,
    sig: { beats: 4, noteValue: 4, subdivision: 1 },
    countIn: false,
  });

  const applySettings = useCallback(
    (next: Settings) => {
      setSettings(next);
      if (transport.isPlaying) {
        transport.restart(buildMetronomePlan(next.sig, next.countIn), next.bpm);
      }
    },
    [transport]
  );

  const previewBpm = useCallback((v: number) => {
    setSettings((s) => ({ ...s, displayBpm: v }));
  }, []);

  const commitBpm = useCallback(
    (v: number) => applySettings({ ...settings, bpm: v, displayBpm: v }),
    [settings, applySettings]
  );

  const setCountIn = useCallback(
    (countIn: boolean) => applySettings({ ...settings, countIn }),
    [settings, applySettings]
  );

  const setSig = useCallback(
    (sig: TimeSignature) => applySettings({ ...settings, sig }),
    [settings, applySettings]
  );

  const togglePlay = () => {
    if (transport.isPlaying) {
      transport.stop();
    } else {
      transport.start(buildMetronomePlan(settings.sig, settings.countIn), settings.bpm);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.inner}>
        <View style={styles.main}>
          <BeatDots
            step={transport.beat?.step ?? null}
            fallbackBeats={settings.sig.beats}
            fallbackSubdivisions={settings.sig.subdivision}
          />
          <Card title="Tempo">
            <BpmControl
              value={settings.bpm}
              displayValue={settings.displayBpm}
              onPreview={previewBpm}
              onCommit={commitBpm}
            />
          </Card>
          <Card title="Time Signature">
            <TimeSignatureControl
              beats={settings.sig.beats}
              noteValue={settings.sig.noteValue}
              subdivision={settings.sig.subdivision}
              onBeatsChange={(beats) => setSig({ ...settings.sig, beats })}
              onNoteValueChange={(noteValue) => setSig({ ...settings.sig, noteValue })}
              onSubdivisionChange={(subdivision) =>
                setSig({ ...settings.sig, subdivision })
              }
            />
          </Card>
          <Card title="Count In">
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>
                Count in one measure before starting
              </Text>
              <Toggle value={settings.countIn} onChange={setCountIn} />
            </View>
          </Card>
        </View>
        <View style={styles.transport}>
          <TransportButton isPlaying={transport.isPlaying} onPress={togglePlay} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingVertical: 12,
  },
  inner: {
    width: '100%',
    marginVertical: 'auto',
    gap: 12,
  },
  main: {
    gap: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  toggleLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  transport: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
});
