import { Accent } from '../types';

export interface AudioBackend {
  now(): number;
  init(): void;
  scheduleClick(time: number, accent: Accent): void;
  close(): void;
}
