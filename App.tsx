import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBar, TabId } from './src/components/TabBar';
import { MetronomeScreen } from './src/screens/MetronomeScreen';
import { RatioTrainingScreen } from './src/screens/RatioTrainingScreen';
import { useTransport } from './src/state/useTransport';
import { colors, spacing } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppInner />
    </SafeAreaProvider>
  );
}

function AppInner() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabId>('metronome');
  const transport = useTransport();

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar style="light" />
      <View style={styles.shell}>
        <View style={styles.header}>
          <Text style={styles.title}>Tempo Trainer</Text>
          <Text style={styles.subtitle}>Guitar Speed Practice</Text>
        </View>
        <View style={styles.tabBarWrap}>
          <TabBar active={tab} onChange={setTab} />
        </View>
        <View style={styles.content}>
          {tab === 'metronome' ? (
            <MetronomeScreen transport={transport} />
          ) : (
            <RatioTrainingScreen transport={transport} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
  },
  header: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: 2,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tabBarWrap: {
    paddingBottom: spacing.sm,
  },
  content: {
    flex: 1,
  },
});
