import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { CreditCard, Calculator, TrendingDown, Percent, Zap } from 'lucide-react-native';
import { useMobileFinFam } from '../../src/context/MobileFinFamContext';
import { MobileTopAppBar } from '../../src/components/MobileTopAppBar';
import { calculateEMI, calculatePrepaymentSavings } from '../../src/context/MobileFinFamContext';

export default function EmiScreen() {
  const { state } = useMobileFinFam();
  const [loanAmount, setLoanAmount] = useState('5000000');
  const [interestRate, setInterestRate] = useState('8.5');
  const [tenureYears, setTenureYears] = useState('20');
  const [extraPrepayment, setExtraPrepayment] = useState('10000');

  const P = parseFloat(loanAmount) || 0;
  const R = parseFloat(interestRate) || 0;
  const N = (parseInt(tenureYears, 10) || 0) * 12;

  const monthlyEMI = calculateEMI(P, R, N);
  const totalPayment = monthlyEMI * N;
  const totalInterest = totalPayment - P;

  const prepaySavings = calculatePrepaymentSavings(P, R, N, parseFloat(extraPrepayment) || 0);

  return (
    <View style={styles.container}>
      <MobileTopAppBar userEmail={state.userEmail} subscriptionTier={state.subscriptionTier} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.banner}>
          <CreditCard size={24} color="#38BDF8" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.bannerTitle}>EMI & Debt Restructuring Engine</Text>
            <Text style={styles.bannerSub}>
              Calculate loan amortization, prepayment interest savings, & tenure reductions.
            </Text>
          </View>
        </View>

        {/* EMI Summary Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Calculated Monthly EMI</Text>
          <Text style={styles.heroVal}>
            ₹{Math.round(monthlyEMI).toLocaleString('en-IN')}{' '}
            <Text style={styles.heroSub}>/month</Text>
          </Text>

          <View style={styles.heroMetricsRow}>
            <View style={styles.hmCol}>
              <Text style={styles.hmLabel}>Principal Amount</Text>
              <Text style={styles.hmVal}>₹{P.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.hmDivider} />
            <View style={styles.hmCol}>
              <Text style={styles.hmLabel}>Total Interest Payable</Text>
              <Text style={[styles.hmVal, { color: '#EF4444' }]}>
                ₹{Math.round(totalInterest).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

        {/* Calculator Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Loan Parameters</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Loan Principal (₹)</Text>
            <TextInput
              style={styles.input}
              value={loanAmount}
              onChangeText={setLoanAmount}
              keyboardType="numeric"
              placeholder="5000000"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.twoCol}>
            <View style={[styles.field, { width: '48%' }]}>
              <Text style={styles.label}>Interest Rate (%)</Text>
              <TextInput
                style={styles.input}
                value={interestRate}
                onChangeText={setInterestRate}
                keyboardType="numeric"
                placeholder="8.5"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={[styles.field, { width: '48%' }]}>
              <Text style={styles.label}>Tenure (Years)</Text>
              <TextInput
                style={styles.input}
                value={tenureYears}
                onChangeText={setTenureYears}
                keyboardType="numeric"
                placeholder="20"
                placeholderTextColor="#64748B"
              />
            </View>
          </View>
        </View>

        {/* Prepayment Impact Simulator */}
        <View style={styles.card}>
          <View style={styles.prepayHeader}>
            <Zap size={18} color="#10B981" />
            <Text style={styles.cardTitle}>Prepayment Optimization</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Extra Monthly Prepayment (₹)</Text>
            <TextInput
              style={styles.input}
              value={extraPrepayment}
              onChangeText={setExtraPrepayment}
              keyboardType="numeric"
              placeholder="10000"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.savingsBox}>
            <View style={styles.sRow}>
              <Text style={styles.sLabel}>Total Interest Saved:</Text>
              <Text style={styles.sValHighlight}>
                ₹{Math.round(prepaySavings.interestSaved).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.sRow}>
              <Text style={styles.sLabel}>Tenure Reduced By:</Text>
              <Text style={styles.sVal}>
                {prepaySavings.monthsSaved} months ({Math.floor(prepaySavings.monthsSaved / 12)} yrs)
              </Text>
            </View>
          </View>
        </View>
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
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#38BDF850',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  heroVal: {
    color: '#38BDF8',
    fontSize: 28,
    fontWeight: '800',
    marginVertical: 4,
  },
  heroSub: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  heroMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  hmCol: {
    alignItems: 'center',
  },
  hmLabel: {
    color: '#64748B',
    fontSize: 10,
  },
  hmVal: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  hmDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  field: {
    marginBottom: 12,
  },
  label: {
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
  prepayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  savingsBox: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
  },
  sRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sLabel: {
    color: '#94A3B8',
    fontSize: 13,
  },
  sVal: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  sValHighlight: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '700',
  },
});
