import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Plus, Calculator, Users, PlusCircle } from 'lucide-react-native';
import { FinancialGoal } from '../../../shared/types/goalPlanning';

// --- ADD GOAL MODAL ---
interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onAddGoal: (goal: FinancialGoal) => void;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ visible, onClose, onAddGoal }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'RETIREMENT' | 'EDUCATION' | 'HOUSING' | 'EMERGENCY_FUND' | 'WEALTH_BUILDING' | 'OTHER'>('EDUCATION');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetYear, setTargetYear] = useState('2032');
  const [priority, setPriority] = useState('1');
  const [currentMonthlySip, setCurrentMonthlySip] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !targetAmount.trim()) return;

    const newGoal: FinancialGoal = {
      id: `goal_${Date.now()}`,
      name: name.trim(),
      category,
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: parseFloat(currentAmount) || 0,
      targetYear: parseInt(targetYear, 10) || new Date().getFullYear() + 5,
      priority: parseInt(priority, 10) || 2,
      currentMonthlySip: parseFloat(currentMonthlySip) || 0,
      expectedReturnRate: 0.12,
      inflationRate: 0.06,
    };

    onAddGoal(newGoal);
    onClose();
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setCurrentMonthlySip('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <PlusCircle size={20} color="#06B6D4" />
              <Text style={styles.modalTitle}>Add Financial Goal</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={22} color="#94A3B8" />
            </Pressable>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.field}>
              <Text style={styles.label}>Goal Title *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Daughter Higher Education"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryPickerRow}>
                {(['RETIREMENT', 'EDUCATION', 'HOUSING', 'EMERGENCY_FUND', 'WEALTH_BUILDING'] as const).map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.catChip,
                      category === cat && styles.catChipActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        category === cat && styles.catChipTextActive,
                      ]}
                    >
                      {cat.replace('_', ' ')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.twoCol}>
              <View style={[styles.field, { width: '48%' }]}>
                <Text style={styles.label}>Target Amount (₹) *</Text>
                <TextInput
                  style={styles.input}
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  keyboardType="numeric"
                  placeholder="5000000"
                  placeholderTextColor="#64748B"
                />
              </View>
              <View style={[styles.field, { width: '48%' }]}>
                <Text style={styles.label}>Current Savings (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={currentAmount}
                  onChangeText={setCurrentAmount}
                  keyboardType="numeric"
                  placeholder="500000"
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>

            <View style={styles.twoCol}>
              <View style={[styles.field, { width: '48%' }]}>
                <Text style={styles.label}>Target Year</Text>
                <TextInput
                  style={styles.input}
                  value={targetYear}
                  onChangeText={setTargetYear}
                  keyboardType="numeric"
                  placeholder="2032"
                  placeholderTextColor="#64748B"
                />
              </View>
              <View style={[styles.field, { width: '48%' }]}>
                <Text style={styles.label}>Monthly SIP (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={currentMonthlySip}
                  onChangeText={setCurrentMonthlySip}
                  keyboardType="numeric"
                  placeholder="15000"
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>
          </ScrollView>

          <Pressable style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Add Goal & Recalculate</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// --- ADD FAMILY MEMBER MODAL ---
interface AddFamilyModalProps {
  visible: boolean;
  onClose: () => void;
  onAddMember: (member: { name: string; relation: string; income: number; expenses: number }) => void;
}

export const AddFamilyMemberModal: React.FC<AddFamilyModalProps> = ({ visible, onClose, onAddMember }) => {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Spouse');
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAddMember({
      name: name.trim(),
      relation,
      income: parseFloat(income) || 0,
      expenses: parseFloat(expenses) || 0,
    });
    onClose();
    setName('');
    setIncome('');
    setExpenses('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <Users size={20} color="#A855F7" />
              <Text style={styles.modalTitle}>Add Family Member</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={22} color="#94A3B8" />
            </Pressable>
          </View>

          <View style={styles.formScroll}>
            <View style={styles.field}>
              <Text style={styles.label}>Member Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Priya Sharma"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Relationship</Text>
              <TextInput
                style={styles.input}
                value={relation}
                onChangeText={setRelation}
                placeholder="Spouse / Parent / Child"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.twoCol}>
              <View style={[styles.field, { width: '48%' }]}>
                <Text style={styles.label}>Monthly Income (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={income}
                  onChangeText={setIncome}
                  keyboardType="numeric"
                  placeholder="85000"
                  placeholderTextColor="#64748B"
                />
              </View>
              <View style={[styles.field, { width: '48%' }]}>
                <Text style={styles.label}>Monthly Expense (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={expenses}
                  onChangeText={setExpenses}
                  keyboardType="numeric"
                  placeholder="30000"
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>
          </View>

          <Pressable style={[styles.submitBtn, { backgroundColor: '#A855F7' }]} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Add Member to Vault</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  formScroll: {
    marginBottom: 16,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    height: 46,
    color: '#F8FAFC',
    fontSize: 14,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catChip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  catChipActive: {
    backgroundColor: '#06B6D425',
    borderColor: '#06B6D4',
  },
  catChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  catChipTextActive: {
    color: '#06B6D4',
  },
  twoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitBtn: {
    backgroundColor: '#06B6D4',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
});
