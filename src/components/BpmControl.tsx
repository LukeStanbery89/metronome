import Slider from '@react-native-community/slider';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { BPM_MAX, BPM_MIN, clampBpm } from '../utils/clamp';
import { Stepper } from './Stepper';

interface BpmControlProps {
  value: number;
  displayValue: number;
  onPreview: (value: number) => void;
  onCommit: (value: number) => void;
  disabled?: boolean;
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

  // Keep the text field in sync with the committed value whenever we're not
  // actively editing (slider drags, steppers, external changes).
  useEffect(() => {
    if (!editing) setDraft(String(displayValue));
  }, [displayValue, editing]);

  // The slider previews continuously while dragging (onPreview) but only
  // commits once (onSlidingComplete), so the metronome doesn't restart on
  // every thumb movement. Steppers commit immediately.
  const commitDraft = () => {
    const parsed = parseInt(draft, 10);
    if (!Number.isNaN(parsed)) {
      onCommit(clampBpm(parsed));
    } else {
      setDraft(String(displayValue));
    }
    setEditing(false);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.readoutRow}>
        <Stepper
          mode="decrement"
          onDecrement={() => onCommit(clampBpm(value - 1))}
          onIncrement={() => onCommit(clampBpm(value + 1))}
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
          mode="increment"
          onDecrement={() => onCommit(clampBpm(value - 1))}
          onIncrement={() => onCommit(clampBpm(value + 1))}
          disabled={disabled}
        />
      </View>
      <Slider
        style={styles.slider}
        minimumValue={BPM_MIN}
        maximumValue={BPM_MAX}
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
