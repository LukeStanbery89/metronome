import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BeatStep, SegmentKind } from '../types';
import { colors } from '../theme';

interface BeatDotsProps {
  step: BeatStep | null;
  fallbackBeats: number;
  fallbackSubdivisions?: number;
}

const SEGMENT_LABELS: Record<SegmentKind, string> = {
  metronome: 'Metronome',
  'count-in-1': 'Count-in 1',
  'group-1': 'Group 1',
  'count-in-2': 'Count-in 2',
  'group-2': 'Group 2',
};

interface DotProps {
  active: boolean;
  color: string;
  dim: boolean;
}

function Dot({ active, color, dim }: DotProps) {
  const scale = useRef(new Animated.Value(active ? 1.35 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: active ? 1.35 : 1,
      friction: 4,
      tension: 220,
      useNativeDriver: true,
    }).start();
  }, [active, scale]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: active ? color : dim ? colors.surfaceAlt : colors.surfaceAlt,
          borderColor: active ? color : dim ? colors.textFaint : colors.border,
          transform: [{ scale }],
        },
      ]}
    />
  );
}

export function BeatDots({ step, fallbackBeats, fallbackSubdivisions = 1 }: BeatDotsProps) {
  const total = step ? step.totalBeats : fallbackBeats;
  const active = step ? step.beatInMeasure : 0;
  const label = step ? SEGMENT_LABELS[step.segment] : 'Ready';
  const subdivisions = step ? step.subdivisions : fallbackSubdivisions;
  const subActive = step ? step.subdivisionIndex : 0;

  const tickColor = step && step.accent === 'countin' ? colors.countin : colors.accent;

  return (
    <View style={styles.wrap}>
      <View style={styles.labelPill}>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.dots}>
        {Array.from({ length: total }, (_, i) => {
          const beatIndex = i + 1;
          const isActive = step !== null && active === beatIndex;
          let color: string = colors.beat;
          if (step && step.accent === 'countin') {
            color = colors.countin;
          } else if (beatIndex === 1) {
            color = colors.downbeat;
          }
          return (
            <Dot key={i} active={isActive} color={color} dim={step === null} />
          );
        })}
      </View>
      {subdivisions > 1 ? (
        <View style={styles.subRow}>
          {Array.from({ length: subdivisions }, (_, i) => (
            <View
              key={i}
              style={[
                styles.subTick,
                step !== null && i === subActive && {
                  backgroundColor: tickColor,
                  borderColor: tickColor,
                },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 10,
  },
  labelPill: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  label: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dots: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    minHeight: 18,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  subRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    height: 6,
  },
  subTick: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
