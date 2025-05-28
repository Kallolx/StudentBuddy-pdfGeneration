import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCredits } from '../context/CreditsContext';

const FormSection = ({ 
  formData, 
  handleChange, 
  selectedTemplate, 
  setSelectedTemplate,
  generateCover,
  generatingCover
}) => {
  const { credits, dailyUsage, MAX_DAILY_CREDITS } = useCredits();
  const [activeTab, setActiveTab] = useState('course');

  // ... rest of your code ...

  return (
    <View style={styles.formContainer}>
      {/* ... rest of your JSX ... */}
      
      {/* Usage counter as text */}
      <Text style={styles.usageText}>
        Today's usage: <Text style={styles.usageCount}>{dailyUsage}/{MAX_DAILY_CREDITS}</Text>
        {dailyUsage >= MAX_DAILY_CREDITS && ' (Limit reached)'}
      </Text>

      {/* Generate button */}
      <TouchableOpacity
        style={[
          styles.generateButton, 
          (dailyUsage >= MAX_DAILY_CREDITS || generatingCover) && styles.generateButtonDisabled
        ]}
        onPress={generateCover}
        disabled={dailyUsage >= MAX_DAILY_CREDITS || generatingCover}
      >
        <View style={styles.generateButtonGradient}>
          <Text style={styles.generateButtonText}>
            {generatingCover ? 'Generating...' : 'Generate Cover Page'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}; 