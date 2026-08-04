import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { Stepper } from './Stepper';

interface TimeSignatureControlProps {
  beats: number;
  noteValue: number;
  subdivision: number;
  onBeatsChange: (beats: number) => void;
  onNoteValueChange: (noteValue: number) => void;
  onSubdivisionChange: (subdivision: number) => void;
}

const NOTE_VALUES = [1, 2, 4, 8, 16];
const SUBDIVISIONS = [1, 2, 3, 4, 6, 8];

const SUBDIVISION_LABELS: Record<number, string> = {
  1: 'Quarter',
  2: '8th',
  3: 'Triplet',
  4: '16th',
  6: '8th triplet',
  8: '32nd',
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function Value({ children, caption }: { children: React.ReactNode; caption?: string }) {
  return (
    <View style={styles.valueRow}>
      <Text style={styles.value}>{children}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

export function TimeSignatureControl({
  beats,
  noteValue,
  subdivision,
  onBeatsChange,
  onNoteValueChange,
  onSubdivisionChange,
}: TimeSignatureControlProps) {
  const noteIdx = NOTE_VALUES.indexOf(noteValue);
  const subIdx = SUBDIVISIONS.indexOf(subdivision);

  return (
    <View style={styles.wrap}>
      <Field label="Beats">
        <Value>{beats}</Value>
        <Stepper
          onDecrement={() => onBeatsChange(Math.max(1, beats - 1))}
          onIncrement={() => onBeatsChange(Math.min(12, beats + 1))}
        />
      </Field>
      <Text style={styles.slash}>/</Text>
      <Field label="Note">
        <Value>{noteValue}</Value>
        <Stepper
          onDecrement={() => onNoteValueChange(NOTE_VALUES[Math.max(0, noteIdx - 1)])}
          onIncrement={() =>
            onNoteValueChange(NOTE_VALUES[Math.min(NOTE_VALUES.length - 1, noteIdx + 1)])
          }
        />
      </Field>
      <View style={styles.divider} />
      <Field label="Subdivision">
        <Value caption={SUBDIVISION_LABELS[subdivision]}>
          {subdivision}
        </Value>
        <Stepper
          onDecrement={() => onSubdivisionChange(SUBDIVISIONS[Math.max(0, subIdx - 1)])}
          onIncrement={() =>
            onSubdivisionChange(SUBDIVISIONS[Math.min(SUBDIVISIONS.length - 1, subIdx + 1)])
          }
        />
      </Field>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 16,
  },
  field: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  label: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  valueRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    lineHeight: 36,
  },
  caption: {
    color: colors.textFaint,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: -4,
  },
  slash: {
    color: colors.textFaint,
    fontSize: 32,
    fontWeight: '700',
    paddingTop: 18,
  },
  divider: {
    alignSelf: 'stretch',
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
});
