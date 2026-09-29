import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import { Grid, X, ArrowRight } from 'lucide-react-native';
import { GoalInterferenceCell } from '../../../shared/types/goalPlanning';

interface Props {
  matrix: GoalInterferenceCell[][];
  goalNames: string[];
}

export const MobileGoalInterferenceMatrix: React.FC<Props> = ({ matrix, goalNames }) => {
  const [selectedCell, setSelectedCell] = useState<{
    cell: GoalInterferenceCell;
    rowName: string;
    colName: string;
  } | null>(null);

  if (!matrix || matrix.length === 0 || !goalNames || goalNames.length === 0) {
    return null;
  }

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return '#334155';
    if (intensity < 0.3) return '#0EA5E9';
    if (intensity < 0.7) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Grid size={20} color="#A855F7" />
        <Text style={styles.title}>Goal Interference Matrix</Text>
      </View>

      <Text style={styles.subtext}>
        Cross-goal impact scores. Tap any cell to view specific liquidity cannibalization.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollWrapper}>
        <View style={styles.matrixGrid}>
          {/* Header Row */}
          <View style={styles.row}>
            <View style={[styles.cell, styles.cornerCell]}>
              <Text style={styles.cornerText}>Goal vs Goal</Text>
            </View>
            {goalNames.map((name, colIdx) => (
              <View key={colIdx} style={[styles.cell, styles.headerCell]}>
                <Text style={styles.headerCellText} numberOfLines={1}>
                  {name.length > 8 ? `${name.substring(0, 7)}…` : name}
                </Text>
              </View>
            ))}
          </View>

          {/* Matrix Rows */}
          {matrix.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.row}>
              <View style={[styles.cell, styles.headerCell]}>
                <Text style={styles.headerCellText} numberOfLines={1}>
                  {goalNames[rowIdx]?.length > 8 ? `${goalNames[rowIdx].substring(0, 7)}…` : goalNames[rowIdx]}
                </Text>
              </View>

              {row.map((cell, colIdx) => {
                const isSelf = rowIdx === colIdx;
                const score = cell.interferenceScore ?? 0;
                const cellColor = isSelf ? '#1E293B' : getIntensityColor(score);

                return (
                  <Pressable
                    key={colIdx}
                    disabled={isSelf}
                    onPress={() =>
                      setSelectedCell({
                        cell,
                        rowName: goalNames[rowIdx],
                        colName: goalNames[colIdx],
                      })
                    }
                    style={[
                      styles.cell,
                      styles.dataCell,
                      { backgroundColor: isSelf ? '#0F172A' : `${cellColor}25`, borderColor: cellColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.cellScoreText,
                        { color: isSelf ? '#475569' : cellColor, fontWeight: isSelf ? '400' : '700' },
                      ]}
                    >
                      {isSelf ? '—' : (score * 100).toFixed(0) + '%'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selectedCell} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Interference Details</Text>
              <Pressable onPress={() => setSelectedCell(null)} hitSlop={8}>
                <X size={20} color="#94A3B8" />
              </Pressable>
            </View>

            {selectedCell && (
              <View style={styles.modalBody}>
                <View style={styles.pairRow}>
                  <Text style={styles.goalPill}>{selectedCell.rowName}</Text>
                  <ArrowRight size={16} color="#A855F7" />
                  <Text style={styles.goalPill}>{selectedCell.colName}</Text>
                </View>

                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Interference Score:</Text>
                  <Text style={styles.metricVal}>
                    {((selectedCell.cell.interferenceScore ?? 0) * 100).toFixed(1)}%
                  </Text>
                </View>

                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Impact Type:</Text>
                  <Text style={[styles.metricVal, { color: '#F59E0B' }]}>
                    {selectedCell.cell.impactType || 'CASHFLOW_COLLISION'}
                  </Text>
                </View>

                <Text style={styles.descLabel}>Analytical Explanation:</Text>
                <Text style={styles.descText}>
                  {selectedCell.cell.explanation || 'Concurrent capital demands during target maturity year.'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  scrollWrapper: {
    marginHorizontal: -4,
  },
  matrixGrid: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 76,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 8,
  },
  cornerCell: {
    backgroundColor: '#0F172A',
  },
  cornerText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  headerCell: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 4,
  },
  headerCellText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  dataCell: {
    borderWidth: 1,
  },
  cellScoreText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    gap: 12,
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
  },
  goalPill: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  metricVal: {
    color: '#A855F7',
    fontSize: 14,
    fontWeight: '700',
  },
  descLabel: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },
  descText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
});
