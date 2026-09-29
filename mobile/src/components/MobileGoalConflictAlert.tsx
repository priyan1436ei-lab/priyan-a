import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { AlertTriangle, ShieldAlert, ChevronRight } from 'lucide-react-native';
import { GoalConflictItem } from '../../../shared/types/goalPlanning';

interface Props {
  conflicts: GoalConflictItem[];
  onSelectConflict?: (conflict: GoalConflictItem) => void;
  onSolvePress?: () => void;
}

export const MobileGoalConflictAlert: React.FC<Props> = ({ conflicts, onSelectConflict, onSolvePress }) => {
  if (!conflicts || conflicts.length === 0) {
    return (
      <View style={styles.noConflictCard}>
        <View style={[styles.badgeIcon, { backgroundColor: '#10B98120' }]}>
          <ShieldAlert size={20} color="#10B981" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.noConflictTitle}>Zero Goal Conflicts Detected</Text>
          <Text style={styles.noConflictSub}>All your goals are financially synchronized with zero overlap deficits.</Text>
        </View>
      </View>
    );
  }

  const criticalCount = conflicts.filter((c) => c.severity === 'CRITICAL' || c.severity === 'HIGH').length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <AlertTriangle size={20} color={criticalCount > 0 ? '#EF4444' : '#F59E0B'} />
          <Text style={styles.headerTitle}>
            {conflicts.length} Goal Conflict{conflicts.length > 1 ? 's' : ''} Detected
          </Text>
        </View>
        {onSolvePress && (
          <Pressable style={styles.solveBtn} onPress={onSolvePress}>
            <Text style={styles.solveBtnText}>Resolve AI</Text>
            <ChevronRight size={14} color="#06B6D4" />
          </Pressable>
        )}
      </View>

      <Text style={styles.description}>
        Simultaneous cashflow demands create portfolio deficits. Tap any conflict to inspect ripple effects.
      </Text>

      {conflicts.map((conflict, index) => {
        const isCritical = conflict.severity === 'CRITICAL' || conflict.severity === 'HIGH';
        const badgeBg = isCritical ? '#EF444420' : '#F59E0B20';
        const badgeColor = isCritical ? '#EF4444' : '#F59E0B';
        const deficit = conflict.deficitAmount ?? conflict.monthlyImpact ?? 0;
        const delay = conflict.suggestedResolution?.delayYears ?? 0;
        const addSip = conflict.suggestedResolution?.additionalSip ?? 0;

        return (
          <Pressable
            key={index}
            style={styles.card}
            onPress={() => onSelectConflict?.(conflict)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.severityBadge, { backgroundColor: badgeBg }]}>
                <Text style={[styles.severityText, { color: badgeColor }]}>{conflict.severity}</Text>
              </View>
              <Text style={styles.yearText}>Overlap Year: {conflict.overlapYear || 2032}</Text>
            </View>

            <Text style={styles.conflictNames}>
              {conflict.goal1Name || conflict.goalA?.name || 'Goal A'}{' '}
              <Text style={{ color: '#94A3B8' }}>vs</Text>{' '}
              {conflict.goal2Name || conflict.goalB?.name || 'Goal B'}
            </Text>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.metaLabel}>Deficit Amount</Text>
                <Text style={styles.metaValue}>₹{deficit.toLocaleString('en-IN')}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.metaLabel}>Recommended Shift</Text>
                <Text style={styles.metaValueHighlight}>
                  {delay > 0
                    ? `Delay ${delay} yr(s)`
                    : `Increase SIP ₹${addSip.toLocaleString('en-IN')}`}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  solveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#06B6D415',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  solveBtnText: {
    color: '#06B6D4',
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '800',
  },
  yearText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  conflictNames: {
    color: '#F1F5F9',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 10,
  },
  metaLabel: {
    color: '#64748B',
    fontSize: 11,
  },
  metaValue: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  metaValueHighlight: {
    color: '#06B6D4',
    fontSize: 13,
    fontWeight: '600',
  },
  noConflictCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#10B98140',
    marginVertical: 10,
  },
  badgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noConflictTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  noConflictSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
});
