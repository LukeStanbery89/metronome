import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';

interface StepperProps {
  onDecrement: () => void;
  onIncrement: () => void;
  disabled?: boolean;
  mode?: 'both' | 'decrement' | 'increment';
}

function StepButton({
  icon,
  onPress,
  disabled,
}: {
  icon: 'add' | 'remove';
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        disabled && styles.btnDisabled,
        pressed && !disabled && styles.btnPressed,
      ]}
      hitSlop={8}
    >
      <Ionicons name={icon} size={16} color={disabled ? colors.textFaint : colors.text} />
    </Pressable>
  );
}

export function Stepper({
  onDecrement,
  onIncrement,
  disabled,
  mode = 'both',
}: StepperProps) {
  return (
    <View style={styles.row}>
      {mode !== 'increment' ? (
        <StepButton icon="remove" onPress={onDecrement} disabled={disabled} />
      ) : null}
      {mode !== 'decrement' ? (
        <StepButton icon="add" onPress={onIncrement} disabled={disabled} />
      ) : null}
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
