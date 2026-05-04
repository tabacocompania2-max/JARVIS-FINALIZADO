import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

interface ProgressData {
  fluency: number[];
  skills: {
    grammar: number;
    vocabulary: number;
    speaking: number;
    listening: number;
  };
  strengths: string[];
  weaknesses: string[];
  totalSessions: number;
  streak: number;
}

interface ChatHistory {
  id: string;
  title: string;
  date: string;
  summary: string;
}

export function ProgressScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProgressData | null>(null);
  const [history, setHistory] = useState<ChatHistory[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://jarvis-server-production.up.railway.app';
        const [progressRes, historyRes] = await Promise.all([
          axios.get(`${apiUrl}/api/student/progress`),
          axios.get(`${apiUrl}/api/student/history`)
        ]);
        setData(progressRes.data);
        setHistory(historyRes.data);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Perfil de Estudiante</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{data?.streak || 0} 🔥</Text>
            <Text style={styles.statLabel}>Racha</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{data?.totalSessions || 0}</Text>
            <Text style={styles.statLabel}>Sesiones</Text>
          </View>
        </View>

        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Habilidades Actuales</Text>
          <View style={styles.skillRow}>
            <Text style={styles.skillName}>Grammar</Text>
            <Text style={styles.skillValue}>{data?.skills.grammar}%</Text>
          </View>
          <View style={styles.skillRow}>
            <Text style={styles.skillName}>Vocabulary</Text>
            <Text style={styles.skillValue}>{data?.skills.vocabulary}%</Text>
          </View>
          <View style={styles.skillRow}>
            <Text style={styles.skillName}>Speaking</Text>
            <Text style={styles.skillValue}>{data?.skills.speaking}%</Text>
          </View>
        </View>

        <View style={styles.analysisRow}>
          <View style={styles.analysisCard}>
            <Text style={[styles.cardTitle, { color: '#4ade80' }]}>Fortalezas</Text>
            {data?.strengths.map((s, i) => <Text key={i} style={styles.analysisText}>• {s}</Text>)}
          </View>
          <View style={styles.analysisCard}>
            <Text style={[styles.cardTitle, { color: '#f87171' }]}>Debilidades</Text>
            {data?.weaknesses.map((w, i) => <Text key={i} style={styles.analysisText}>• {w}</Text>)}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Historial de Sesiones</Text>
        {history.map((item) => (
          <TouchableOpacity key={item.id} style={styles.historyCard}>
            <View>
              <Text style={styles.historyTitle}>{item.title}</Text>
              <Text style={styles.historySummary}>{item.summary}</Text>
            </View>
            <Text style={styles.historyDate}>{item.date}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backButton: { marginRight: 15 },
  backText: { color: '#06b6d4', fontSize: 16, fontWeight: '600' },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 25, marginBottom: 15 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  statCard: { backgroundColor: '#1e293b', padding: 20, borderRadius: 15, width: '48%', alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: '#94a3b8', fontSize: 14, marginTop: 5 },
  skillsSection: { backgroundColor: '#1e293b', padding: 20, borderRadius: 15, marginTop: 20 },
  skillRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  skillName: { color: '#94a3b8', fontSize: 16 },
  skillValue: { color: '#38bdf8', fontSize: 16, fontWeight: 'bold' },
  analysisRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  analysisCard: { backgroundColor: '#1e293b', padding: 15, borderRadius: 15, width: '48%' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  analysisText: { color: '#cbd5e1', fontSize: 13, marginBottom: 5 },
  historyCard: { backgroundColor: '#1e293b', padding: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  historyTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  historySummary: { color: '#94a3b8', fontSize: 13, marginTop: 2, maxWidth: '80%' },
  historyDate: { color: '#64748b', fontSize: 12 },
});
