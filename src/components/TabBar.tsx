import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export type TabId = 'metronome' | 'ratio';

interface TabBarProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: keyof typeof Ionicons.glyphMap }[] =
  [
    { id: 'metronome', label: 'Metronome', icon: 'timer' },
    { id: 'ratio', label: 'Ratio Training', icon: 'swap-vertical' },
  ];

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.tabActive,
              pressed && styles.tabPressed,
            ]}
          >
            <Ionicons
              name={isActive ? tab.icon : `${tab.icon}-outline` as keyof typeof Ionicons.glyphMap}
              size={15}
              color={isActive ? colors.accent : colors.textDim}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  tabActive: {
    backgroundColor: colors.accentSoft,
  },
  tabPressed: {
    opacity: 0.8,
  },
  label: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.accent,
  },
});
