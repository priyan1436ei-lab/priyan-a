import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { User, Shield, Crown, LogOut, Lock, Smartphone, Bell, ChevronRight } from 'lucide-react-native';
import { useMobileFinFam } from '../../src/context/MobileFinFamContext';
import { MobileTopAppBar } from '../../src/components/MobileTopAppBar';

export default function ProfileScreen() {
  const { state } = useMobileFinFam();

  const handleLogout = () => {
    Alert.alert('Logged Out', 'You have been signed out of your FinFam Vault.');
  };

  return (
    <View style={styles.container}>
      <MobileTopAppBar userEmail={state.userEmail} subscriptionTier={state.subscriptionTier} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <User size={32} color="#06B6D4" />
          </View>
          <Text style={styles.userName}>{state.userEmail}</Text>
          <View style={styles.tierBadge}>
            <Crown size={14} color="#F59E0B" />
            <Text style={styles.tierText}>{state.subscriptionTier} VIP MEMBER</Text>
          </View>
        </View>

        {/* Security & App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Security</Text>

          <Pressable style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Lock size={18} color="#06B6D4" />
              <Text style={styles.rowText}>Biometric / SecureStore Auth</Text>
            </View>
            <ChevronRight size={18} color="#64748B" />
          </Pressable>

          <Pressable style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Smartphone size={18} color="#A855F7" />
              <Text style={styles.rowText}>Device & Mesh Node Settings</Text>
            </View>
            <ChevronRight size={18} color="#64748B" />
          </Pressable>

          <Pressable style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Bell size={18} color="#38BDF8" />
              <Text style={styles.rowText}>Push & Goal Alerts</Text>
            </View>
            <ChevronRight size={18} color="#64748B" />
          </Pressable>
        </View>

        {/* Logout */}
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out of Vault</Text>
        </Pressable>
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
  userCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#06B6D420',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#06B6D4',
  },
  userName: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  tierText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
  },
  section: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowText: {
    color: '#CBD5E1',
    fontSize: 14,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF444415',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF444440',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
