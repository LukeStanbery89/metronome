import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BeatDots } from '../components/BeatDots';
import { BpmControl } from '../components/BpmControl';
import { Card } from '../components/Card';
import { TimeSignatureControl } from '../components/TimeSignatureControl';
import { TransportButton } from '../components/TransportButton';
import { buildMetronomePlan } from '../engine/sequence';
import { Transport } from '../state/useTransport';
import { TimeSignature } from '../types';

interface Settings {
  bpm: number;
  displayBpm: number;
  sig: TimeSignature;
}

interface Props {
  transport: Transport;
}

export function MetronomeScreen({ transport }: Props) {
  const [settings, setSettings] = useState<Settings>({
    bpm: 120,
    displayBpm: 120,
    sig: { beats: 4, noteValue: 4, subdivision: 1 },
  });

  const applySettings = useCallback(
    (next: Settings) => {
      setSettings(next);
      if (transport.isPlaying) {
        transport.restart(buildMetronomePlan(next.sig), next.bpm);
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

  const setSig = useCallback(
    (sig: TimeSignature) => applySettings({ ...settings, sig }),
    [settings, applySettings]
  );

  const togglePlay = () => {
    if (transport.isPlaying) {
      transport.stop();
    } else {
      transport.start(buildMetronomePlan(settings.sig), settings.bpm);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.inner}>
        <View style={styles.main}>
          <View style={styles.transport}>
            <TransportButton isPlaying={transport.isPlaying} onPress={togglePlay} />
          </View>
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
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  inner: {
    width: '100%',
    gap: 10,
  },
  main: {
    gap: 10,
  },
  transport: {
    alignItems: 'center',
  },
});
