import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgress } from '../hooks/useProgress';
import { StatsDashboard } from '../components/progress/StatsDashboard';
import { PracticeHistory } from '../components/progress/PracticeHistory';
import { useTabContext } from '@/contexts/TabContext';

export default function ProgressScreen() {
  const {
    loading,
    history,
    error,
    stats,
    page,
    handleNextPage,
    handlePreviousPage,
    currentSubject: hookSubject,
    fetchPracticeHistory
  } = useProgress();
  const { currentTab, shouldRefresh, currentSubject: tabSubject } = useTabContext();
  const [refreshing, setRefreshing] = React.useState(false);

  // Refresh data when entering the progress tab
  useEffect(() => {
    if (currentTab === 'progress' && shouldRefresh('progress')) {
      console.log('[Progress] Tab focused - refreshing data');
      fetchPracticeHistory(tabSubject);
    }
  }, [currentTab, shouldRefresh]);

  // Also refresh when the tabSubject changes
  useEffect(() => {
    if (currentTab === 'progress' && tabSubject) {
      console.log(`[Progress] Subject from context: ${tabSubject}`);
      fetchPracticeHistory(tabSubject);
    }
  }, [tabSubject, currentTab]);

  // Pull-to-refresh handler
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Use subject from TabContext for consistency
    fetchPracticeHistory(tabSubject).finally(() => {
      setRefreshing(false);
    });
  }, [fetchPracticeHistory, tabSubject]);

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>
            Subject: {tabSubject || 'Loading...'}
          </Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingIndicator}>
            <Text>Loading stats...</Text>
          </View>
        ) : (
          <StatsDashboard stats={stats} />
        )}
        
        <View style={styles.historyContainer}>
          <Text style={styles.sectionTitle}>Practice History</Text>
          <PracticeHistory
            history={history}
            loading={loading}
            error={error}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            page={page}
            currentSubject={tabSubject}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  historyContainer: {
    marginTop: 24,
  },
  loadingIndicator: {
    padding: 20,
    alignItems: 'center',
  },
}); 