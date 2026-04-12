import { Theme } from '@/constants/theme';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Appbar,
  Checkbox,
  Divider,
  Modal,
  Portal,
  Searchbar,
  Text,
} from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Static Data ─────────────────────────────────────────────────────────────

const SORT_BY_OPTIONS = ['Created On', 'Modified On', 'Next Action Date', 'Lead Score'];

const SAVED_FILTERS = [
  'Recent Leads',
  'Demo Attended Leads',
  'Hot Prospects',
  'New Leads Today',
];

const COUNSELOR_OPTIONS = ['Divya Nair', 'Sayan Pal'];

const STAGE_OPTIONS = [
  '05 Engaged Leads',
  '01 New',
  '06 Prospect',
  '07 Demo Attended',
  '09 Visited',
];

const SUB_STAGE_OPTIONS = [
  'Enquired For Different Course',
  'Not Called',
  'Not Responding',
  'Attended Demo',
  'Will Attend Demo',
];

const CAMPAIGN_OPTIONS = [
  'Not Known',
  'Mobile Add Lead',
  'Web Add Lead',
  'Bulk Upload',
  'Mobile Smart Caller Quick Add',
];

const CHANNEL_OPTIONS = ['Offline', 'Referral', 'Online'];

const SOURCE_OPTIONS = [
  'Raw Database',
  'Direct Walkin',
  'School Presentation',
  'Test Centre',
  'Seminar',
];

const MEDIUM_OPTIONS = [
  'Website',
  'Landing Page',
  'Advertisement',
  'Referral Campaign',
  'Social Media Post',
  'Email Campaign',
  'SMS Campaign',
];

const PROGRAM_OPTIONS = [
  'MERN Stack Training and Certification',
  'Python Full Stack Training and Certification',
  'Data Science Training and Certification',
  'Data Analyst Training and Certification',
  'Yet To Decide',
];

