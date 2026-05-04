import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSpeechAudio } from '../hooks/useSpeechAudio';
import { logService } from '../services/logService';

const JarvisScreen = ({ navigation }: any) => {
  const { transcript, jarvisResponse, isListening, isProcessing, isJarvisSpeaking, startListening, stopListening, handleUserMessage } = useSpeechAudio();
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState('Ready');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const unsub = logService.subscribe(setLogs);
    return unsub;
  }, []);

  useEffect(() => {
    if (isJarvisSpeaking) setStatus('Speaking...');
    else if (isProcessing) setStatus('Thinking...');
    else if (isListening) setStatus('Listening...');
    else setStatus('Ready');
  }, [isListening, isProcessing, isJarvisSpeaking]);

  const onSend = () => {
    if (inputText.trim()) {
      handleUserMessage(inputText);
      setInputText('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>🎓 Jarvis</Text>
            <Text style={styles.statusLabel}>STATUS: <Text style={styles.statusValue}>{status}</Text></Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Progress')}
            style={styles.statsBtn}
          >
            <Text>📊</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.responseCard}>
            <Text style={styles.jarvisLabel}>JARVIS:</Text>
            <Text style={styles.responseText}>{jarvisResponse}</Text>
          </View>

          {transcript ? (
            <View style={styles.transcriptCard}>
              <Text style={styles.transcriptLabel}>LAST TRANSCRIPT:</Text>
              <Text style={styles.transcriptText}>{transcript}</Text>
            </View>
          ) : null}

          <View style={styles.voiceContainer}>
            <TouchableOpacity 
              style={[styles.voiceBtn, isListening && styles.activeVoiceBtn]}
              onPress={isListening ? stopListening : startListening}
            >
              <Text style={styles.voiceBtnText}>
                {isListening ? '⏹️ STOP SESSION' : '🎙️ START VOICE MODE'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.badge}>V5.1.0 - REAL VOICE MODE ACTIVE 🏗️🎙️</Text>
          </View>

          <View style={styles.console}>
            <View style={styles.consoleHeader}>
              <Text style={styles.consoleTitle}>SYSTEM LOGS:</Text>
              <TouchableOpacity onPress={() => logService.clear()}>
                <Text style={styles.clearBtn}>🗑️ Clear</Text>
              </TouchableOpacity>
            </View>
            {logs.map((log, i) => (
              <Text key={i} style={styles.logText}>{log}</Text>
            ))}
          </View>
        </ScrollView>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Talk to Jarvis..."
            placeholderTextColor="#64748b"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={onSend}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={onSend}>
            <Text style={styles.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  statusLabel: { color: '#64748b', fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  statusValue: { color: '#38bdf8' },
  statsBtn: { backgroundColor: '#1e293b', padding: 10, borderRadius: 10 },
  scrollContent: { padding: 20 },
  responseCard: { backgroundColor: '#1e293b', padding: 20, borderRadius: 15, marginBottom: 20, minHeight: 120 },
  jarvisLabel: { color: '#38bdf8', fontSize: 10, fontWeight: 'bold', marginBottom: 8 },
  responseText: { color: '#fff', fontSize: 17, lineHeight: 24 },
  transcriptCard: { backgroundColor: 'rgba(56, 189, 248, 0.05)', padding: 15, borderRadius: 10, marginBottom: 20, borderLeftWidth: 3, borderLeftColor: '#38bdf8' },
  transcriptLabel: { color: '#64748b', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  transcriptText: { color: '#94a3b8', fontSize: 15, fontStyle: 'italic' },
  voiceContainer: { alignItems: 'center', marginVertical: 20 },
  voiceBtn: { backgroundColor: '#38bdf8', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, elevation: 5 },
  activeVoiceBtn: { backgroundColor: '#ef4444' },
  voiceBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  badge: { color: '#38bdf8', fontSize: 10, marginTop: 10, fontWeight: 'bold' },
  console: { backgroundColor: '#000', padding: 12, borderRadius: 8, marginTop: 20, borderWidth: 1, borderColor: '#1e293b' },
  consoleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  consoleTitle: { color: '#4ade80', fontSize: 10, fontWeight: 'bold' },
  clearBtn: { color: '#f87171', fontSize: 10, fontWeight: 'bold' },
  logText: { color: '#94a3b8', fontSize: 10, marginBottom: 2, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  inputWrapper: { 
    flexDirection: 'row', 
    padding: 15, 
    paddingBottom: Platform.OS === 'android' ? 30 : 20, 
    backgroundColor: '#1e293b', 
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155'
  },
  textInput: { flex: 1, backgroundColor: '#0f172a', color: '#fff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, fontSize: 15, marginRight: 10 },
  sendBtn: { backgroundColor: '#38bdf8', width: 45, height: 45, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  sendBtnText: { color: '#fff', fontSize: 20 }
});

export default JarvisScreen;
