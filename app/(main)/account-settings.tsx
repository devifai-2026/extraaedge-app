import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { Avatar, Divider, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToggleKey =
  | 'clickToCall'
  | 'missCall'
  | 'smartCaller'
  | 'smartCallerPopup'
  | 'callRecordingBelow6'
  | 'callRecordingAbove6'
  | 'ivrOnlineOffline';

type NotificationTime = 5 | 10 | 15 | 20;

interface ToggleSetting {
  key: ToggleKey;
  label: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const TOGGLE_SETTINGS: ToggleSetting[] = [
  { key: 'clickToCall', label: 'Click to Call Enable' },
  { key: 'missCall', label: 'Enable Miss Call' },
  { key: 'smartCaller', label: 'Enable Smart Caller' },
  { key: 'smartCallerPopup', label: 'Enable Smart Caller Pop Up' },
  { key: 'callRecordingBelow6', label: 'Enable Call Recording (For Android Version Below 6.0)' },
  { key: 'callRecordingAbove6', label: 'Enable Call Recording (For Android Version 6.0 and Above)' },
  { key: 'ivrOnlineOffline', label: 'Enable Online / Offline Feature of IVR' },
];

const NOTIFICATION_TIMES: NotificationTime[] = [5, 10, 15, 20];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AccountSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Toggle states
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    clickToCall: true,
    missCall: false,
    smartCaller: true,
    smartCallerPopup: true,
    callRecordingBelow6: false,
    callRecordingAbove6: false,
    ivrOnlineOffline: true,
  });

  // Notification time selection
  const [notificationTime, setNotificationTime] = useState<NotificationTime>(10);

  // Modal states
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [tooltipModalVisible, setTooltipModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleToggle = (key: ToggleKey) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogoutConfirm = () => {
    setLogoutModalVisible(false);
    router.replace('/login' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── Top Navigation Bar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navIconBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Account Settings</Text>
        <TouchableOpacity style={styles.navIconBtn} onPress={() => router.push('/help-troubleshoot' as any)} activeOpacity={0.7}>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Section 1: Company Brand Header ── */}
        <View style={styles.brandCard}>
          <View style={styles.brandLogoContainer}>
            <View style={styles.brandLogoBox}>
              <MaterialCommunityIcons name="lightning-bolt" size={28} color={Theme.colors.primary} />
            </View>
            <Text style={styles.brandName}>Speed Up</Text>
          </View>
          <Text style={styles.brandSubtitle}>Education Admissions CRM</Text>
        </View>

        <Divider style={styles.sectionDivider} />

        {/* ── Section 2: User Profile Card ── */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatarWrapper}>
              <Avatar.Image
                size={64}
                source={{ uri: 'https://i.pravatar.cc/150?u=divyanair' }}
                style={styles.avatar}
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Divya Nair</Text>
              <View style={styles.profileDetailRow}>
                <MaterialCommunityIcons name="email-outline" size={13} color={Theme.colors.text.secondary} />
                <Text style={styles.profileDetailText}>divya.nair@speedup.in</Text>
              </View>
              <View style={styles.profileDetailRow}>
                <MaterialCommunityIcons name="identifier" size={13} color={Theme.colors.text.secondary} />
                <Text style={styles.profileDetailText}>UID: EE-20483</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Section 3: Settings Toggles ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Settings</Text>
        </View>

        <View style={styles.card}>
          {TOGGLE_SETTINGS.map((setting, index) => (
            <View key={setting.key}>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>{setting.label}</Text>
                <Switch
                  value={toggles[setting.key]}
                  onValueChange={() => handleToggle(setting.key)}
                  trackColor={{ false: '#D1D5DB', true: '#FECACA' }}
                  thumbColor={toggles[setting.key] ? Theme.colors.primary : '#9CA3AF'}
                  ios_backgroundColor="#D1D5DB"
                />
              </View>
              {index < TOGGLE_SETTINGS.length - 1 && (
                <Divider style={styles.itemDivider} />
              )}
            </View>
          ))}
        </View>

        {/* ── Section 4: Follow-Up Notification Time ── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Follow-Up Notification Time (Minutes)</Text>
            <TouchableOpacity onPress={() => setTooltipModalVisible(true)} activeOpacity={0.7} style={styles.infoBtn}>
              <MaterialCommunityIcons name="information-outline" size={18} color={Theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          {NOTIFICATION_TIMES.map((time, index) => (
            <View key={time}>
              <TouchableOpacity
                style={styles.radioRow}
                onPress={() => setNotificationTime(time)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.radioOuter,
                  notificationTime === time && styles.radioOuterSelected,
                ]}>
                  {notificationTime === time && <View style={styles.radioInner} />}
                </View>
                <Text style={[
                  styles.radioLabel,
                  notificationTime === time && styles.radioLabelSelected,
                ]}>
                  {time} Minutes
                </Text>
              </TouchableOpacity>
              {index < NOTIFICATION_TIMES.length - 1 && (
                <Divider style={styles.itemDivider} />
              )}
            </View>
          ))}
        </View>

        {/* ── Section 5: Account Actions ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setLogoutModalVisible(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="logout" size={18} color={Theme.colors.primary} />
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetPasswordBtn}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="lock-reset" size={18} color="#FFF" />
            <Text style={styles.resetPasswordBtnText}>Reset Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Help Modal ── */}
      <Modal
        visible={helpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setHelpModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="help-circle" size={24} color={Theme.colors.primary} />
              <Text style={styles.modalTitle}>Help & Support</Text>
              <TouchableOpacity onPress={() => setHelpModalVisible(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Divider style={styles.modalDivider} />
            <Text style={styles.modalBody}>
              Need help with Account Settings? Contact your CRM administrator or reach out to ExtraaEdge support for assistance with call settings, notifications, and account configuration.
            </Text>
            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setHelpModalVisible(false)} activeOpacity={0.8}>
              <Text style={styles.modalPrimaryBtnText}>Got It</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Tooltip Modal ── */}
      <Modal
        visible={tooltipModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTooltipModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setTooltipModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="information" size={24} color={Theme.colors.primary} />
              <Text style={styles.modalTitle}>Notification Time</Text>
              <TouchableOpacity onPress={() => setTooltipModalVisible(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Divider style={styles.modalDivider} />
            <Text style={styles.modalBody}>
              Select how early you want to receive follow-up reminders before scheduled activity time.
            </Text>
            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setTooltipModalVisible(false)} activeOpacity={0.8}>
              <Text style={styles.modalPrimaryBtnText}>Got It</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Log Out Confirmation Modal ── */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLogoutModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="logout" size={24} color={Theme.colors.primary} />
              <Text style={styles.modalTitle}>Log Out</Text>
            </View>
            <Divider style={styles.modalDivider} />
            <Text style={styles.modalBody}>
              Are you sure you want to log out of your ExtraaEdge CRM session?
            </Text>
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setLogoutModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleLogoutConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmBtnText}>Confirm Log Out</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Navbar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  navIconBtn: {
    padding: 8,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    textAlign: 'left',
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.2,
    marginLeft: 4,
  },

  // Scroll
  scroll: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 0,
  },

  // Dividers
  sectionDivider: {
    marginVertical: 16,
    backgroundColor: '#E5E7EB',
    height: 1,
  },
  itemDivider: {
    backgroundColor: '#F3F4F6',
    height: 1,
  },

  // Brand card
  brandCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  brandLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogoBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFF1F1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    marginTop: 4,
    marginLeft: 54,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Profile card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 14,
  },
  avatarWrapper: {
    borderRadius: 36,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    padding: 2,
  },
  avatar: {
    backgroundColor: '#EEEEEE',
  },
  profileInfo: {
    flex: 1,
    gap: 5,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.3,
  },
  profileDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  profileDetailText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    flexShrink: 1,
  },

  // Section headers
  sectionHeader: {
    marginBottom: 8,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  infoBtn: {
    padding: 2,
  },

  // Toggle rows
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 12,
  },
  toggleLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 20,
  },

  // Radio rows
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Theme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.primary,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  radioLabelSelected: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },

  // Action buttons
  actionsContainer: {
    gap: 12,
    marginBottom: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
    backgroundColor: '#FFF5F5',
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  resetPasswordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  resetPasswordBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: { elevation: 10 },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.3,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalDivider: {
    backgroundColor: '#F3F4F6',
    height: 1,
    marginBottom: 16,
  },
  modalBody: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    fontWeight: '400',
    marginBottom: 20,
  },
  modalPrimaryBtn: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  modalCancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  modalConfirmBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
  },
  modalConfirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
