import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // Render React Native components in jsdom via react-native-web so
      // component/hook tests run without a native runtime or emulator.
      'react-native': 'react-native-web',
    },
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      // NOTE: the coverage % reported by `npm run test:coverage` is scoped to
      // engine, state, components, and utils only. The screens are excluded
      // below and are currently at 0% coverage, so whole-app coverage would be
      // far lower than the numbers this report shows. Re-include src/screens/**
      // and add screen-level tests when they get covered.
      exclude: [
        'src/**/*.test.{ts,tsx}',
        // Pure constants - nothing to assert.
        'src/theme.ts',
        // Browser/native-coupled drivers; testing them would mock the very
        // APIs they exercise for little value.
        'src/audio/**',
        // Screen-level integration tests are out of scope for now; re-include
        // when they get covered.
        'src/screens/**',
      ],
      // Fail the coverage run if coverage drops below these floors.
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 75,
        branches: 60,
      },
    },
  },
});
