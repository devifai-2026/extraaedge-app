import React, { useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Divider, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Theme } from '@/constants/theme';

// ─── Static Data ─────────────────────────────────────────────────────────────

const DEVICE_PATHS = [
  { id: '1', label: 'Internal Storage', path: '/storage/emulated/0' },
  { id: '2', label: 'Downloads Folder', path: '/storage/emulated/0/Download' },
  { id: '3', label: 'Call Recordings Folder', path: '/storage/emulated/0/CallRecordings' },
  { id: '4', label: 'DCIM Folder', path: '/storage/emulated/0/DCIM' },
  { id: '5', label: 'Music Folder', path: '/storage/emulated/0/Music' },
  { id: '6', label: 'Documents Folder', path: '/storage/emulated/0/Documents' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface AccordionCardProps {
  label: string;
  icon: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  badgeText?: string;
}

function AccordionCard({ label, icon, children, isOpen, onToggle, badgeText }: AccordionCardProps) {
  return (
    <View style={cardStyles.wrapper}>
      <TouchableOpacity style={cardStyles.header} onPress={onToggle} activeOpacity={0.75}>
        <View style={cardStyles.headerLeft}>
          <View style={cardStyles.iconBox}>
            <MaterialCommunityIcons name={icon as any} size={18} color={Theme.colors.primary} />
          </View>
          <Text style={cardStyles.headerLabel}>{label}</Text>
          {badgeText ? (
            <View style={cardStyles.badge}>
              <Text style={cardStyles.badgeText}>{badgeText}</Text>
            </View>
          ) : null}
        </View>
        <MaterialCommunityIcons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#9CA3AF"
        />
      </TouchableOpacity>
      {isOpen && (
        <>
          <Divider style={cardStyles.innerDivider} />
          <View style={cardStyles.body}>{children}</View>
        </>
      )}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFF1F1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  headerLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  badge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  innerDivider: {
    backgroundColor: '#F3F4F6',
    height: 1,
  },
  body: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HelpTroubleshootScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Accordion open states
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Section 1 – Click To Call Refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshDone, setRefreshDone] = useState(false);

  // Section 2 – Import Call Log
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);

  // Section 4 – Recording Path
  const [pathSearch, setPathSearch] = useState('');
  const [selectedPath, setSelectedPath] = useState<(typeof DEVICE_PATHS)[0] | null>(null);
  const [pathDropdownOpen, setPathDropdownOpen] = useState(false);
  const [isUpdatingPath, setIsUpdatingPath] = useState(false);
  const [pathUpdateDone, setPathUpdateDone] = useState(false);

  const toggleSection = (key: string) => {
    setOpenSection(prev => (prev === key ? null : key));
  };

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshDone(false);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshDone(true);
    }, 1800);
  };

  // Import handler
  const handleImport = () => {
    setIsImporting(true);
    setImportDone(false);
    setTimeout(() => {
      setIsImporting(false);
      setImportDone(true);
    }, 1800);
  };

  // Path update handler
  const handleUpdatePath = () => {
    if (!selectedPath) return;
    setIsUpdatingPath(true);
    setPathUpdateDone(false);
    setTimeout(() => {
      setIsUpdatingPath(false);
      setPathUpdateDone(true);
    }, 1500);
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const filteredPaths = DEVICE_PATHS.filter(p =>
    p.label.toLowerCase().includes(pathSearch.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── Top Navigation Bar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navIconBtn} onPress={() => router.back()} activeOpacity={0.75}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Help</Text>
        <TouchableOpacity style={styles.navIconBtn} onPress={() => {}} activeOpacity={0.75}>
          <MaterialCommunityIcons name="console" size={22} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 36 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Page description chip */}
        <View style={styles.pageChip}>
          <MaterialCommunityIcons name="tools" size={14} color={Theme.colors.primary} />
          <Text style={styles.pageChipText}>Troubleshooting Tools</Text>
        </View>

        {/* ─────────────────────────────────────────
            SECTION 1 — Click To Call Refresh
        ───────────────────────────────────────── */}
        <AccordionCard
          label="Click To Call Refresh"
          icon="phone-refresh"
          isOpen={openSection === 'clickToCall'}
          onToggle={() => toggleSection('clickToCall')}
        >
          <Text style={styles.accordionBodyText}>
            Sync and refresh your Click-to-Call connection. Use this if calls are not connecting correctly.
          </Text>

          {refreshDone && (
            <View style={styles.successBanner}>
              <MaterialCommunityIcons name="check-circle-outline" size={16} color="#16A34A" />
              <Text style={styles.successText}>Click To Call refreshed successfully.</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, isRefreshing && styles.primaryBtnDisabled]}
            onPress={handleRefresh}
            activeOpacity={0.8}
            disabled={isRefreshing}
          >
            <MaterialCommunityIcons
              name={isRefreshing ? 'loading' : 'refresh'}
              size={16}
              color="#FFF"
            />
            <Text style={styles.primaryBtnText}>
              {isRefreshing ? 'Refreshing…' : 'Refresh Click To Call'}
            </Text>
          </TouchableOpacity>
        </AccordionCard>

        {/* ─────────────────────────────────────────
            SECTION 2 — Import Call Log
        ───────────────────────────────────────── */}
        <AccordionCard
          label="Import Call Log"
          icon="phone-log"
          isOpen={openSection === 'importCallLog'}
          onToggle={() => toggleSection('importCallLog')}
        >
          <Text style={styles.accordionBodyText}>
            Import call logs from a specific date into the CRM for tracking and analysis.
          </Text>

          {/* Date selector field */}
          <Text style={styles.fieldLabel}>Select Date</Text>
          <TouchableOpacity
            style={styles.dateField}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="calendar-month-outline" size={18} color={Theme.colors.primary} />
            <Text style={styles.dateFieldText}>{formatDate(selectedDate)}</Text>
            <MaterialCommunityIcons name="chevron-down" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Native Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              maximumDate={new Date()}
              onChange={(event: DateTimePickerEvent, date?: Date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) setSelectedDate(date);
                if (Platform.OS === 'android') setShowDatePicker(false);
              }}
              themeVariant="light"
              accentColor={Theme.colors.primary}
            />
          )}

          {importDone && (
            <View style={styles.successBanner}>
              <MaterialCommunityIcons name="check-circle-outline" size={16} color="#16A34A" />
              <Text style={styles.successText}>
                Call logs for {formatDate(selectedDate)} imported.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, isImporting && styles.primaryBtnDisabled]}
            onPress={handleImport}
            activeOpacity={0.8}
            disabled={isImporting}
          >
            <MaterialCommunityIcons
              name={isImporting ? 'loading' : 'download'}
              size={16}
              color="#FFF"
            />
            <Text style={styles.primaryBtnText}>
              {isImporting ? 'Importing…' : 'Import Logs'}
            </Text>
          </TouchableOpacity>
        </AccordionCard>

        {/* ─────────────────────────────────────────
            SECTION 3 — Go To Sync Page
        ───────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.navRowCard}
          onPress={() => {}}
          activeOpacity={0.75}
        >
          <View style={styles.navRowLeft}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name="sync" size={18} color={Theme.colors.primary} />
            </View>
            <Text style={styles.navRowLabel}>Go To Sync Page</Text>
          </View>
          <View style={styles.navRowRight}>
            <Text style={styles.navRowHint}>Sync data</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* ─────────────────────────────────────────
            SECTION 4 — Enable Device Path Option
        ───────────────────────────────────────── */}
        <AccordionCard
          label="Update Recording Path"
          icon="folder-cog-outline"
          isOpen={openSection === 'recordingPath'}
          onToggle={() => {
            toggleSection('recordingPath');
            setPathDropdownOpen(false);
          }}
        >
          <Text style={styles.accordionBodyText}>
            Set the device folder where call recordings will be saved.
          </Text>

          {/* Path dropdown selector */}
          <Text style={styles.fieldLabel}>Recording Path</Text>
          <TouchableOpacity
            style={styles.selectorField}
            onPress={() => setPathDropdownOpen(p => !p)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="folder-outline" size={18} color={Theme.colors.primary} />
            <Text style={[styles.selectorFieldText, !selectedPath && styles.selectorPlaceholder]}>
              {selectedPath ? selectedPath.label : 'Select a storage path…'}
            </Text>
            <MaterialCommunityIcons
              name={pathDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#9CA3AF"
            />
          </TouchableOpacity>

          {/* Inline path list */}
          {pathDropdownOpen && (
            <View style={styles.pathDropdownContainer}>
              {/* Search field */}
              <View style={styles.searchRow}>
                <MaterialCommunityIcons name="magnify" size={16} color="#9CA3AF" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search paths…"
                  placeholderTextColor="#9CA3AF"
                  value={pathSearch}
                  onChangeText={setPathSearch}
                  autoCorrect={false}
                />
                {pathSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setPathSearch('')}>
                    <MaterialCommunityIcons name="close-circle" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
              <Divider style={styles.pathSearchDivider} />

              {filteredPaths.map((item, index) => (
                <View key={item.id}>
                  <TouchableOpacity
                    style={[
                      styles.pathItem,
                      selectedPath?.id === item.id && styles.pathItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedPath(item);
                      setPathDropdownOpen(false);
                      setPathSearch('');
                      setPathUpdateDone(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="folder"
                      size={16}
                      color={selectedPath?.id === item.id ? Theme.colors.primary : '#9CA3AF'}
                    />
                    <View style={styles.pathItemTexts}>
                      <Text
                        style={[
                          styles.pathItemLabel,
                          selectedPath?.id === item.id && styles.pathItemLabelSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text style={styles.pathItemSub}>{item.path}</Text>
                    </View>
                    {selectedPath?.id === item.id && (
                      <MaterialCommunityIcons name="check" size={16} color={Theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                  {index < filteredPaths.length - 1 && (
                    <Divider style={styles.pathItemDivider} />
                  )}
                </View>
              ))}

              {filteredPaths.length === 0 && (
                <Text style={styles.emptySearchText}>No paths match your search.</Text>
              )}
            </View>
          )}

          {/* Selected path preview */}
          {selectedPath && !pathDropdownOpen && (
            <View style={styles.selectedPathPreview}>
              <MaterialCommunityIcons name="folder-check" size={14} color="#16A34A" />
              <Text style={styles.selectedPathPreviewText} numberOfLines={1}>
                {selectedPath.path}
              </Text>
            </View>
          )}

          {pathUpdateDone && (
            <View style={styles.successBanner}>
              <MaterialCommunityIcons name="check-circle-outline" size={16} color="#16A34A" />
              <Text style={styles.successText}>Recording path updated successfully.</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (!selectedPath || isUpdatingPath) && styles.primaryBtnDisabled,
            ]}
            onPress={handleUpdatePath}
            activeOpacity={0.8}
            disabled={!selectedPath || isUpdatingPath}
          >
            <MaterialCommunityIcons
              name={isUpdatingPath ? 'loading' : 'folder-edit-outline'}
              size={16}
              color="#FFF"
            />
            <Text style={styles.primaryBtnText}>
              {isUpdatingPath ? 'Updating…' : 'Update Path'}
            </Text>
          </TouchableOpacity>
        </AccordionCard>

        {/* ─────────────────────────────────────────
            SECTION 5 — Blacklisted Contacts
        ───────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.blacklistBtn}
          onPress={() => {}}
          activeOpacity={0.8}
        >
          <View style={styles.navRowLeft}>
            <View style={[styles.iconBox, styles.iconBoxBlack]}>
              <MaterialCommunityIcons name="account-cancel-outline" size={18} color="#000" />
            </View>
            <Text style={styles.blacklistBtnText}>Blacklisted Contacts</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#6B7280" />
        </TouchableOpacity>

        {/* App version footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>EXTRAAEDGE CRM v1.0.32</Text>
          <Text style={styles.footerSubText}>© 2026 Education Admissions CRM</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F5F7',
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
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.2,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Page chip
  pageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 16,
  },
  pageChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Nav row card (Section 3)
  navRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  navRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  navRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navRowLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  navRowHint: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // Shared icon box
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFF1F1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  iconBoxBlack: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },

  // Accordion body text
  accordionBodyText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '400',
  },

  // Field label
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // Date field
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  dateFieldText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  // Selector field
  selectorField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  selectorFieldText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  selectorPlaceholder: {
    color: '#9CA3AF',
    fontWeight: '400',
  },

  // Path dropdown
  pathDropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    padding: 0,
    height: 20,
  },
  pathSearchDivider: {
    backgroundColor: '#F3F4F6',
    height: 1,
  },
  pathItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pathItemSelected: {
    backgroundColor: '#FFF5F5',
  },
  pathItemTexts: {
    flex: 1,
    gap: 2,
  },
  pathItemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  pathItemLabelSelected: {
    color: Theme.colors.primary,
  },
  pathItemSub: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  pathItemDivider: {
    backgroundColor: '#F9FAFB',
    height: 1,
  },
  emptySearchText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },

  // Selected path preview
  selectedPathPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  selectedPathPreviewText: {
    flex: 1,
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '500',
  },

  // Success banner
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  successText: {
    fontSize: 13,
    color: '#16A34A',
    fontWeight: '600',
    flex: 1,
  },

  // Primary action button (red)
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
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
  primaryBtnDisabled: {
    backgroundColor: '#FECACA',
    ...Platform.select({
      ios: { shadowOpacity: 0 },
      android: { elevation: 0 },
    }),
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Blacklisted contacts button (Section 5)
  blacklistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  blacklistBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700',
    letterSpacing: 1,
  },
  footerSubText: {
    fontSize: 10,
    color: '#D1D5DB',
    marginTop: 4,
    fontWeight: '400',
  },
});
