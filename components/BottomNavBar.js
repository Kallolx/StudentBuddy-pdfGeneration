import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '../context/NavigationContext';

const { width } = Dimensions.get('window');
const NAV_WIDTH = width * 0.85; // 85% of screen width

const CreateModal = ({ visible, onClose, onSelect }) => {
  const [animation] = useState(new Animated.Value(0));
  const { navigateToSubScreen } = useNavigation();

  React.useEffect(() => {
    if (visible) {
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const createOptions = [
    { name: 'Assignment', icon: 'document-text', color: '#825EFF', screen: 'Assignment' },
    { name: 'Lab Report', icon: 'flask', color: '#FF8F5E', screen: 'LabReport' },
    { name: 'Group Report', icon: 'people', color: '#52B6FF', screen: 'GroupReport' },
  ];

  const handleOptionSelect = (screen) => {
    onClose();
    navigateToSubScreen(screen);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} tint="dark" style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                {
                  scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
              opacity: animation,
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(40, 40, 40, 0.95)', 'rgba(30, 30, 30, 0.95)']}
            style={styles.modalGradient}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsContainer}>
              {createOptions.map((option) => (
                <TouchableOpacity
                  key={option.name}
                  style={styles.optionButton}
                  onPress={() => handleOptionSelect(option.screen)}
                >
                  <LinearGradient
                    colors={[`${option.color}20`, `${option.color}10`]}
                    style={styles.optionGradient}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: `${option.color}20` }]}>
                      <Ionicons name={option.icon} size={24} color={option.color} />
                    </View>
                    <Text style={styles.optionText}>{option.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const BottomNavBar = ({ activeScreen, setActiveScreen }) => {
  const insets = useSafeAreaInsets();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { navigateToSubScreen, navigateToScreen } = useNavigation();

  const navigationItems = [
    { name: 'Home', icon: 'home' },
    { name: 'Create', icon: 'add-circle' },
    { name: 'Tools', icon: 'construct' },
    { name: 'Settings', icon: 'settings' },
  ];

  const handleCreatePress = () => {
    setShowCreateModal(true);
  };

  const handleNavigation = (screen) => {
    if (screen === 'Create') {
      handleCreatePress();
    } else {
      setActiveScreen(screen);
      navigateToScreen(screen);
    }
  };

  return (
    <>
      <View style={[styles.outerContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
          <View style={styles.container}>
            {navigationItems.map((item) => {
              const isActive = activeScreen === item.name;
              return (
                <TouchableOpacity
                  key={item.name}
                  style={styles.navItem}
                  onPress={() => handleNavigation(item.name)}
                >
                  <Ionicons
                    name={item.icon}
                    size={isActive ? 28 : 24}
                    color={isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}
                  />
                  {isActive && (
                    <Text style={styles.navText}>
                      {item.name}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>

      <CreateModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSelect={navigateToSubScreen}
      />
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  blurContainer: {
    width: NAV_WIDTH,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.75)',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    position: 'relative',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'DMSans-Medium',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.85,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  modalGradient: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionGradient: {
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
  optionText: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
  },
});

export default BottomNavBar;