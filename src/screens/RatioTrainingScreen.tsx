import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BeatDots } from '../components/BeatDots';
import { BpmControl } from '../components/BpmControl';
import { Card } from '../components/Card';
import { MeasuresControl } from '../components/MeasuresControl';
import { TimeSignatureControl } from '../components/TimeSignatureControl';
import { Toggle } from '../components/Toggle';
import { TransportButton } from '../components/TransportButton';
import { buildRatioPlan } from '../engine/sequence';
import { Transport } from '../state/useTransport';
import { colors, spacing } from '../theme';
import { TimeSignature } from '../types';

interface Settings {
  bpm: number;
  displayBpm: number;
  sig1: TimeSignature;
  countIn1: boolean;
  measures1: number;
  sig2: TimeSignature;
  countIn2: boolean;
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
    countIn1: true,
    measures1: 1,
    sig2: { beats: 4, noteValue: 4, subdivision: 2 },
    countIn2: false,
    measures2: 1,
  });

  const applySettings = useCallback(
    (next: Settings) => {
      setSettings(next);
      if (transport.isPlaying) {
        transport.restart(
          buildRatioPlan(
            next.sig1,
            next.countIn1,
            next.measures1,
            next.sig2,
            next.countIn2,
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
          settings.countIn1,
          settings.measures1,
          settings.sig2,
          settings.countIn2,
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
              applySettings({ ...settings, sig1: { ...settings.sig1, beats } })
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
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Count in one measure</Text>
            <Toggle
              value={settings.countIn1}
              onChange={(countIn1) => applySettings({ ...settings, countIn1 })}
            />
          </View>
        </Card>
        <Card title="Group 2">
          <TimeSignatureControl
            beats={settings.sig2.beats}
            noteValue={settings.sig2.noteValue}
            subdivision={settings.sig2.subdivision}
            onBeatsChange={(beats) =>
              applySettings({ ...settings, sig2: { ...settings.sig2, beats } })
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
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Count in one measure</Text>
            <Toggle
              value={settings.countIn2}
              onChange={(countIn2) => applySettings({ ...settings, countIn2 })}
            />
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
