import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CreatePage = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Page</Text>
        <Text style={styles.subtitle}>Start creating your new project</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: 'rgba(40, 40, 40, 0.7)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});

export default CreatePage; 