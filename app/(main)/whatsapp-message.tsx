import { Theme } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
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
  Modal,
  Portal,
  Searchbar,
  Text,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Data ─────────────────────────────────────────────────────────────────────

const SENDER_IDS = [
  'BIM Consumption',
  'ExtraaEdge Main',
  'Admission Alerts',
  'Counselor Direct',
  'Institute Updates',
];

const WA_TEMPLATES = [
  'First Connect – WA Demo Config',
  'Welcome Message',
  'Follow Up Reminder',
  'Application Status Update',
  'Admission Confirmation',
];

type Mode = 'enterprise' | 'non-enterprise';

// ─── SelectModal ─────────────────────────────────────────────────────────────

interface SelectModalProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  searchPlaceholder: string;
}

function SelectModal({
  visible,
  onDismiss,
  title,
  options,
  selected,
  onSelect,
  searchPlaceholder,
}: SelectModalProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () =>
      query.trim()
        ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
        : options,
    [query, options]
  );

  const handleSelect = (value: string) => {
    onSelect(value);
    setQuery('');
    onDismiss();
  };

  const handleDismiss = () => {
    setQuery('');
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={[
          styles.bottomSheet,
          { paddingBottom: insets.bottom + 16 },
        ]}
      >
        <View style={styles.dragHandleRow}>
          <View style={styles.dragHandle} />
        </View>

        <Text style={styles.modalTitle}>{title}</Text>
        <Divider />

        <View style={styles.modalSearchWrap}>
          <Searchbar
            placeholder={searchPlaceholder}
            value={query}
            onChangeText={setQuery}
            style={styles.modalSearchBar}
            inputStyle={styles.modalSearchInput}
            iconColor={Theme.colors.primary}
            elevation={0}
          />
        </View>

        <ScrollView
          style={styles.modalList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filtered.length === 0 ? (
            <Text style={styles.emptyText}>No results found</Text>
          ) : (
            filtered.map((item) => {
              const isSelected = item === selected;
              return (
                <React.Fragment key={item}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.optionRow,
                      isSelected && styles.optionRowSelected,
                      pressed && styles.optionRowPressed,
                    ]}
                    android_ripple={{ color: 'rgba(229,57,53,0.08)' }}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={20}
                        color={Theme.colors.primary}
                      />
                    )}
                  </Pressable>
                  <Divider style={styles.optionDivider} />
                </React.Fragment>
              );
            })
          )}
        </ScrollView>
      </Modal>
    </Portal>
  );
}

// ─── RadioOption ──────────────────────────────────────────────────────────────

