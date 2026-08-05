import { createElement } from 'react';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Vitest runs with globals disabled, so RTL can't register its own cleanup;
// do it explicitly so rendered DOM doesn't leak between tests in a file.
afterEach(() => cleanup());

// react-native-web's Animated needs requestAnimationFrame, which jsdom only
// provides when configured to "pretend to be visual".
if (typeof globalThis.requestAnimationFrame !== 'function') {
  globalThis.requestAnimationFrame = (cb) =>
    setTimeout(() => cb(performance.now()), 0) as unknown as number;
}

// Silence React 19 "act" environment warnings when testing hooks/components.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

// Native-only modules can't be imported in jsdom, so they get functional
// stubs. The slider stub behaves like the real one: it reports both preview
// (onValueChange) and commit (onSlidingComplete) values.
vi.mock('@react-native-community/slider', () => ({
  __esModule: true,
  default: (props: {
    onValueChange?: (v: number) => void;
    onSlidingComplete?: (v: number) => void;
    minimumValue?: number;
    maximumValue?: number;
    value?: number;
    step?: number;
  }) =>
    createElement('input', {
      type: 'range',
      'data-testid': 'slider',
      min: props.minimumValue ?? 0,
      max: props.maximumValue ?? 100,
      value: props.value ?? 0,
      step: props.step ?? 1,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = Number(e.target.value);
        props.onValueChange?.(v);
        props.onSlidingComplete?.(v);
      },
    }),
}));

vi.mock('@expo/vector-icons', () => ({
  __esModule: true,
  Ionicons: ({ name }: { name?: string }) =>
    createElement('span', { 'data-testid': 'icon', 'data-name': name ?? '' }),
}));

// expo-audio is pulled in via the native audio backend; tests use a fake
// backend, so the module itself is stubbed out.
vi.mock('expo-audio', () => ({
  __esModule: true,
  createAudioPlayer: () => ({
    seekTo: async () => {},
    play: async () => {},
  }),
  setAudioModeAsync: async () => {},
}));
