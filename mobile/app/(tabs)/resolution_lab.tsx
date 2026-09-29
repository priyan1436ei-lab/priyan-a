import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react-native';
import { useMobileFinFam } from '../../src/context/MobileFinFamContext';
import { MobileTopAppBar } from '../../src/components/MobileTopAppBar';
import { MobileResolutionLab } from '../../src/components/MobileResolutionLab';

export default function ResolutionLabScreen() {
  const { state, applyResolution } = useMobileFinFam();
  const [activePlanId, setActivePlanId] = useState<string | undefined>(
    state.resolutionPlans[0]?.id
  );

  const handleApply = (plan: any) => {
    setActivePlanId(plan.id);
    applyResolution(plan);
    Alert.alert(
      'Strategy Applied!',
      `Successfully updated portfolio parameters according to ${plan.strategyName}. Feasibility projected at ${(plan.projectedFeasibility * 100).toFixed(0)}%.`
    );
  };

  return (
    <View style={styles.container}>
      <MobileTopAppBar userEmail={state.userEmail} subscriptionTier={state.subscriptionTier} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.banner}>
          <Sparkles size={24} color="#10B981" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.bannerTitle}>AI Conflict Resolution Hub</Text>
            <Text style={styles.bannerSub}>
              Multi-variable optimization engine generated 5 tailored strategies for your portfolio.
            </Text>
          </View>
        </View>

        {/* Resolution Lab Component */}
        <MobileResolutionLab
          resolutionPlans={state.resolutionPlans}
          onApplyPlan={handleApply}
          activePlanId={activePlanId}
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
});
