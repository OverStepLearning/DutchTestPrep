import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgress } from '../hooks/useProgress';
import { StatsDashboard } from '../components/progress/StatsDashboard';
import { PracticeHistory } from '../components/progress/PracticeHistory';

export default function ProgressScreen() {
  const {
    loading,
    history,
    error,
    stats,
    page,
    handleNextPage,
    handlePreviousPage
  } = useProgress();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your Dutch learning journey</Text>
        </View>

        {/* Stats Dashboard */}
        <StatsDashboard stats={stats} />

        {/* Practice History */}
        <PracticeHistory
          history={history}
          loading={loading}
          error={error}
          page={page}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
}); 