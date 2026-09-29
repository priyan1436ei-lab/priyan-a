import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Sliders, GitCommit, Sparkles } from 'lucide-react-native';
import { useMobileFinFam } from '../../src/context/MobileFinFamContext';
import { MobileTopAppBar } from '../../src/components/MobileTopAppBar';
import { MobileWhatIfScenarioLab } from '../../src/components/MobileWhatIfScenarioLab';
import { MobileRippleChain } from '../../src/components/MobileRippleChain';
import { MobileRadarChart } from '../../src/components/MobileSvgCharts';

export default function WhatIfLabScreen() {
  const { state, runSimulation } = useMobileFinFam();
  const [simulatedScore, setSimulatedScore] = useState<number>(state.overallScore);

  const handleSimulate = (params: any) => {
    const report = runSimulation(params);
    setSimulatedScore(report.overallFeasibilityScore * 100);
  };

  const chartData = state.goals.map((g) => ({
    label: g.name.substring(0, 6),
    value: Math.min(100, (g.currentAmount / Math.max(1, g.targetAmount)) * 100 + 40),
  }));

  return (
    <View style={styles.container}>
      <MobileTopAppBar userEmail={state.userEmail} subscriptionTier={state.subscriptionTier} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.banner}>
          <Sliders size={24} color="#06B6D4" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.bannerTitle}>What-If & Ripple Simulator</Text>
            <Text style={styles.bannerSub}>
              Stress test economic shocks, career changes, & goal delays in real-time.
            </Text>
          </View>
        </View>

        {/* What-If Lab Component */}
        <MobileWhatIfScenarioLab
          onSimulate={handleSimulate}
          currentScore={state.overallScore}
          simulatedScore={simulatedScore}
        />

        {/* Portfolio Radar Visualizer */}
        <View style={styles.chartBox}>
          <Text style={styles.chartTitle}>Portfolio Stress Radar</Text>
          <MobileRadarChart data={chartData} width={300} height={200} />
        </View>

        {/* Ripple Chain */}
        <MobileRippleChain
          ripples={state.feasibilityReport?.downstreamRipples ?? []}
          triggerGoalName={state.goals[0]?.name}
          triggerAction="Simulation Modification"
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
  chartBox: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chartTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
});
