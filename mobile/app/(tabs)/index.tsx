import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ShieldAlert,
  Plus,
  Zap,
  TrendingUp,
  CreditCard,
  Users,
  BrainCircuit,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react-native';
import { useMobileFinFam } from '../../src/context/MobileFinFamContext';
import { MobileTopAppBar } from '../../src/components/MobileTopAppBar';
import { MobileMultiGoalSummary } from '../../src/components/MobileMultiGoalSummary';
import { MobileGoalConflictAlert } from '../../src/components/MobileGoalConflictAlert';
import { AddGoalModal } from '../../src/components/MobileModals';

export default function DashboardScreen() {
  const router = useRouter();
  const { state, refreshData, addGoal } = useMobileFinFam();
  const [refreshing, setRefreshing] = useState(false);
  const [addGoalModalOpen, setAddGoalModalOpen] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const { overallScore, totalMonthlyIncome, totalMonthlyExpenses, goals, conflicts } = state;
  const netSavings = totalMonthlyIncome - totalMonthlyExpenses;

  return (
    <View style={styles.container}>
      <MobileTopAppBar
        userEmail={state.userEmail}
        subscriptionTier={state.subscriptionTier}
        onAddGoalPress={() => setAddGoalModalOpen(true)}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06B6D4" />
        }
      >
        {/* Net Worth & Cashflow Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroSub}>Monthly Net Income Surplus</Text>
              <Text style={styles.heroAmount}>
                ₹{netSavings.toLocaleString('en-IN')} <Text style={styles.monthText}>/mo</Text>
              </Text>
            </View>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNum}>{overallScore}</Text>
              <Text style={styles.scoreLabel}>Health Score</Text>
            </View>
          </View>

          <View style={styles.cashflowRow}>
            <View style={styles.cfItem}>
              <Text style={styles.cfLabel}>Total Income</Text>
              <Text style={styles.cfIncome}>+₹{totalMonthlyIncome.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.cfDivider} />
            <View style={styles.cfItem}>
              <Text style={styles.cfLabel}>Total Expenses</Text>
              <Text style={styles.cfExpense}>-₹{totalMonthlyExpenses.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {/* Quick Action Dock */}
        <View style={styles.actionDock}>
          <Pressable style={styles.dockItem} onPress={() => router.push('/(tabs)/multi_goal_planner')}>
            <View style={[styles.dockIcon, { backgroundColor: '#06B6D420' }]}>
              <Zap size={20} color="#06B6D4" />
            </View>
            <Text style={styles.dockLabel}>Planner</Text>
          </Pressable>

          <Pressable style={styles.dockItem} onPress={() => router.push('/(tabs)/conflict_map')}>
            <View style={[styles.dockIcon, { backgroundColor: '#F59E0B20' }]}>
              <ShieldAlert size={20} color="#F59E0B" />
            </View>
            <Text style={styles.dockLabel}>Conflict Map</Text>
          </Pressable>

          <Pressable style={styles.dockItem} onPress={() => router.push('/(tabs)/optimizer')}>
            <View style={[styles.dockIcon, { backgroundColor: '#A855F720' }]}>
              <BrainCircuit size={20} color="#A855F7" />
            </View>
            <Text style={styles.dockLabel}>AI Optimizer</Text>
          </Pressable>

          <Pressable style={styles.dockItem} onPress={() => router.push('/(tabs)/emi')}>
            <View style={[styles.dockIcon, { backgroundColor: '#38BDF820' }]}>
              <CreditCard size={20} color="#38BDF8" />
            </View>
            <Text style={styles.dockLabel}>EMI Engine</Text>
          </Pressable>
        </View>

        {/* Multi-Goal Feasibility Overview */}
        <MobileMultiGoalSummary
          overallScore={overallScore}
          goalsCount={goals.length}
          conflictsCount={conflicts.length}
          onViewDetails={() => router.push('/(tabs)/multi_goal_planner')}
        />

        {/* Goal Conflicts Alert */}
        <MobileGoalConflictAlert
          conflicts={conflicts}
          onSolvePress={() => router.push('/(tabs)/resolution_lab')}
        />

        {/* Active Goals Quick Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Financial Goals ({goals.length})</Text>
          <Pressable onPress={() => setAddGoalModalOpen(true)} style={styles.addInlineBtn}>
            <Plus size={16} color="#06B6D4" />
            <Text style={styles.addInlineText}>Add Goal</Text>
          </Pressable>
        </View>

        {goals.map((g) => {
          const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;

          return (
            <View key={g.id} style={styles.goalCard}>
              <View style={styles.goalRow}>
                <View>
                  <Text style={styles.goalName}>{g.name}</Text>
                  <Text style={styles.goalYear}>Target Year: {g.targetYear}</Text>
                </View>
                <Text style={styles.goalAmount}>₹{g.targetAmount.toLocaleString('en-IN')}</Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min(100, progress)}%` }]} />
              </View>

              <View style={styles.goalFooter}>
                <Text style={styles.progressText}>{progress.toFixed(1)}% Funded</Text>
                <Text style={styles.sipText}>SIP: ₹{g.currentMonthlySip.toLocaleString('en-IN')}/mo</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Add Goal Modal */}
      <AddGoalModal
        visible={addGoalModalOpen}
        onClose={() => setAddGoalModalOpen(false)}
        onAddGoal={(newGoal) => addGoal(newGoal)}
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
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroSub: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  heroAmount: {
    color: '#10B981',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 2,
  },
  monthText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#06B6D4',
  },
  scoreNum: {
    color: '#06B6D4',
    fontSize: 20,
    fontWeight: '800',
  },
  scoreLabel: {
    color: '#64748B',
    fontSize: 8,
    marginTop: -2,
  },
  cashflowRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    borderRadius: 12,
  },
  cfItem: {
    alignItems: 'center',
  },
  cfLabel: {
    color: '#64748B',
    fontSize: 11,
  },
  cfIncome: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
  },
  cfExpense: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  cfDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
  },
  actionDock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dockItem: {
    width: '23%',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dockIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  dockLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  addInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addInlineText: {
    color: '#06B6D4',
    fontSize: 13,
    fontWeight: '600',
  },
  goalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  goalYear: {
    color: '#64748B',
    fontSize: 12,
  },
  goalAmount: {
    color: '#06B6D4',
    fontSize: 15,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#06B6D4',
    borderRadius: 3,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  sipText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
});
