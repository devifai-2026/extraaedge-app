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
  List,
  Modal,
  Portal,
  Searchbar,
  Text,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Counselor Options ────────────────────────────────────────────────────────

const COUNSELOR_OPTIONS = [
  'Divya Nair',
  'Subhojit Dutta',
  'Bikram Biswas',
  'Prerna Mehta',
  'Arjun Pillai',
  'Kavya Sharma',
  'Rohit Tiwari',
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
  visible,
  onDismiss,
  title,
  options,
  selected,
  onSelect,
}: SelectModalProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () =>
      query.trim()
        ? options.filter((o) =>
            o.toLowerCase().includes(query.toLowerCase())
          )
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
        {/* Drag handle */}
        <View style={styles.dragHandleRow}>
          <View style={styles.dragHandle} />
        </View>

        <Text style={styles.modalTitle}>{title}</Text>
        <Divider />

        {/* Search bar */}
        <View style={styles.modalSearchWrap}>
          <Searchbar
            placeholder="Search counselor..."
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
            <Text style={styles.emptyText}>No counselors found</Text>
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
                    {/* Avatar circle */}
                    <View
                      style={[
                        styles.optionAvatar,
                        isSelected && styles.optionAvatarSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionAvatarText,
                          isSelected && styles.optionAvatarTextSelected,
                        ]}
                      >
                        {item.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>

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

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ReferLeadScreen() {
  const router = useRouter();
  const { leadData } = useLocalSearchParams<{ leadData: string }>();

  const lead = useMemo(() => {
    try {
      return leadData ? JSON.parse(leadData) : null;
    } catch {
      return null;
    }
  }, [leadData]);

  const [referredTo, setReferredTo] = useState('');
  const [referNotes, setReferNotes] = useState('');
  const [referredToError, setReferredToError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleRefer = () => {
    if (!referredTo.trim()) {
      setReferredToError(true);
      return;
    }
    setReferredToError(false);
    // TODO: submit referral API call
    console.log('Referring lead:', lead?.name, '→', referredTo, 'Notes:', referNotes);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Top Navigation Bar ──────────────────────────────────── */}
      <Appbar.Header style={styles.header} elevated>
        <Appbar.BackAction
          onPress={() => router.back()}
          color="#000000"
        />
        <Appbar.Content
          title="Refer Lead"
          titleStyle={styles.headerTitle}
        />
        <TouchableOpacity
          style={styles.referBtn}
          onPress={handleRefer}
          activeOpacity={0.82}
        >
          <Text style={styles.referBtnText}>Refer</Text>
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
          {/* ── Lead Name Display ──────────────────────────────────── */}
          {lead && (
            <View style={styles.leadNameBlock}>
              <Text style={styles.leadName}>{lead.name}</Text>
              <View style={styles.leadNameDivider} />
            </View>
          )}

          {/* ── Section 1 : Select Referred To ────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>
              Select Referred To <Text style={styles.required}>*</Text>
            </Text>

            <TouchableOpacity
              style={[
                styles.dropdownField,
                referredToError && styles.dropdownFieldError,
              ]}
              onPress={() => {
                setReferredToError(false);
                setModalVisible(true);
              }}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.dropdownValue,
                  !referredTo && styles.dropdownPlaceholder,
                ]}
                numberOfLines={1}
              >
                {referredTo || 'Select counselor...'}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={22}
                color={referredToError ? Theme.colors.primary : '#9E9E9E'}
              />
            </TouchableOpacity>

            {referredToError && (
              <Text style={styles.errorText}>
                Please select a counselor to refer this lead to.
              </Text>
            )}
          </View>

          {/* ── Section 2 : Refer Notes ────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Refer Notes</Text>

            <TextInput
              style={styles.textarea}
              value={referNotes}
              onChangeText={setReferNotes}
              placeholder="Enter referral notes here..."
              placeholderTextColor="#BDBDBD"
              multiline
              textAlignVertical="top"
              numberOfLines={5}
              maxLength={500}
            />

            <Text style={styles.charCount}>{referNotes.length}/500</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Counselor Select Modal ─────────────────────────────────── */}
      <SelectModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        title="Select Referred To"
        options={COUNSELOR_OPTIONS}
        selected={referredTo}
        onSelect={(val) => setReferredTo(val)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  // ── Header ───────────────────────────────────────────────────
  header: {
    backgroundColor: '#FFFFFF',
    elevation: 4,
  },
  headerTitle: {
    fontWeight: '800',
    fontSize: 20,
    color: '#000000',
    letterSpacing: -0.3,
  },
  referBtn: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 22,
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  referBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },

  // ── Scroll ────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },

  // ── Lead Name ─────────────────────────────────────────────────
  leadNameBlock: {
    marginTop: 20,
    marginBottom: 8,
  },
  leadName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.4,
  },
  leadNameDivider: {
    marginTop: 14,
    height: 1,
    backgroundColor: '#EEEEEE',
  },

  // ── Section ────────────────────────────────────────────────────
  section: {
    marginTop: 28,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#424242',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  required: {
    color: Theme.colors.primary,
    fontWeight: '800',
  },

  // ── Dropdown ───────────────────────────────────────────────────
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

  // ── Textarea ────────────────────────────────────────────────────
  textarea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#000000',
    minHeight: 130,
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
  charCount: {
    fontSize: 11,
    color: '#BDBDBD',
    textAlign: 'right',
    marginTop: 6,
    marginRight: 2,
    fontWeight: '500',
  },

  // ── Bottom Sheet Modal ──────────────────────────────────────────
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

  // ── Option Row ──────────────────────────────────────────────────
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionRowSelected: {
    backgroundColor: 'rgba(229,57,53,0.05)',
  },
  optionRowPressed: {
    backgroundColor: 'rgba(229,57,53,0.08)',
  },
  optionAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionAvatarSelected: {
    backgroundColor: Theme.colors.primary,
  },
  optionAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#757575',
  },
  optionAvatarTextSelected: {
    color: '#FFFFFF',
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
    marginLeft: 72,
  },
});
