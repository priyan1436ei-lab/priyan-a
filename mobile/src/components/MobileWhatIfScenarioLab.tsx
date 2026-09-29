import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { Sliders, RefreshCw, Zap, TrendingUp, ShieldAlert, Award } from 'lucide-react-native';

interface SimulationParams {
  incomeBumpPercent: number;
  expectedReturnPercent: number;
  inflationPercent: number;
  delayAllYears: number;
}

interface Props {
  onSimulate: (params: SimulationParams) => void;
  currentScore?: number;
  simulatedScore?: number;
}

export const MobileWhatIfScenarioLab: React.FC<Props> = ({
  onSimulate,
  currentScore = 78,
  simulatedScore = 84,
}) => {
  const [incomeBump, setIncomeBump] = useState('10');
  const [returnRate, setReturnRate] = useState('12');
  const [inflationRate, setInflationRate] = useState('6.5');
  const [delayYears, setDelayYears] = useState('0');

  const handleApply = () => {
    onSimulate({
      incomeBumpPercent: parseFloat(incomeBump) || 0,
      expectedReturnPercent: parseFloat(returnRate) || 12,
      inflationPercent: parseFloat(inflationRate) || 6,
      delayAllYears: parseInt(delayYears, 10) || 0,
    });
  };

  const handleReset = () => {
    setIncomeBump('0');
    setReturnRate('12');
    setInflationRate('6.5');
    setDelayYears('0');
    onSimulate({
      incomeBumpPercent: 0,
      expectedReturnPercent: 12,
      inflationPercent: 6.5,
      delayAllYears: 0,
    });
  };

  const delta = (simulatedScore ?? 0) - (currentScore ?? 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Sliders size={20} color="#06B6D4" />
          <Text style={styles.title}>What-If Scenario Simulator</Text>
        </View>
        <Pressable style={styles.resetBtn} onPress={handleReset}>
          <RefreshCw size={14} color="#94A3B8" />
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <Text style={styles.subtext}>
        Test macro-economic shocks & personal income levers to see real-time score shifts.
      </Text>

      {/* Score Comparison Widget */}
      <View style={styles.scoreCompareBox}>
        <View style={styles.scoreCol}>
          <Text style={styles.scoreLabel}>Baseline Score</Text>
          <Text style={styles.scoreVal}>{currentScore}</Text>
        </View>

        <View style={styles.arrowBox}>
          <Zap size={20} color={delta >= 0 ? '#10B981' : '#EF4444'} />
          <Text
            style={[
              styles.deltaText,
              { color: delta >= 0 ? '#10B981' : '#EF4444' },
            ]}
          >
            {delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
          </Text>
        </View>

        <View style={styles.scoreCol}>
          <Text style={styles.scoreLabel}>Simulated Score</Text>
          <Text style={[styles.scoreVal, { color: '#06B6D4' }]}>
            {simulatedScore?.toFixed(1)}
          </Text>
        </View>
      </View>

      {/* Input Controls */}
      <View style={styles.formGrid}>
        <View style={styles.field}>
          <Text style={styles.label}>Annual Income Surge (%)</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={incomeBump}
              onChangeText={setIncomeBump}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#64748B"
            />
            <Text style={styles.suffix}>%</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Portfolio Return Rate (%)</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={returnRate}
              onChangeText={setReturnRate}
              keyboardType="numeric"
              placeholder="12"
              placeholderTextColor="#64748B"
            />
            <Text style={styles.suffix}>%</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Expected Inflation (%)</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={inflationRate}
              onChangeText={setInflationRate}
              keyboardType="numeric"
              placeholder="6.5"
              placeholderTextColor="#64748B"
            />
            <Text style={styles.suffix}>%</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Global Goal Delay (Years)</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={delayYears}
              onChangeText={setDelayYears}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#64748B"
            />
            <Text style={styles.suffix}>yrs</Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.applyBtn} onPress={handleApply}>
        <Zap size={16} color="#0F172A" />
        <Text style={styles.applyBtnText}>Recalculate Portfolio Stress</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resetText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  subtext: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 14,
  },
  scoreCompareBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  scoreCol: {
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#64748B',
    fontSize: 11,
    marginBottom: 2,
  },
  scoreVal: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
  },
  arrowBox: {
    alignItems: 'center',
  },
  deltaText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  field: {
    width: '48%',
    marginBottom: 12,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    height: 44,
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  suffix: {
    color: '#64748B',
    fontSize: 12,
    marginLeft: 4,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#06B6D4',
    paddingVertical: 12,
    borderRadius: 10,
  },
  applyBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
});
