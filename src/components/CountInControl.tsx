import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

interface CountInControlProps {
  value: number;
  maxBeats: number;
  onChange: (value: number) => void;
}

function readout(value: number): string {
  if (value <= 0) return 'Off';
  return value === 1 ? '1 beat' : `${value} beats`;
}

export function CountInControl({
  value,
  maxBeats,
  onChange,
}: CountInControlProps) {
  const [preview, setPreview] = useState<number | null>(null);
  const display = preview ?? value;

  return (
    <View style={styles.wrap}>
      <View style={styles.readoutRow}>
        <Text style={styles.label}>Count in</Text>
        <Text style={styles.value}>{readout(display)}</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={Math.max(0, maxBeats)}
        step={1}
        value={display}
        minimumTrackTintColor={colors.accent}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.accent}
        onValueChange={(v) => setPreview(Math.round(v))}
        onSlidingComplete={(v) => {
          setPreview(null);
          onChange(Math.round(v));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  readoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  label: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  value: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  slider: {
    width: '100%',
    height: 26,
  },
});
