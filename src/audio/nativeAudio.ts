import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { Accent } from '../types';
import { AudioBackend } from './types';

const SOURCES: Record<Accent, number> = {
  measure: require('../../assets/clicks/measure.wav'),
  beat: require('../../assets/clicks/beat.wav'),
  subdivision: require('../../assets/clicks/subdivision.wav'),
  countin: require('../../assets/clicks/countin.wav'),
};

export class NativeAudioBackend implements AudioBackend {
  private players: Partial<Record<Accent, AudioPlayer>> = {};
  private queue: { time: number; accent: Accent }[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private active = false;

  now(): number {
    if (typeof performance !== 'undefined') {
      return performance.now() / 1000;
    }
    return Date.now() / 1000;
  }

  async init(): Promise<void> {
    if (this.active) return;
    this.active = true;
    // Plays even with the hardware ringer/mute switch on and keeps
    // background music (practice tracks) audible underneath the clicks.
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    }).catch(() => {});
    if (!this.players.measure) {
      this.players.measure = createAudioPlayer(SOURCES.measure);
      this.players.beat = createAudioPlayer(SOURCES.beat);
      this.players.subdivision = createAudioPlayer(SOURCES.subdivision);
      this.players.countin = createAudioPlayer(SOURCES.countin);
    }
    // Pump loop: expo-audio play() is async, so scheduled clicks are
    // buffered here and fired off as their timestamps arrive.
    this.timer = setInterval(() => this.pump(), 4);
  }

  scheduleClick(time: number, accent: Accent): void {
    this.queue.push({ time, accent });
  }

  close(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.queue = [];
    this.active = false;
  }

  private pump(): void {
    const now = this.now();
    while (this.queue.length > 0 && this.queue[0].time <= now) {
      const { accent } = this.queue.shift() as { time: number; accent: Accent };
      const player = this.players[accent];
      if (player) {
        void player.seekTo(0).then(() => player.play());
      }
    }
  }
}
