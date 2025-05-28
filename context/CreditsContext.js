import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreditsContext = createContext();

export const CreditsProvider = ({ children }) => {
  const [credits, setCredits] = useState(5);
  const [dailyUsage, setDailyUsage] = useState(0);

  // Load credits from storage on app start
  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const storedCredits = await AsyncStorage.getItem('credits');
      const storedDailyUsage = await AsyncStorage.getItem('dailyUsage');
      
      if (storedCredits !== null) {
        setCredits(parseInt(storedCredits));
      } else {
        setCredits(5);
        await AsyncStorage.setItem('credits', '5');
      }

      if (storedDailyUsage !== null) {
        setDailyUsage(parseInt(storedDailyUsage));
      }
    } catch (error) {
      console.error('Error loading credits:', error);
    }
  };

  const useCredit = async () => {
    if (credits > 0) {
      const newCredits = credits - 1;
      const newDailyUsage = dailyUsage + 1;
      
      try {
        await AsyncStorage.setItem('credits', newCredits.toString());
        await AsyncStorage.setItem('dailyUsage', newDailyUsage.toString());
        setCredits(newCredits);
        setDailyUsage(newDailyUsage);
        return true;
      } catch (error) {
        console.error('Error updating credits:', error);
        return false;
      }
    }
    return false;
  };

  const addCredits = async (amount) => {
    try {
      const newCredits = credits + amount;
      await AsyncStorage.setItem('credits', newCredits.toString());
      setCredits(newCredits);
      return true;
    } catch (error) {
      console.error('Error adding credits:', error);
      return false;
    }
  };

  return (
    <CreditsContext.Provider value={{ 
      credits, 
      dailyUsage,
      useCredit,
      addCredits
    }}>
      {children}
    </CreditsContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
}; 