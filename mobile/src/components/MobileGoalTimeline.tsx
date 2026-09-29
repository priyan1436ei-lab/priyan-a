import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar, Target, Flag } from 'lucide-react-native';
import { FinancialGoal } from '../../../shared/types/goalPlanning';

interface Props {
  goals: FinancialGoal[];
}

export const MobileGoalTimeline: React.FC<Props> = ({ goals }) => {
  if (!goals || goals.length === 0) return null;

  // Sort goals by target year
  const sortedGoals = [...goals].sort((a, b) => a.targetYear - b.targetYear);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Calendar size={20} color="#38BDF8" />
        <Text style={styles.title}>Multi-Goal Lifespan Timeline</Text>
      </View>
      <Text style={styles.subtext}>
        Chronological roadmap of your targets and required maturity capital.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.timelineRow}>
          {sortedGoals.map((goal, idx) => {
            const isPriority1 = goal.priority === 1;

            return (
              <View key={goal.id || idx} style={styles.timelineCard}>
                <View style={styles.yearBadge}>
                  <Text style={styles.yearText}>{goal.targetYear}</Text>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.goalTitleRow}>
                    <Text style={styles.goalName} numberOfLines={1}>
                      {goal.name}
                    </Text>
                    {isPriority1 && (
                      <View style={styles.p1Badge}>
                        <Text style={styles.p1Text}>P1</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.categoryText}>{goal.category}</Text>

                  <View style={styles.amountBox}>
                    <Text style={styles.amountLabel}>Target Capital</Text>
                    <Text style={styles.amountVal}>₹{goal.targetAmount.toLocaleString('en-IN')}</Text>
                  </View>

                  <View style={styles.sipBox}>
                    <Text style={styles.sipLabel}>Monthly SIP</Text>
                    <Text style={styles.sipVal}>₹{goal.currentMonthlySip.toLocaleString('en-IN')}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
  scroll: {
    marginHorizontal: -4,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 12,
  },
  timelineCard: {
    width: 170,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  yearBadge: {
    backgroundColor: '#38BDF820',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  yearText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
  },
  cardBody: {
    gap: 4,
  },
  goalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  p1Badge: {
    backgroundColor: '#EF444425',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  p1Text: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '800',
  },
  categoryText: {
    color: '#64748B',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  amountBox: {
    marginTop: 6,
  },
  amountLabel: {
    color: '#64748B',
    fontSize: 10,
  },
  amountVal: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  sipBox: {
    marginTop: 4,
  },
  sipLabel: {
    color: '#64748B',
    fontSize: 10,
  },
  sipVal: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
  },
});
