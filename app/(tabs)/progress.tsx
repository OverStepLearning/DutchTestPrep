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
    backgroundColor: '#E6F4EC', // Mint Foam - light background
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF', // Snow - card surface
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#318F65', // Forest Verdant - heading
  },
  subtitle: {
    fontSize: 16,
    color: '#5CA480', // Overstep Green - secondary text
    marginTop: 5,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#318F65', // Forest Verdant - heading
  },
  historyContainer: {
    marginTop: 24,
    backgroundColor: '#FFFFFF', // Snow - card surface
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingIndicator: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Snow - card surface
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
}); 