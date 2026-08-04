import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { Stepper } from './Stepper';

interface MeasuresControlProps {
  value: number;
  onChange: (value: number) => void;
}

const MIN_MEASURES = 1;
const MAX_MEASURES = 8;

export function MeasuresControl({ value, onChange }: MeasuresControlProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>Measures</Text>
      <View style={styles.valueWrap}>
        <Text style={styles.value}>{value}</Text>
      </View>
      <Stepper
        onDecrement={() => onChange(Math.max(MIN_MEASURES, value - 1))}
        onIncrement={() => onChange(Math.min(MAX_MEASURES, value + 1))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  valueWrap: {
    flex: 1,
    alignItems: 'center',
  },
  value: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    lineHeight: 26,
  },
});
