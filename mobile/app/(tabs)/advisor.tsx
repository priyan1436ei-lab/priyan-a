import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Bot, Send, User, Sparkles, ShieldCheck, Zap } from 'lucide-react-native';
import { useMobileFinFam } from '../../src/context/MobileFinFamContext';
import { MobileTopAppBar } from '../../src/components/MobileTopAppBar';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function AdvisorScreen() {
  const { state } = useMobileFinFam();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello! I am your FinFam AI Wealth Coach. I've analyzed your ${state.goals.length} active financial goals and overall Health Score of ${state.overallScore}/100. How can I assist your financial strategy today?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = inputText;
    setInputText('');
    setLoading(true);

    setTimeout(() => {
      let responseText = `Based on your household cashflow and goals, I recommend prioritizing your highest-impact goals first. To eliminate conflict deficits, consider increasing your monthly equity SIP step-up by 8-10% annually.`;
      if (query.toLowerCase().includes('tax')) {
        responseText = `To optimize tax liabilities, maximize ELSS mutual fund investments under Section 80C up to ₹1.5 Lakhs and consider National Pension System (NPS) under Section 80CCD(1B) for an extra ₹50,000 tax deduction.`;
      } else if (query.toLowerCase().includes('retire') || query.toLowerCase().includes('pension')) {
        responseText = `For your Retirement goal, increasing your SIP allocation by ₹5,000/month in equity index funds will offset your expected 6% inflation gap over the next 15 years.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <MobileTopAppBar userEmail={state.userEmail} subscriptionTier={state.subscriptionTier} />

      <View style={styles.banner}>
        <Bot size={22} color="#06B6D4" />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.bannerTitle}>FinFam AI Wealth Coach</Text>
          <Text style={styles.bannerSub}>24/7 Multi-Goal & Tax Intelligence Assistant</Text>
        </View>
      </View>

      <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <View
              key={msg.id}
              style={[
                styles.msgRow,
                isUser ? styles.userMsgRow : styles.aiMsgRow,
              ]}
            >
              {!isUser && (
                <View style={styles.aiAvatar}>
                  <Bot size={16} color="#06B6D4" />
                </View>
              )}

              <View
                style={[
                  styles.msgBubble,
                  isUser ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text style={[styles.msgText, isUser && { color: '#0F172A' }]}>{msg.text}</Text>
                <Text style={[styles.timeText, isUser && { color: '#0F172A90' }]}>
                  {msg.timestamp}
                </Text>
              </View>
            </View>
          );
        })}

        {loading && (
          <View style={[styles.msgRow, styles.aiMsgRow]}>
            <View style={styles.aiAvatar}>
              <Bot size={16} color="#06B6D4" />
            </View>
            <View style={[styles.msgBubble, styles.aiBubble]}>
              <Text style={{ color: '#94A3B8', fontSize: 13 }}>Analyzing portfolio cashflows...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Suggested Prompts */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptScroll}>
        {[
          'How do I fix goal conflicts?',
          'Best tax saving strategy?',
          'Should I prepay loan or SIP?',
          'Child education planning',
        ].map((prompt, idx) => (
          <Pressable
            key={idx}
            style={styles.promptChip}
            onPress={() => setInputText(prompt)}
          >
            <Sparkles size={12} color="#06B6D4" />
            <Text style={styles.promptText}>{prompt}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask AI Coach anything..."
          placeholderTextColor="#64748B"
        />
        <Pressable style={styles.sendBtn} onPress={handleSend}>
          <Send size={18} color="#0F172A" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  bannerTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  bannerSub: {
    color: '#94A3B8',
    fontSize: 11,
  },
  chatScroll: {
    flex: 1,
    paddingHorizontal: 14,
  },
  chatContent: {
    paddingVertical: 14,
    gap: 12,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  userMsgRow: {
    justifyContent: 'flex-end',
  },
  aiMsgRow: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#06B6D420',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  msgBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#06B6D4',
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#334155',
  },
  msgText: {
    color: '#F8FAFC',
    fontSize: 14,
    lineHeight: 20,
  },
  timeText: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  promptScroll: {
    maxHeight: 40,
    paddingHorizontal: 10,
    marginVertical: 4,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  promptText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 14,
    marginRight: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#06B6D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
