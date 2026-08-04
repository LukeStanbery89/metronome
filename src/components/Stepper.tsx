import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';

interface StepperProps {
  onDecrement: () => void;
  onIncrement: () => void;
  disabled?: boolean;
}

export function Stepper({ onDecrement, onIncrement, disabled }: StepperProps) {
  const btnStyle = [styles.btn, disabled && styles.btnDisabled];
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onDecrement}
        disabled={disabled}
        style={({ pressed }) => [btnStyle, pressed && !disabled && styles.btnPressed]}
        hitSlop={8}
      >
        <Ionicons name="remove" size={16} color={disabled ? colors.textFaint : colors.text} />
      </Pressable>
      <Pressable
        onPress={onIncrement}
        disabled={disabled}
        style={({ pressed }) => [btnStyle, pressed && !disabled && styles.btnPressed]}
        hitSlop={8}
      >
        <Ionicons name="add" size={16} color={disabled ? colors.textFaint : colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    backgroundColor: colors.border,
  },
  btnDisabled: {
    opacity: 0.4,
  },
});
