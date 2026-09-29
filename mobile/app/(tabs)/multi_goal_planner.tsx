import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Plus, Target, Sparkles, Filter } from 'lucide-react-native';
import { useMobileFinFam } from '../../src/context/MobileFinFamContext';
import { MobileTopAppBar } from '../../src/components/MobileTopAppBar';
import { MobileGoalFeasibilityCard } from '../../src/components/MobileGoalFeasibilityCard';
import { MobileMultiGoalSummary } from '../../src/components/MobileMultiGoalSummary';
import { MobileGoalTimeline } from '../../src/components/MobileGoalTimeline';
import { AddGoalModal } from '../../src/components/MobileModals';

export default function MultiGoalPlannerScreen() {
  const { state, addGoal, deleteGoal } = useMobileFinFam();
  const [addGoalModalOpen, setAddGoalModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const { overallScore, goals, conflicts, feasibilityReport } = state;

  const categories = ['ALL', 'RETIREMENT', 'EDUCATION', 'HOUSING', 'EMERGENCY_FUND', 'WEALTH_BUILDING'];

  const filteredGoals = goals.filter((g) =>
    filterCategory === 'ALL' ? true : g.category === filterCategory
  );

  return (
    <View style={styles.container}>
      <MobileTopAppBar
        userEmail={state.userEmail}
        subscriptionTier={state.subscriptionTier}
        onAddGoalPress={() => setAddGoalModalOpen(true)}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.headerBanner}>
          <Target size={24} color="#06B6D4" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.bannerTitle}>Multi-Goal Feasibility Engine</Text>
            <Text style={styles.bannerSub}>
              Simultaneous cashflow stress test with inflation & market volatility adjustments.
            </Text>
          </View>
        </View>

        {/* Overall Portfolio Summary */}
        <MobileMultiGoalSummary
          overallScore={overallScore}
          goalsCount={goals.length}
          conflictsCount={conflicts.length}
        />

        {/* Lifespan Timeline */}
        <MobileGoalTimeline goals={goals} />

        {/* Category Filter Chips */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Filter Category:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {categories.map((cat) => (
              <Pressable
                key={cat}
                style={[
                  styles.chip,
                  filterCategory === cat && styles.chipActive,
                ]}
                onPress={() => setFilterCategory(cat)}
              >
                <Text
                  style={[
                    styles.chipText,
                    filterCategory === cat && styles.chipTextActive,
                  ]}
                >
                  {cat.replace('_', ' ')}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Detailed Goal Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Goal Feasibility Analysis</Text>
          <Pressable style={styles.addBtn} onPress={() => setAddGoalModalOpen(true)}>
            <Plus size={16} color="#0F172A" />
            <Text style={styles.addBtnText}>New Goal</Text>
          </Pressable>
        </View>

        {filteredGoals.map((goal) => {
          const detail = feasibilityReport?.goalAnalysis.find((a) => a.goalId === goal.id);

          return (
            <MobileGoalFeasibilityCard
              key={goal.id}
              goal={goal}
              feasibilityScore={detail?.feasibilityScore ?? 0.8}
              requiredSip={detail?.requiredSip ?? goal.currentMonthlySip * 1.2}
              sipDeficit={detail?.sipGap ?? 0}
              inflationAdjustedTarget={detail?.inflationAdjustedTarget ?? goal.targetAmount * 1.5}
              recommendation={detail?.recommendations?.[0] ?? 'Increase monthly SIP to align with inflation.'}
              onEdit={() => {}}
              onDelete={() => deleteGoal(goal.id)}
            />
          );
        })}
      </ScrollView>

      <AddGoalModal
        visible={addGoalModalOpen}
        onClose={() => setAddGoalModalOpen(false)}
        onAddGoal={(g) => addGoal(g)}
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
  headerBanner: {
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
  filterSection: {
    marginVertical: 10,
  },
  filterLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  chipScroll: {
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: '#06B6D425',
    borderColor: '#06B6D4',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#06B6D4',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#06B6D4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
});
