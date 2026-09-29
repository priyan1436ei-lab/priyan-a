import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle, CheckCircle2, TrendingUp, Plus, Trash2 } from 'lucide-react-native';
import { GoalItem, GoalFeasibilityResult } from '../../../shared/types/goalPlanning';

interface MobileGoalFeasibilityCardProps {
  goal: GoalItem;
  feasibility?: GoalFeasibilityResult;
  feasibilityScore?: number;
  requiredSip?: number;
  sipDeficit?: number;
  inflationAdjustedTarget?: number;
  recommendation?: string;
  onDeleteGoal?: (goalId: any) => void;
  onTopUpGoal?: (goal: GoalItem) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const MobileGoalFeasibilityCard: React.FC<MobileGoalFeasibilityCardProps> = ({
  goal,
  feasibility,
  feasibilityScore,
  requiredSip,
  sipDeficit,
  inflationAdjustedTarget,
  recommendation,
  onDeleteGoal,
  onTopUpGoal,
  onDelete,
}) => {
  const currentAmt = goal.currentAmount || 0;
  const targetAmt = goal.targetAmount || 1;
  const pctSaved = Math.min(100, Math.round((currentAmt / targetAmt) * 100));

  const reqSip = requiredSip ?? feasibility?.requiredMonthlyContribution ?? (goal.currentMonthlySip || 0) * 1.15;
  const planSip = goal.currentMonthlySip || 0;
  const fScore = feasibilityScore ?? (feasibility?.feasibilityScore ? feasibility.feasibilityScore / 100 : 0.84);
  const statusStr = feasibility?.status ?? (fScore >= 0.8 ? 'ON_TRACK' : 'AT_RISK');

  const handleDelete = onDelete || (onDeleteGoal ? () => onDeleteGoal(goal.id) : undefined);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.topRow}>
        <View style={styles.titleSection}>
          <Text style={styles.emoji}>{goal.emoji || '🎯'}</Text>
          <View style={styles.textStack}>
            <View style={styles.nameRow}>
              <Text style={styles.goalName} numberOfLines={1}>{goal.name}</Text>
              {goal.hardDeadline && (
                <View style={styles.hardBadge}>
                  <Text style={styles.hardText}>RIGID</Text>
                </View>
              )}
            </View>
            <Text style={styles.categoryText}>
              {goal.category} • Target Year: {goal.targetYear || goal.targetDate || '2032'}
            </Text>
          </View>
        </View>

        {handleDelete && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Trash2 size={14} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Badges */}
      <View style={styles.badgeRow}>
        <View style={styles.priorityBadge}>
          <Text style={styles.priorityText}>PRIORITY {goal.priority || 1}</Text>
        </View>

        <View style={[styles.statusBadge, statusStr === 'ON_TRACK' ? styles.onTrack : styles.conflicted]}>
          <Text style={styles.statusText}>{(fScore * 100).toFixed(0)}% Feasibility</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.savedText}>
            ₹{currentAmt.toLocaleString('en-IN')} ({pctSaved}%)
          </Text>
          <Text style={styles.targetText}>
            Target: ₹{targetAmt.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pctSaved}%` }]} />
        </View>
      </View>

      {/* SIP Comparison */}
      <View style={styles.sipGrid}>
        <View>
          <Text style={styles.sipLabel}>REQUIRED SIP</Text>
          <Text style={styles.sipReqValue}>₹{Math.round(reqSip).toLocaleString('en-IN')}/mo</Text>
        </View>

        <View>
          <Text style={styles.sipLabel}>PLANNED SIP</Text>
          <Text style={styles.sipPlannedValue}>₹{Math.round(planSip).toLocaleString('en-IN')}/mo</Text>
        </View>
      </View>

      {/* Recommendation Banner */}
      {recommendation && (
        <View style={styles.recBox}>
          <AlertTriangle size={12} color="#06B6D4" />
          <Text style={styles.recText}>{recommendation}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  emoji: {
    fontSize: 22,
  },
  textStack: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goalName: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    flex: 1,
  },
  hardBadge: {
    backgroundColor: '#EF444425',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  hardText: {
    color: '#EF4444',
    fontSize: 8,
    fontWeight: 'bold',
  },
  categoryText: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityBadge: {
    borderWidth: 1,
    borderColor: '#A855F7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    color: '#A855F7',
    fontSize: 9,
    fontWeight: '900',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  onTrack: {
    backgroundColor: '#10B98125',
  },
  conflicted: {
    backgroundColor: '#F59E0B25',
  },
  statusText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: 'bold',
  },
  progressContainer: {
    gap: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  savedText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  targetText: {
    color: '#64748B',
    fontSize: 10,
  },
  track: {
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#06B6D4',
    borderRadius: 3,
  },
  sipGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 8,
  },
  sipLabel: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: 'bold',
  },
  sipReqValue: {
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  sipPlannedValue: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  recBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#06B6D415',
    borderColor: '#06B6D430',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  recText: {
    color: '#06B6D4',
    fontSize: 11,
    fontWeight: '600',
  },
});
