import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Linking, Image, Share, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '../context/NavigationContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCredits } from '../context/CreditsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const { credits, dailyUsage, MAX_DAILY_CREDITS, addCredits } = useCredits();
  const [completedTasks, setCompletedTasks] = useState([]);

  // Load completed tasks on mount
  useEffect(() => {
    loadCompletedTasks();
  }, []);

  const loadCompletedTasks = async () => {
    try {
      const tasks = await AsyncStorage.getItem('completedTasks');
      if (tasks) {
        setCompletedTasks(JSON.parse(tasks));
      }
    } catch (error) {
      console.error('Error loading completed tasks:', error);
    }
  };

  const tasks = [
    {
      id: 1,
      title: 'Visit Developer Portfolio',
      description: 'Check out our developer\'s work',
      points: 2,
      icon: 'code-slash',
      color: '#825EFF',
      url: 'https://kallolsfolio.vercel.app',
      completed: completedTasks.includes(1)
    },
    {
      id: 2,
      title: 'Follow on Facebook',
      description: 'Stay updated with our latest features',
      points: 3,
      icon: 'logo-facebook',
      color: '#1877F2',
      url: 'https://www.facebook.com/kamrulhasan.kallol.9/',
      completed: completedTasks.includes(2)
    },
    {
      id: 3,
      title: 'Try Web Version',
      description: 'Experience our web platform',
      points: 5,
      icon: 'globe',
      color: '#52B6FF',
      url: 'https://studbuddy.vercel.app/',
      completed: completedTasks.includes(3)
    },
    {
      id: 4,
      title: 'Share with Friends',
      description: 'Help others discover StudentBuddy',
      points: 4,
      icon: 'share-social',
      color: '#FF8F5E',
      url: 'https://studbuddy.vercel.app/',
      completed: completedTasks.includes(4)
    }
  ];

  const handleTaskPress = async (task) => {
    try {
      if (task.id === 4) {
        // Handle share task
        await Share.share({
          message: 'Check out StudentBuddy - Your ultimate academic companion! Create beautiful cover pages and manage your academic documents with ease. Try it now: https://studbuddy.vercel.app/',
          url: 'https://studbuddy.vercel.app/'
        });
      } else {
        // Open URL for other tasks
        await Linking.openURL(task.url);
      }

      // Only add credits if task wasn't completed before
      if (!task.completed) {
        const newCompletedTasks = [...completedTasks, task.id];
        await AsyncStorage.setItem('completedTasks', JSON.stringify(newCompletedTasks));
        setCompletedTasks(newCompletedTasks);
        await addCredits(task.points);

        Alert.alert(
          'Task Completed!',
          `You've earned ${task.points} credits!`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error handling task:', error);
      Alert.alert(
        'Error',
        'Failed to complete task. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const TaskCard = ({ task }) => (
    <TouchableOpacity 
      style={styles.taskCard}
      onPress={() => handleTaskPress(task)}
    >
      <LinearGradient
        colors={[`${task.color}15`, `${task.color}05`]}
        style={styles.taskGradient}
      >
        <View style={[styles.taskIconContainer, { backgroundColor: `${task.color}20` }]}>
          <Ionicons name={task.icon} size={24} color={task.color} />
        </View>
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
            {!task.completed && (
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>+{task.points}</Text>
              </View>
            )}
          </View>
          <Text style={styles.taskDescription} numberOfLines={1}>{task.description}</Text>
        </View>
        <Ionicons 
          name={task.completed ? "checkmark-circle" : "chevron-forward"}
          size={20} 
          color={task.completed ? "#57D9A3" : task.color}
          style={styles.arrowIcon}
        />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: Math.max(insets.bottom, 20) + 80 } // Add extra padding for bottom nav
      ]}
    >
      {/* Credits Section */}
      <View style={styles.creditsSection}>
        <LinearGradient
          colors={['#825EFF', '#5E17EB']}
          style={styles.creditsGradient}
        >
          <View style={styles.creditsContent}>
            <Text style={styles.creditsTitle}>Available Credits</Text>
            <Text style={styles.creditsCount}>{credits}</Text>
            <TouchableOpacity style={styles.buyCreditsButton}>
              <Text style={styles.buyCreditsText}>Earn More Credits</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Generation Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Generation Status</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Today's Usage</Text>
            <Text style={styles.statusValue}>{dailyUsage}</Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Available Credits</Text>
            <Text style={styles.statusValue}>{credits}</Text>
          </View>
        </View>
      </View>

      {/* Earn Points Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Earn More Points</Text>
        <View style={styles.tasksGrid}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </View>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  contentContainer: {
    padding: 16,
  },
  creditsSection: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  creditsGradient: {
    padding: 24,
  },
  creditsContent: {
    alignItems: 'center',
  },
  creditsTitle: {
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  creditsCount: {
    fontSize: 48,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  buyCreditsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  buyCreditsText: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#AAAAAA',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 24,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
  },
  statusDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tasksGrid: {
    gap: 12,
  },
  taskCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  taskGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
    marginRight: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  taskTitle: {
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    marginRight: 8,
    flex: 1,
  },
  pointsBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    color: '#57D9A3',
  },
  taskDescription: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: '#AAAAAA',
  },
  arrowIcon: {
    marginLeft: 4,
  },
  settingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
    color: '#FFFFFF',
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
});

export default SettingsScreen; 