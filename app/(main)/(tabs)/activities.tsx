import { Theme } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Appbar, Divider, Modal, Portal, Searchbar, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    dateTime: '09/04/2026 10:30 AM',
    status: 'Planned',
    remarks: 'Discuss MBA admission requirements and eligibility criteria.',
  },
  {
    id: '2',
    leadName: 'Priya Verma',
    activityType: 'Call Activity',
    dateTime: '09/04/2026 11:00 AM',
    status: 'Done',
    remarks: 'Called and discussed Data Science course details. Interested.',
  },
  {
    id: '3',
    leadName: 'Amit Kumar',
    activityType: 'Add Note',
    dateTime: '09/04/2026 12:15 PM',
    status: 'Missed',
    remarks: 'Could not reach the lead. Will retry tomorrow morning.',
  },
  {
    id: '4',
    leadName: 'Sneha Gupta',
    activityType: 'Follow Up',
    dateTime: '09/04/2026 02:00 PM',
    status: 'Planned',
    remarks: 'Schedule a demo session for Digital Marketing program.',
  },
  {
    id: '5',
    leadName: 'Vikram Singh',
    activityType: 'Call Activity',
    dateTime: '08/04/2026 09:30 AM',
    status: 'Done',
    remarks: 'Highly interested in Product Management. Send brochure.',
  },
  {
    id: '6',
    leadName: 'Ananya Roy',
    activityType: 'Add Note',
    dateTime: '08/04/2026 03:45 PM',
    status: 'Planned',
    remarks: 'Send UX Design brochure and fee structure via email.',
  },
  {
    id: '7',
    leadName: 'Karan Mehta',
    activityType: 'Follow Up',
    dateTime: '07/04/2026 04:30 PM',
    status: 'Missed',
    remarks: 'Lead was in a meeting. Reschedule for next morning.',
  },
  {
    id: '8',
    leadName: 'Divya Nair',
    activityType: 'Call Activity',
    dateTime: '07/04/2026 11:15 AM',
    status: 'Done',
    remarks: 'Confirmed visit for campus tour this weekend.',
  },
];

