import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem
} from '@react-navigation/drawer';
import {
  Avatar,
  Text,
  Divider,
  Surface,
  IconButton,
} from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

function useSessionTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

const MenuTab = ({ label, icon, route, isActive, onPress }: any) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[
        styles.menuTab,
        isActive && styles.menuTabActive
      ]}
    >
      <View style={styles.menuIconContainer}>
        <MaterialCommunityIcons 
          name={icon} 
          size={24} 
          color={isActive ? Theme.colors.primary : '#5F6368'} 
        />
      </View>
      <Text style={[
        styles.menuTabText,
        isActive && styles.menuTabTextActive
      ]}>
        {label}
      </Text>
      {isActive && (
        <View style={styles.activeIndicator} />
      )}
    </TouchableOpacity>
  );
};

export function CustomDrawerContent(props: any) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const sessionTime = useSessionTimer();

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      {/* Premium Header - Handling Top Safe Area */}
      <Surface 
        style={[
          styles.header, 
          { 
            paddingTop: Platform.OS === 'ios' ? insets.top + 8 : insets.top + 16,
            paddingBottom: 24 
          }
        ]} 
        elevation={1}
      >
        <View style={styles.headerTop}>
          <View style={styles.avatarWrapper}>
            <Avatar.Image
              size={70}
              source={{ uri: 'https://i.pravatar.cc/150?u=extraedge' }}
              style={styles.avatar}
            />
            <View style={styles.activeDot} />
          </View>
          
          <TouchableOpacity 
            style={styles.notificationBtn}
            onPress={() => Haptics.selectionAsync()}
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color="#5F6368" />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.userName}>Sayan Mondal</Text>
          <Text style={styles.userRole}>Admission Manager</Text>
        </View>

        <Surface style={styles.timerPill} elevation={0}>
          <View style={styles.timerContent}>
            <View style={styles.pulseContainer}>
              <View style={styles.pulsePoint} />
            </View>
            <Text style={styles.timerLabel}>ACTIVE SESSION</Text>
          </View>
          <Text style={styles.timerValue}>{sessionTime}</Text>
        </Surface>
      </Surface>

      <DrawerContentScrollView 
        {...props} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        // Removing default insets to handle them manually for a tighter design
        paddingTop={0}
      >
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>MENU</Text>
          <MenuTab 
            label="Settings" 
            icon="cog-outline" 
            isActive={pathname === '/account-settings'} 
            onPress={() => router.push('/account-settings' as any)}
          />
          <MenuTab 
            label="Troubleshoot" 
            icon="wrench-outline" 
            isActive={pathname === '/help-troubleshoot'} 
            onPress={() => router.push('/help-troubleshoot' as any)}
          />
          <MenuTab 
            label="Sync Data" 
            icon="sync" 
            isActive={false} 
            onPress={() => {}}
          />
          <MenuTab 
            label="Self Test" 
            icon="shield-check-outline" 
            isActive={false} 
            onPress={() => {}}
          />
        </View>
      </DrawerContentScrollView>

      {/* Footer Section - Handling Bottom Safe Area */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}>
        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={handleLogout}
        >
          <LinearGradientCover />
          <MaterialCommunityIcons name="power" size={22} color="#FFF" />
          <Text style={styles.logoutText}>Logout Session</Text>
        </TouchableOpacity>
        
        <View style={styles.versionInfo}>
          <Text style={styles.versionLabel}>EXTRAAEDGE CRM</Text>
          <Text style={styles.versionValue}>v1.0.32 Build 482</Text>
        </View>
      </View>
    </View>
  );
}

// Fallback for Gradient since library might not be available
const LinearGradientCover = () => (
  <View style={[StyleSheet.absoluteFill, { backgroundColor: Theme.colors.primary, borderRadius: 14 }]} />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: '#F1F3F4',
    borderWidth: 3,
    borderColor: '#F8F9FA',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F3F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.primary,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  profileInfo: {
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#202124',
    letterSpacing: -0.5,
  },
  userRole: {
    fontSize: 14,
    color: '#5F6368',
    fontWeight: '500',
    marginTop: 2,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  timerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseContainer: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  pulsePoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#80868B',
    letterSpacing: 0.8,
  },
  timerValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#202124',
    fontVariant: ['tabular-nums'],
  },
  scrollContent: {
    paddingTop: 24,
  },
  sectionContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9AA0A6',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 12,
  },
  menuTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  menuTabActive: {
    backgroundColor: '#FEECEB',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C4043',
    marginLeft: 8,
    flex: 1,
  },
  menuTabTextActive: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  activeIndicator: {
    width: 4,
    height: 20,
    backgroundColor: Theme.colors.primary,
    borderRadius: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#F8F9FA',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  versionInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  versionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#BDC1C6',
    letterSpacing: 1.5,
  },
  versionValue: {
    fontSize: 11,
    color: '#BDC1C6',
    marginTop: 2,
    fontWeight: '500',
  },
});