interface RadioOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function RadioOption({ label, selected, onPress }: RadioOptionProps) {
  return (
    <TouchableOpacity
      style={styles.radioRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function WhatsAppMessageScreen() {
  const router = useRouter();
  const { leadData } = useLocalSearchParams<{ leadData: string }>();

  const lead = useMemo(() => {
    try {
      return leadData ? JSON.parse(leadData) : null;
    } catch {
      return null;
    }
  }, [leadData]);

  // Mode toggle
  const [mode, setMode] = useState<Mode>('enterprise');

  // Enterprise-only fields
  const [senderId, setSenderId] = useState('');
  const [senderIdError, setSenderIdError] = useState(false);
  const [senderIdModalVisible, setSenderIdModalVisible] = useState(false);
  const [enterpriseNumber, setEnterpriseNumber] = useState('Father Number');

  // Non-enterprise-only fields
  const [nonEnterpriseNumber, setNonEnterpriseNumber] = useState('Primary Number');

  // Shared fields
  const [template, setTemplate] = useState('');
  const [templateError, setTemplateError] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [message, setMessage] = useState('');

  const leadName = lead?.name ?? 'Lead';

  const handleSend = () => {
    let valid = true;

    if (mode === 'enterprise' && !senderId.trim()) {
      setSenderIdError(true);
      valid = false;
    } else {
      setSenderIdError(false);
    }

    if (!template.trim()) {
      setTemplateError(true);
      valid = false;
    } else {
      setTemplateError(false);
    }

    if (!valid) return;

    console.log('Sending WhatsApp:', {
      mode,
      senderId: mode === 'enterprise' ? senderId : undefined,
      number: mode === 'enterprise' ? enterpriseNumber : nonEnterpriseNumber,
      template,
      message,
      lead: leadName,
    });

    router.back();
  };

  const enterpriseNumberOptions = [
    'Father Number',
    'Mother Number',
    'Alternative Number',
  ];

  const nonEnterpriseNumberOptions = [
    'Primary Number',
    "Father's Number",
    "Mother's Number",
    'Alternate Number',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Top Navigation Bar ─────────────────────────────────────── */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => router.back()} color="#000000" />
        <Appbar.Content title="WhatsApp Lead" titleStyle={styles.headerTitle} />
        <TouchableOpacity
          style={styles.headerActionPill}
          onPress={handleSend}
          activeOpacity={0.8}
        >
          <Text style={styles.headerActionText}>Send</Text>
        </TouchableOpacity>
      </Appbar.Header>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >


          {/* ── Section 1: Mode Toggle ────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Select Mode of Message</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segment,
                  mode === 'enterprise' && styles.segmentActive,
                ]}
                onPress={() => setMode('enterprise')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentText,
                    mode === 'enterprise' && styles.segmentTextActive,
                  ]}
                >
                  Enterprise
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segment,
                  mode === 'non-enterprise' && styles.segmentActive,
                ]}
                onPress={() => setMode('non-enterprise')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentText,
                    mode === 'non-enterprise' && styles.segmentTextActive,
                  ]}
                >
                  Non-Enterprise
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Enterprise: Section 2 – Select Sender ID ─────────────── */}
          {mode === 'enterprise' && (
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>
                Select Sender ID{' '}
                <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.dropdownField,
                  senderIdError && styles.dropdownFieldError,
                ]}
                onPress={() => {
                  setSenderIdError(false);
                  setSenderIdModalVisible(true);
                }}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.dropdownValue,
                    !senderId && styles.dropdownPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {senderId || 'Select sender ID...'}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={22}
                  color={senderIdError ? Theme.colors.primary : '#9E9E9E'}
                />
              </TouchableOpacity>
              {senderIdError && (
                <Text style={styles.errorText}>
                  Please select a sender ID.
                </Text>
              )}
            </View>
          )}

          {/* ── Enterprise: Section 3 – Number Selection ─────────────── */}
          {mode === 'enterprise' && (
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>
                Message To {leadName} Number With
              </Text>
              <View style={styles.radioGroup}>
                {enterpriseNumberOptions.map((opt) => (
                  <RadioOption
                    key={opt}
                    label={opt}
                    selected={enterpriseNumber === opt}
                    onPress={() => setEnterpriseNumber(opt)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ── Non-Enterprise: Section 2 – Number Selection ─────────── */}
          {mode === 'non-enterprise' && (
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>
                Message To {leadName} Number With
              </Text>
              <View style={styles.radioGroup}>
                {nonEnterpriseNumberOptions.map((opt) => (
                  <RadioOption
                    key={opt}
                    label={opt}
                    selected={nonEnterpriseNumber === opt}
                    onPress={() => setNonEnterpriseNumber(opt)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ── Section 4: Select WhatsApp Template ──────────────────── */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>
              Select WhatsApp Template{' '}
              <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdownField,
                templateError && styles.dropdownFieldError,
              ]}
              onPress={() => {
                setTemplateError(false);
                setTemplateModalVisible(true);
              }}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.dropdownValue,
                  !template && styles.dropdownPlaceholder,
                ]}
                numberOfLines={1}
              >
                {template || 'Select template...'}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={22}
                color={templateError ? Theme.colors.primary : '#9E9E9E'}
              />
            </TouchableOpacity>
            {templateError && (
              <Text style={styles.errorText}>
                Please select a WhatsApp template.
              </Text>
            )}
          </View>

          {/* ── Section 5: Message Textarea ───────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Send WhatsApp Message</Text>
            <TextInput
              style={styles.textarea}
              value={message}
              onChangeText={setMessage}
              placeholder="Type WhatsApp message here..."
              placeholderTextColor="#BDBDBD"
              multiline
              textAlignVertical="top"
              numberOfLines={6}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Sender ID Modal ───────────────────────────────────────────── */}
      <SelectModal
        visible={senderIdModalVisible}
        onDismiss={() => setSenderIdModalVisible(false)}
        title="Select Sender ID"
        options={SENDER_IDS}
        selected={senderId}
        onSelect={setSenderId}
        searchPlaceholder="Search sender ID..."
      />

      {/* ── Template Modal ────────────────────────────────────────────── */}
      <SelectModal
        visible={templateModalVisible}
        onDismiss={() => setTemplateModalVisible(false)}
        title="Select WhatsApp Template"
        options={WA_TEMPLATES}
        selected={template}
        onSelect={setTemplate}
        searchPlaceholder="Search templates..."
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

  // ── Header ─────────────────────────────────────────────────────
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
  headerActionText: {
    color: Theme.colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },

  // ── Scroll ──────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },

  // ── Section ──────────────────────────────────────────────────────
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: '#F1F3F4',
    padding: 16,
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

  // ── Segmented Control ────────────────────────────────────────────
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F1F3F5',
    borderRadius: 12,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: Theme.colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // ── Dropdown Field ───────────────────────────────────────────────
  dropdownField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  dropdownFieldError: {
    borderColor: Theme.colors.primary,
    borderWidth: 1.5,
  },
  dropdownValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  dropdownPlaceholder: {
    color: '#BDBDBD',
    fontWeight: '400',
  },
  errorText: {
    fontSize: 12,
    color: Theme.colors.primary,
    fontWeight: '500',
    marginTop: 6,
    marginLeft: 4,
  },

  // ── Radio Group ──────────────────────────────────────────────────
  radioGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: Theme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.primary,
  },
  radioLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#424242',
  },
  radioLabelSelected: {
    color: '#000000',
    fontWeight: '700',
  },

  // ── Textarea ──────────────────────────────────────────────────────
  textarea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#000000',
    minHeight: 150,
    lineHeight: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },

  // ── Bottom Sheet Modal ────────────────────────────────────────────
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    maxHeight: '78%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
      },
      android: { elevation: 20 },
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
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  modalSearchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalSearchBar: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    height: 46,
    elevation: 0,
  },
  modalSearchInput: {
    fontSize: 14,
  },
  modalList: {
    maxHeight: 340,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9E9E9E',
    fontSize: 14,
    paddingVertical: 24,
  },

  // ── Option Row ───────────────────────────────────────────────────
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionRowSelected: {
    backgroundColor: 'rgba(229,57,53,0.05)',
  },
  optionRowPressed: {
    backgroundColor: 'rgba(229,57,53,0.08)',
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
  optionLabelSelected: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  optionDivider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginLeft: 20,
  },
});
