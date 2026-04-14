import { Theme } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Appbar, Divider, Text } from 'react-native-paper';

// ─── Dummy Data ─────────────────────────────────────────────────────────────

const RECENT_CALLS_DATA = [
  {
    id: '1',
    name: 'Rahul Sharma',
    phoneNumber: '+91 9876543210',
    type: 'outgoing',
    timestamp: 'Today 10:45 AM',
    duration: '02:15',
  },
  {
    id: '2',
    name: 'Sneha Kapoor',
    phoneNumber: '+91 9123456789',
    type: 'incoming',
    timestamp: 'Yesterday 04:30 PM',
    duration: '01:05',
  },
  {
    id: '3',
    name: 'Amit Roy',
    phoneNumber: '+91 9988776655',
    type: 'missed',
    timestamp: 'Today 09:10 AM',
    duration: '00:00',
  },
];

// ─── CallItem Component ──────────────────────────────────────────────────────

function CallItem({ item, onPress }: { item: typeof RECENT_CALLS_DATA[0]; onPress: () => void }) {
  const getCallIcon = () => {
    switch (item.type) {
      case 'incoming':
        return { name: 'arrow-bottom-left', color: '#4CAF50' };
      case 'outgoing':
        return { name: 'arrow-top-right', color: '#2196F3' };
      case 'missed':
        return { name: 'phone-missed', color: '#E53935' };
      default:
        return { name: 'phone', color: '#757575' };
    }
  };

  const iconInfo = getCallIcon();

  return (
    <TouchableOpacity
      style={styles.callItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.callInfoRow}>
        <View style={[styles.iconContainer, { backgroundColor: iconInfo.color + '15' }]}>
          <MaterialCommunityIcons
            name={iconInfo.name as any}
            size={22}
            color={iconInfo.color}
          />
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.callerName}>{item.name}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
          <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.callType}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Call
            </Text>
            <View style={styles.dot} />
            <Text style={styles.duration}>Duration: {item.duration}</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#BDBDBD" />
      </View>
    </TouchableOpacity>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <MaterialCommunityIcons name="phone-off" size={60} color="#E0E0E0" />
      </View>
      <Text style={styles.emptyText}>No Recent Calls Found</Text>
      <Text style={styles.emptySubText}>When you start making calls, they'll appear here.</Text>
    </View>
  );
}

// ─── RecentCallsScreen ───────────────────────────────────────────────────────

export default function RecentCallsScreen() {
  const router = useRouter();
  const [calls] = useState(RECENT_CALLS_DATA); // In real app, this would be fetched

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Top Navigation Bar ──────────────────────────────────── */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction
          onPress={() => router.back()}
          color="#000000"
        />
        <Appbar.Content
          title="Recent Calls"
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      {calls.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={calls}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CallItem
              item={item}
              onPress={() => {
                // Navigate to lead details with some dummy ID
                router.push({ pathname: '/(main)/edit-lead', params: { leadId: item.id } });
              }}
            />
          )}
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

  // ── List ──────────────────────────────────────────────────────
  listContent: {
    paddingBottom: 20,
  },
  callItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  callInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  detailsContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  callerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#212121',
    letterSpacing: -0.2,
  },
  timestamp: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  phoneNumber: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 4,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#BDBDBD',
    marginHorizontal: 8,
  },
  duration: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9E9E9E',
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