const REFERRED_FROM_OPTIONS = [
  'Website',
  'Facebook',
  'Google Ads',
  'Friend Reference',
  'Instagram',
  'LinkedIn',
  'YouTube',
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const INDIAN_CITIES = [
  'Delhi', 'Mumbai', 'Kolkata', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune',
  'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore',
  'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ludhiana',
  'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi',
  'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad',
  'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur',
  'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur',
];

const RESPONSE_OPTIONS = [
  'Interested',
  'Not Interested',
  'Call Later',
  'Busy',
  'Switched Off',
  'Not Reachable',
  'Wrong Number',
  'Will Think',
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface FilterState {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  savedFilter: string;
  counselor: string[];
  stage: string[];
  subStage: string[];
  campaign: string[];
  channel: string[];
  source: string[];
  medium: string[];
  program: string[];
  referredFrom: string[];
  state: string[];
  city: string[];
  response: string[];
  applicantName: string;
  emailId: string;
  whatsappNumber: string;
  fromAddedOn: Date | null;
  toAddedOn: Date | null;
  fromUpdatedOn: Date | null;
  toUpdatedOn: Date | null;
  fromReferredToUpdated: Date | null;
  fromAutomatedUpdate: Date | null;
  toAutomatedUpdate: Date | null;
  fromFollowupScheduled: Date | null;
  toFollowupScheduled: Date | null;
  reEnquiredFrom: Date | null;
  reEnquiredTo: Date | null;
}

// ─── Single Select Bottom Sheet ───────────────────────────────────────────────

interface SingleSelectModalProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

function SingleSelectModal({
  visible, onDismiss, title, options, selected, onSelect,
}: SingleSelectModalProps) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  useEffect(() => { if (!visible) setSearch(''); }, [visible]);

  const filtered = useMemo(
    () => options.filter(o => o.toLowerCase().includes(search.toLowerCase())),
    [options, search],
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.bottomSheet, { paddingBottom: insets.bottom + 16 }]}
      >
        <View style={styles.dragHandle} />
        <Text style={styles.sheetTitle}>{title}</Text>
        <Divider />
        <View style={styles.sheetSearchWrap}>
          <Searchbar
            placeholder="Search..."
            value={search}
            onChangeText={setSearch}
            style={styles.sheetSearchbar}
            inputStyle={styles.sheetSearchInput}
            iconColor={Theme.colors.primary}
          />
        </View>
        <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {filtered.map(option => {
            const isSelected = selected === option;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.sheetRow, isSelected && styles.sheetRowSelected]}
                onPress={() => { onSelect(option); onDismiss(); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.sheetRowText, isSelected && styles.sheetRowTextSelected]}>
                  {option}
                </Text>
                {isSelected && (
                  <MaterialCommunityIcons name="check-circle" size={20} color={Theme.colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
          {filtered.length === 0 && (
            <Text style={styles.noResultsText}>No results found</Text>
          )}
        </ScrollView>
      </Modal>
    </Portal>
  );
}

// ─── Multi Select Bottom Sheet ────────────────────────────────────────────────

interface MultiSelectModalProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  options: string[];
  selected: string[];
  onConfirm: (values: string[]) => void;
}

function MultiSelectModal({
  visible, onDismiss, title, options, selected, onConfirm,
}: MultiSelectModalProps) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [localSelected, setLocalSelected] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setLocalSelected([...selected]);
      setSearch('');
    }
  }, [visible, selected]);

  const filtered = useMemo(
    () => options.filter(o => o.toLowerCase().includes(search.toLowerCase())),
    [options, search],
  );

  const toggle = useCallback((item: string) => {
    setLocalSelected(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item],
    );
  }, []);

  const handleConfirm = () => {
    onConfirm(localSelected);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.bottomSheet, { paddingBottom: insets.bottom + 8 }]}
      >
        <View style={styles.dragHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          {localSelected.length > 0 && (
            <TouchableOpacity onPress={() => setLocalSelected([])}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        <Divider />
        <View style={styles.sheetSearchWrap}>
          <Searchbar
            placeholder="Search..."
            value={search}
            onChangeText={setSearch}
            style={styles.sheetSearchbar}
            inputStyle={styles.sheetSearchInput}
            iconColor={Theme.colors.primary}
          />
        </View>
        <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {filtered.map(option => {
            const isChecked = localSelected.includes(option);
            return (
              <TouchableOpacity
                key={option}
                style={styles.checkRow}
                onPress={() => toggle(option)}
                activeOpacity={0.7}
              >
                <Checkbox
                  status={isChecked ? 'checked' : 'unchecked'}
                  color={Theme.colors.primary}
                  onPress={() => toggle(option)}
                />
                <Text style={styles.checkRowText}>{option}</Text>
              </TouchableOpacity>
            );
          })}
          {filtered.length === 0 && (
            <Text style={styles.noResultsText}>No results found</Text>
          )}
        </ScrollView>
        <View style={styles.sheetActions}>
          <TouchableOpacity style={styles.sheetCancelBtn} onPress={onDismiss}>
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetDoneBtn} onPress={handleConfirm}>
            <Text style={styles.sheetDoneText}>
              Done {localSelected.length > 0 ? `(${localSelected.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </Portal>
  );
}

// ─── Date Picker Modal ────────────────────────────────────────────────────────

interface DatePickerModalProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  selected: Date | null;
  onSelect: (date: Date) => void;
}

function DatePickerModal({ visible, onDismiss, title, selected, onSelect }: DatePickerModalProps) {
  const insets = useSafeAreaInsets();

  const handleChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      onDismiss();
    }
    if (date) {
      onSelect(date);
      if (Platform.OS === 'android') onDismiss();
    }
  };

  if (!visible) return null;

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={selected ?? new Date()}
        mode="date"
        display="default"
        onChange={handleChange}
      />
    );
  }

  // iOS — show inside a bottom sheet modal
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.bottomSheet, { paddingBottom: insets.bottom + 16 }]}
      >
        <View style={styles.dragHandle} />
        <Text style={styles.sheetTitle}>{title}</Text>
        <Divider />
        <DateTimePicker
          value={selected ?? new Date()}
          mode="date"
          display="inline"
          onChange={handleChange}
          style={{ alignSelf: 'center', marginVertical: 8 }}
        />
        <View style={styles.sheetActions}>
          <TouchableOpacity style={styles.sheetCancelBtn} onPress={() => { onSelect(null as any); onDismiss(); }}>
            <Text style={styles.sheetCancelText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetDoneBtn} onPress={onDismiss}>
            <Text style={styles.sheetDoneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </Portal>
  );
}

// ─── Chip Row ────────────────────────────────────────────────────────────────

function ChipRow({ items, onRemove }: { items: string[]; onRemove: (item: string) => void }) {
  if (items.length === 0) return null;
  return (
    <View style={styles.chipRow}>
      {items.map(item => (
        <View key={item} style={styles.chip}>
          <Text style={styles.chipText} numberOfLines={1}>{item}</Text>
          <TouchableOpacity onPress={() => onRemove(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialCommunityIcons name="close-circle" size={16} color={Theme.colors.primary} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

// ─── Multi-Select Field ───────────────────────────────────────────────────────

interface MultiSelectFieldProps {
  label: string;
  placeholder?: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}

function MultiSelectField({ label, placeholder = 'Select...', options, selected, onChange }: MultiSelectFieldProps) {
  const [open, setOpen] = useState(false);

  const removeItem = (item: string) => onChange(selected.filter(x => x !== item));

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownBtn, selected.length > 0 && styles.dropdownBtnActive]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={selected.length === 0 ? styles.dropdownPlaceholder : styles.dropdownValue} numberOfLines={1}>
          {selected.length === 0 ? placeholder : `${selected.length} selected`}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color={selected.length > 0 ? Theme.colors.primary : Theme.colors.text.secondary}
        />
      </TouchableOpacity>
      <ChipRow items={selected} onRemove={removeItem} />
      <MultiSelectModal
        visible={open}
        onDismiss={() => setOpen(false)}
        title={label}
        options={options}
        selected={selected}
        onConfirm={onChange}
      />
    </View>
  );
}

// ─── Single-Select Field ──────────────────────────────────────────────────────

interface SingleSelectFieldProps {
  label: string;
  placeholder?: string;
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

function SingleSelectField({ label, placeholder = 'Select...', options, selected, onChange }: SingleSelectFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownBtn, !!selected && styles.dropdownBtnActive]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={!selected ? styles.dropdownPlaceholder : styles.dropdownValue} numberOfLines={1}>
          {selected || placeholder}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color={selected ? Theme.colors.primary : Theme.colors.text.secondary}
        />
      </TouchableOpacity>
      <SingleSelectModal
        visible={open}
        onDismiss={() => setOpen(false)}
        title={label}
        options={options}
        selected={selected}
        onSelect={onChange}
      />
    </View>
  );
}

// ─── Date Field ───────────────────────────────────────────────────────────────

function formatDate(date: Date | null): string {
  if (!date) return '';
  return `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
}

interface DateFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
}

function DateField({ label, value, onChange }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownBtn, !!value && styles.dropdownBtnActive]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={!value ? styles.dropdownPlaceholder : styles.dropdownValue}>
          {value ? formatDate(value) : 'DD / MM / YYYY'}
        </Text>
        <MaterialCommunityIcons
          name="calendar"
          size={20}
          color={value ? Theme.colors.primary : Theme.colors.text.secondary}
        />
      </TouchableOpacity>
      <DatePickerModal
        visible={open}
        onDismiss={() => setOpen(false)}
        title={label}
        selected={value}
        onSelect={date => { onChange(date || null); setOpen(false); }}
      />
    </View>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionTitleBar} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SortFilterLeadsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [filters, setFilters] = useState<FilterState>({
    sortBy: '',
    sortOrder: 'desc',
    savedFilter: '',
    counselor: [],
    stage: [],
    subStage: [],
    campaign: [],
    channel: [],
    source: [],
    medium: [],
    program: [],
    referredFrom: [],
    state: [],
    city: [],
    response: [],
    applicantName: '',
    emailId: '',
    whatsappNumber: '',
    fromAddedOn: null,
    toAddedOn: null,
    fromUpdatedOn: null,
    toUpdatedOn: null,
    fromReferredToUpdated: null,
    fromAutomatedUpdate: null,
    toAutomatedUpdate: null,
    fromFollowupScheduled: null,
    toFollowupScheduled: null,
    reEnquiredFrom: null,
    reEnquiredTo: null,
  });

  const setField = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const setMulti = (key: keyof FilterState) => (values: string[]) =>
    setField(key, values as any);

  const handleApply = () => {
    // Apply filters and navigate back
    router.back();
  };

  const handleReset = () => {
    setFilters({
      sortBy: '',
      sortOrder: 'desc',
      savedFilter: '',
      counselor: [],
      stage: [],
      subStage: [],
      campaign: [],
      channel: [],
      source: [],
      medium: [],
      program: [],
      referredFrom: [],
      state: [],
      city: [],
      response: [],
      applicantName: '',
      emailId: '',
      whatsappNumber: '',
      fromAddedOn: null,
      toAddedOn: null,
      fromUpdatedOn: null,
      toUpdatedOn: null,
      fromReferredToUpdated: null,
      fromAutomatedUpdate: null,
      toAutomatedUpdate: null,
      fromFollowupScheduled: null,
      toFollowupScheduled: null,
      reEnquiredFrom: null,
      reEnquiredTo: null,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Portal.Host>
        {/* ── Top Navigation Bar ─────────────────────────────────── */}
        <Appbar.Header style={styles.appbar} statusBarHeight={0}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={Theme.colors.secondary} />
          </TouchableOpacity>
          <Appbar.Content
            title="Sort / Filter"
            titleStyle={styles.appbarTitle}
          />
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>
        </Appbar.Header>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── SECTION 1: Sort ─────────────────────────────────── */}
            <SectionCard title="Sort By">
              <SingleSelectField
                label="Sort By"
                placeholder="Select sort criteria..."
                options={SORT_BY_OPTIONS}
                selected={filters.sortBy}
                onChange={v => setField('sortBy', v)}
              />

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Sort Order</Text>
                <View style={styles.radioGroup}>
                  {(['asc', 'desc'] as const).map((order, idx) => {
                    const label = order === 'asc' ? 'Ascending' : 'Descending';
                    const icon = order === 'asc' ? 'sort-ascending' : 'sort-descending';
                    const isActive = filters.sortOrder === order;
                    return (
                      <TouchableOpacity
                        key={order}
                        style={[styles.radioOption, isActive && styles.radioOptionActive, idx === 0 && { marginRight: 10 }]}
                        onPress={() => setField('sortOrder', order)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.radioCircle, isActive && styles.radioCircleActive]}>
                          {isActive && <View style={styles.radioInner} />}
                        </View>
                        <MaterialCommunityIcons
                          name={icon}
                          size={16}
                          color={isActive ? Theme.colors.primary : Theme.colors.text.secondary}
                          style={{ marginLeft: 6 }}
                        />
                        <Text style={[styles.radioLabel, isActive && styles.radioLabelActive]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </SectionCard>

            {/* ── SECTION 2: Saved Filter ─────────────────────────── */}
            <SectionCard title="Filter Leads">
              <SingleSelectField
                label="Load Saved Filter"
                placeholder="Select saved filter..."
                options={SAVED_FILTERS}
                selected={filters.savedFilter}
                onChange={v => setField('savedFilter', v)}
              />
            </SectionCard>

            {/* ── SECTION 3: Filter By (multi-select) ─────────────── */}
            <SectionCard title="Filter By">
              <MultiSelectField
                label="Select Counselor Referred To"
                placeholder="Select counselors..."
                options={COUNSELOR_OPTIONS}
                selected={filters.counselor}
                onChange={setMulti('counselor')}
              />
              <MultiSelectField
                label="Stage"
                placeholder="Select stages..."
                options={STAGE_OPTIONS}
                selected={filters.stage}
                onChange={setMulti('stage')}
              />
              <MultiSelectField
                label="Sub Stage"
                placeholder="Select sub-stages..."
                options={SUB_STAGE_OPTIONS}
                selected={filters.subStage}
                onChange={setMulti('subStage')}
              />
              <MultiSelectField
                label="Campaign"
                placeholder="Select campaigns..."
                options={CAMPAIGN_OPTIONS}
                selected={filters.campaign}
                onChange={setMulti('campaign')}
              />
              <MultiSelectField
                label="Channel"
                placeholder="Select channels..."
                options={CHANNEL_OPTIONS}
                selected={filters.channel}
                onChange={setMulti('channel')}
              />
              <MultiSelectField
                label="Source"
                placeholder="Select sources..."
                options={SOURCE_OPTIONS}
                selected={filters.source}
                onChange={setMulti('source')}
              />
              <MultiSelectField
                label="Medium"
                placeholder="Select mediums..."
                options={MEDIUM_OPTIONS}
                selected={filters.medium}
                onChange={setMulti('medium')}
              />
              <MultiSelectField
                label="Program"
                placeholder="Select programs..."
                options={PROGRAM_OPTIONS}
                selected={filters.program}
                onChange={setMulti('program')}
              />
              <MultiSelectField
                label="Referred From"
                placeholder="Select referred from..."
                options={REFERRED_FROM_OPTIONS}
                selected={filters.referredFrom}
                onChange={setMulti('referredFrom')}
              />
              <MultiSelectField
                label="State"
                placeholder="Select states..."
                options={INDIAN_STATES}
                selected={filters.state}
                onChange={setMulti('state')}
              />
              <MultiSelectField
                label="City"
                placeholder="Select cities..."
                options={INDIAN_CITIES}
                selected={filters.city}
                onChange={setMulti('city')}
              />
              <MultiSelectField
                label="Select Response"
                placeholder="Select responses..."
                options={RESPONSE_OPTIONS}
                selected={filters.response}
                onChange={setMulti('response')}
              />
            </SectionCard>

            {/* ── SECTION 4: Text Input Filters ────────────────────── */}
            <SectionCard title="Search Filters">
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Applicant Name</Text>
                <View style={styles.textInputWrap}>
                  <MaterialCommunityIcons name="account-search" size={18} color={Theme.colors.text.secondary} style={styles.textInputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter applicant name..."
                    placeholderTextColor={Theme.colors.text.muted}
                    value={filters.applicantName}
                    onChangeText={v => setField('applicantName', v)}
                    autoCapitalize="words"
                  />
                  {!!filters.applicantName && (
                    <TouchableOpacity onPress={() => setField('applicantName', '')}>
                      <MaterialCommunityIcons name="close-circle" size={18} color={Theme.colors.text.secondary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Email ID</Text>
                <View style={styles.textInputWrap}>
                  <MaterialCommunityIcons name="email-outline" size={18} color={Theme.colors.text.secondary} style={styles.textInputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter email address..."
                    placeholderTextColor={Theme.colors.text.muted}
                    value={filters.emailId}
                    onChangeText={v => setField('emailId', v)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {!!filters.emailId && (
                    <TouchableOpacity onPress={() => setField('emailId', '')}>
                      <MaterialCommunityIcons name="close-circle" size={18} color={Theme.colors.text.secondary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>WhatsApp Number</Text>
                <View style={styles.textInputWrap}>
                  <MaterialCommunityIcons name="whatsapp" size={18} color={Theme.colors.text.secondary} style={styles.textInputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter WhatsApp number..."
                    placeholderTextColor={Theme.colors.text.muted}
                    value={filters.whatsappNumber}
                    onChangeText={v => setField('whatsappNumber', v.replace(/[^0-9]/g, ''))}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                  {!!filters.whatsappNumber && (
                    <TouchableOpacity onPress={() => setField('whatsappNumber', '')}>
                      <MaterialCommunityIcons name="close-circle" size={18} color={Theme.colors.text.secondary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </SectionCard>

            {/* ── SECTION 5: Date Range Filters ───────────────────── */}
            <SectionCard title="Date Range Filters">
              {/* Added On */}
              <View style={styles.dateRangeGroup}>
                <Text style={styles.dateGroupLabel}>Added On</Text>
                <View style={styles.dateRangeRow}>
                  <View style={styles.dateRangeCol}>
                    <DateField
                      label="From"
                      value={filters.fromAddedOn}
                      onChange={d => setField('fromAddedOn', d)}
                    />
                  </View>
                  <View style={styles.dateRangeSep}>
                    <Text style={styles.dateRangeSepText}>—</Text>
                  </View>
                  <View style={styles.dateRangeCol}>
                    <DateField
                      label="To"
                      value={filters.toAddedOn}
                      onChange={d => setField('toAddedOn', d)}
                    />
                  </View>
                </View>
              </View>

              {/* Updated On */}
              <View style={styles.dateRangeGroup}>
                <Text style={styles.dateGroupLabel}>Updated On</Text>
                <View style={styles.dateRangeRow}>
                  <View style={styles.dateRangeCol}>
                    <DateField
                      label="From"
                      value={filters.fromUpdatedOn}
                      onChange={d => setField('fromUpdatedOn', d)}
                    />
                  </View>
                  <View style={styles.dateRangeSep}>
                    <Text style={styles.dateRangeSepText}>—</Text>
                  </View>
                  <View style={styles.dateRangeCol}>
                    <DateField
                      label="To"
                      value={filters.toUpdatedOn}
                      onChange={d => setField('toUpdatedOn', d)}
                    />
                  </View>
                </View>
              </View>

              {/* Referred To Updated */}
              <View style={styles.dateRangeGroup}>
                <Text style={styles.dateGroupLabel}>Referred To Updated</Text>
                <View style={styles.dateRangeRow}>
                  <View style={[styles.dateRangeCol, { flex: 1 }]}>
                    <DateField
                      label="From Date"
                      value={filters.fromReferredToUpdated}
                      onChange={d => setField('fromReferredToUpdated', d)}
                    />
                  </View>
                </View>
              </View>

              {/* Automated Update */}
              <View style={styles.dateRangeGroup}>
                <Text style={styles.dateGroupLabel}>Automated Update</Text>
                <View style={styles.dateRangeRow}>
                  <View style={styles.dateRangeCol}>
                    <DateField
                      label="From"
                      value={filters.fromAutomatedUpdate}
                      onChange={d => setField('fromAutomatedUpdate', d)}
                    />
                  </View>
                  <View style={styles.dateRangeSep}>
                    <Text style={styles.dateRangeSepText}>—</Text>
                  </View>
                  <View style={styles.dateRangeCol}>
                    <DateField
                      label="To"
                      value={filters.toAutomatedUpdate}
                      onChange={d => setField('toAutomatedUpdate', d)}
                    />
                  </View>
                </View>
              </View>

              {/* Followup Scheduled */}
              <View style={styles.dateRangeGroup}>
                <Text style={styles.dateGroupLabel}>Followup Scheduled On</Text>
                <View style={styles.dateRangeRow}>
                  <View style={styles.dateRangeCol}>
                    <DateField
                      label="From"
                      value={filters.fromFollowupScheduled}
                      onChange={d => setField('fromFollowupScheduled', d)}
                    />
                  </View>
                  <View style={styles.dateRangeSep}>
                    <Text style={styles.dateRangeSepText}>—</Text>
                  </View>
                  <View style={styles.dateRangeCol}>
                    <DateField
                      label="To"
                      value={filters.toFollowupScheduled}
                      onChange={d => setField('toFollowupScheduled', d)}
                    />
                  </View>
                </View>
              </View>

              {/* Re-Enquired */}
              <View style={styles.dateRangeGroup}>
                <Text style={styles.dateGroupLabel}>Re-Enquired</Text>
                <View style={styles.dateRangeRow}>
                  <View style={styles.dateRangeCol}>
                    <DateField
                      label="From"
                      value={filters.reEnquiredFrom}
                      onChange={d => setField('reEnquiredFrom', d)}
                    />
                  </View>
                  <View style={styles.dateRangeSep}>
                    <Text style={styles.dateRangeSepText}>—</Text>
                  </View>
                  <View style={styles.dateRangeCol}>
                    <DateField
                      label="To"
                      value={filters.reEnquiredTo}
                      onChange={d => setField('reEnquiredTo', d)}
                    />
                  </View>
                </View>
              </View>
            </SectionCard>

            {/* ── Bottom Apply button ──────────────────────────────── */}
            <TouchableOpacity style={styles.bottomApplyBtn} onPress={handleApply} activeOpacity={0.85}>
              <MaterialCommunityIcons name="filter-check" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.bottomApplyText}>Apply Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Portal.Host>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },

  // ── AppBar
  appbar: {
    backgroundColor: Theme.colors.background,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingHorizontal: 4,
  },
  appbarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.secondary,
    letterSpacing: 0.2,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  resetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 4,
  },
  resetText: {
    fontSize: 13,
    color: Theme.colors.text.secondary,
    fontWeight: '500',
  },
  applyBtn: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.full,
    paddingHorizontal: 18,
    paddingVertical: 7,
    marginRight: 8,
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },

  // ── Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 12,
  },

  // ── Section Card
  sectionCard: {
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.radius.lg,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: Theme.colors.primary,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.secondary,
    letterSpacing: 0.2,
  },

  // ── Field
  fieldWrap: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.text.secondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // ── Dropdown Button
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: Theme.radius.md,
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
  },
  dropdownBtnActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: '#FFF5F5',
  },
  dropdownPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: Theme.colors.text.muted,
  },
  dropdownValue: {
    flex: 1,
    fontSize: 14,
    color: Theme.colors.secondary,
    fontWeight: '500',
  },

  // ── Chip
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: Theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    maxWidth: 200,
  },
  chipText: {
    fontSize: 12,
    color: Theme.colors.primary,
    fontWeight: '600',
    marginRight: 4,
    flexShrink: 1,
  },

  // ── Radio
  radioGroup: {
    flexDirection: 'row',
    marginTop: 4,
  },
  radioOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: Theme.radius.md,
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  radioOptionActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: '#FFF5F5',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: Theme.colors.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.primary,
  },
  radioLabel: {
    fontSize: 13,
    color: Theme.colors.text.secondary,
    fontWeight: '500',
    marginLeft: 6,
  },
  radioLabelActive: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },

  // ── Text Input
  textInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: Theme.radius.md,
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    paddingHorizontal: 12,
    minHeight: 48,
  },
  textInputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: Theme.colors.secondary,
    paddingVertical: 10,
  },

  // ── Date Range
  dateRangeGroup: {
    marginBottom: 14,
  },
  dateGroupLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.secondary,
    marginBottom: 8,
  },
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  dateRangeCol: {
    flex: 1,
  },
  dateRangeSep: {
    paddingHorizontal: 6,
    paddingBottom: 14,
  },
  dateRangeSepText: {
    fontSize: 16,
    color: Theme.colors.text.muted,
  },

  // ── Bottom Apply
  bottomApplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.lg,
    paddingVertical: 16,
    marginTop: 4,
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
  bottomApplyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // ── Bottom Sheet
  bottomSheet: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 'auto',
    maxHeight: '80%',
    paddingTop: 8,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#BDBDBD',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.secondary,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  clearAllText: {
    fontSize: 13,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  sheetSearchWrap: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sheetSearchbar: {
    backgroundColor: '#F5F5F5',
    borderRadius: Theme.radius.md,
    elevation: 0,
    height: 42,
  },
  sheetSearchInput: {
    fontSize: 14,
    minHeight: 0,
  },
  sheetList: {
    maxHeight: 300,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  sheetRowSelected: {
    backgroundColor: '#FFF5F5',
  },
  sheetRowText: {
    fontSize: 14,
    color: Theme.colors.secondary,
    flex: 1,
  },
  sheetRowTextSelected: {
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  checkRowText: {
    fontSize: 14,
    color: Theme.colors.secondary,
    marginLeft: 8,
    flex: 1,
  },
  noResultsText: {
    fontSize: 14,
    color: Theme.colors.text.muted,
    textAlign: 'center',
    paddingVertical: 24,
  },
  sheetActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  sheetCancelBtn: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: Theme.radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  sheetCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text.secondary,
  },
  sheetDoneBtn: {
    flex: 2,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  sheetDoneText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },

  // ── Calendar
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  calNavBtn: {
    padding: 4,
  },
  calHeaderCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  calMonthYearText: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.secondary,
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  calCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calCellSelected: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 999,
  },
  calDowText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.text.secondary,
  },
  calDayText: {
    fontSize: 13,
    color: Theme.colors.secondary,
    fontWeight: '500',
  },
  calDayTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  monthCell: {
    width: '33.33%',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Theme.radius.md,
    marginBottom: 4,
  },
  monthCellText: {
    fontSize: 13,
    color: Theme.colors.secondary,
    fontWeight: '500',
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  yearCell: {
    width: '25%',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Theme.radius.md,
    marginBottom: 4,
  },
  yearCellText: {
    fontSize: 13,
    color: Theme.colors.secondary,
    fontWeight: '500',
  },
  calClearBtn: {
    marginHorizontal: 16,
    marginTop: 4,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  calClearText: {
    fontSize: 13,
    color: Theme.colors.text.secondary,
    fontWeight: '500',
  },
});
