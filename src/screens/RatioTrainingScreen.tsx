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
import { Transport } from '../state/useTransport';
import { spacing } from '../theme';
import { TimeSignature } from '../types';

interface Settings {
  bpm: number;
  displayBpm: number;
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
    bpm: 120,
    displayBpm: 120,
    sig1: { beats: 4, noteValue: 4, subdivision: 1 },
    countInBeats1: 4,
    measures1: 1,
    sig2: { beats: 4, noteValue: 4, subdivision: 2 },
    countInBeats2: 4,
    measures2: 1,
  });

  const applySettings = useCallback(
    (next: Settings) => {
      setSettings(next);
      if (transport.isPlaying) {
        transport.restart(
          buildRatioPlan(
            next.sig1,
            next.countInBeats1,
            next.measures1,
            next.sig2,
            next.countInBeats2,
            next.measures2
          ),
          next.bpm
        );
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
        settings.bpm
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.inner}>
        <View style={styles.main}>
          <BeatDots
            step={transport.beat?.step ?? null}
            fallbackBeats={settings.sig1.beats}
            fallbackSubdivisions={settings.sig1.subdivision}
          />
        <Card title="Tempo">
          <BpmControl
            value={settings.bpm}
            displayValue={settings.displayBpm}
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
                ...settings,
                sig1: { ...settings.sig1, beats },
                countInBeats1: Math.min(settings.countInBeats1, Math.max(4, beats)),
              })
            }
            onNoteValueChange={(noteValue) =>
              applySettings({ ...settings, sig1: { ...settings.sig1, noteValue } })
            }
            onSubdivisionChange={(subdivision) =>
              applySettings({ ...settings, sig1: { ...settings.sig1, subdivision } })
            }
          />
          <MeasuresControl
            value={settings.measures1}
            onChange={(measures1) => applySettings({ ...settings, measures1 })}
          />
          <CountInControl
            value={settings.countInBeats1}
            maxBeats={Math.max(4, settings.sig1.beats)}
            onChange={(countInBeats1) => applySettings({ ...settings, countInBeats1 })}
          />
        </Card>
        <Card title="Group 2">
          <TimeSignatureControl
            beats={settings.sig2.beats}
            noteValue={settings.sig2.noteValue}
            subdivision={settings.sig2.subdivision}
            onBeatsChange={(beats) =>
              applySettings({
                ...settings,
                sig2: { ...settings.sig2, beats },
                countInBeats2: Math.min(settings.countInBeats2, Math.max(4, beats)),
              })
            }
            onNoteValueChange={(noteValue) =>
              applySettings({ ...settings, sig2: { ...settings.sig2, noteValue } })
            }
            onSubdivisionChange={(subdivision) =>
              applySettings({ ...settings, sig2: { ...settings.sig2, subdivision } })
            }
          />
          <MeasuresControl
            value={settings.measures2}
            onChange={(measures2) => applySettings({ ...settings, measures2 })}
          />
          <CountInControl
            value={settings.countInBeats2}
            maxBeats={Math.max(4, settings.sig2.beats)}
            onChange={(countInBeats2) => applySettings({ ...settings, countInBeats2 })}
          />
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
    paddingVertical: 10,
  },
  inner: {
    width: '100%',
    marginVertical: 'auto',
    gap: 10,
  },
  main: {
    gap: 10,
  },
  transport: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
});
