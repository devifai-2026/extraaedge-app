import { Theme } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useState, useEffect, useCallback } from 'react';
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  Pressable,
  Modal,
} from 'react-native';
import { Appbar, Divider, Text } from 'react-native-paper';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = 80;

// ─── Types ────────────────────────────────────────────────────────────────────

type ActivityType = 'Follow Up' | 'Add Note' | 'Call Activity';
type ActivityStatus = 'Planned' | 'Done' | 'Missed';
type FollowupCategory = 'My Activity' | 'Follow Up' | 'Add Note';

interface ActivityItem {
  id: string;
  leadName: string;
  activityType: ActivityType;
  dateTime: string;
  status: ActivityStatus;
  remarks: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTIVITIES_DATA: ActivityItem[] = [
  {
    id: '1',
    leadName: 'Rahul Sharma',
    activityType: 'Follow Up',
    dateTime: 'Today, 10:45 AM',
    status: 'Planned',
    remarks: 'Discuss MBA admission requirements and eligibility criteria.',
  },
  {
    id: '2',
    leadName: 'Priya Verma',
    activityType: 'Call Activity',
    dateTime: 'Today, 11:30 AM',
    status: 'Done',
    remarks: 'Called and discussed Data Science course details. Interested.',
  },
  {
    id: '3',
    leadName: 'Amit Kumar',
    activityType: 'Add Note',
    dateTime: 'Today, 12:15 PM',
    status: 'Missed',
    remarks: 'Could not reach the lead. Will retry tomorrow morning.',
  },
  {
    id: '4',
    leadName: 'Sneha Gupta',
    activityType: 'Follow Up',
    dateTime: 'Today, 02:00 PM',
    status: 'Planned',
    remarks: 'Schedule a demo session for Digital Marketing program.',
  },
  {
    id: '5',
    leadName: 'Vikram Singh',
    activityType: 'Call Activity',
    dateTime: 'Yesterday, 09:30 AM',
    status: 'Done',
    remarks: 'Highly interested in Product Management. Send brochure.',
  },
  {
    id: '6',
    leadName: 'Ananya Roy',
    activityType: 'Add Note',
    dateTime: 'Yesterday, 03:45 PM',
    status: 'Planned',
    remarks: 'Send UX Design brochure and fee structure via email.',
  },
];

const FOLLOWUP_CATEGORIES: FollowupCategory[] = ['My Activity', 'Follow Up', 'Add Note'];
const STATUS_OPTIONS = ['All', 'Planned', 'Done', 'Missed'];

// ─── Reusable Animated Drawer Component ───────────────────────────────────────

interface BottomDrawerProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  children: React.ReactNode;
  height?: number;
}

