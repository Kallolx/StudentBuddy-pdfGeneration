import React from 'react';
import { View, Text, Image, StyleSheet, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useCredits } from '../context/CreditsContext';

const TopBar = ({ username }) => {
  const { credits } = useCredits();
  const insets = useSafeAreaInsets();
  
  return (
    <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
      <LinearGradient
        colors={['rgba(40, 40, 40, 0.8)', 'rgba(30, 30, 30, 0.6)']}
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0) }
        ]}
      >
        <View style={styles.userContainer}>
          <View style={styles.imageContainer}>
            <LinearGradient
              colors={['#825EFF', '#5E17EB']}
              style={styles.imageGradient}
            >
              <Image
                source={{ uri: 'https://scontent.fdac138-2.fna.fbcdn.net/v/t39.30808-6/487457359_1146042150598533_1044304439597145452_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHu5us41iJ8ZJqdNwRW31ApuUttAH6UGWa5S20AfpQZZtk9ABKmPkRqmMjdtQe-PB92AmZNLcxCjM3eqUoDPK-d&_nc_ohc=lkYPRHz6r54Q7kNvwHqr2ki&_nc_oc=Adkq6msnT-a4F0qpcNRsgFSvwemSD3gBnW0zfWrDe6B4gLPKnWYuAjPDdNnPvBn2ooA&_nc_zt=23&_nc_ht=scontent.fdac138-2.fna&_nc_gid=wjMpf1jZ882cFLaUm67YrQ&oh=00_AfLfcBSXWUbxuwM9nOjIBWBw50xO4ZFtJPoXRyQJpPTBrg&oe=68294F99' }}
                style={styles.userImage}
              />
            </LinearGradient>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.username}>{username}</Text>
          </View>
        </View>
        <View style={styles.creditsContainer}>
          <LinearGradient
            colors={['rgba(130, 94, 255, 0.2)', 'rgba(94, 23, 235, 0.2)']}
            style={styles.creditsGradient}
          >
            <Ionicons name="diamond" size={16} color="#825EFF" style={styles.creditsIcon} />
            <Text style={styles.creditsText}>{credits}</Text>
          </LinearGradient>
        </View>
      </LinearGradient>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  imageGradient: {
    width: '100%',
    height: '100%',
    padding: 2,
  },
  userImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  userInfo: {
    marginLeft: 12,
  },
  welcomeText: {
    color: '#AAAAAA',
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    marginBottom: 2,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
  },
  creditsContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  creditsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  creditsIcon: {
    marginRight: 6,
  },
  creditsText: {
    color: '#FFFFFF',
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
  },
});

export default TopBar; 