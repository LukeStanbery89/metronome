import Slider from '@react-native-community/slider';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { Stepper } from './Stepper';

interface BpmControlProps {
  value: number;
  displayValue: number;
  onPreview: (value: number) => void;
  onCommit: (value: number) => void;
  disabled?: boolean;
}

const MIN_BPM = 30;
const MAX_BPM = 280;

function clamp(v: number): number {
  return Math.round(Math.min(MAX_BPM, Math.max(MIN_BPM, v)));
}

export function BpmControl({
  value,
  displayValue,
  onPreview,
  onCommit,
  disabled,
}: BpmControlProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!editing) setDraft(String(displayValue));
  }, [displayValue, editing]);

  const commitDraft = () => {
    const parsed = parseInt(draft, 10);
    if (!Number.isNaN(parsed)) {
      onCommit(clamp(parsed));
    } else {
      setDraft(String(displayValue));
    }
    setEditing(false);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.readoutRow}>
        <Stepper
          onDecrement={() => onCommit(clamp(value - 1))}
          onIncrement={() => onCommit(clamp(value + 1))}
          disabled={disabled}
        />
        <View style={styles.readout}>
          {editing ? (
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onBlur={commitDraft}
              onSubmitEditing={commitDraft}
              autoFocus
              selectTextOnFocus
              keyboardType="number-pad"
              inputMode="numeric"
              style={styles.bpmInput}
              placeholderTextColor={colors.textDim}
            />
          ) : (
            <Pressable onPress={() => setEditing(true)} disabled={disabled}>
              <Text style={styles.bpmText}>{displayValue}</Text>
            </Pressable>
          )}
          <Text style={styles.bpmUnit}>BPM</Text>
        </View>
        <Stepper
          onDecrement={() => onCommit(clamp(value - 5))}
          onIncrement={() => onCommit(clamp(value + 5))}
          disabled={disabled}
        />
      </View>
      <Slider
        style={styles.slider}
        minimumValue={MIN_BPM}
        maximumValue={MAX_BPM}
        step={1}
        value={displayValue}
        minimumTrackTintColor={colors.accent}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.accent}
        onValueChange={(v) => onPreview(Math.round(v))}
        onSlidingComplete={(v) => onCommit(Math.round(v))}
        disabled={disabled}
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
    gap: spacing.sm,
  },
  readout: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  bpmText: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    lineHeight: 44,
  },
  bpmInput: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    lineHeight: 44,
    textAlign: 'center',
    minWidth: 88,
    padding: 0,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
  },
  bpmUnit: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
  },
  slider: {
    width: '100%',
    height: 26,
  },
});