const BottomDrawer = ({ visible, onDismiss, title, children, height }: BottomDrawerProps) => {
  const insets = useSafeAreaInsets();
  const [internalVisible, setInternalVisible] = useState(false);
  const drawerHeight = height || SCREEN_HEIGHT * 0.55;
  
  const translateY = useSharedValue(drawerHeight);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      translateY.value = withSpring(0, { damping: 25, stiffness: 200 });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(drawerHeight, { duration: 250 }, () => {
        runOnJS(setInternalVisible)(false);
      });
    }
  }, [visible]);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
        backdropOpacity.value = 1 - e.translationY / drawerHeight;
      }
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_THRESHOLD || e.velocityY > 500) {
        runOnJS(onDismiss)();
      } else {
        translateY.value = withSpring(0, { damping: 25, stiffness: 200 });
        backdropOpacity.value = withTiming(1, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!internalVisible) return null;

  return (
    <Modal visible={internalVisible} transparent animationType="none">
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={styles.flex} onPress={onDismiss} />
        </Animated.View>
        
        <GestureDetector gesture={gesture}>
          <Animated.View 
             style={[
               styles.drawer, 
               animatedStyle, 
               { minHeight: drawerHeight, paddingBottom: insets.bottom + 20 }
             ]}
          >
            <View style={styles.dragHandleRow}>
              <View style={styles.dragHandle} />
            </View>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Divider />
            <View style={styles.flex}>
                {children}
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

// ─── Main Screen Component ────────────────────────────────────────────────────

export default function ActivitiesScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState<FollowupCategory>('Follow Up');
  const [categorySheetVisible, setCategorySheetVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [statusSheetVisible, setStatusSheetVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [activityDrawerVisible, setActivityDrawerVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);

  const openActivityDetail = (item: ActivityItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedActivity(item);
    setActivityDrawerVisible(true);
  };

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setCalendarVisible(false);
      if (event.type === 'set' && date) setSelectedDate(date);
    } else {
      if (date) setSelectedDate(date);
    }
  };

  const getActivityIcon = (type: ActivityType): any => {
    switch (type) {
      case 'Call Activity': return 'phone-outgoing';
      case 'Add Note': return 'notebook-edit-outline';
      default: return 'calendar-clock';
    }
  };

  const renderTimelineItem = ({ item, index }: { item: ActivityItem; index: number }) => {
    const isDone = item.status === 'Done';
    const isMissed = item.status === 'Missed';
    const dotColor = isDone ? '#4CAF50' : (isMissed ? Theme.colors.primary : '#BDBDBD');
    const bg = isDone ? '#E8F5E9' : (isMissed ? '#FFF1F0' : '#F5F5F7');
    const txt = isDone ? '#2E7D32' : (isMissed ? Theme.colors.primary : '#5F6368');
    const isLast = index === ACTIVITIES_DATA.length - 1;

    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 100)}
        style={styles.timelineRow}
      >
        <View style={styles.indicatorCol}>
          <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
          {!isLast && <View style={styles.verticalLine} />}
        </View>

        <TouchableOpacity 
          style={styles.activityCard} 
          onPress={() => openActivityDetail(item)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={styles.leadName}>{item.leadName}</Text>
            <View style={[styles.statusPill, { backgroundColor: bg }]}>
              <Text style={[styles.statusPillText, { color: txt }]}>{item.status}</Text>
            </View>
          </View>
          <View style={styles.cardTypeRow}>
            <MaterialCommunityIcons name={getActivityIcon(item.activityType)} size={14} color={Theme.colors.primary} />
            <Text style={styles.activityTypeText}>{item.activityType}</Text>
            <View style={styles.timeDot} />
            <Text style={styles.timeText}>{item.dateTime}</Text>
          </View>
          <Text style={styles.remarksText} numberOfLines={1}>{item.remarks}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Appbar.Header style={styles.header}>
          <Appbar.Action icon="menu" onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} />
          <Appbar.Content title="Activities" titleStyle={styles.headerTitle} />
          <Appbar.Action icon="magnify" onPress={() => {}} />
          <Appbar.Action icon="filter-variant" onPress={() => setStatusSheetVisible(true)} />
        </Appbar.Header>

        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <TouchableOpacity style={[styles.filterChip, styles.activeChip]} onPress={() => setCategorySheetVisible(true)}>
              <Text style={styles.activeChipText}>{selectedCategory}</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip} onPress={() => setCalendarVisible(true)}>
              <MaterialCommunityIcons name="calendar-outline" size={16} color="#5F6368" />
              <Text style={styles.filterChipText}>{selectedDate ? `${selectedDate.getDate()}/${selectedDate.getMonth()+1}` : 'Date'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <FlatList
          data={ACTIVITIES_DATA}
          renderItem={renderTimelineItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />

        {/* ── Drawers ── */}
        
        <BottomDrawer 
          visible={categorySheetVisible} 
          onDismiss={() => setCategorySheetVisible(false)}
          title="Choose Category"
          height={320}
        >
          {FOLLOWUP_CATEGORIES.map(cat => (
            <TouchableOpacity key={cat} style={styles.sheetItem} onPress={() => { setSelectedCategory(cat); setCategorySheetVisible(false); }}>
               <Text style={[styles.sheetItemText, selectedCategory === cat && styles.selectedText]}>{cat}</Text>
               {selectedCategory === cat && <MaterialCommunityIcons name="check" size={20} color={Theme.colors.primary} />}
            </TouchableOpacity>
          ))}
        </BottomDrawer>

        <BottomDrawer 
          visible={statusSheetVisible} 
          onDismiss={() => setStatusSheetVisible(false)}
          title="Filter by Status"
          height={360}
        >
          {STATUS_OPTIONS.map(status => (
            <TouchableOpacity key={status} style={styles.sheetItem} onPress={() => { setSelectedStatus(status); setStatusSheetVisible(false); }}>
               <Text style={[styles.sheetItemText, selectedStatus === status && styles.selectedText]}>{status}</Text>
               {selectedStatus === status && <MaterialCommunityIcons name="check" size={20} color={Theme.colors.primary} />}
            </TouchableOpacity>
          ))}
        </BottomDrawer>

        <BottomDrawer 
          visible={activityDrawerVisible} 
          onDismiss={() => setActivityDrawerVisible(false)}
          title="Activity Details"
          height={SCREEN_HEIGHT * 0.5}
        >
          {selectedActivity && (
            <ScrollView style={styles.drawerScroll} contentContainerStyle={{ padding: 20 }}>
               <View style={styles.drawerHeaderRow}>
                  <View>
                    <Text style={styles.drawerLeadName}>{selectedActivity.leadName}</Text>
                    <Text style={styles.drawerMeta}>{selectedActivity.dateTime}</Text>
                  </View>
                  <View style={styles.drawerIconBox}>
                     <MaterialCommunityIcons name={getActivityIcon(selectedActivity.activityType)} size={22} color={Theme.colors.primary} />
                  </View>
               </View>
               
               <View style={styles.detailBox}>
                  <Text style={styles.detailLabel}>REMARKS</Text>
                  <Text style={styles.detailText}>{selectedActivity.remarks}</Text>
               </View>

               <View style={styles.drawerActions}>
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => setActivityDrawerVisible(false)}>
                     <MaterialCommunityIcons name="check-all" size={18} color="#FFF" />
                     <Text style={styles.primaryBtnText}>Mark as Done</Text>
                  </TouchableOpacity>
               </View>
            </ScrollView>
          )}
        </BottomDrawer>

        {calendarVisible && (
          <DateTimePicker value={selectedDate || new Date()} mode="date" display="default" onChange={onDateChange} />
        )}

      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#000000' },
  filterBar: { paddingVertical: 12 },
  filterScroll: { paddingHorizontal: 16, gap: 10 },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F3F4', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  activeChip: { backgroundColor: Theme.colors.primary },
  activeChipText: { color: '#FFFFFF', fontWeight: '700' },
  filterChipText: { color: '#5F6368', fontWeight: '600' },
  listContainer: { paddingHorizontal: 16, paddingBottom: 100 },
  timelineRow: { flexDirection: 'row', gap: 16 },
  indicatorCol: { alignItems: 'center', width: 12 },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginTop: 6 },
  verticalLine: { width: 2, flex: 1, backgroundColor: '#F1F3F4', marginVertical: -4 },
  activityCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#F1F3F4' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  leadName: { fontSize: 16, fontWeight: '800', color: '#202124' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusPillText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  cardTypeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  activityTypeText: { fontSize: 13, fontWeight: '700', color: '#5F6368' },
  timeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D1D1' },
  timeText: { fontSize: 13, color: '#9AA0A6' },
  remarksText: { fontSize: 14, color: '#5F6368' },
  
  // Drawer Styles
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  dragHandleRow: { alignItems: 'center', paddingVertical: 12 },
  dragHandle: { width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2 },
  sheetTitle: { fontSize: 18, fontWeight: '900', color: '#202124', paddingHorizontal: 20, marginBottom: 12 },
  sheetItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, paddingHorizontal: 20 },
  sheetItemText: { fontSize: 16, fontWeight: '600', color: '#5F6368' },
  selectedText: { color: Theme.colors.primary, fontWeight: '800' },
  drawerScroll: { flex: 1 },
  drawerHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  drawerLeadName: { fontSize: 22, fontWeight: '900', color: '#202124' },
  drawerMeta: { fontSize: 14, color: '#5F6368', marginTop: 2 },
  drawerIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FEECEB', justifyContent: 'center', alignItems: 'center' },
  detailBox: { backgroundColor: '#F8F9FA', padding: 16, borderRadius: 12, marginBottom: 24 },
  detailLabel: { fontSize: 11, fontWeight: '900', color: '#9AA0A6', letterSpacing: 0.5, marginBottom: 6 },
  detailText: { fontSize: 15, color: '#202124', lineHeight: 22 },
  drawerActions: { marginTop: 10 },
  primaryBtn: { backgroundColor: Theme.colors.primary, flexDirection: 'row', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
