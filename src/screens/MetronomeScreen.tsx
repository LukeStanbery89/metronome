import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BeatDots } from '../components/BeatDots';
import { BpmControl } from '../components/BpmControl';
import { Card } from '../components/Card';
import { TimeSignatureControl } from '../components/TimeSignatureControl';
import { TransportButton } from '../components/TransportButton';
import { buildMetronomePlan } from '../engine/sequence';
import { useBpm } from '../state/useBpm';
import { Transport } from '../state/useTransport';
import { TimeSignature } from '../types';

interface Props {
  transport: Transport;
}

export function MetronomeScreen({ transport }: Props) {
  const [sig, setSigState] = useState<TimeSignature>({
    beats: 4,
    noteValue: 4,
    subdivision: 1,
  });

  // Committing a BPM change restarts a running metronome immediately; the
  // applySettings pattern is shared with the ratio trainer via useBpm.
  const applySettings = useCallback(
    (next: { bpm: number; sig: TimeSignature }) => {
      setSigState(next.sig);
      if (transport.isPlaying) {
        transport.restart(buildMetronomePlan(next.sig), next.bpm);
      }
    },
    [transport]
  );

  const onCommitBpm = useCallback(
    (bpm: number) => applySettings({ bpm, sig }),
    [sig, applySettings]
  );
  const { bpm, displayBpm, previewBpm, commitBpm } = useBpm(120, onCommitBpm);

  const setSig = useCallback(
    (nextSig: TimeSignature) => applySettings({ bpm, sig: nextSig }),
    [bpm, applySettings]
  );

  const togglePlay = () => {
    if (transport.isPlaying) {
      transport.stop();
    } else {
      transport.start(buildMetronomePlan(sig), bpm);
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
            fallbackBeats={sig.beats}
            fallbackSubdivisions={sig.subdivision}
          />
          <Card title="Tempo">
            <BpmControl
              value={bpm}
              displayValue={displayBpm}
              onPreview={previewBpm}
              onCommit={commitBpm}
            />
          </Card>
          <Card title="Time Signature">
            <TimeSignatureControl
              beats={sig.beats}
              noteValue={sig.noteValue}
              subdivision={sig.subdivision}
              onBeatsChange={(beats) => setSig({ ...sig, beats })}
              onNoteValueChange={(noteValue) => setSig({ ...sig, noteValue })}
              onSubdivisionChange={(subdivision) => setSig({ ...sig, subdivision })}
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
