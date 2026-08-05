import { useCallback, useState } from 'react';

// Shared BPM editing state for the screens. `displayBpm` tracks the slider
// thumb / readout while dragging; only `commitBpm` applies a real change, so
// live-slider movement never restarts the running metronome.
export interface BpmState {
  bpm: number;
  displayBpm: number;
  previewBpm: (value: number) => void;
  commitBpm: (value: number) => void;
}

export function useBpm(
  initial: number,
  onCommit: (value: number) => void
): BpmState {
  const [bpm, setBpm] = useState(initial);
  const [displayBpm, setDisplayBpm] = useState(initial);

  const previewBpm = useCallback((value: number) => {
    setDisplayBpm(value);
  }, []);

  const commitBpm = useCallback(
    (value: number) => {
      setBpm(value);
      setDisplayBpm(value);
      onCommit(value);
    },
    [onCommit]
  );

  return { bpm, displayBpm, previewBpm, commitBpm };
}
