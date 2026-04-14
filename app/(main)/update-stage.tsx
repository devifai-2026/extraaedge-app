import { Theme } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Appbar,
  Divider,
  List,
  Modal,
  Portal,
  Searchbar,
  Text,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Options ─────────────────────────────────────────────────────────────────

const STAGE_OPTIONS = [
  '08 Visit Scheduled',
  '09 Visited',
  '10 Enrolled',
  '11 Junk',
  '12 Cold',
];

const LEAD_REASON_OPTIONS = [
  'Attend Demo',
  'Not Interested',
  'Status Pending',
  'Will Attend Demo',
  'Will Join Later',
  'Will Join Soon',
];


// ─── SelectModal ─────────────────────────────────────────────────────────────

interface SelectModalProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

function SelectModal({
  visible, onDismiss, title, options, selected, onSelect,
}: SelectModalProps) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!visible) setSearch('');
  }, [visible]);

  const filtered = useMemo(
    () => options.filter(o => o.toLowerCase().includes(search.toLowerCase())),
    [options, search],
  );

  const handleSelect = (value: string) => {
    onSelect(value);
    onDismiss();
  };

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
        <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
          {filtered.map(option => (
            <Pressable
              key={option}
              style={({ pressed }) => [
                styles.optionRow,
                selected === option && styles.optionRowSelected,
                pressed && styles.optionRowPressed,
              ]}
              android_ripple={{ color: 'rgba(229,57,53,0.07)' }}
              onPress={() => handleSelect(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  selected === option && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
              {selected === option && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={Theme.colors.primary}
                />
              )}
            </Pressable>
          ))}
          {filtered.length === 0 && (
            <Text style={styles.noResults}>No results found</Text>
          )}
        </ScrollView>
      </Modal>
    </Portal>
  );
}

// ─── Date format helpers ──────────────────────────────────────────────────────

function parseDate(s: string): Date {
  if (!s) return new Date();
  const [d, m, y] = s.split('/');
  if (!d || !m || !y) return new Date();
  return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
}

function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

// ─── DatePickerModal ──────────────────────────────────────────────────────────

interface DatePickerModalProps {
  visible: boolean;
  onDismiss: () => void;
  selectedDate: string; // "DD/MM/YYYY"
  onSelectDate: (dateStr: string) => void;
}

function DatePickerModal({ visible, onDismiss, selectedDate, onSelectDate }: DatePickerModalProps) {
  const insets = useSafeAreaInsets();
  const [tempDate, setTempDate] = useState<Date>(() => parseDate(selectedDate));

  useEffect(() => {
    if (visible) setTempDate(parseDate(selectedDate));
  }, [visible]);

  // ── Android: native dialog ──
  if (Platform.OS === 'android') {
    if (!visible) return null;
    return (
      <DateTimePicker
        value={parseDate(selectedDate)}
        mode="date"
        display="default"
        onChange={(event: DateTimePickerEvent, date?: Date) => {
          onDismiss();
          if (event.type === 'set' && date) onSelectDate(formatDate(date));
        }}
      />
    );
  }

  // ── iOS: inline picker in bottom sheet ──
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.bottomSheet, { paddingBottom: insets.bottom + 8 }]}
      >
        <View style={styles.dragHandle} />

        <View style={styles.pickerHeaderRow}>
          <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.pickerCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.sheetTitle}>Select Date</Text>
          <TouchableOpacity
            onPress={() => { onSelectDate(formatDate(tempDate)); onDismiss(); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.pickerDoneText}>Done</Text>
          </TouchableOpacity>
        </View>

        <Divider style={{ backgroundColor: '#F0F0F0' }} />

        <DateTimePicker
          value={tempDate}
          mode="date"
          display="inline"
          onChange={(_event: DateTimePickerEvent, date?: Date) => {
            if (date) setTempDate(date);
          }}
          accentColor={Theme.colors.primary}
          themeVariant="light"
          style={styles.pickerWidget}
        />
      </Modal>
    </Portal>
  );
}

// ─── UpdateStageScreen ────────────────────────────────────────────────────────

interface FormErrors {
  stage?: string;
  reason?: string;
  date?: string;
}

