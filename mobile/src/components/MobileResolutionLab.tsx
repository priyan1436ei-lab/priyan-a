import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Sparkles, CheckCircle2, TrendingUp, Calendar, ShieldCheck, Zap } from 'lucide-react-native';
import { GoalResolutionPlan } from '../../../shared/types/goalPlanning';

interface Props {
  resolutionPlans: GoalResolutionPlan[];
  onApplyPlan: (plan: GoalResolutionPlan) => void;
  activePlanId?: string;
}

export const MobileResolutionLab: React.FC<Props> = ({
  resolutionPlans,
  onApplyPlan,
  activePlanId,
}) => {
  if (!resolutionPlans || resolutionPlans.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Sparkles size={22} color="#10B981" />
        <Text style={styles.emptyTitle}>Optimal Resolution Achieved</Text>
        <Text style={styles.emptySub}>Your current goal schedule requires zero conflict resolution adjustments.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Sparkles size={20} color="#10B981" />
        <Text style={styles.title}>AI Resolution Strategies</Text>
      </View>
      <Text style={styles.subtext}>
        Select an AI-recommended strategy to resolve all overlap deficits and boost feasibility.
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {resolutionPlans.map((plan, index) => {
          const isActive = activePlanId === plan.id || index === 0;

          return (
            <View
              key={plan.id || index}
              style={[
                styles.planCard,
                isActive && styles.activePlanCard,
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.strategyNameGroup}>
                  <Text style={styles.strategyTitle}>{plan.strategyName}</Text>
                  {isActive && (
                    <View style={styles.activeTag}>
                      <Text style={styles.activeTagText}>RECOMMENDED</Text>
                    </View>
                  )}
                </View>

                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>{(plan.projectedFeasibility * 100).toFixed(0)}%</Text>
                  <Text style={styles.scoreSub}>Feasibility</Text>
                </View>
              </View>

              <Text style={styles.description}>{plan.description}</Text>

              {/* Resolution Metrics */}
              <View style={styles.metricsBox}>
                <View style={styles.mCol}>
                  <Text style={styles.mLabel}>Monthly SIP Step-up</Text>
                  <Text style={styles.mValHighlight}>+₹{plan.totalAdditionalSip.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.mCol}>
                  <Text style={styles.mLabel}>Max Year Stagger</Text>
                  <Text style={styles.mVal}>{plan.maxDelayYears} yrs</Text>
                </View>
                <View style={styles.mCol}>
                  <Text style={styles.mLabel}>Conflicts Resolved</Text>
                  <Text style={[styles.mVal, { color: '#10B981' }]}>100%</Text>
                </View>
              </View>

              {/* Action Button */}
              <Pressable
                style={[
                  styles.applyBtn,
                  isActive ? styles.applyBtnActive : styles.applyBtnInactive,
                ]}
                onPress={() => onApplyPlan(plan)}
              >
                {isActive ? (
                  <>
                    <CheckCircle2 size={16} color="#0F172A" />
                    <Text style={styles.applyBtnActiveText}>Strategy Applied</Text>
                  </>
                ) : (
                  <>
                    <Zap size={16} color="#10B981" />
                    <Text style={styles.applyBtnInactiveText}>Apply Strategy</Text>
                  </>
                )}
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  subtext: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 14,
  },
  planCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activePlanCard: {
    borderColor: '#10B981',
    backgroundColor: '#0F291E',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  strategyNameGroup: {
    flex: 1,
    marginRight: 8,
  },
  strategyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  activeTag: {
    backgroundColor: '#10B98130',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  activeTagText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  scoreBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  scoreText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '800',
  },
  scoreSub: {
    color: '#64748B',
    fontSize: 9,
  },
  description: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  metricsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  mCol: {
    alignItems: 'flex-start',
  },
  mLabel: {
    color: '#64748B',
    fontSize: 10,
    marginBottom: 2,
  },
  mVal: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  mValHighlight: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '700',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  applyBtnActive: {
    backgroundColor: '#10B981',
  },
  applyBtnActiveText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  applyBtnInactive: {
    backgroundColor: '#10B98115',
    borderWidth: 1,
    borderColor: '#10B98140',
  },
  applyBtnInactiveText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#10B98140',
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
});
