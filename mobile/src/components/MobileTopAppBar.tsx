import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ShieldCheck, Sparkles, Zap, Plus } from 'lucide-react-native';
import { useMobileFinFam } from '../context/MobileFinFamContext';

interface MobileTopAppBarProps {
  userEmail?: string;
  subscriptionTier?: string;
  onAddGoalPress?: () => void;
  onOpenAddGoal?: () => void;
  onOpenTransfer?: () => void;
}

export const MobileTopAppBar: React.FC<MobileTopAppBarProps> = ({
  userEmail,
  subscriptionTier,
  onAddGoalPress,
  onOpenAddGoal,
  onOpenTransfer,
}) => {
  const { userProfile } = useMobileFinFam();
  const triggerAdd = onAddGoalPress || onOpenAddGoal;

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>PS</Text>
        </View>
        <View>
          <View style={styles.brandRow}>
            <Text style={styles.brandTitle}>FinFam</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>VAULT</Text>
            </View>
            <View style={styles.proBadge}>
              <ShieldCheck size={12} color="#10B981" />
              <Text style={styles.proText}>{subscriptionTier || 'PRO'}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            {userEmail || userProfile.email || 'Sharma Family Vault'}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        {onOpenTransfer && (
          <TouchableOpacity style={styles.iconBtn} onPress={onOpenTransfer}>
            <Zap size={18} color="#C084FC" />
          </TouchableOpacity>
        )}

        {triggerAdd && (
          <TouchableOpacity style={styles.addBtn} onPress={triggerAdd}>
            <Plus size={16} color="#050816" strokeWidth={3} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#06B6D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  badge: {
    backgroundColor: '#06B6D420',
    borderColor: '#06B6D440',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#06B6D4',
    fontSize: 9,
    fontWeight: 'bold',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#10B98125',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  proText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#1E293B',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#06B6D4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#050816',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
