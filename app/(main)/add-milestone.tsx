import { Theme } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Appbar, Divider, Modal, Portal, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Date format helpers ───────────────────────────────────────────────────────

/** "DD/MM/YYYY" → Date object */
function parseDate(s: string): Date {
  if (!s) return new Date();
  const [d, m, y] = s.split('/');
  if (!d || !m || !y) return new Date();
  return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
}

/** Date object → "DD/MM/YYYY" */
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

  // Temp date used on iOS so we only commit when "Done" is pressed
  const [tempDate, setTempDate] = useState<Date>(() => parseDate(selectedDate));

  // Sync tempDate each time the modal opens
  useEffect(() => {
    if (visible) setTempDate(parseDate(selectedDate));
  }, [visible]);

  // ── Android: native dialog, no custom Modal needed ──
  if (Platform.OS === 'android') {
    if (!visible) return null;
    return (
      <DateTimePicker
        value={parseDate(selectedDate)}
        mode="date"
        display="default"
        onChange={(event: DateTimePickerEvent, date?: Date) => {
          onDismiss(); // always close first
          if (event.type === 'set' && date) onSelectDate(formatDate(date));
        }}
      />
    );
  }

  // ── iOS: inline picker inside a bottom sheet ──
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[calS.sheet, { paddingBottom: insets.bottom + 8 }]}
      >
        {/* Drag handle */}
        <View style={calS.dragHandleRow}>
          <View style={calS.dragHandle} />
        </View>

        {/* Header row: Cancel / Title / Done */}
        <View style={calS.headerRow}>
          <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={calS.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={calS.sheetTitle}>Select Date</Text>
          <TouchableOpacity
            onPress={() => { onSelectDate(formatDate(tempDate)); onDismiss(); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={calS.doneText}>Done</Text>
          </TouchableOpacity>
        </View>

        <Divider style={calS.divider} />

        <DateTimePicker
          value={tempDate}
          mode="date"
          display="inline"
          onChange={(_event: DateTimePickerEvent, date?: Date) => {
            if (date) setTempDate(date);
          }}
          accentColor={Theme.colors.primary}
          themeVariant="light"
          style={calS.picker}
        />
      </Modal>
    </Portal>
  );
}

// ─── AddMilestoneScreen ───────────────────────────────────────────────────────

interface FormErrors {
  date?: string;
  remarks?: string;
}

export default function AddMilestoneScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const lead = useMemo(() => {
    try { return params.leadData ? JSON.parse(params.leadData as string) : null; }
    catch { return null; }
  }, [params.leadData]);

  const [nextActionDate, setNextActionDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [dateModalVisible, setDateModalVisible] = useState(false);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!nextActionDate) e.date = 'Next action date is required';
    if (!remarks.trim()) e.remarks = 'Follow-up remarks are required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      console.log('Add Milestone Payload:', { leadId: lead?.id, nextActionDate, remarks });
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ─── Header ─── */}
      <Appbar.Header style={styles.header} elevated>
        <Appbar.BackAction
          onPress={() => router.back()}
          color={Theme.colors.secondary}
        />
        <Appbar.Content title="Add Milestone" titleStyle={styles.headerTitle} />
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.82}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </Appbar.Header>

      {/* ─── Lead name badge ─── */}
      {lead?.name && (
        <View style={styles.leadNameBar}>
          <View style={styles.leadAvatar}>
            <Text style={styles.leadAvatarText}>
              {lead.name.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.leadNameText} numberOfLines={1}>{lead.name}</Text>
            {lead.program && (
              <Text style={styles.leadSubText} numberOfLines={1}>{lead.program}</Text>
            )}
          </View>
          <View style={styles.leadBadge}>
            <MaterialCommunityIcons name="flag-variant" size={12} color={Theme.colors.primary} />
            <Text style={styles.leadBadgeText}>Milestone</Text>
          </View>
        </View>
      )}

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

          {/* ─── SECTION 1 : Next Action Date ─── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionLabel}>Schedule</Text>
            </View>

            <Text style={styles.fieldLabel}>
              Next Action Date <Text style={styles.required}>*</Text>
            </Text>

            <TouchableOpacity
              style={[styles.selectField, errors.date && styles.fieldError]}
              onPress={() => {
                setErrors(e => ({ ...e, date: undefined }));
                setDateModalVisible(true);
              }}
              activeOpacity={0.75}
            >
              <View style={styles.calIconWrap}>
                <MaterialCommunityIcons
                  name="calendar-month-outline"
                  size={20}
                  color={Theme.colors.primary}
                />
              </View>

              <Text style={[styles.selectText, !nextActionDate && styles.placeholderText]}>
                {nextActionDate || 'DD/MM/YYYY'}
              </Text>

              <MaterialCommunityIcons
                name="chevron-down"
                size={20}
                color={errors.date ? Theme.colors.primary : '#BDBDBD'}
              />
            </TouchableOpacity>

            {errors.date && (
              <View style={styles.errorRow}>
                <MaterialCommunityIcons name="alert-circle-outline" size={13} color={Theme.colors.primary} />
                <Text style={styles.errorText}>{errors.date}</Text>
              </View>
            )}
          </View>

          {/* ─── SECTION 2 : Follow-Up Remarks ─── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionLabel}>Follow-Up Notes</Text>
            </View>

            <Text style={styles.fieldLabel}>
              Follow-Up Remarks <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              style={[styles.textArea, errors.remarks && styles.textAreaError]}
              multiline
              numberOfLines={6}
              placeholder="Enter follow-up remarks here..."
              placeholderTextColor="#BDBDBD"
              value={remarks}
              onChangeText={t => {
                setRemarks(t);
                if (errors.remarks) setErrors(e => ({ ...e, remarks: undefined }));
              }}
              textAlignVertical="top"
            />

            {errors.remarks && (
              <View style={styles.errorRow}>
                <MaterialCommunityIcons name="alert-circle-outline" size={13} color={Theme.colors.primary} />
                <Text style={styles.errorText}>{errors.remarks}</Text>
              </View>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── Date Picker Modal ─── */}
      <DatePickerModal
        visible={dateModalVisible}
        onDismiss={() => setDateModalVisible(false)}
        selectedDate={nextActionDate}
        onSelectDate={dateStr => {
          setNextActionDate(dateStr);
          setDateModalVisible(false);
        }}
      />

    </SafeAreaView>
  );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },

  // ── Header ──
  header: {
    backgroundColor: '#FFFFFF',
    elevation: 4,
  },
  headerTitle: {
    fontWeight: '800',
    fontSize: 20,
    color: Theme.colors.secondary,
    letterSpacing: -0.3,
  },
  saveBtn: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 22,
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.42,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },

  // ── Lead Name Bar ──
  leadNameBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  leadAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  leadNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.secondary,
    letterSpacing: -0.2,
  },
  leadSubText: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '500',
    marginTop: 2,
  },
  leadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229,57,53,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  leadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.primary,
    letterSpacing: 0.2,
  },

  // ── Scroll ──
  scrollView: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 52,
    gap: 14,
  },

  // ── Section Card ──
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: Theme.colors.primary,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9E9E9E',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ── Fields ──
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 10,
  },
  required: {
    color: Theme.colors.primary,
    fontWeight: '800',
  },

  // Date picker field
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 52,
  },
  fieldError: {
    borderColor: Theme.colors.primary,
    backgroundColor: 'rgba(229,57,53,0.04)',
  },
  calIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(229,57,53,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
    marginRight: 8,
  },
  placeholderText: {
    color: '#BDBDBD',
    fontWeight: '500',
  },

  // Textarea
  textArea: {
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 15,
    color: '#111111',
    minHeight: 140,
    lineHeight: 22,
  },
  textAreaError: {
    borderColor: Theme.colors.primary,
    backgroundColor: 'rgba(229,57,53,0.04)',
  },

  // Error
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    gap: 5,
  },
  errorText: {
    fontSize: 12,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
});

// ─── Calendar Modal Styles ────────────────────────────────────────────────────

const calS = StyleSheet.create({
  sheet: {
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
        shadowOpacity: 0.12,
        shadowRadius: 14,
      },
      android: { elevation: 18 },
    }),
  },
  dragHandleRow: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.2,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#757575',
  },
  doneText: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  divider: {
    backgroundColor: '#F0F0F0',
  },
  picker: {
    marginHorizontal: 8,
  },
});
