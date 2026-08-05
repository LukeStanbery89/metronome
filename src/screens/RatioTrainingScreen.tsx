import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BeatDots } from '../components/BeatDots';
import { BpmControl } from '../components/BpmControl';
import { Card } from '../components/Card';
import { CountInControl } from '../components/CountInControl';
import { MeasuresControl } from '../components/MeasuresControl';
import { TimeSignatureControl } from '../components/TimeSignatureControl';
import { TransportButton } from '../components/TransportButton';
import { buildRatioPlan } from '../engine/sequence';
import { useBpm } from '../state/useBpm';
import { Transport } from '../state/useTransport';
import { TimeSignature } from '../types';
import { clampCountIn } from '../utils/clamp';

interface Settings {
  sig1: TimeSignature;
  countInBeats1: number;
  measures1: number;
  sig2: TimeSignature;
  countInBeats2: number;
  measures2: number;
}

interface Props {
  transport: Transport;
}

export function RatioTrainingScreen({ transport }: Props) {
  const [settings, setSettings] = useState<Settings>({
    sig1: { beats: 4, noteValue: 4, subdivision: 1 },
    countInBeats1: 4,
    measures1: 1,
    sig2: { beats: 4, noteValue: 4, subdivision: 2 },
    countInBeats2: 4,
    measures2: 1,
  });

  // Every settings change rebuilds the plan and, if a session is running,
  // restarts it immediately so edits apply on the next loop cycle.
  const applySettings = useCallback(
    (next: { bpm: number } & Settings) => {
      const { bpm, ...rest } = next;
      setSettings(rest);
      if (transport.isPlaying) {
        transport.restart(
          buildRatioPlan(
            rest.sig1,
            rest.countInBeats1,
            rest.measures1,
            rest.sig2,
            rest.countInBeats2,
            rest.measures2
          ),
          bpm
        );
      }
    },
    [transport]
  );

  const onCommitBpm = useCallback(
    (bpm: number) => applySettings({ bpm, ...settings }),
    [settings, applySettings]
  );
  const { bpm, displayBpm, previewBpm, commitBpm } = useBpm(120, onCommitBpm);

  const togglePlay = () => {
    if (transport.isPlaying) {
      transport.stop();
    } else {
      transport.start(
        buildRatioPlan(
          settings.sig1,
          settings.countInBeats1,
          settings.measures1,
          settings.sig2,
          settings.countInBeats2,
          settings.measures2
        ),
        bpm
      );
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
            fallbackBeats={settings.sig1.beats}
            fallbackSubdivisions={settings.sig1.subdivision}
          />
          <Card title="Tempo">
            <BpmControl
              value={bpm}
              displayValue={displayBpm}
              onPreview={previewBpm}
              onCommit={commitBpm}
            />
          </Card>
          <Card title="Group 1">
            <TimeSignatureControl
              beats={settings.sig1.beats}
              noteValue={settings.sig1.noteValue}
              subdivision={settings.sig1.subdivision}
              onBeatsChange={(beats) =>
                applySettings({
                  bpm,
                  ...settings,
                  sig1: { ...settings.sig1, beats },
                  // Keep the count-in within the new max when beats shrink.
                  countInBeats1: clampCountIn(settings.countInBeats1, beats),
                })
              }
              onNoteValueChange={(noteValue) =>
                applySettings({
                  bpm,
                  ...settings,
                  sig1: { ...settings.sig1, noteValue },
                })
              }
              onSubdivisionChange={(subdivision) =>
                applySettings({
                  bpm,
                  ...settings,
                  sig1: { ...settings.sig1, subdivision },
                })
              }
            />
            <MeasuresControl
              value={settings.measures1}
              onChange={(measures1) => applySettings({ bpm, ...settings, measures1 })}
            />
            <CountInControl
              value={settings.countInBeats1}
              maxBeats={Math.max(4, settings.sig1.beats)}
              onChange={(countInBeats1) =>
                applySettings({ bpm, ...settings, countInBeats1 })
              }
            />
          </Card>
          <Card title="Group 2">
            <TimeSignatureControl
              beats={settings.sig2.beats}
              noteValue={settings.sig2.noteValue}
              subdivision={settings.sig2.subdivision}
              onBeatsChange={(beats) =>
                applySettings({
                  bpm,
                  ...settings,
                  sig2: { ...settings.sig2, beats },
                  countInBeats2: clampCountIn(settings.countInBeats2, beats),
                })
              }
              onNoteValueChange={(noteValue) =>
                applySettings({
                  bpm,
                  ...settings,
                  sig2: { ...settings.sig2, noteValue },
                })
              }
              onSubdivisionChange={(subdivision) =>
                applySettings({
                  bpm,
                  ...settings,
                  sig2: { ...settings.sig2, subdivision },
                })
              }
            />
            <MeasuresControl
              value={settings.measures2}
              onChange={(measures2) => applySettings({ bpm, ...settings, measures2 })}
            />
            <CountInControl
              value={settings.countInBeats2}
              maxBeats={Math.max(4, settings.sig2.beats)}
              onChange={(countInBeats2) =>
                applySettings({ bpm, ...settings, countInBeats2 })
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
