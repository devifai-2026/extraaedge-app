import { Theme } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Appbar, Divider, Text } from 'react-native-paper';

// ─── Dummy Data ─────────────────────────────────────────────────────────────

const FOLLOWUPS_DATA = [
  {
    id: 'f1',
    name: 'Rahul Sharma',
    message: 'Followup scheduled for demo discussion',
    time: 'Today 11:30 AM',
    status: 'pending',
  },
  {
    id: 'f2',
    name: 'Sneha Kapoor',
    message: 'Call reminder for admission confirmation',
    time: 'Today 02:00 PM',
    status: 'pending',
  },
  {
    id: 'f3',
    name: 'Amit Roy',
    message: 'Course enquiry followup pending',
    time: 'Tomorrow 10:00 AM',
    status: 'upcoming',
  },
];

const MISSED_CALLS_DATA = [
  {
    id: 'm1',
    name: 'Rahul Sharma',
    phoneNumber: '+91 9876543210',
    time: 'Today 09:15 AM',
  },
  {
    id: 'm2',
    name: 'Sneha Kapoor',
    phoneNumber: '+91 9123456789',
    time: 'Yesterday 06:45 PM',
  },
];

// ─── Components ─────────────────────────────────────────────────────────────

function TabButton({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}
      activeOpacity={0.8}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{title}</Text>
      {active && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  );
}

function FollowupItem({ item, onPress }: { item: typeof FOLLOWUPS_DATA[0]; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.notificationItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.notificationRow}>
        <View style={[styles.statusIndicator, { backgroundColor: item.status === 'pending' ? Theme.colors.primary : '#FFA000' }]} />
        <View style={styles.detailsContainer}>
          <View style={styles.itemHeader}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <Text style={styles.message}>{item.message}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#BDBDBD" />
      </View>
    </TouchableOpacity>
  );
}

function MissedCallNotification({ item, onPress }: { item: typeof MISSED_CALLS_DATA[0]; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.notificationItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.notificationRow}>
        <View style={styles.missedIconCircle}>
          <MaterialCommunityIcons name="phone-missed" size={18} color={Theme.colors.primary} />
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.itemHeader}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <View style={styles.subInfo}>
            <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
            <View style={styles.dot} />
            <Text style={styles.missedText}>Missed call received</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#BDBDBD" />
      </View>
    </TouchableOpacity>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <MaterialCommunityIcons name="bell-off-outline" size={60} color="#E0E0E0" />
      </View>
      <Text style={styles.emptyText}>No Notifications Available</Text>
      <Text style={styles.emptySubText}>We'll notify you when there's an update on your leads.</Text>
    </View>
  );
}

// ─── NotificationsScreen ─────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'followups' | 'missed'>('followups');
  const [followups, setFollowups] = useState(FOLLOWUPS_DATA);
  const [missedCalls, setMissedCalls] = useState(MISSED_CALLS_DATA);

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to remove all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            if (activeTab === 'followups') setFollowups([]);
            else setMissedCalls([]);
          },
        },
      ]
    );
  };

  const data = activeTab === 'followups' ? followups : missedCalls;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Top Navigation Bar ──────────────────────────────────── */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => router.back()} color="#000000" />
        <Appbar.Content title="Notifications" titleStyle={styles.headerTitle} />
        <Appbar.Action icon="delete-sweep-outline" onPress={handleClearAll} color={Theme.colors.primary} />
      </Appbar.Header>

      {/* ── Tabs ── */}
      <View style={styles.tabsContainer}>
        <TabButton
          title="Followups"
          active={activeTab === 'followups'}
          onPress={() => setActiveTab('followups')}
        />
        <TabButton
          title="Missed Calls"
          active={activeTab === 'missed'}
          onPress={() => setActiveTab('missed')}
        />
      </View>

      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            activeTab === 'followups' ? (
              <FollowupItem
                item={item as any}
                onPress={() => router.push({ pathname: '/(main)/add-milestone', params: { leadId: item.id } })}
              />
            ) : (
              <MissedCallNotification
                item={item as any}
                onPress={() => router.push({ pathname: '/(main)/recent-calls' })}
              />
            )
          }
          ItemSeparatorComponent={() => <Divider style={styles.divider} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header ────────────────────────────────────────────────────
  appbar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
  },

  // ── Tabs ──────────────────────────────────────────────────────
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'relative',
  },
  tabButtonActive: {
    // optional active background if needed
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#757575',
  },
  tabTextActive: {
    color: Theme.colors.primary,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: Theme.colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },

  // ── List ──────────────────────────────────────────────────────
  listContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 14,
  },
  missedIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(229, 57, 53, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  detailsContainer: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#212121',
    letterSpacing: -0.2,
  },
  time: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  message: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 18,
  },
  subInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneNumber: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '600',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#BDBDBD',
    marginHorizontal: 8,
  },
  missedText: {
    fontSize: 13,
    color: '#616161',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
  },

  // ── Empty State ───────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#FFFFFF',
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#212121',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 15,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 22,
  },
});
