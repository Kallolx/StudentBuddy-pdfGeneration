import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Linking, ScrollView, FlatList } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationProvider, useNavigation } from '../context/NavigationContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height, width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3; // 48 = padding (16) * 2 + gap (16)

const HomePage = () => {
  const insets = useSafeAreaInsets();
  const { navigateToSubScreen } = useNavigation();

  // Feature highlights data
  const appFeatures = [
    {
      id: 1,
      title: 'AI Writing Assistant',
      description: 'Get help with grammar, structure, and creativity',
      icon: 'sparkles',
      color: '#825EFF'
    },
    {
      id: 2,
      title: 'Plagiarism Checker',
      description: 'Ensure your work is original and properly cited',
      icon: 'shield-checkmark',
      color: '#FF8F5E'
    },
    {
      id: 3,
      title: 'Citation Generator',
      description: 'Automatically format citations in any style',
      icon: 'list',
      color: '#52B6FF'
    }
  ];

  // Team members data
  const teamMembers = [
    {
      id: 1,
      name: 'Kamrul Hasan',
      role: 'Lead Developer',
      image: 'https://scontent.fdac138-2.fna.fbcdn.net/v/t39.30808-6/487457359_1146042150598533_1044304439597145452_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHu5us41iJ8ZJqdNwRW31ApuUttAH6UGWa5S20AfpQZZtk9ABKmPkRqmMjdtQe-PB92AmZNLcxCjM3eqUoDPK-d&_nc_ohc=lkYPRHz6r54Q7kNvwHqr2ki&_nc_oc=Adkq6msnT-a4F0qpcNRsgFSvwemSD3gBnW0zfWrDe6B4gLPKnWYuAjPDdNnPvBn2ooA&_nc_zt=23&_nc_ht=scontent.fdac138-2.fna&_nc_gid=wjMpf1jZ882cFLaUm67YrQ&oh=00_AfLfcBSXWUbxuwM9nOjIBWBw50xO4ZFtJPoXRyQJpPTBrg&oe=68294F99',
    },
    {
      id: 2,
      name: 'Tanjila Binta',
      role: 'UI/UX Designer',
      image: 'https://scontent.fdac138-1.fna.fbcdn.net/v/t39.30808-6/480598895_1716728019249182_5838133428681242973_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeH04ItlP8f4hUV-3xPM4-yGYzCCJMHqfl9jMIIkwep-X14M68z1H0sSQY5TWjQ-KZ8RyIuSEJG5vYfUHZAwxRLy&_nc_ohc=p3WpN3Cg8ukQ7kNvwGp0Lap&_nc_oc=Adn2dCVx2z-h2bosMCNMr80kFE4_yk4ZwM7r_CwirRYeHV5ISeuqtWa-NUEgVUkJzJY&_nc_zt=23&_nc_ht=scontent.fdac138-1.fna&_nc_gid=Aj_SNnasxqbfv1X3F0CXPA&oh=00_AfKrqwk2XuZku960Tq25Fd6b5eDOVgOi2JMEzWb8fO-aTQ&oe=682963AD',
    },
    {
      id: 3,
      name: 'Nurjahan Mithila',
      role: 'Project Manager',
      image: 'https://scontent.fdac138-2.fna.fbcdn.net/v/t39.30808-6/493991500_1008832278022147_3218576671632359799_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeERcZdXcPM7u8RO2KFBr6Kncvze1RSJ2YZy_N7VFInZhisiSVRwOlqh8jYciQxcBnEbJtg1deWfq-tBvidcXPJu&_nc_ohc=hsuFPrBZ9_oQ7kNvwHq38fR&_nc_oc=AdngyAaObi2nL2yH01DMewB_HL58PngcR329hE-yVjb2aCBs53j5LFSXxz8vd514rBM&_nc_zt=23&_nc_ht=scontent.fdac138-2.fna&_nc_gid=zDGm9vQzd55ci-mBxfBZyw&oh=00_AfLf0BkyvOs2VUKMXdTT9V2sKYJe6feCzWkmr-DG_hbB2Q&oe=68295CD0',
    },
    {
      id: 4,
      name: 'Habiba Sultana',
      role: 'Team Members',
      image: 'https://scontent.fdac138-2.fna.fbcdn.net/v/t1.6435-1/195520334_1113783672785130_6531036685796121674_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=102&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeGai-cwfPed014YoQgHFeRBIJei1v27bfggl6LW_btt-H3z9czSJbWohrh3VPsbdMC9GVk8Y11NQTIOmqP3GAol&_nc_ohc=mYk44NrXrBcQ7kNvwEes9or&_nc_oc=AdmcXHQAWVqL1qMULYXO5IV3Z62syayO-y9Wwo18iPiAV2MzN9Jar1ubYhHqpqJNecI&_nc_zt=24&_nc_ht=scontent.fdac138-2.fna&_nc_gid=3RBkDZXx0knOUQi1JmFQjQ&oh=00_AfLzA8-dm8VMkiIK244xvxNtw6LuWlH7raVofcx5LjZe-A&oe=685DC0BC',
    },

  ];

  const renderTeamCard = ({ item }) => (
    <TouchableOpacity style={[styles.teamCard, { width: CARD_WIDTH }]}>
      <LinearGradient
        colors={['rgba(130, 94, 255, 0.1)', 'rgba(130, 94, 255, 0.02)']}
        style={styles.teamCardGradient}
      >
        <View style={styles.teamImageOuter}>
          <View style={styles.teamImageContainer}>
            <Image 
              source={{ uri: item.image }} 
              style={styles.teamImage} 
            />
          </View>
        </View>
        <Text style={styles.teamName}>{item.name}</Text>
        <Text style={styles.teamRole}>{item.role}</Text>
        <View style={styles.teamSocialIcons}>
          <TouchableOpacity style={styles.socialIcon}>
            <Ionicons name="logo-linkedin" size={16} color="#AAAAAA" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon}>
            <Ionicons name="mail-outline" size={16} color="#AAAAAA" />
          </TouchableOpacity>
        </View>
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
      {/* Banner Section with bottom text and button */}
      <View style={styles.bannerContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1579547945413-497e1b99dac0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
          style={styles.bannerImage}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
          style={styles.bannerOverlay}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Academic Excellence</Text>
            </View>
            <TouchableOpacity style={styles.bannerButton}>
              <LinearGradient
                colors={['#825EFF', '#5E17EB']}
                style={styles.bannerButtonGradient}
              >
                <Text style={styles.bannerButtonText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={styles.bannerButtonIcon} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Tools Section */}
      <View style={styles.toolsContainer}>
        {/* First row of tools */}
        <View style={styles.toolsRow}>
          {/* Assignment Card */}
          <TouchableOpacity 
            style={styles.toolCard}
            onPress={() => navigateToSubScreen('Assignment')}
          >
            <BlurView intensity={30} tint="dark" style={styles.toolCardInner}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(130, 94, 255, 0.2)' }]}>
                <Ionicons name="document-text" size={28} color="#825EFF" />
              </View>
              <Text style={styles.toolTitle}>Assignment</Text>
            </BlurView>
          </TouchableOpacity>

          {/* Lab Report Card */}
          <TouchableOpacity 
            style={styles.toolCard}
            onPress={() => navigateToSubScreen('LabReport')}
          >
            <BlurView intensity={30} tint="dark" style={styles.toolCardInner}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 143, 94, 0.2)' }]}>
                <Ionicons name="flask" size={28} color="#FF8F5E" />
              </View>
              <Text style={styles.toolTitle}>Lab Report</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Second row of tools */}
        <View style={styles.toolsRow}>
          {/* Group Report Card */}
          <TouchableOpacity 
            style={styles.toolCard}
            onPress={() => navigateToSubScreen('GroupReport')}
          >
            <BlurView intensity={30} tint="dark" style={styles.toolCardInner}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(82, 182, 255, 0.2)' }]}>
                <Ionicons name="people" size={28} color="#52B6FF" />
              </View>
              <Text style={styles.toolTitle}>Group Report</Text>
            </BlurView>
          </TouchableOpacity>

          {/* Coming Soon Card */}
          <TouchableOpacity style={styles.toolCard}>
            <BlurView intensity={30} tint="dark" style={styles.toolCardInner}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <Ionicons name="time-outline" size={28} color="#AAAAAA" />
              </View>
              <Text style={[styles.toolTitle, { color: '#AAAAAA' }]}>More Soon...</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>


      
      {/* Team Members Section */}
      <View style={styles.teamContainer}>
        <Text style={styles.sectionTitle}>Our Team</Text>
        <FlatList
          data={teamMembers}
          renderItem={renderTeamCard}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.teamList}
          snapToInterval={CARD_WIDTH + 16} // 16 is the gap between cards
          decelerationRate="fast"
          snapToAlignment="start"
        />
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
  // Banner styles
  bannerContainer: {
    height: height * 0.28,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    marginTop: 0,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bannerContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTextContainer: {
    flex: 1,
    paddingRight: 20,
  },
  bannerTitle: {
    fontSize: 22,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bannerButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    marginRight: 6,
  },
  bannerButtonIcon: {
    marginLeft: 2,
  },
  // Section titles
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    marginBottom: 12,
    marginLeft: 5,
  },
  // Tools section
  toolsContainer: {
    marginBottom: 20,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  toolCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  toolCardInner: {
    padding: 16,
    height: height * 0.15,
    backgroundColor: 'rgba(40, 40, 40, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  toolTitle: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // App Features Section
  featuresContainer: {
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(40, 40, 40, 0.5)',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: '#BBBBBB',
  },
  // Team Members Section
  teamContainer: {
    marginBottom: 20,
  },
  teamList: {
    paddingRight: 16, // Add padding to show the last card properly
  },
  teamCard: {
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  teamCardGradient: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  teamImageOuter: {
    padding: 3,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(130, 94, 255, 0.3)',
    marginBottom: 10,
  },
  teamImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  teamImage: {
    width: '100%',
    height: '100%',
  },
  teamName: {
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
    textAlign: 'center',
  },
  teamRole: {
    fontSize: 11,
    fontFamily: 'DMSans-Regular',
    color: '#AAAAAA',
    marginBottom: 8,
    textAlign: 'center',
  },
  teamSocialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
});

export default HomePage; 