const FOLLOWUP_CATEGORIES: FollowupCategory[] = ['My Activity', 'Follow Up', 'Add Note'];
const STATUS_OPTIONS = ['All', 'Planned', 'Done', 'Missed'];
const COUNSELORS = ['Divya Nair', 'Sayan Pal'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDisplayDate(date: Date): string {
  const day   = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year  = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function getActivityIcon(type: ActivityType): React.ComponentProps<typeof MaterialCommunityIcons>['name'] {
  switch (type) {
    case 'Call Activity': return 'phone-outline';
    case 'Add Note':      return 'note-outline';
    default:              return 'calendar-clock-outline';
  }
}

function getStatusStyle(status: ActivityStatus) {
  switch (status) {
    case 'Done':   return { bg: '#E8F5E9', text: '#2E7D32', dot: '#4CAF50' };
    case 'Missed': return { bg: '#FFEBEE', text: Theme.colors.primary, dot: Theme.colors.primary };
    default:       return { bg: '#F5F5F5', text: '#757575', dot: '#BDBDBD' };
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ActivitiesScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Category dropdown
  const [selectedCategory, setSelectedCategory] = useState<FollowupCategory>('Follow Up');
  const [categorySheetVisible, setCategorySheetVisible] = useState(false);

  // Date filter
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setCalendarVisible(false);
      if (event.type === 'set' && date) setSelectedDate(date);
    } else {
      if (date) setSelectedDate(date);
    }
  };

  // Status filter
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [statusSheetVisible, setStatusSheetVisible] = useState(false);

  // Counselor filter
  const [selectedCounselor, setSelectedCounselor] = useState('');
  const [counselorSheetVisible, setCounselorSheetVisible] = useState(false);
  const [counselorSearch, setCounselorSearch] = useState('');

  // Activity detail drawer
  const [activityDrawerVisible, setActivityDrawerVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);

  const openActivityDrawer = (item: ActivityItem) => {
    setSelectedActivity(item);
    setActivityDrawerVisible(true);
  };

  const filteredCounselors = COUNSELORS.filter(c =>
    c.toLowerCase().includes(counselorSearch.toLowerCase())
  );

  const filteredActivities = ACTIVITIES_DATA.filter(item => {
    if (selectedCategory === 'Follow Up' && item.activityType !== 'Follow Up') return false;
    if (selectedCategory === 'Add Note' && item.activityType !== 'Add Note') return false;
    if (selectedStatus !== 'All' && item.status !== selectedStatus) return false;
    return true;
  });

  // ─── Renderers ──────────────────────────────────────────────────────────────

  const renderActivityCard = ({
    item,
    index,
  }: {
    item: ActivityItem;
    index: number;
  }) => {
    const isLast = index === filteredActivities.length - 1;
    const sc = getStatusStyle(item.status);
    const icon = getActivityIcon(item.activityType);

    return (
      <TouchableOpacity onPress={() => openActivityDrawer(item)} activeOpacity={0.75}>
        <View style={styles.timelineRow}>
          {/* Left: dot + connecting line */}
          <View style={styles.timelineIndicator}>
            <View style={[styles.timelineDot, { backgroundColor: sc.dot }]} />
            {!isLast && <View style={styles.timelineLine} />}
          </View>

          {/* Right: card */}
          <View style={styles.activityCard}>
            {/* Name + status badge */}
            <View style={styles.cardTopRow}>
              <Text style={styles.cardLeadName} numberOfLines={1}>
                {item.leadName}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                <Text style={[styles.statusBadgeText, { color: sc.text }]}>
                  {item.status}
                </Text>
              </View>
            </View>

            {/* Activity type */}
            <View style={styles.cardMetaRow}>
              <MaterialCommunityIcons name={icon} size={14} color="#777" />
              <Text style={styles.activityTypeText}>{item.activityType}</Text>
            </View>

            {/* Date & time */}
            <View style={styles.cardDateRow}>
              <MaterialCommunityIcons name="clock-outline" size={13} color="#AAAAAA" />
              <Text style={styles.dateTimeText}>{item.dateTime}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBottomSheet = (
    visible: boolean,
    onDismiss: () => void,
    title: string,
    children: React.ReactNode
  ) => (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.dragHandle} />
        <Text style={styles.modalTitle}>{title}</Text>
        <Divider />
        <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </Modal>
    </Portal>
  );

  // ─── UI ─────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Top Navigation Bar ── */}
      <Appbar.Header style={styles.header} elevated>
        <Appbar.Action
          icon="menu"
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        />
        <Appbar.Content title="Activities" titleStyle={styles.headerTitle} />
        <Appbar.Action icon="phone-outline" onPress={() => {}} />
        <Appbar.Action icon="bell-outline" onPress={() => {}} />
      </Appbar.Header>

      {/* ── Section 1: Followup Category Dropdown ── */}
      <View style={styles.categoryRow}>
        <TouchableOpacity
          style={styles.categoryDropdown}
          onPress={() => setCategorySheetVisible(true)}
          activeOpacity={0.75}
        >
          <Text style={styles.categoryLabel}>{selectedCategory}</Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* ── Section 2: Date Filter Row ── */}
      <View style={styles.filterRow}>
        {/* Calendar date field */}
        <TouchableOpacity
          style={styles.dateField}
          onPress={() => setCalendarVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="calendar" size={17} color={Theme.colors.primary} />
          <Text
            style={[styles.dateFieldText, !selectedDate && styles.fieldPlaceholder]}
            numberOfLines={1}
          >
            {selectedDate ? formatDisplayDate(selectedDate) : 'Date'}
          </Text>
        </TouchableOpacity>

        {/* Status dropdown */}
        <TouchableOpacity
          style={styles.statusField}
          onPress={() => setStatusSheetVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.statusFieldText} numberOfLines={1}>
            {selectedStatus}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={16} color="#000" />
        </TouchableOpacity>

        {/* Counselor filter icon */}
        <TouchableOpacity
          style={[
            styles.filterIconBtn,
            selectedCounselor ? styles.filterIconBtnActive : null,
          ]}
          onPress={() => setCounselorSheetVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="filter-variant"
            size={22}
            color={selectedCounselor ? Theme.colors.primary : '#555'}
          />
        </TouchableOpacity>
      </View>

      {/* Active filter chips */}
      {(selectedDate || selectedCounselor) ? (
        <View style={styles.activeFiltersRow}>
          {selectedDate ? (
            <TouchableOpacity
              style={styles.activeChip}
              onPress={() => setSelectedDate(null)}
              activeOpacity={0.75}
            >
              <Text style={styles.activeChipText}>{formatDisplayDate(selectedDate!)}</Text>
              <MaterialCommunityIcons name="close" size={13} color={Theme.colors.primary} />
            </TouchableOpacity>
          ) : null}
          {selectedCounselor ? (
            <TouchableOpacity
              style={styles.activeChip}
              onPress={() => setSelectedCounselor('')}
              activeOpacity={0.75}
            >
              <Text style={styles.activeChipText}>{selectedCounselor}</Text>
              <MaterialCommunityIcons name="close" size={13} color={Theme.colors.primary} />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {/* Count row */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{filteredActivities.length} Activities</Text>
      </View>

      {/* ── Section 3: Activity Timeline List ── */}
      <FlatList
        data={filteredActivities}
        renderItem={renderActivityCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="calendar-check-outline"
              size={60}
              color="#E0E0E0"
            />
            <Text style={styles.emptyText}>No activities found</Text>
            <Text style={styles.emptySubText}>Try adjusting your filters</Text>
          </View>
        }
      />

      {/* ══════════════════ Bottom Sheets ══════════════════ */}

      {/* Followup Category Sheet */}
      {renderBottomSheet(
        categorySheetVisible,
        () => setCategorySheetVisible(false),
        'Choose Followup Category',
        <>
          {FOLLOWUP_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.sheetItem,
                selectedCategory === cat && styles.sheetItemSelected,
              ]}
              onPress={() => {
                setSelectedCategory(cat);
                setCategorySheetVisible(false);
              }}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.sheetItemText,
                  selectedCategory === cat && styles.sheetItemTextSelected,
                ]}
              >
                {cat}
              </Text>
              {selectedCategory === cat && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={Theme.colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Status Filter Sheet */}
      {renderBottomSheet(
        statusSheetVisible,
        () => setStatusSheetVisible(false),
        'Select Status',
        <>
          {STATUS_OPTIONS.map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.sheetItem,
                selectedStatus === status && styles.sheetItemSelected,
              ]}
              onPress={() => {
                setSelectedStatus(status);
                setStatusSheetVisible(false);
              }}
              activeOpacity={0.75}
            >
              <View style={styles.statusOptionLeft}>
                {status !== 'All' && (
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          status === 'Done'
                            ? '#4CAF50'
                            : status === 'Missed'
                            ? Theme.colors.primary
                            : '#BDBDBD',
                      },
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.sheetItemText,
                    selectedStatus === status && styles.sheetItemTextSelected,
                    status === 'All' && { marginLeft: 20 },
                  ]}
                >
                  {status}
                </Text>
              </View>
              {selectedStatus === status && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={Theme.colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Counselor Selector Sheet */}
      <Portal>
        <Modal
          visible={counselorSheetVisible}
          onDismiss={() => {
            setCounselorSheetVisible(false);
            setCounselorSearch('');
          }}
          contentContainerStyle={[
            styles.bottomSheet,
            { paddingBottom: insets.bottom + 20 },
          ]}
        >
          <View style={styles.dragHandle} />
          <Text style={styles.modalTitle}>Select Counselor</Text>
          <Divider />
          <View style={styles.counselorSearchContainer}>
            <Searchbar
              placeholder="Search counselor..."
              onChangeText={setCounselorSearch}
              value={counselorSearch}
              style={styles.counselorSearch}
              inputStyle={styles.counselorSearchInput}
              iconColor={Theme.colors.primary}
            />
          </View>
          <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
            {filteredCounselors.length === 0 ? (
              <Text style={styles.emptySheetText}>No counselors found</Text>
            ) : (
              filteredCounselors.map(name => (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.sheetItem,
                    selectedCounselor === name && styles.sheetItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedCounselor(selectedCounselor === name ? '' : name);
                    setCounselorSheetVisible(false);
                    setCounselorSearch('');
                  }}
                  activeOpacity={0.75}
                >
                  <View style={styles.counselorItemLeft}>
                    <View style={styles.counselorAvatar}>
                      <Text style={styles.counselorAvatarText}>
                        {name.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.sheetItemText,
                        selectedCounselor === name && styles.sheetItemTextSelected,
                      ]}
                    >
                      {name}
                    </Text>
                  </View>
                  {selectedCounselor === name && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color={Theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </Modal>
      </Portal>

      {/* Date Picker — iOS: bottom sheet spinner */}
      {Platform.OS === 'ios' && (
        <Portal>
          <Modal
            visible={calendarVisible}
            onDismiss={() => setCalendarVisible(false)}
            contentContainerStyle={[
              styles.calendarModal,
              { paddingBottom: insets.bottom + 20 },
            ]}
          >
            <View style={styles.dragHandle} />
            <Text style={styles.modalTitle}>Select Date</Text>
            <Divider style={{ marginBottom: 8 }} />
            <DateTimePicker
              value={selectedDate ?? new Date()}
              mode="date"
              display="spinner"
              onChange={onDateChange}
              themeVariant="light"
              style={{ alignSelf: 'center', width: '100%' }}
            />
            <View style={styles.datePickerActions}>
              <TouchableOpacity
                onPress={() => { setSelectedDate(null); setCalendarVisible(false); }}
                style={styles.clearDateBtn}
                activeOpacity={0.75}
              >
                <Text style={styles.clearDateText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCalendarVisible(false)}
                style={styles.doneDateBtn}
                activeOpacity={0.75}
              >
                <Text style={styles.doneDateText}>Done</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </Portal>
      )}

      {/* Date Picker — Android: native dialog */}
      {Platform.OS === 'android' && calendarVisible && (
        <DateTimePicker
          value={selectedDate ?? new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {/* Activity Details Drawer */}
      <Portal>
        <Modal
          visible={activityDrawerVisible}
          onDismiss={() => setActivityDrawerVisible(false)}
          contentContainerStyle={[
            styles.bottomSheet,
            { paddingBottom: insets.bottom + 24 },
          ]}
        >
          <View style={styles.dragHandle} />
          {selectedActivity && (
            <>
              {/* Drawer header */}
              <View style={styles.drawerHeader}>
                <View style={styles.drawerTitleBlock}>
                  <Text style={styles.drawerLeadName}>{selectedActivity.leadName}</Text>
                  <View style={styles.drawerTypeRow}>
                    <MaterialCommunityIcons
                      name={getActivityIcon(selectedActivity.activityType)}
                      size={14}
                      color="#777"
                    />
                    <Text style={styles.drawerTypeText}>
                      {selectedActivity.activityType}
                    </Text>
                  </View>
                </View>
                {(() => {
                  const sc = getStatusStyle(selectedActivity.status);
                  return (
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: sc.text }]}>
                        {selectedActivity.status}
                      </Text>
                    </View>
                  );
                })()}
              </View>

              <Divider style={{ marginBottom: 16 }} />

              <ScrollView
                style={styles.drawerScroll}
                showsVerticalScrollIndicator={false}
              >
                {/* Scheduled date */}
                <View style={styles.detailRow}>
                  <View style={styles.detailIconWrap}>
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={18}
                      color={Theme.colors.primary}
                    />
                  </View>
                  <View style={styles.detailBody}>
                    <Text style={styles.detailLabel}>Scheduled Date</Text>
                    <Text style={styles.detailValue}>{selectedActivity.dateTime}</Text>
                  </View>
                </View>

                {/* Remarks */}
                <View style={styles.detailRow}>
                  <View style={styles.detailIconWrap}>
                    <MaterialCommunityIcons
                      name="comment-text-outline"
                      size={18}
                      color={Theme.colors.primary}
                    />
                  </View>
                  <View style={styles.detailBody}>
                    <Text style={styles.detailLabel}>Remarks</Text>
                    <Text style={styles.detailValue}>
                      {selectedActivity.remarks || '—'}
                    </Text>
                  </View>
                </View>

                {/* Quick action buttons */}
                <View style={styles.quickActionsRow}>
                  <TouchableOpacity
                    style={styles.outlineActionBtn}
                    onPress={() => setActivityDrawerVisible(false)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={15}
                      color={Theme.colors.primary}
                    />
                    <Text style={styles.outlineActionText}>Update</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.outlineActionBtn}
                    onPress={() => setActivityDrawerVisible(false)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="calendar-edit"
                      size={15}
                      color="#555"
                    />
                    <Text style={[styles.outlineActionText, { color: '#555' }]}>
                      Reschedule
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.filledActionBtn}
                    onPress={() => setActivityDrawerVisible(false)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="check-circle-outline"
                      size={15}
                      color="#FFF"
                    />
                    <Text style={styles.filledActionText}>Mark as Done</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </>
          )}
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  // ── Header ──
  header: {
    backgroundColor: '#FFFFFF',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.3,
  },

  // ── Category dropdown ──
  categoryRow: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    gap: 6,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },

  // ── Filter row ──
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dateField: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    gap: 6,
  },
  dateFieldText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  fieldPlaceholder: {
    color: '#AAAAAA',
    fontWeight: '400',
  },
  statusField: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    gap: 4,
  },
  statusFieldText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  filterIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIconBtnActive: {
    backgroundColor: '#FFF0F0',
    borderColor: Theme.colors.primary,
  },

  // ── Active filter chips ──
  activeFiltersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
    gap: 8,
    flexWrap: 'wrap',
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    gap: 5,
  },
  activeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.primary,
  },

  // ── Count row ──
  countRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  countText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
  },

  // ── Timeline list ──
  listContent: {
    paddingTop: 4,
    paddingBottom: 80,
    paddingHorizontal: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timelineIndicator: {
    width: 26,
    alignItems: 'center',
    paddingTop: 18,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E4E4E4',
    marginTop: 5,
    marginBottom: 0,
  },
  activityCard: {
    flex: 1,
    marginLeft: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLeadName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
  },
  activityTypeText: {
    fontSize: 13,
    color: '#555555',
    fontWeight: '600',
  },
  cardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateTimeText: {
    fontSize: 12,
    color: '#AAAAAA',
    fontWeight: '500',
  },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#BBBBBB',
  },
  emptySubText: {
    fontSize: 13,
    color: '#CCCCCC',
  },

  // ── Bottom sheet base ──
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    color: '#000000',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  sheetScroll: {
    maxHeight: 360,
  },

  // ── Sheet list items ──
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 3,
  },
  sheetItemSelected: {
    backgroundColor: '#FFF0F0',
  },
  sheetItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  sheetItemTextSelected: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },

  // ── Status dot in sheet ──
  statusOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // ── Counselor sheet ──
  counselorSearchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  counselorSearch: {
    borderRadius: 12,
    height: 46,
    backgroundColor: '#F5F5F5',
    elevation: 0,
  },
  counselorSearchInput: {
    fontSize: 14,
  },
  counselorItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counselorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counselorAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptySheetText: {
    textAlign: 'center',
    color: '#AAAAAA',
    fontSize: 14,
    paddingVertical: 20,
  },

  // ── Calendar modal ──
  calendarModal: {
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 4,
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  clearDateBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  clearDateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999999',
  },
  doneDateBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  doneDateText: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.primary,
  },

  // ── Activity details drawer ──
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  drawerTitleBlock: {
    flex: 1,
    marginRight: 10,
  },
  drawerLeadName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
  },
  drawerTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  drawerTypeText: {
    fontSize: 13,
    color: '#777',
    fontWeight: '600',
  },
  drawerScroll: {
    maxHeight: 380,
    paddingHorizontal: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  detailIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailBody: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#AAAAAA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
    lineHeight: 20,
  },

  // ── Quick actions ──
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  outlineActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
    gap: 5,
  },
  outlineActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  filledActionBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: Theme.colors.primary,
    gap: 5,
  },
  filledActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
