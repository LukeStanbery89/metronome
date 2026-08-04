import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface TransportButtonProps {
  isPlaying: boolean;
  onPress: () => void;
}

export function TransportButton({ isPlaying, onPress }: TransportButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        isPlaying ? styles.btnStop : styles.btnPlay,
        pressed && styles.btnPressed,
      ]}
    >
      <Ionicons
        name={isPlaying ? 'stop' : 'play'}
        size={30}
        color={isPlaying ? colors.stop : colors.onAccent}
        style={isPlaying ? styles.stopIcon : styles.playIcon}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 72,
    height: 72,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnPlay: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  btnStop: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.stop,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  playIcon: {
    marginLeft: 4,
  },
  stopIcon: {},
});
