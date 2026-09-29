import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PieChart, TrendingUp, AlertTriangle, CheckCircle2, Sparkles, Layers } from 'lucide-react-native';
import { GoalPortfolioSummary } from '../../../shared/types/goalPlanning';

interface MobileMultiGoalSummaryProps {
  summary?: GoalPortfolioSummary;
  overallScore?: number;
  goalsCount?: number;
  conflictsCount?: number;
  onViewDetails?: () => void;
  onLoadDemoData?: () => void;
  onNavigateToConflictMap?: () => void;
  onNavigateToResolutionLab?: () => void;
}

export const MobileMultiGoalSummary: React.FC<MobileMultiGoalSummaryProps> = ({
  summary,
  overallScore = 84,
  goalsCount = 4,
  conflictsCount = 1,
  onViewDetails,
  onLoadDemoData,
  onNavigateToConflictMap,
  onNavigateToResolutionLab,
}) => {
  const isShortfall = (summary?.monthlyShortfall ?? 0) > 0;
  const score = summary?.overallFeasibilityScore ?? overallScore;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View>
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>FINFAM INTELLIGENCE</Text>
          </View>
          <Text style={styles.title}>Capacity & Health Overview</Text>
        </View>

        {onLoadDemoData && (
          <TouchableOpacity style={styles.demoBtn} onPress={onLoadDemoData}>
            <Sparkles size={14} color="#FBBF24" />
            <Text style={styles.demoBtnText}>⚡ Demo Conflict</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.grid}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Capacity</Text>
            <PieChart size={14} color="#06B6D4" />
          </View>
          <Text style={styles.metricValue}>
            ₹{(summary?.availableMonthlyCapacity ?? 70000).toLocaleString('en-IN')}
          </Text>
          <Text style={styles.metricSub}>/ mo available</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Active Goals</Text>
            <TrendingUp size={14} color="#A855F7" />
          </View>
          <Text style={styles.metricValuePurple}>
            {summary?.totalGoalsCount ?? goalsCount} Goals
          </Text>
          <Text style={styles.metricSub}>configured targets</Text>
        </View>

        <View style={[styles.metricCard, conflictsCount > 0 ? styles.shortfallCard : styles.balancedCard]}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Conflicts</Text>
            {conflictsCount > 0 ? <AlertTriangle size={14} color="#EF4444" /> : <CheckCircle2 size={14} color="#10B981" />}
          </View>
          <Text style={conflictsCount > 0 ? styles.shortfallValue : styles.balancedValue}>
            {conflictsCount} Overlap{conflictsCount === 1 ? '' : 's'}
          </Text>
          <Text style={styles.metricSub}>{conflictsCount > 0 ? 'Deficit Detected' : 'Clean Roadmap'}</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Feasibility</Text>
            <Layers size={14} color="#F59E0B" />
          </View>
          <Text style={styles.scoreValue}>{score}%</Text>
          <Text style={styles.metricSub}>Portfolio Health</Text>
        </View>
      </View>

      {onViewDetails && (
        <TouchableOpacity style={styles.resolveCta} onPress={onViewDetails}>
          <Sparkles size={14} color="#0F172A" />
          <Text style={styles.resolveCtaText}>View Detailed Feasibility Breakdown</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagBadge: {
    backgroundColor: '#06B6D420',
    borderColor: '#06B6D440',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  tagText: {
    color: '#06B6D4',
    fontSize: 9,
    fontWeight: 'bold',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#A855F720',
    borderColor: '#A855F740',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  demoBtnText: {
    color: '#A855F7',
    fontSize: 11,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  shortfallCard: {
    backgroundColor: '#EF444415',
    borderColor: '#EF444430',
  },
  balancedCard: {
    backgroundColor: '#10B98115',
    borderColor: '#10B98130',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: 'bold',
  },
  metricValue: {
    color: '#06B6D4',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  metricValuePurple: {
    color: '#A855F7',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  shortfallValue: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  balancedValue: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  scoreValue: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  metricSub: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 2,
  },
  resolveCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#06B6D4',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  resolveCtaText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
});
