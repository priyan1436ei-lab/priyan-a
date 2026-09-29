import React from 'react';
import { Tabs } from 'expo-router';
import {
  Home,
  Target,
  Layers,
  Sliders,
  Sparkles,
  Scale,
  CreditCard,
  Users,
  Bot,
  UserCheck,
  Send,
} from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#06B6D4',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#334155',
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color, size }) => <Home size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="multi_goal_planner"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color, size }) => <Target size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="conflict_map"
        options={{
          title: 'Conflicts',
          tabBarIcon: ({ color, size }) => <Layers size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="what_if_lab"
        options={{
          title: 'What-If',
          tabBarIcon: ({ color, size }) => <Sliders size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="resolution_lab"
        options={{
          title: 'Resolve',
          tabBarIcon: ({ color, size }) => <Sparkles size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="optimizer"
        options={{
          title: 'Decision',
          tabBarIcon: ({ color, size }) => <Scale size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="emi"
        options={{
          title: 'EMI Engine',
          tabBarIcon: ({ color, size }) => <CreditCard size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: 'Family',
          tabBarIcon: ({ color, size }) => <Users size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="advisor"
        options={{
          title: 'AI Coach',
          tabBarIcon: ({ color, size }) => <Bot size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transfer"
        options={{
          title: 'Transfer',
          tabBarIcon: ({ color, size }) => <Send size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <UserCheck size={size || 20} color={color} />,
        }}
      />
    </Tabs>
  );
}
