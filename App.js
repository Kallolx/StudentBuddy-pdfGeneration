import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { CreditsProvider } from './context/CreditsContext';

// Import components
import TopBar from './components/TopBar';
import BottomNavBar from './components/BottomNavBar';
import HomePage from './screens/HomePage';
import CreatePage from './screens/CreatePage';
import ToolsScreen from './screens/ToolsScreen';
import SettingsScreen from './screens/SettingsScreen';
import AssignmentScreen from './screens/AssignmentScreen';
import LabReportScreen from './screens/LabReportScreen';
import GroupReportScreen from './screens/GroupReportScreen';

// Get screen width for animations
const { width } = Dimensions.get('window');

// Keep the splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

const MainApp = () => {
  const { activeScreen, activeSubScreen, navigateToScreen } = useNavigation();
  
  // Animation value for the slide-in effect
  const slideAnim = useRef(new Animated.Value(width)).current;
  
  // Animate when sub-screen changes
  useEffect(() => {
    if (activeSubScreen) {
      // Reset position when a new screen comes in
      slideAnim.setValue(width);
      // Animate to 0
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [activeSubScreen]);

  // Render active screen based on navigation
  const renderMainScreen = () => {
    switch(activeScreen) {
      case 'Home':
        return <HomePage />;
      case 'Create':
        return <CreatePage />;
      case 'Tools':
        return <ToolsScreen />;
      case 'Settings':
        return <SettingsScreen />;
      default:
        return <HomePage />;
    }
  };
  
  // Render sub-screen if active
  const renderSubScreen = () => {
    switch(activeSubScreen) {
      case 'Assignment':
        return <AssignmentScreen />;
      case 'LabReport':
        return <LabReportScreen />;
      case 'GroupReport':
        return <GroupReportScreen />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      {!activeSubScreen && <TopBar username="Kamrul Hasan" credits={10} />}
      
      {/* Main content area */}
      <View style={styles.content}>
        {/* Main screen */}
        {!activeSubScreen && renderMainScreen()}
        
        {/* Sub-screen with animation */}
        {activeSubScreen && (
          <Animated.View 
            style={[
              styles.subScreenContainer,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            {renderSubScreen()}
          </Animated.View>
        )}
      </View>
      
      {/* Only show bottom nav when not in a sub-screen */}
      {!activeSubScreen && <BottomNavBar activeScreen={activeScreen} setActiveScreen={navigateToScreen} />}
    </View>
  );
};

export default function App() {
  // Load DM Sans font
  const [fontsLoaded] = useFonts({
    'DMSans-Regular': require('./assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Medium': require('./assets/fonts/DMSans-Medium.ttf'),
    'DMSans-Bold': require('./assets/fonts/DMSans-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationProvider>
        <CreditsProvider>
          <NavigationContainer>
            <MainApp />
          </NavigationContainer>
        </CreditsProvider>
      </NavigationProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 0, // No padding as TopBar handles its own spacing
  },
  content: {
    flex: 1,
    position: 'relative', // Needed for absolute positioning of sub-screens
  },
  subScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#121212',
    zIndex: 2, // Make sure it renders above main content
  },
});
