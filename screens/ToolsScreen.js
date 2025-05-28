import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '../context/NavigationContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const ToolsScreen = () => {
  const insets = useSafeAreaInsets();
  const { navigateToSubScreen } = useNavigation();

  const activeTools = [
    {
      id: 1,
      name: 'Assignment',
      description: 'Create and manage assignments',
      icon: 'document-text',
      color: '#825EFF',
      status: 'active',
      screen: 'Assignment'
    },
    {
      id: 2,
      name: 'Lab Report',
      description: 'Generate lab reports',
      icon: 'flask',
      color: '#FF8F5E',
      status: 'active',
      screen: 'LabReport'
    },
    {
      id: 3,
      name: 'Group Report',
      description: 'Collaborate on group reports',
      icon: 'people',
      color: '#52B6FF',
      status: 'active',
      screen: 'GroupReport'
    }
  ];

  const upcomingTools = [
    {
      id: 4,
      name: 'AI Writing Assistant',
      description: 'Get help with writing and structure',
      icon: 'sparkles',
      color: '#825EFF',
      status: 'coming-soon'
    },
    {
      id: 5,
      name: 'Reference Manager',
      description: 'Organize and manage your references',
      icon: 'library',
      color: '#FF5E8F',
      status: 'coming-soon'
    },
    {
      id: 6,
      name: 'Research Assistant',
      description: 'Find and analyze research papers',
      icon: 'search',
      color: '#5E8FFF',
      status: 'coming-soon'
    },
    {
      id: 7,
      name: 'Format Converter',
      description: 'Convert between different formats',
      icon: 'swap-horizontal',
      color: '#FFB35E',
      status: 'coming-soon'
    }
  ];

  const ToolCard = ({ tool }) => {
    const isActive = tool.status === 'active';
    
    const handlePress = () => {
      if (isActive && tool.screen) {
        navigateToSubScreen(tool.screen);
      }
    };
    
    return (
      <TouchableOpacity 
        style={styles.toolCard}
        onPress={handlePress}
        disabled={!isActive}
      >
        <LinearGradient
          colors={[`${tool.color}15`, `${tool.color}05`]}
          style={styles.toolGradient}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${tool.color}20` }]}>
            <Ionicons name={tool.icon} size={24} color={tool.color} />
          </View>
          <View style={styles.toolContent}>
            <View style={styles.toolHeader}>
              <Text style={styles.toolName}>{tool.name}</Text>
              {!isActive && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Soon</Text>
                </View>
              )}
            </View>
            <Text style={styles.toolDescription}>{tool.description}</Text>
          </View>
          <Ionicons 
            name={isActive ? "chevron-forward" : "time-outline"} 
            size={20} 
            color={isActive ? tool.color : "#AAAAAA"} 
            style={styles.arrowIcon}
          />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: Math.max(insets.bottom, 20) + 80 } // Add extra padding for bottom nav
      ]}
    >
      {/* Active Tools Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Tools</Text>
        <View style={styles.toolsGrid}>
          {activeTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </View>
      </View>

      {/* Coming Soon Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coming Soon</Text>
        <View style={styles.toolsGrid}>
          {upcomingTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  toolsGrid: {
    gap: 12,
  },
  toolCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  toolGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  toolContent: {
    flex: 1,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  toolName: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    color: '#AAAAAA',
  },
  toolDescription: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#AAAAAA',
  },
  arrowIcon: {
    marginLeft: 8,
  },
});

export default ToolsScreen; 