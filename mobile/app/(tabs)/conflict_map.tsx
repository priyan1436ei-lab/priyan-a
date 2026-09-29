import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldAlert, Grid, Sparkles, ArrowRight } from 'lucide-react-native';
import { useMobileFinFam } from '../../src/context/MobileFinFamContext';
import { MobileTopAppBar } from '../../src/components/MobileTopAppBar';
import { MobileGoalConflictAlert } from '../../src/components/MobileGoalConflictAlert';
import { MobileGoalInterferenceMatrix } from '../../src/components/MobileGoalInterferenceMatrix';
import { MobileRippleChain } from '../../src/components/MobileRippleChain';

export default function ConflictMapScreen() {
  const router = useRouter();
  const { state } = useMobileFinFam();
  const { conflicts, matrix, goals, feasibilityReport } = state;

  const goalNames = goals.map((g) => g.name);

  return (
    <View style={styles.container}>
      <MobileTopAppBar userEmail={state.userEmail} subscriptionTier={state.subscriptionTier} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.banner}>
          <ShieldAlert size={24} color="#F59E0B" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.bannerTitle}>Goal Conflict Matrix & Heatmap</Text>
            <Text style={styles.bannerSub}>
              Detect overlapping capital requirements and liquidity bottlenecks across goals.
            </Text>
          </View>
        </View>

        {/* CTA Bar */}
        <Pressable
          style={styles.solveCtaBar}
          onPress={() => router.push('/(tabs)/resolution_lab')}
        >
          <View style={styles.ctaLeft}>
            <Sparkles size={20} color="#0F172A" />
            <Text style={styles.ctaTitle}>AI Conflict Resolver</Text>
          </View>

          <View style={styles.ctaRight}>
            <Text style={styles.ctaActionText}>Solve 5 Strategies</Text>
            <ArrowRight size={16} color="#0F172A" />
          </View>
        </Pressable>

        {/* Conflicts Alert Cards */}
        <MobileGoalConflictAlert
          conflicts={conflicts}
          onSolvePress={() => router.push('/(tabs)/resolution_lab')}
        />

        {/* Goal Interference Matrix */}
        <MobileGoalInterferenceMatrix matrix={matrix} goalNames={goalNames} />

        {/* Downstream Ripple Chain */}
        <MobileRippleChain
          ripples={feasibilityReport?.downstreamRipples ?? []}
          triggerGoalName={goals[0]?.name}
          triggerAction="Simultaneous Capital Withdrawal"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  bannerTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  bannerSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  solveCtaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#06B6D4',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  ctaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
  ctaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctaActionText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
});
