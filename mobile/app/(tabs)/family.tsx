import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Users, Plus, CheckCircle2, DollarSign, Wallet, Shield } from 'lucide-react-native';
import { useMobileFinFam } from '../../src/context/MobileFinFamContext';
import { MobileTopAppBar } from '../../src/components/MobileTopAppBar';
import { AddFamilyMemberModal } from '../../src/components/MobileModals';

export default function FamilyScreen() {
  const { state, addFamilyMember } = useMobileFinFam();
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const { familyMembers, familyBills } = state;

  const totalFamilyIncome = familyMembers.reduce((sum, m) => sum + m.income, 0);
  const totalFamilyExpense = familyMembers.reduce((sum, m) => sum + m.expenses, 0);

  const handlePayBill = (billName: string, amount: number) => {
    Alert.alert('Bill Paid!', `Successfully processed payment of ₹${amount.toLocaleString('en-IN')} for ${billName}.`);
  };

  return (
    <View style={styles.container}>
      <MobileTopAppBar
        userEmail={state.userEmail}
        subscriptionTier={state.subscriptionTier}
        onAddGoalPress={() => setAddMemberOpen(true)}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.banner}>
          <Users size={24} color="#A855F7" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.bannerTitle}>Family Vault & Shared Liquidity</Text>
            <Text style={styles.bannerSub}>
              Aggregated household cashflows, shared debt obligations, & member contributions.
            </Text>
          </View>
        </View>

        {/* Aggregated Household Summary */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Household Net Monthly Cashflow</Text>
          <Text style={styles.heroVal}>
            ₹{(totalFamilyIncome - totalFamilyExpense).toLocaleString('en-IN')}
          </Text>

          <View style={styles.metricsRow}>
            <View style={styles.mCol}>
              <Text style={styles.mLabel}>Total Income</Text>
              <Text style={styles.mIncome}>+₹{totalFamilyIncome.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.mDivider} />
            <View style={styles.mCol}>
              <Text style={styles.mLabel}>Total Expense</Text>
              <Text style={styles.mExpense}>-₹{totalFamilyExpense.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {/* Family Members Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Family Members ({familyMembers.length})</Text>
          <Pressable style={styles.addBtn} onPress={() => setAddMemberOpen(true)}>
            <Plus size={16} color="#0F172A" />
            <Text style={styles.addBtnText}>Add Member</Text>
          </Pressable>
        </View>

        {/* Family Member Cards */}
        {familyMembers.map((member, idx) => {
          const contribPercent =
            totalFamilyIncome > 0 ? ((member.income / totalFamilyIncome) * 100).toFixed(0) : '0';

          return (
            <View key={member.id || idx} style={styles.memberCard}>
              <View style={styles.memberHeader}>
                <View>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRel}>{member.relation}</Text>
                </View>
                <View style={styles.contribBadge}>
                  <Text style={styles.contribText}>{contribPercent}% Household Share</Text>
                </View>
              </View>

              <View style={styles.memberCashflow}>
                <View>
                  <Text style={styles.cfLabel}>Monthly Income</Text>
                  <Text style={styles.cfVal}>₹{member.income.toLocaleString('en-IN')}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.cfLabel}>Monthly Expense</Text>
                  <Text style={[styles.cfVal, { color: '#EF4444' }]}>
                    ₹{member.expenses.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Shared Family Bills Header */}
        <Text style={[styles.sectionTitle, { marginTop: 16, marginBottom: 10 }]}>
          Shared Household Obligations ({familyBills.length})
        </Text>

        {familyBills.map((bill) => (
          <View key={bill.id} style={styles.billCard}>
            <View style={styles.billLeft}>
              <Text style={styles.billName}>{bill.name}</Text>
              <Text style={styles.billAssignee}>Assigned to: {bill.assignedTo}</Text>
              <Text style={styles.billDueDate}>Due: {bill.dueDate}</Text>
            </View>

            <View style={styles.billRight}>
              <Text style={styles.billAmount}>₹{bill.amount.toLocaleString('en-IN')}</Text>
              <Pressable
                style={[
                  styles.payBtn,
                  bill.isPaid && styles.paidBtn,
                ]}
                onPress={() => handlePayBill(bill.name, bill.amount)}
              >
                <Text style={styles.payBtnText}>{bill.isPaid ? 'Paid' : 'Pay Bill'}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <AddFamilyMemberModal
        visible={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        onAddMember={(m) => addFamilyMember(m)}
      />
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
    borderColor: '#A855F750',
    marginBottom: 14,
  },
  heroTitle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  heroVal: {
    color: '#10B981',
    fontSize: 26,
    fontWeight: '800',
    marginVertical: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  mCol: {
    alignItems: 'center',
  },
  mLabel: {
    color: '#64748B',
    fontSize: 10,
  },
  mIncome: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  mExpense: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  mDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#A855F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  memberCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  memberRel: {
    color: '#64748B',
    fontSize: 12,
  },
  contribBadge: {
    backgroundColor: '#A855F720',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  contribText: {
    color: '#A855F7',
    fontSize: 11,
    fontWeight: '700',
  },
  memberCashflow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 10,
  },
  cfLabel: {
    color: '#64748B',
    fontSize: 10,
  },
  cfVal: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  billCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  billLeft: {
    flex: 1,
  },
  billName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  billAssignee: {
    color: '#94A3B8',
    fontSize: 12,
  },
  billDueDate: {
    color: '#64748B',
    fontSize: 11,
  },
  billRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  billAmount: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
  payBtn: {
    backgroundColor: '#06B6D4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  paidBtn: {
    backgroundColor: '#10B98125',
  },
  payBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
});
