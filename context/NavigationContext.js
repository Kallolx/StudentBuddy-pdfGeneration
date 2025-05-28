import React, { createContext, useState, useContext } from 'react';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const [activeScreen, setActiveScreen] = useState('Home');
  const [activeSubScreen, setActiveSubScreen] = useState(null);
  const [screenHistory, setScreenHistory] = useState([]);

  // Navigate to a main screen
  const navigateToScreen = (screenName) => {
    // If we're navigating to a main screen, clear the sub-screen
    setActiveSubScreen(null);
    setActiveScreen(screenName);
    setScreenHistory([]);
  };
  
  // Navigate to a sub-screen
  const navigateToSubScreen = (subScreenName) => {
    setScreenHistory([...screenHistory, { main: activeScreen, sub: activeSubScreen }]);
    setActiveSubScreen(subScreenName);
  };
  
  // Go back to previous screen
  const goBack = () => {
    if (screenHistory.length > 0) {
      const prevScreen = screenHistory[screenHistory.length - 1];
      setActiveScreen(prevScreen.main);
      setActiveSubScreen(prevScreen.sub);
      setScreenHistory(screenHistory.slice(0, -1));
      return true; // Navigation handled
    }
    
    // If on a sub-screen with no history, go back to main screen
    if (activeSubScreen) {
      setActiveSubScreen(null);
      return true; // Navigation handled
    }
    
    return false; // No back navigation handled
  };

  return (
    <NavigationContext.Provider 
      value={{ 
        activeScreen, 
        activeSubScreen,
        navigateToScreen,
        navigateToSubScreen,
        goBack,
        screenHistory
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export default NavigationContext; 