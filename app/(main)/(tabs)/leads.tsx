import { Theme } from '@/constants/theme';
import LeadActionDrawer, { LeadItem } from '@/components/LeadActionDrawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Appbar,
  Avatar,
  Button,
  Card,
  Divider,
  IconButton,
  List,
  Menu,
  Modal,
  Portal,
  RadioButton,
  Searchbar,
  Text
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

// ─── Skeleton primitives ────────────────────────────────────────────────────

function SkeletonBox({
  width,
  height,
  borderRadius = 6,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.35, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: '#E0E0E0' },
        animStyle,
        style,
      ]}
    />
  );
}

function SkeletonListCard() {
  return (
    <View style={skeletonStyles.listCard}>
      {/* Avatar */}
      <SkeletonBox width={50} height={50} borderRadius={25} />

      {/* Lines */}
      <View style={skeletonStyles.listLines}>
        <SkeletonBox width="60%" height={14} borderRadius={7} />
        <SkeletonBox width="45%" height={12} borderRadius={6} style={{ marginTop: 8 }} />
        <SkeletonBox width="70%" height={10} borderRadius={5} style={{ marginTop: 8 }} />
        <SkeletonBox width="40%" height={10} borderRadius={5} style={{ marginTop: 8 }} />
        <SkeletonBox width="55%" height={10} borderRadius={5} style={{ marginTop: 6 }} />
      </View>

      {/* Action buttons */}
      <View style={skeletonStyles.listActions}>
        <SkeletonBox width={36} height={36} borderRadius={18} />
        <SkeletonBox width={36} height={36} borderRadius={18} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

function SkeletonGridCard() {
  return (
    <View style={skeletonStyles.gridCard}>
      <SkeletonBox width={48} height={48} borderRadius={24} style={{ alignSelf: 'center' }} />
      <SkeletonBox width="70%" height={13} borderRadius={6} style={{ alignSelf: 'center', marginTop: 12 }} />
      <SkeletonBox width="55%" height={11} borderRadius={5} style={{ alignSelf: 'center', marginTop: 8 }} />
      <View style={skeletonStyles.gridActionRow}>
        <SkeletonBox width={32} height={32} borderRadius={16} />
        <SkeletonBox width={32} height={32} borderRadius={16} />
      </View>
    </View>
  );
}

function SkeletonStatusChips() {
  return (
    <View style={skeletonStyles.chipsRow}>
      {[80, 90, 110, 75, 100].map((w, i) => (
        <SkeletonBox key={i} width={w} height={34} borderRadius={17} style={{ marginRight: 8 }} />
      ))}
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────

// Saved lead lists
const SAVED_LISTS = [
  'All Leads',
  'Today Leads',
  'Demo Attended Leads',
  'Followup Pending Leads',
  'Visited Leads',
  'Hot Prospects',
  'Recently Added Leads',
];

// Status filter categories
const STATUS_FILTERS = [
  'All',
  'Untouched',
  'Unspoken',
  'FollowUp',
  'Demo Prospect',
  'Engaged Leads',
  'Interested',
  'Demo Attended',
  'Scheduled Visit',
  'Visited',
  'Enrolled',
  'Junk',
  'Cold',
  'Re-enquired'
];

// Dummy leads data
const LEADS_DATA: LeadItem[] = [
  { id: '1', name: 'Rahul Sharma', mobile: '+91 98765 43210', date: '20/01/2026 10:47:51 AM', visited: 0, followup: '09/04/2026 10:58:00 AM', source: 'Website', leadAge: '81 days', program: 'MBA' },
  { id: '2', name: 'Priya Verma', mobile: '+91 87654 32109', date: '19/01/2026 11:30:12 AM', visited: 1, followup: '10/04/2026 09:00:00 AM', source: 'Facebook', leadAge: '82 days', program: 'Data Science' },
  { id: '3', name: 'Amit Kumar', mobile: '+91 76543 21098', date: '18/01/2026 02:15:44 PM', visited: 0, followup: '08/04/2026 11:30:00 AM', source: 'Google Ads', leadAge: '83 days', program: 'Web Development' },
  { id: '4', name: 'Sneha Gupta', mobile: '+91 65432 10987', date: '17/01/2026 09:00:00 AM', visited: 2, followup: '11/04/2026 04:00:00 PM', source: 'Instagram', leadAge: '84 days', program: 'Digital Marketing' },
  { id: '5', name: 'Vikram Singh', mobile: '+91 54321 09876', date: '16/01/2026 03:45:22 PM', visited: 0, followup: '12/04/2026 10:00:00 AM', source: 'Direct', leadAge: '85 days', program: 'Product Management' },
  { id: '6', name: 'Ananya Roy', mobile: '+91 43210 98765', date: '15/01/2026 12:20:11 PM', visited: 1, followup: '15/04/2026 02:30:00 PM', source: 'Referral', leadAge: '86 days', program: 'UX Design' },
];

export default function LeadsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [viewType, setViewType] = useState('list'); // 'list', 'grid', 'compact'
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dataset, setDataset] = useState('Lead');
  const [searchType, setSearchType] = useState('Applicant Name');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Simulate initial data fetch
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: re-fetch leads here
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Lead action drawer
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);

  const openLeadDrawer = (lead: LeadItem) => {
    setSelectedLead(lead);
    setDrawerVisible(true);
  };

  // Sheet visible states
  const [datasetSheetVisible, setDatasetSheetVisible] = useState(false);
  const [searchTypeSheetVisible, setSearchTypeSheetVisible] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  // More menu (3-dot popover)
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);

  // Saved list drawer
  const [savedListDrawerVisible, setSavedListDrawerVisible] = useState(false);
  const [selectedSavedList, setSelectedSavedList] = useState('All Leads');
  const [appliedSavedList, setAppliedSavedList] = useState('All Leads');

  const renderLeadItem = ({ item }: { item: typeof LEADS_DATA[0] }) => {
    if (viewType === 'grid') {
      return (
        <TouchableOpacity activeOpacity={0.75} onPress={() => openLeadDrawer(item)} style={styles.gridCardWrapper}>
          <Card style={styles.gridCard}>
            <View style={styles.gridCardContent}>
              <Avatar.Text
                label={item.name.substring(0, 2).toUpperCase()}
                size={48}
                style={styles.gridAvatar}
                color="#FFFFFF"
              />
              <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.gridMobile} numberOfLines={1}>{item.mobile}</Text>
              <View style={styles.gridActions}>
                <IconButton icon="phone-outline" iconColor={Theme.colors.primary} size={20} />
                <IconButton icon="message-outline" iconColor="#555555" size={20} />
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity activeOpacity={0.75} onPress={() => openLeadDrawer(item)}>
      <Card style={styles.leadCard}>
        <View style={styles.cardRow}>
          {/* Left Avatar */}
          <Avatar.Text
            label={item.name.substring(0, 2).toUpperCase()}
            size={50}
            style={styles.avatar}
            color="#FFFFFF"
          />

          {/* Center Content */}
          <View style={styles.cardInfo}>
            <Text style={styles.leadName}>{item.name}</Text>
            <Text style={styles.leadMobile}>{item.mobile}</Text>
            <Text style={styles.metaData}>{item.date}</Text>

            <View style={styles.flagRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={14} color="#666" />
              <Text style={styles.flagText}>Visited: {item.visited}</Text>
            </View>

            <View style={styles.followupRow}>
              <MaterialCommunityIcons name="calendar-clock-outline" size={14} color={Theme.colors.primary} />
              <Text style={styles.followupText}>{item.followup}</Text>
            </View>
          </View>

          {/* Right Actions */}
          <View style={styles.cardActions}>
            <IconButton
              icon="phone"
              mode="contained"
              containerColor={Theme.colors.primary}
              iconColor="#FFFFFF"
              size={22}
              onPress={() => { }}
            />
            <IconButton
              icon="whatsapp"
              mode="outlined"
              iconColor="#25D366"
              size={22}
              style={{ borderColor: '#E0E0E0' }}
              onPress={() => { }}
            />
          </View>
        </View>
      </Card>
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
        <ScrollView style={styles.sheetContent}>
          {children}
        </ScrollView>
      </Modal>
    </Portal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation Bar */}
      <Appbar.Header style={styles.header}>
        <Appbar.Action
          icon="menu"
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        />
        <Appbar.Content title="Leads" titleStyle={styles.headerTitle} />
        <Appbar.Action icon="phone-outline" onPress={() => { }} />
        <Appbar.Action icon="bell-outline" onPress={() => { }} />
        
      </Appbar.Header>

      {/* Search and Dataset Section */}
      <View style={styles.searchRow}>
        {!isSearching ? (
          <TouchableOpacity
            style={styles.datasetSelector}
            onPress={() => setDatasetSheetVisible(true)}
          >
            <Text style={styles.datasetLabel}>{dataset}</Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#000" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.searchTypeSelector}
            onPress={() => setSearchTypeSheetVisible(true)}
          >
            <Text style={styles.searchTypeLabel} numberOfLines={1}>{searchType}</Text>
            <MaterialCommunityIcons name="chevron-down" size={18} color="#000" />
          </TouchableOpacity>
        )}

        <View style={styles.rightIcons}>
          <IconButton
            icon={isSearching ? "close" : "magnify"}
            size={24}
            onPress={() => setIsSearching(!isSearching)}
          />
          <Menu
            visible={moreMenuVisible}
            onDismiss={() => setMoreMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={24}
                onPress={() => setMoreMenuVisible(true)}
              />
            }
            contentStyle={styles.moreMenuContent}
          >
            <Menu.Item
              leadingIcon="format-list-bulleted"
              onPress={() => {
                setMoreMenuVisible(false);
                setSavedListDrawerVisible(true);
              }}
              title="View List"
              titleStyle={styles.moreMenuItem}
            />
          </Menu>
          <IconButton
            icon="view-list"
            size={24}
            iconColor={viewType === 'list' ? Theme.colors.primary : "#999"}
            onPress={() => setViewType('list')}
          />
          <IconButton
            icon="view-grid"
            size={24}
            iconColor={viewType === 'grid' ? Theme.colors.primary : "#999"}
            onPress={() => setViewType('grid')}
          />
          {/* <IconButton
            icon="view-comfy"
            size={24}
            iconColor={viewType === 'compact' ? Theme.colors.primary : "#999"}
            onPress={() => setViewType('compact')}
          /> */}
        </View>
      </View>

      {isSearching && (
        <View style={styles.searchBarContainer}>
          <Searchbar
            placeholder="Search leads..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchBarInput}
            iconColor={Theme.colors.primary}
          />
        </View>
      )}

      {/* Horizontal Status Chips */}
      <View style={styles.statusChipsContainer}>
        {loading ? (
          <SkeletonStatusChips />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusChipsScroll}
          >
            {STATUS_FILTERS.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusChip,
                  selectedStatus === status && styles.activeStatusChip
                ]}
                onPress={() => setSelectedStatus(status)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    selectedStatus === status && styles.activeStatusChipText
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Count and Filter Row */}
      <View style={styles.countRow}>
        {loading ? (
          <>
            <SkeletonBox width={90} height={14} borderRadius={7} />
            <SkeletonBox width={110} height={14} borderRadius={7} />
          </>
        ) : (
          <>
            <Text style={styles.countText}>1500 Leads</Text>
            <Button
              mode="text"
              icon="filter-variant"
              labelStyle={styles.filterBtnLabel}
              onPress={() => router.push('/(main)/sort-filter-leads')}
            >
              Sort / Filter
            </Button>
          </>
        )}
      </View>

      {/* Lead List / Skeleton */}
      {loading ? (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {viewType === 'grid' ? (
            <View style={skeletonStyles.gridContainer}>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonGridCard key={i} />
              ))}
            </View>
          ) : (
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonListCard key={i} />
            ))
          )}
        </ScrollView>
      ) : (
        <FlatList
          data={LEADS_DATA}
          renderItem={renderLeadItem}
          keyExtractor={item => item.id}
          numColumns={viewType === 'grid' ? 2 : 1}
          key={viewType === 'grid' ? 'grid' : 'list'}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Theme.colors.primary]}
              tintColor={Theme.colors.primary}
            />
          }
        />
      )}

      {/* Bottom Sheets */}
      {renderBottomSheet(
        datasetSheetVisible,
        () => setDatasetSheetVisible(false),
        "Select Dataset",
        <>
          <List.Item
            title="Lead"
            onPress={() => { setDataset('Lead'); setDatasetSheetVisible(false); }}
            right={() => dataset === 'Lead' && <List.Icon icon="check" color={Theme.colors.primary} />}
          />
          <List.Item
            title="Rawdata"
            onPress={() => { setDataset('Rawdata'); setDatasetSheetVisible(false); }}
            right={() => dataset === 'Rawdata' && <List.Icon icon="check" color={Theme.colors.primary} />}
          />
        </>
      )}

      {renderBottomSheet(
        searchTypeSheetVisible,
        () => setSearchTypeSheetVisible(false),
        "Search Type",
        <>
          {['Basic Search', 'Applicant Name', 'WhatsApp Number', 'Email ID'].map((type) => (
            <List.Item
              key={type}
              title={type}
              onPress={() => { setSearchType(type); setSearchTypeSheetVisible(false); }}
              right={() => searchType === type && <List.Icon icon="check" color={Theme.colors.primary} />}
            />
          ))}
        </>
      )}

      {renderBottomSheet(
        filterSheetVisible,
        () => setFilterSheetVisible(false),
        "Filters",
        <>
          <List.Item title="Date Filter" left={() => <List.Icon icon="calendar" />} />
          <List.Item title="Lead Status" left={() => <List.Icon icon="tag-outline" />} />
          <List.Item title="Lead Source" left={() => <List.Icon icon="source-branch" />} />
          <List.Item title="Followup Pending" left={() => <List.Icon icon="clock-alert-outline" />} />
          <View style={styles.sheetFooter}>
            <Button
              mode="contained"
              style={styles.applyBtn}
              onPress={() => setFilterSheetVisible(false)}
            >
              Apply Filters
            </Button>
          </View>
        </>
      )}

      {/* Saved List Bottom Drawer */}
      <Portal>
        <Modal
          visible={savedListDrawerVisible}
          onDismiss={() => {
            setSelectedSavedList(appliedSavedList);
            setSavedListDrawerVisible(false);
          }}
          contentContainerStyle={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]}
        >
          <View style={styles.dragHandle} />
          <Text style={styles.modalTitle}>Saved Lists</Text>
          <Divider />
          <ScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
            {SAVED_LISTS.map((listName) => (
              <TouchableOpacity
                key={listName}
                activeOpacity={0.7}
                style={[
                  styles.savedListItem,
                  selectedSavedList === listName && styles.savedListItemSelected,
                ]}
                onPress={() => setSelectedSavedList(listName)}
              >
                <Text
                  style={[
                    styles.savedListItemText,
                    selectedSavedList === listName && styles.savedListItemTextSelected,
                  ]}
                >
                  {listName}
                </Text>
                <RadioButton
                  value={listName}
                  status={selectedSavedList === listName ? 'checked' : 'unchecked'}
                  onPress={() => setSelectedSavedList(listName)}
                  color={Theme.colors.primary}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.savedListFooter}>
            <Button
              mode="contained"
              style={styles.savedListApplyBtn}
              labelStyle={styles.savedListApplyLabel}
              onPress={() => {
                setAppliedSavedList(selectedSavedList);
                setSavedListDrawerVisible(false);
              }}
            >
              Apply
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Lead action bottom drawer */}
      <LeadActionDrawer
        visible={drawerVisible}
        lead={selectedLead}
        onDismiss={() => setDrawerVisible(false)}
        onAction={(action, lead) => {
          if (action === 'edit') {
            router.push({
              pathname: '/(main)/edit-lead',
              params: { leadData: JSON.stringify(lead) },
            });
          } else if (action === 'stage') {
            router.push({
              pathname: '/(main)/update-stage',
              params: { leadData: JSON.stringify(lead) },
            });
          } else if (action === 'refer') {
            router.push({
              pathname: '/(main)/refer-lead',
              params: { leadData: JSON.stringify(lead) },
            });
          } else if (action === 'whatsapp') {
            router.push({
              pathname: '/(main)/whatsapp-message',
              params: { leadData: JSON.stringify(lead) },
            });
          } else if (action === 'followup') {
            router.push({
              pathname: '/(main)/add-milestone',
              params: { leadData: JSON.stringify(lead) },
            });
          } else if (action === 'note') {
            router.push({
              pathname: '/(main)/add-note',
              params: { leadData: JSON.stringify(lead) },
            });
          } else {
            console.log('Action:', action, 'Lead:', lead.name);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontWeight: '900',
    fontSize: 22,
    color: '#000000',
    letterSpacing: -0.5,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  datasetSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  datasetLabel: {
    fontWeight: '700',
    fontSize: 16,
    marginRight: 4,
  },
  searchTypeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    maxWidth: '40%',
  },
  searchTypeLabel: {
    fontWeight: '700',
    fontSize: 14,
    marginRight: 4,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -8,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    borderRadius: 12,
    height: 48,
    backgroundColor: '#F1F3F5',
    elevation: 0,
  },
  searchBarInput: {
    fontSize: 15,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusChipsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  statusChipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  activeStatusChip: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  activeStatusChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  countText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  filterBtnLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  listContent: {
    padding: 12,
    paddingBottom: 100,
  },
  leadCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: '#F1F3F5',
  },
  cardRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: Theme.colors.primary,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
  },
  leadName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#000000',
  },
  leadMobile: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '600',
    marginTop: 2,
  },
  metaData: {
    fontSize: 12,
    color: '#868E96',
    marginTop: 4,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  flagText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  followupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  followupText: {
    fontSize: 12,
    color: Theme.colors.primary,
    fontWeight: '700',
    marginLeft: 4,
  },
  cardActions: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  gridCardWrapper: {
    flex: 1,
    margin: 6,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#F1F3F5',
  },
  gridCardContent: {
    padding: 16,
    alignItems: 'center',
  },
  gridAvatar: {
    backgroundColor: Theme.colors.primary,
    marginBottom: 10,
  },
  gridName: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    color: '#000000',
  },
  gridMobile: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  gridActions: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Theme.colors.primary,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  bottomSheet: {
    backgroundColor: 'white',
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
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
    color: '#000',
  },
  sheetContent: {
    maxHeight: 400,
  },
  sheetFooter: {
    padding: 16,
  },
  applyBtn: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 4,
  },
  moreMenuContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 6,
    marginTop: 4,
  },
  moreMenuItem: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  savedListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 3,
  },
  savedListItemSelected: {
    backgroundColor: '#FFF0F0',
  },
  savedListItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  savedListItemTextSelected: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  savedListFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  savedListApplyBtn: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 30,
    paddingVertical: 4,
  },
  savedListApplyLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

const skeletonStyles = StyleSheet.create({
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  listLines: {
    flex: 1,
    marginLeft: 16,
  },
  listActions: {
    alignItems: 'center',
    gap: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCard: {
    width: '47%',
    margin: '1.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  gridActionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
});
