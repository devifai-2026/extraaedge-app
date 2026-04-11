import { Theme } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Divider, Text } from 'react-native-paper';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.64;
const DISMISS_THRESHOLD = 80;
const DISMISS_VELOCITY = 600;

export interface LeadItem {
  id: string;
  name: string;
  mobile: string;
  date: string;
  visited: number;
  followup: string;
  source: string;
  leadAge?: string;
  program?: string;
}

interface LeadActionDrawerProps {
  visible: boolean;
  lead: LeadItem | null;
  onDismiss: () => void;
  onAction?: (action: string, lead: LeadItem) => void;
}

const ACTIONS: { key: string; label: string; icon: string; color?: string; bgColor?: string }[] = [
  {
    key: 'edit',
    label: 'Edit Details',
    icon: 'pencil-outline',
    color: Theme.colors.primary,
    bgColor: 'rgba(229,57,53,0.08)',
  },
  {
    key: 'stage',
    label: 'Update Stage',
    icon: 'flag-variant-outline',
    color: Theme.colors.primary,
    bgColor: 'rgba(229,57,53,0.08)',
  },
  {
    key: 'refer',
    label: 'Refer Lead',
    icon: 'account-arrow-right-outline',
    color: Theme.colors.primary,
    bgColor: 'rgba(229,57,53,0.08)',
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp Message',
    icon: 'whatsapp',
    color: '#25D366',
    bgColor: 'rgba(37,211,102,0.1)',
  },
  {
    key: 'followup',
    label: 'Follow Up',
    icon: 'calendar-clock-outline',
    color: Theme.colors.primary,
    bgColor: 'rgba(229,57,53,0.08)',
  },
  {
    key: 'note',
    label: 'Add Note',
    icon: 'note-text-outline',
    color: Theme.colors.primary,
    bgColor: 'rgba(229,57,53,0.08)',
  },
];

export default function LeadActionDrawer({
  visible,
  lead,
  onDismiss,
  onAction,
}: LeadActionDrawerProps) {
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const translateY = useSharedValue(DRAWER_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setIsModalVisible(true);
      translateY.value = withSpring(0, {
        damping: 28,
        stiffness: 320,
        mass: 0.9,
      });
      backdropOpacity.value = withTiming(1, { duration: 220 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(DRAWER_HEIGHT, { duration: 270 }, () => {
        runOnJS(setIsModalVisible)(false);
      });
    }
  }, [visible]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        backdropOpacity.value = Math.max(
          0,
          1 - event.translationY / (DRAWER_HEIGHT * 0.45)
        );
      }
    })
    .onEnd((event) => {
      if (event.translationY > DISMISS_THRESHOLD || event.velocityY > DISMISS_VELOCITY) {
        backdropOpacity.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(DRAWER_HEIGHT, { duration: 260 }, () => {
          runOnJS(onDismiss)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 28, stiffness: 320 });
        backdropOpacity.value = withTiming(1, { duration: 160 });
      }
    });

  const drawerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!isModalVisible || !lead) return null;

  const initials = lead.name.substring(0, 2).toUpperCase();

  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.modalRoot}>
        {/* Dimmed backdrop — tap anywhere outside drawer to close */}
        <Animated.View
          style={[StyleSheet.absoluteFillObject, styles.backdrop, backdropAnimatedStyle]}
          pointerEvents="box-none"
        >
          <Pressable style={StyleSheet.absoluteFillObject} onPress={onDismiss} />
        </Animated.View>

        {/* Swipeable bottom drawer */}
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[
              styles.drawer,
              drawerAnimatedStyle,
              { paddingBottom: insets.bottom + 12 },
            ]}
          >
            {/* Drag handle */}
            <View style={styles.dragHandleRow}>
              <View style={styles.dragHandle} />
            </View>

            {/* Header: avatar + name + call button */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.headerNameBlock}>
                  <Text style={styles.leadName} numberOfLines={1}>{lead.name}</Text>
                  <Text style={styles.leadMobile}>{lead.mobile}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.callButton}
                activeOpacity={0.82}
                onPress={() => onAction?.('call', lead)}
              >
                <MaterialCommunityIcons name="phone" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Two-column info grid */}
            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <View style={styles.infoCell}>
                  <Text style={styles.infoLabel}>Lead Age</Text>
                  <Text style={styles.infoValue}>{lead.leadAge ?? '—'}</Text>
                </View>
                <View style={[styles.infoCell, styles.infoCellRight]}>
                  <Text style={styles.infoLabel}>Program</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>{lead.program ?? '—'}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoCell}>
                  <Text style={styles.infoLabel}>Source</Text>
                  <Text style={styles.infoValue}>{lead.source}</Text>
                </View>
                <View style={[styles.infoCell, styles.infoCellRight]}>
                  <Text style={styles.infoLabel}>Follow Up</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {lead.followup.split(' ')[0]}
                  </Text>
                </View>
              </View>
            </View>

            <Divider style={styles.sectionDivider} />

            {/* Action list */}
            <View style={styles.actionList}>
              {ACTIONS.map((action, index) => (
                <React.Fragment key={action.key}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionRow,
                      pressed && styles.actionRowPressed,
                    ]}
                    android_ripple={{ color: 'rgba(229,57,53,0.07)' }}
                    onPress={() => {
                      onAction?.(action.key, lead);
                      onDismiss();
                    }}
                  >
                    <View
                      style={[
                        styles.actionIconWrap,
                        { backgroundColor: action.bgColor },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={action.icon as any}
                        size={20}
                        color={action.color}
                      />
                    </View>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color="#BDBDBD"
                    />
                  </Pressable>
                  {index < ACTIONS.length - 1 && (
                    <Divider style={styles.actionDivider} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  drawer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: DRAWER_HEIGHT,
    // Top-edge shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.13,
        shadowRadius: 14,
      },
      android: {
        elevation: 18,
      },
    }),
  },
  dragHandleRow: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 18,
    paddingTop: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  headerNameBlock: {
    flex: 1,
  },
  leadName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.2,
  },
  leadMobile: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '500',
    marginTop: 2,
  },
  callButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 8,
      },
      android: { elevation: 5 },
    }),
  },
  infoGrid: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoCell: {
    flex: 1,
  },
  infoCellRight: {
    paddingLeft: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#F5F5F5',
  },
  infoLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  sectionDivider: {
    height: 1.5,
    backgroundColor: '#F3F3F3',
  },
  actionList: {
    paddingTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  actionRowPressed: {
    backgroundColor: 'rgba(229,57,53,0.055)',
  },
  actionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginLeft: 74,
  },
});
