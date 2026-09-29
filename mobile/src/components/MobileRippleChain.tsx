import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GitCommit } from 'lucide-react-native';
import { RippleEffect } from '../../../shared/types/goalPlanning';

interface Props {
  ripples: RippleEffect[];
  triggerGoalName?: string;
  triggerAction?: string;
}

export const MobileRippleChain: React.FC<Props> = ({ ripples, triggerGoalName, triggerAction }) => {
  if (!ripples || ripples.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <GitCommit size={20} color="#10B981" />
        <Text style={styles.emptyText}>Zero Downstream Ripple Conflicts</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <GitCommit size={20} color="#EC4899" />
        <Text style={styles.title}>Downstream Ripple Chain</Text>
      </View>

      {triggerGoalName && (
        <View style={styles.triggerBanner}>
          <Text style={styles.triggerText}>
            Trigger Event: <Text style={{ color: '#F8FAFC', fontWeight: '700' }}>{triggerGoalName}</Text> (
            {triggerAction || 'Priority Modification'})
          </Text>
        </View>
      )}

      <View style={styles.chainList}>
        {ripples.map((step, index) => {
          const isLast = index === ripples.length - 1;
          const isSevere = step.severity === 'HIGH' || step.severity === 'CRITICAL';
          const fImpact = step.feasibilityImpact ?? 0;
          const deficit = step.additionalDeficit ?? 0;

          return (
            <View key={index} style={styles.stepItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.nodeCircle,
                    { backgroundColor: isSevere ? '#EF4444' : '#F59E0B' },
                  ]}
                >
                  <Text style={styles.nodeNum}>{index + 1}</Text>
                </View>
                {!isLast && <View style={styles.verticalLine} />}
              </View>

              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Text style={styles.targetGoalName}>{step.affectedGoalName || `Goal ${index + 1}`}</Text>
                  <View
                    style={[
                      styles.sevBadge,
                      { backgroundColor: isSevere ? '#EF444425' : '#F59E0B25' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sevBadgeText,
                        { color: isSevere ? '#EF4444' : '#F59E0B' },
                      ]}
                    >
                      {step.severity || 'HIGH'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.causeText}>Cause: {step.causalFactor || 'Resource competition'}</Text>

                <View style={styles.metricsGrid}>
                  <View style={styles.metricItem}>
                    <Text style={styles.mLabel}>Feasibility Impact</Text>
                    <Text style={styles.mValNeg}>-{(fImpact * 100).toFixed(1)}%</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.mLabel}>Forced Stagger</Text>
                    <Text style={styles.mVal}>{step.forcedDelayYears || 0} yr delay</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.mLabel}>Deficit Spawned</Text>
                    <Text style={styles.mValNeg}>₹{deficit.toLocaleString('en-IN')}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>
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
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  triggerBanner: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#EC4899',
  },
  triggerText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  chainList: {
    marginTop: 4,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 30,
    marginRight: 10,
  },
  nodeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  nodeNum: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#334155',
    marginTop: 4,
  },
  stepContent: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  targetGoalName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  sevBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sevBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  causeText: {
    color: '#CBD5E1',
    fontSize: 12,
    marginBottom: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    padding: 8,
    borderRadius: 8,
  },
  metricItem: {
    alignItems: 'flex-start',
  },
  mLabel: {
    color: '#64748B',
    fontSize: 10,
  },
  mVal: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  mValNeg: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 14,
    marginVertical: 10,
  },
  emptyText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
});