export default function UpdateStageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const lead = useMemo(() => {
    try {
      return params.leadData ? JSON.parse(params.leadData as string) : null;
    } catch {
      return null;
    }
  }, [params.leadData]);

  const [stage, setStage] = useState('09 Visited');
  const [leadReason, setLeadReason] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const [stageModalVisible, setStageModalVisible] = useState(false);
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!stage) newErrors.stage = 'Stage is required';
    if (!leadReason) newErrors.reason = 'Lead reason is required';
    if (!followupDate) newErrors.date = 'Followup date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = () => {
    if (validate()) {
      // TODO: dispatch API call
      console.log('Update Stage Payload:', { stage, leadReason, followupDate, remarks });
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction
          onPress={() => router.back()}
          color="#000000"
        />
        <Appbar.Content title="Update Stage" titleStyle={styles.headerTitle} />
        <TouchableOpacity
          style={styles.headerActionPill}
          onPress={handleUpdate}
          activeOpacity={0.8}
        >
          <Text style={styles.headerActionText}>Update</Text>
        </TouchableOpacity>
      </Appbar.Header>



      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── SECTION 1 : Stage ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionLabel}>Stage Information</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Stage <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.selectField, errors.stage && styles.fieldError]}
                onPress={() => {
                  setErrors(e => ({ ...e, stage: undefined }));
                  setStageModalVisible(true);
                }}
                activeOpacity={0.75}
              >
                <Text style={[styles.selectText, !stage && styles.placeholderText]}>
                  {stage || 'Select Stage'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={22} color="#9E9E9E" />
              </TouchableOpacity>
              {errors.stage && <Text style={styles.errorText}>{errors.stage}</Text>}
            </View>

            {/* ── SECTION 2 : Lead Reason ── */}
            <View style={[styles.fieldGroup, { marginBottom: 0 }]}>
              <Text style={styles.fieldLabel}>
                Select Lead Reason <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.selectField, errors.reason && styles.fieldError]}
                onPress={() => {
                  setErrors(e => ({ ...e, reason: undefined }));
                  setReasonModalVisible(true);
                }}
                activeOpacity={0.75}
              >
                <Text style={[styles.selectText, !leadReason && styles.placeholderText]}>
                  {leadReason || 'Select Lead Reason'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={22} color="#9E9E9E" />
              </TouchableOpacity>
              {errors.reason && <Text style={styles.errorText}>{errors.reason}</Text>}
            </View>
          </View>

          {/* ── SECTION 3 : Follow-up Date ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionLabel}>Followup Details</Text>
            </View>

            <View style={[styles.fieldGroup, { marginBottom: 0 }]}>
              <Text style={styles.fieldLabel}>
                Followup Date <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.selectField, errors.date && styles.fieldError]}
                onPress={() => {
                  setErrors(e => ({ ...e, date: undefined }));
                  setDateModalVisible(true);
                }}
                activeOpacity={0.75}
              >
                <Text style={[styles.selectText, !followupDate && styles.placeholderText]}>
                  {followupDate || 'DD/MM/YYYY'}
                </Text>
                <MaterialCommunityIcons name="calendar-outline" size={22} color="#9E9E9E" />
              </TouchableOpacity>
              {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
            </View>
          </View>

          {/* ── SECTION 4 : Remarks ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionLabel}>Additional Notes</Text>
            </View>

            <View style={[styles.fieldGroup, { marginBottom: 0 }]}>
              <Text style={styles.fieldLabel}>Remarks</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={5}
                placeholder="Enter remarks here..."
                placeholderTextColor="#BDBDBD"
                value={remarks}
                onChangeText={setRemarks}
                textAlignVertical="top"
              />
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Modals ── */}
      <SelectModal
        visible={stageModalVisible}
        onDismiss={() => setStageModalVisible(false)}
        title="Select Stage"
        options={STAGE_OPTIONS}
        selected={stage}
        onSelect={setStage}
      />
      <SelectModal
        visible={reasonModalVisible}
        onDismiss={() => setReasonModalVisible(false)}
        title="Select Lead Reason"
        options={LEAD_REASON_OPTIONS}
        selected={leadReason}
        onSelect={setLeadReason}
      />
      <DatePickerModal
        visible={dateModalVisible}
        onDismiss={() => setDateModalVisible(false)}
        selectedDate={followupDate}
        onSelectDate={(dateStr) => {
          setFollowupDate(dateStr);
          setDateModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header ──
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
  headerActionPill: {
    backgroundColor: '#FEECEB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },

  // ── Section Card ──
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: '#F1F3F4',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: Theme.colors.primary,
    marginRight: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },

  // ── Field ──
  fieldGroup: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 6,
    marginLeft: 2,
  },
  required: {
    color: Theme.colors.primary,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8EAED',
    paddingHorizontal: 14,
    height: 52,
  },
  fieldError: {
    borderColor: Theme.colors.primary,
    backgroundColor: 'rgba(229,57,53,0.03)',
  },
  selectText: {
    flex: 1,
    fontSize: 15,
    color: '#111111',
    marginRight: 8,
  },
  placeholderText: {
    color: '#BDBDBD',
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
    fontSize: 12,
    color: Theme.colors.primary,
    fontWeight: '500',
  },
  textArea: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8EAED',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111111',
    minHeight: 100,
  },

  // ── Bottom Sheet ──
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 16 },
    }),
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.2,
  },
  sheetSearchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sheetSearchbar: {
    borderRadius: 12,
    backgroundColor: '#F5F6F8',
    elevation: 0,
    height: 46,
  },
  sheetSearchInput: {
    fontSize: 14,
  },
  sheetList: {
    maxHeight: 340,
  },

  // ── Option Row ──
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionRowSelected: {
    backgroundColor: 'rgba(229,57,53,0.06)',
  },
  optionRowPressed: {
    backgroundColor: 'rgba(229,57,53,0.04)',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
    flex: 1,
  },
  optionTextSelected: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  noResults: {
    textAlign: 'center',
    color: '#9E9E9E',
    fontSize: 14,
    paddingVertical: 24,
  },

  // ── Date Picker ──
  pickerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  pickerCancelText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#757575',
  },
  pickerDoneText: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  pickerWidget: {
    marginHorizontal: 8,
  },
});
