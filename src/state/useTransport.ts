import { useCallback, useEffect, useRef, useState } from 'react';
import { createAudioBackend } from '../audio';
import { AudioBackend } from '../audio/types';
import { Scheduler } from '../engine/scheduler';
import { PlaybackPlan } from '../engine/sequence';
import { BeatEvent } from '../types';

export interface Transport {
  isPlaying: boolean;
  beat: BeatEvent | null;
  start: (plan: PlaybackPlan, bpm: number) => void;
  restart: (plan: PlaybackPlan, bpm: number) => void;
  stop: () => void;
}

// Bridges the audio Scheduler into React state. The scheduler drives beats
// through its onBeat callback, which is what updates `beat` here; playback
// start/stop itself is intentionally fire-and-forget (start is async but the
// UI doesn't await it — the first beat callback follows quickly after).
// The backend factory is injectable so tests can supply a fake driver.
export function useTransport(
  createBackend: () => AudioBackend = createAudioBackend
): Transport {
  const schedulerRef = useRef<Scheduler | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beat, setBeat] = useState<BeatEvent | null>(null);

  // The backend + scheduler are created lazily on the first start so no audio
  // context is touched until the user actually presses play.
  const getScheduler = useCallback(() => {
    if (!schedulerRef.current) {
      schedulerRef.current = new Scheduler(createBackend());
    }
    return schedulerRef.current;
  }, [createBackend]);

  const start = useCallback(
    (plan: PlaybackPlan, bpm: number) => {
      setBeat(null);
      getScheduler().start(plan, bpm, (step, beatIndex) =>
        setBeat({ step, beatIndex })
      );
      setIsPlaying(true);
    },
    [getScheduler]
  );

  // restart applies a settings change mid-playback. It is guarded by the
  // scheduler's isRunning so edits made while stopped don't silently start
  // playback; the screens only call it when transport.isPlaying is true.
  const restart = useCallback(
    (plan: PlaybackPlan, bpm: number) => {
      if (!schedulerRef.current?.isRunning) return;
      setBeat(null);
      getScheduler().start(plan, bpm, (step, beatIndex) =>
        setBeat({ step, beatIndex })
      );
    },
    [getScheduler]
  );

  const stop = useCallback(() => {
    schedulerRef.current?.stop();
    setBeat(null);
    setIsPlaying(false);
  }, []);

  // Tear down any running playback if the screen unmounts.
  useEffect(() => {
    return () => schedulerRef.current?.stop();
  }, []);

  return { isPlaying, beat, start, restart, stop };
}
