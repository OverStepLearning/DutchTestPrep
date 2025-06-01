import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useTabContext } from '@/contexts/TabContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const { currentSubject } = useTabContext();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute for dynamic greeting
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get motivational tips - currently hardcoded but rotates daily
  // TODO: Could be enhanced to fetch from API or be more personalized
  const dailyTips = [
    "Practice a little every day for the best results! 🌟",
    "Don't be afraid to make mistakes - they help you learn! 💪",
    "Try speaking out loud to improve your pronunciation! 🗣️",
    "Review yesterday's lessons to strengthen your memory! 🧠",
    "Set small daily goals and celebrate your progress! 🎉",
    "Immerse yourself by listening to music in your target language! 🎵",
    "Practice with native speakers when you feel ready! 👥",
    "Use flashcards to memorize new vocabulary effectively! 📚",
    "Watch movies with subtitles in your learning language! 🎬",
    "Keep a language learning journal to track your thoughts! ✍️"
  ];
  
  // Rotate tip based on day of year for variety
  const dayOfYear = Math.floor((currentTime.getTime() - new Date(currentTime.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const todaysTip = dailyTips[dayOfYear % dailyTips.length];

  // Get user initials for status placeholder
  const getUserInitials = () => {
    const name = user?.name || 'Learner';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get random background color for user status
  const getUserStatusColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const name = user?.name || 'Learner';
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* User Greeting Section */}
        <View style={styles.greetingSection}>
          <View style={styles.greetingContent}>
            {/* User Status Placeholder */}
            <View style={styles.userStatusContainer}>
              <View style={[styles.userStatusPlaceholder, { backgroundColor: getUserStatusColor() }]}>
                <Text style={styles.userInitials}>{getUserInitials()}</Text>
              </View>
            </View>
            
            <View style={styles.greetingTextContainer}>
              <Text style={styles.greeting}>{getGreeting()}!</Text>
              <Text style={styles.userName}>{user?.name || 'Learner'}</Text>
              <Text style={styles.welcomeText}>
                Ready to continue your {currentSubject || 'language'} journey?
              </Text>
            </View>
          </View>
        </View>

        {/* Daily Tip Section with Mascot */}
        <View style={styles.tipSection}>
          <View style={styles.tipContent}>
            {/* Left Side - Daily Tip */}
            <View style={styles.leftContent}>
              <Text style={styles.tipTitle}>Daily Tip</Text>
              <Text style={styles.tipText}>{todaysTip}</Text>
              
              {/* Start Practice Button */}
              <TouchableOpacity 
                style={styles.startButton}
                onPress={() => router.push('/(tabs)/practice')}
              >
                <Ionicons name="play-circle" size={24} color="#fff" />
                <Text style={styles.startButtonText}>START</Text>
              </TouchableOpacity>
            </View>
            
            {/* Right Side - Mascot */}
            <View style={styles.rightContent}>
              <Image 
                source={require('../../assets/images/mascot.png')} 
                style={styles.mascotImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* Learning Streak */}
        <View style={styles.streakContainer}>
          <View style={styles.streakHeader}>
            <Ionicons name="flame" size={24} color="#ff6b35" />
            <Text style={styles.streakTitle}>Learning Streak</Text>
          </View>
          <Text style={styles.streakNumber}>7</Text>
          <Text style={styles.streakText}>days in a row! 🔥</Text>
          <Text style={styles.streakSubtext}>Keep it up! You're doing great!</Text>
        </View>

        {/* Current Subject */}
        <View style={styles.subjectContainer}>
          <Text style={styles.subjectTitle}>Currently Learning</Text>
          <View style={styles.subjectCard}>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{currentSubject || 'Dutch'}</Text>
              <Text style={styles.subjectLevel}>Intermediate Level</Text>
            </View>
            <TouchableOpacity 
              style={styles.changeSubjectButton}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Text style={styles.changeSubjectText}>Change</Text>
              <Ionicons name="chevron-forward" size={16} color="#4f86f7" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Goal */}
        <View style={styles.goalContainer}>
          <Text style={styles.goalTitle}>Today's Goal</Text>
          <View style={styles.goalProgress}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
            <Text style={styles.goalText}>3 of 5 exercises completed</Text>
          </View>
          <TouchableOpacity 
            style={styles.goalButton}
            onPress={() => router.push('/(tabs)/practice')}
          >
            <Text style={styles.goalButtonText}>Continue Learning</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Action Cards */}
        <View style={styles.actionCardsContainer}>
          <View style={styles.secondaryCardsRow}>
            <TouchableOpacity 
              style={[styles.actionCard, styles.secondaryCard]}
              onPress={() => router.push('/(tabs)/progress')}
            >
              <Ionicons name="trending-up" size={24} color="#4f86f7" />
              <Text style={styles.secondaryCardTitle}>Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, styles.secondaryCard]}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Ionicons name="settings" size={24} color="#4f86f7" />
              <Text style={styles.secondaryCardTitle}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

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
    paddingBottom: 16,
  },
  greetingSection: {
    padding: 20,
    marginBottom: 16,
  },
  greetingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userStatusContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userStatusPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  greetingTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4f86f7',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  tipSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingVertical: 32,
    minHeight: 320,
    backgroundColor: '#f8f9fa',
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flex: 1,
    paddingRight: 16,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f86f7',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  rightContent: {
    width: 180,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImage: {
    width: '100%',
    height: '100%',
  },
  mascotEmoji: {
    fontSize: 40,
  },
  actionCardsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  secondaryCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryCard: {
    width: '48%',
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 20,
  },
  secondaryCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  streakContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    marginHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 4,
  },
  streakText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  streakSubtext: {
    fontSize: 14,
    color: '#666',
  },
  goalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  goalProgress: {
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  goalText: {
    fontSize: 14,
    color: '#666',
  },
  goalButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  goalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  subjectContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subjectLevel: {
    fontSize: 14,
    color: '#666',
  },
  changeSubjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  changeSubjectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4f86f7',
    marginRight: 4,
  },
  userInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});
