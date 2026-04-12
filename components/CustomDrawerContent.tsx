import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem
} from '@react-navigation/drawer';
import {
  Avatar,
  Text,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export function CustomDrawerContent(props: any) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sessionTime = useSessionTimer();

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        {/* Session Timer Banner */}
        <View style={styles.timerBanner}>
          <MaterialCommunityIcons name="timer-outline" size={16} color={Theme.colors.primary} />
          <Text style={styles.timerLabel}>Session</Text>
          <Text style={styles.timerText}>{sessionTime}</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarBorder}>
            <Avatar.Image
              size={64}
              source={{ uri: 'https://i.pravatar.cc/150?u=extraedge' }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Sayan Mondal</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Admission Manager</Text>
            </View>
          </View>
        </View>
        <View style={styles.emailContainer}>
            <MaterialCommunityIcons name="email-outline" size={16} color={Theme.colors.primary} />
            <Text style={styles.userEmail}>sayan@extraedge.com</Text>
        </View>
      </View>
      
      <Divider style={styles.headerDivider} />

      {/* Main Menu - Sharp & Visible */}
      <DrawerContentScrollView 
        {...props} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuGroup}>
            <DrawerItem
            label="Settings"
            icon={({ focused, color, size }) => (
                <MaterialCommunityIcons 
                    name={focused ? "cog" : "cog-outline"} 
                    size={22}
                    color={focused ? Theme.colors.primary : "#333333"} 
                />
            )}
            onPress={() => router.push('/account-settings' as any)}
            activeTintColor={Theme.colors.primary}
            activeBackgroundColor="#FEECEB"
            labelStyle={styles.menuLabel}
            style={styles.drawerItem}
            />
            <DrawerItem
            label="Troubleshoot"
            icon={({ focused, color, size }) => (
                <MaterialCommunityIcons
                    name={focused ? "wrench" : "wrench-outline"}
                    size={22}
                    color={focused ? Theme.colors.primary : "#333333"}
                />
            )}
            onPress={() => router.push('/help-troubleshoot' as any)}
            activeTintColor={Theme.colors.primary}
            activeBackgroundColor="#FEECEB"
            labelStyle={styles.menuLabel}
            style={styles.drawerItem}
            />
            <DrawerItem
            label="Sync Data"
            icon={({ focused, color, size }) => (
                <MaterialCommunityIcons 
                    name={"sync"} 
                    size={22}
                    color={focused ? Theme.colors.primary : "#333333"} 
                />
            )}
            onPress={() => {}}
            activeTintColor={Theme.colors.primary}
            activeBackgroundColor="#FEECEB"
            labelStyle={styles.menuLabel}
            style={styles.drawerItem}
            />
            <DrawerItem
            label="Self Test"
            icon={({ focused, color, size }) => (
                <MaterialCommunityIcons 
                    name={focused ? "check-decagram" : "check-decagram-outline"} 
                    size={22}
                    color={focused ? Theme.colors.primary : "#333333"} 
                />
            )}
            onPress={() => {}}
            activeTintColor={Theme.colors.primary}
            activeBackgroundColor="#FEECEB"
            labelStyle={styles.menuLabel}
            style={styles.drawerItem}
            />
        </View>
      </DrawerContentScrollView>

      {/* Fixed Bottom Section */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 20 }]}>
        <Divider style={styles.footerDivider} />
        <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={() => router.replace('/login')}
            activeOpacity={0.8}
        >
            <MaterialCommunityIcons name="logout" size={24} color={Theme.colors.primary} />
            <Text style={styles.logoutText}>Logout Session</Text>
        </TouchableOpacity>
        
        <View style={styles.footerInfo}>
          <Text style={styles.versionText}>EXTRAAEDGE CRM v1.0.32</Text>
          <Text style={styles.copyrightText}>© 2026 Education Admissions CRM</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  timerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFDADA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 18,
    gap: 6,
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  timerText: {
    fontSize: 15,
    fontWeight: '800',
    color: Theme.colors.primary,
    letterSpacing: 1.5,
    fontVariant: ['tabular-nums'],
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBorder: {
    padding: 2,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  avatar: {
    backgroundColor: '#EEEEEE',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000000', // Pure black for max sharpness
    letterSpacing: -0.5,
  },
  roleBadge: {
    backgroundColor: '#E5393520', // Very light red tint
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  roleText: {
    fontSize: 12,
    color: Theme.colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  userEmail: {
    fontSize: 14,
    color: '#495057',
    marginLeft: 10,
    fontWeight: '600',
  },
  headerDivider: {
    height: 1.5,
    backgroundColor: '#F1F3F5',
  },
  scrollContent: {
    paddingTop: 16,
  },
  menuGroup: {
    paddingHorizontal: 12,
  },
  drawerItem: {
    borderRadius: 10,
    marginVertical: 2,
    paddingVertical: 0,
    height: 44,
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212529',
    marginLeft: -20,
  },
  bottomSection: {
    paddingHorizontal: 24,
  },
  footerDivider: {
    marginBottom: 20,
    backgroundColor: '#F1F3F5',
    height: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFDADA',
  },
  logoutText: {
    marginLeft: 14,
    fontSize: 17,
    fontWeight: '800',
    color: Theme.colors.primary,
  },
  footerInfo: {
    marginTop: 24,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#ADB5BD',
    fontWeight: '700',
    letterSpacing: 1,
  },
  copyrightText: {
    fontSize: 10,
    color: '#CED4DA',
    marginTop: 6,
    fontWeight: '500',
  },
});
