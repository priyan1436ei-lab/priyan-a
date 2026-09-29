import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { Send, Smartphone, ShieldCheck, Zap, RefreshCw } from 'lucide-react-native';
import { useMobileFinFam } from '../../src/context/MobileFinFamContext';
import { MobileTopAppBar } from '../../src/components/MobileTopAppBar';

export default function TransferScreen() {
  const { state } = useMobileFinFam();
  const [recipient, setRecipient] = useState('Priya Sharma (Spouse)');
  const [amount, setAmount] = useState('15000');
  const [note, setNote] = useState('SIP Contribution towards Daughter Education');
  const [sending, setSending] = useState(false);

  const handleSendTransfer = () => {
    if (!amount.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      Alert.alert(
        'Transfer Successful!',
        `Successfully routed ₹${parseFloat(amount).toLocaleString('en-IN')} to ${recipient} via FinFam Real-Time Liquidity Mesh.`
      );
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <MobileTopAppBar userEmail={state.userEmail} subscriptionTier={state.subscriptionTier} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <Send size={22} color="#06B6D4" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.bannerTitle}>Real-Time Mesh Liquidity Transfer</Text>
            <Text style={styles.bannerSub}>
              Instant peer-to-peer goal funding across connected family vault nodes.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Transfer Details</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Recipient Node</Text>
            <TextInput
              style={styles.input}
              value={recipient}
              onChangeText={setRecipient}
              placeholder="e.g. Priya Sharma"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Transfer Amount (₹)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="15000"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Note / Goal Allocation</Text>
            <TextInput
              style={styles.input}
              value={note}
              onChangeText={setNote}
              placeholder="e.g. Education SIP"
              placeholderTextColor="#64748B"
            />
          </View>

          <Pressable style={styles.sendBtn} onPress={handleSendTransfer} disabled={sending}>
            <Zap size={18} color="#0F172A" />
            <Text style={styles.sendBtnText}>
              {sending ? 'Routing Liquidity...' : 'Execute Mesh Transfer'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
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
  banner: {
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
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
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
    height: 44,
    color: '#F8FAFC',
    fontSize: 14,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#06B6D4',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  sendBtnText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
});
