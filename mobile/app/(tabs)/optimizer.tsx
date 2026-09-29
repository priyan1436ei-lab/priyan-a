import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { BrainCircuit, Sparkles, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react-native';
import { useMobileFinFam } from '../../src/context/MobileFinFamContext';
import { MobileTopAppBar } from '../../src/components/MobileTopAppBar';
import { evaluateDecision } from '../../src/context/MobileFinFamContext';

export default function OptimizerScreen() {
  const { state } = useMobileFinFam();
  const [decisionType, setDecisionType] = useState<'BUY_VS_RENT' | 'PREPAY_LOAN_VS_INVEST' | 'CAREER_CHANGE' | 'CUSTOM'>('BUY_VS_RENT');
  const [title, setTitle] = useState('Purchase EV SUV vs Renting & Investing');
  const [upfrontCost, setUpfrontCost] = useState('1500000');
  const [monthlyCost, setMonthlyCost] = useState('25000');
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  const handleEvaluate = () => {
    const cost = parseFloat(upfrontCost) || 0;
    const mCost = parseFloat(monthlyCost) || 0;
    const res = evaluateDecision(title, cost, mCost, state.totalMonthlyIncome, state.totalMonthlyExpenses, state.goals);
    setEvaluationResult(res);
  };

  return (
    <View style={styles.container}>
      <MobileTopAppBar userEmail={state.userEmail} subscriptionTier={state.subscriptionTier} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.banner}>
          <BrainCircuit size={24} color="#A855F7" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.bannerTitle}>AI Decision Optimizer</Text>
            <Text style={styles.bannerSub}>
              Evaluate major financial moves before committing capital.
            </Text>
          </View>
        </View>

        {/* Decision Type Selector */}
        <Text style={styles.sectionLabel}>Select Decision Model:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          {[
            { id: 'BUY_VS_RENT', label: 'Buy vs Rent Car/Home' },
            { id: 'PREPAY_LOAN_VS_INVEST', label: 'Prepay Loan vs SIP' },
            { id: 'CAREER_CHANGE', label: 'Career / Income Switch' },
            { id: 'CUSTOM', label: 'Custom Outlay' },
          ].map((t) => (
            <Pressable
              key={t.id}
              style={[
                styles.typeChip,
                decisionType === t.id && styles.typeChipActive,
              ]}
              onPress={() => setDecisionType(t.id as any)}
            >
              <Text
                style={[
                  styles.typeChipText,
                  decisionType === t.id && styles.typeChipTextActive,
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Form Inputs */}
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.inputLabel}>Decision Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Purchase EV SUV"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.twoCol}>
            <View style={[styles.field, { width: '48%' }]}>
              <Text style={styles.inputLabel}>Upfront Downpayment (₹)</Text>
              <TextInput
                style={styles.input}
                value={upfrontCost}
                onChangeText={setUpfrontCost}
                keyboardType="numeric"
                placeholder="1500000"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={[styles.field, { width: '48%' }]}>
              <Text style={styles.inputLabel}>Monthly Outflow (₹)</Text>
              <TextInput
                style={styles.input}
                value={monthlyCost}
                onChangeText={setMonthlyCost}
                keyboardType="numeric"
                placeholder="25000"
                placeholderTextColor="#64748B"
              />
            </View>
          </View>

          <Pressable style={styles.evalBtn} onPress={handleEvaluate}>
            <BrainCircuit size={18} color="#0F172A" />
            <Text style={styles.evalBtnText}>Simulate Decision Impact</Text>
          </Pressable>
        </View>

        {/* AI Evaluation Results */}
        {evaluationResult && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View
                style={[
                  styles.recBadge,
                  {
                    backgroundColor:
                      evaluationResult.recommendation === 'PROCEED' ? '#10B98125' : '#EF444425',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.recText,
                    {
                      color:
                        evaluationResult.recommendation === 'PROCEED' ? '#10B981' : '#EF4444',
                    },
                  ]}
                >
                  RECOMMENDATION: {evaluationResult.recommendation}
                </Text>
              </View>

              <Text style={styles.scoreText}>
                Feasibility: {(evaluationResult.postDecisionFeasibility * 100).toFixed(0)}%
              </Text>
            </View>

            <Text style={styles.summaryTitle}>Tradeoff Analysis</Text>
            <Text style={styles.summaryBody}>{evaluationResult.summary}</Text>

            <View style={styles.tradeoffBox}>
              <View style={styles.tCol}>
                <Text style={styles.tLabel}>Baseline Surplus</Text>
                <Text style={styles.tVal}>
                  ₹{(state.totalMonthlyIncome - state.totalMonthlyExpenses).toLocaleString('en-IN')}/mo
                </Text>
              </View>
              <View style={styles.tCol}>
                <Text style={styles.tLabel}>New Surplus</Text>
                <Text style={[styles.tVal, { color: '#06B6D4' }]}>
                  ₹
                  {(
                    state.totalMonthlyIncome -
                    state.totalMonthlyExpenses -
                    (parseFloat(monthlyCost) || 0)
                  ).toLocaleString('en-IN')}
                  /mo
                </Text>
              </View>
            </View>
          </View>
        )}
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
  sectionLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  typeChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  typeChipActive: {
    backgroundColor: '#A855F725',
    borderColor: '#A855F7',
  },
  typeChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: '#A855F7',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  field: {
    marginBottom: 12,
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    height: 44,
    color: '#F8FAFC',
    fontSize: 14,
  },
  twoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  evalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#A855F7',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  evalBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A855F760',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recText: {
    fontSize: 12,
    fontWeight: '800',
  },
  scoreText: {
    color: '#A855F7',
    fontSize: 14,
    fontWeight: '700',
  },
  summaryTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryBody: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  tradeoffBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
  },
  tCol: {
    alignItems: 'center',
  },
  tLabel: {
    color: '#64748B',
    fontSize: 11,
  },
  tVal: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
});
