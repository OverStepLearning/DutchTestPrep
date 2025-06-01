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
    const colors = ['#318F65', '#5CA480', '#2E8B57', '#3CB371', '#20B2AA', '#008B8B', '#4682B4', '#5F9EA0'];
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
                <Ionicons name="play-circle" size={24} color="#212121" />
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
            <Ionicons name="flame" size={24} color="#E5AF00" />
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
              <Ionicons name="chevron-forward" size={16} color="#318F65" />
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
              <Ionicons name="trending-up" size={24} color="#318F65" />
              <Text style={styles.secondaryCardTitle}>Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, styles.secondaryCard]}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Ionicons name="settings" size={24} color="#318F65" />
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
    backgroundColor: '#E6F4EC', // Mint Foam - light section background
  },
  scrollContent: {
    paddingBottom: 16,
  },
  greetingSection: {
    backgroundColor: '#FFFFFF', // Snow - card surface
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#318F65', // Forest Verdant - heading color
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5CA480', // Overstep Green - secondary text
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#212121', // Charcoal - body text
    lineHeight: 22,
  },
  tipSection: {
    marginBottom: 24,
    marginHorizontal: 16,
    paddingHorizontal: 20,
    paddingVertical: 32,
    minHeight: 320,
    backgroundColor: '#FFFFFF', // Snow - card surface
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
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
    color: '#318F65', // Forest Verdant - heading
    marginBottom: 8,
  },
  tipText: {
    fontSize: 16,
    color: '#212121', // Charcoal - body text
    lineHeight: 24,
    marginBottom: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6C83F', // Sunbeam Yellow - primary CTA
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
    color: '#212121', // Charcoal - text on light button
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
    backgroundColor: '#FFFFFF', // Snow - card surface
    alignItems: 'center',
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#E6F4EC', // Mint Foam - subtle border
  },
  secondaryCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#318F65', // Forest Verdant - icon color
    marginTop: 8,
  },
  streakContainer: {
    backgroundColor: '#FFFFFF', // Snow - card surface
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
    borderLeftWidth: 4,
    borderLeftColor: '#E5AF00', // Golden Mango - accent strip
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#318F65', // Forest Verdant - heading
    marginLeft: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#E5AF00', // Golden Mango - highlight number
    marginBottom: 4,
  },
  streakText: {
    fontSize: 16,
    color: '#212121', // Charcoal - body text
    marginBottom: 4,
  },
  streakSubtext: {
    fontSize: 14,
    color: '#5CA480', // Overstep Green - secondary text
  },
  goalContainer: {
    backgroundColor: '#FFFFFF', // Snow - card surface
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
    color: '#318F65', // Forest Verdant - heading
    marginBottom: 16,
  },
  goalProgress: {
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E6F4EC', // Mint Foam - background
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#E5AF00', // Golden Mango - progress bar
  },
  goalText: {
    fontSize: 14,
    color: '#212121', // Charcoal - body text
  },
  goalButton: {
    backgroundColor: '#5CA480', // Overstep Green - secondary action
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  goalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // Snow - text on dark button
  },
  subjectContainer: {
    backgroundColor: '#FFFFFF', // Snow - card surface
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
    color: '#318F65', // Forest Verdant - heading
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
    color: '#212121', // Charcoal - main text
    marginBottom: 4,
  },
  subjectLevel: {
    fontSize: 14,
    color: '#5CA480', // Overstep Green - secondary text
  },
  changeSubjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8D3', // Lemon Frost - soft banner
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  changeSubjectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#318F65', // Forest Verdant - action text
    marginRight: 4,
  },
  userInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});
