import { Accent } from '../types';

// Contract every audio driver implements. Two backends exist: the Web Audio
// one (used on web/iOS Chrome) and the expo-audio one (used on the native
// app). The Scheduler drives both through this single interface.
export interface AudioBackend {
  // Current time in seconds on the driver's clock. All scheduleClick times
  // are expressed on this same clock.
  now(): number;
  // Make the driver ready to produce sound. Resolves once the clock is
  // actually running (e.g. after an AudioContext resume), so the scheduler
  // can safely schedule clicks immediately afterwards.
  init(): Promise<void>;
  // Queue a click of the given accent to play at `time` (seconds, driver clock).
  scheduleClick(time: number, accent: Accent): void;
  // Tear down playback resources. Must tolerate being called when not started.
  close(): void;
}
