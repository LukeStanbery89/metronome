import { useCallback, useEffect, useRef, useState } from 'react';
import { createAudioBackend } from '../audio';
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

export function useTransport(): Transport {
  const schedulerRef = useRef<Scheduler | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beat, setBeat] = useState<BeatEvent | null>(null);

  const getScheduler = useCallback(() => {
    if (!schedulerRef.current) {
      schedulerRef.current = new Scheduler(createAudioBackend());
    }
    return schedulerRef.current;
  }, []);

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

  useEffect(() => {
    return () => schedulerRef.current?.stop();
  }, []);

  return { isPlaying, beat, start, restart, stop };
}
