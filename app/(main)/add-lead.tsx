import { Theme } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Appbar,
  Checkbox,
  Divider,
  Modal,
  Portal,
  Searchbar,
  Text,
  List,
} from 'react-native-paper';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Options ────────────────────────────────────────────────────────────────

const STAGE_OPTIONS = [
  '08 Visit Scheduled',
  '09 Visited',
  '10 Enrolled',
  '11 Junk',
  '12 Cold',
];

const SUB_STAGE_OPTIONS = ['Visit Scheduled', 'Will Join Soon'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
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

const CHANNEL_OPTIONS = ['Offline', 'Online', 'Referral'];
const SOURCE_OPTIONS = [
  'Direct Walkin', 'Education Fair', 'Friend', 'Incoming', 'JD',
  'Others', 'Raw Database', 'School Presentation', 'Seminar',
  'Social Media', 'Test Centre',
];

const CAMPAIGN_OPTIONS = [
  'Bulk Upload', 'Mobile Add Lead', 'Mobile Quick Add Lead',
  'Mobile Smart Caller Quick Add', 'Not Known Web Add Lead', 'Web Quick Add Lead',
];

const MEDIUM_OPTIONS = ['Not Known', 'Website Application Form'];

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  applicantName: string;
  emailId: string;
  alternateEmailId: string;
  whatsappNumber: string;
  alternateContactNumber: string;
  program: string;
  currentLocation: string;
  ugDegree: string;
  ugSpecialization: string;
  ugUniversity: string;
  ugGraduationYear: string;
  pgYear: string;
  gender: string;
  stage: string;
  subStage: string;
  remarks: string;
  fatherFullName: string;
  fatherMobile: string;
  fatherEmail: string;
  motherFullName: string;
  motherMobile: string;
  motherEmail: string;
  state: string;
  city: string;
  address: string;
  pincode: string;
  channel: string;
  source: string;
  campaign: string;
  medium: string[];
}

type FormErrors = Partial<Record<keyof FormData, string>>;

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
        contentContainerStyle={[
          styles.bottomSheet,
          { paddingBottom: insets.bottom + 16 },
        ]}
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
            <List.Item
              key={option}
              title={option}
              titleStyle={styles.listItemTitle}
              onPress={() => handleSelect(option)}
              style={selected === option ? styles.listItemSelected : undefined}
              right={() =>
                selected === option
                  ? <List.Icon icon="check-circle" color={Theme.colors.primary} />
                  : null
              }
            />
          ))}
          {filtered.length === 0 && (
            <Text style={styles.noResults}>No results found</Text>
          )}
        </ScrollView>
      </Modal>
    </Portal>
  );
}

// ─── MultiSelectModal ────────────────────────────────────────────────────────

interface MultiSelectModalProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  options: string[];
  selected: string[];
  onSelect: (values: string[]) => void;
}

function MultiSelectModal({
  visible, onDismiss, title, options, selected, onSelect,
}: MultiSelectModalProps) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [localSelected, setLocalSelected] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setLocalSelected(selected);
    } else {
      setSearch('');
    }
  }, [visible]);

  const filtered = useMemo(
    () => options.filter(o => o.toLowerCase().includes(search.toLowerCase())),
    [options, search],
  );

  const toggle = (value: string) => {
    setLocalSelected(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value],
    );
  };

  const handleDone = () => {
    onSelect(localSelected);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.bottomSheet,
          { paddingBottom: insets.bottom + 16 },
        ]}
      >
        <View style={styles.dragHandle} />
        <View style={styles.sheetHeaderRow}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={handleDone} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
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
        <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
          {filtered.map(option => (
            <TouchableOpacity
              key={option}
              style={styles.checkboxRow}
              onPress={() => toggle(option)}
              activeOpacity={0.7}
            >
              <Checkbox
                status={localSelected.includes(option) ? 'checked' : 'unchecked'}
                color={Theme.colors.primary}
                onPress={() => toggle(option)}
              />
              <Text style={styles.checkboxLabel}>{option}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Modal>
    </Portal>
  );
}

// ─── AccordionSection ────────────────────────────────────────────────────────

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  hasError?: boolean;
}

function AccordionSection({
  title, children, defaultExpanded = true, hasError = false,
}: AccordionSectionProps) {
  const expandedRef = useRef(defaultExpanded);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotateAnim = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  const toggle = useCallback(() => {
    const next = !expandedRef.current;
    expandedRef.current = next;

    LayoutAnimation.configureNext({
      duration: 230,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });

    Animated.timing(rotateAnim, {
      toValue: next ? 1 : 0,
      duration: 230,
      useNativeDriver: true,
    }).start();

    setExpanded(next);
  }, [rotateAnim]);

  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.sectionCard}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={toggle}
        activeOpacity={0.75}
      >
        <View style={styles.sectionHeaderLeft}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {hasError && <View style={styles.errorDot} />}
        </View>
        <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
          <MaterialCommunityIcons
            name="chevron-down"
            size={22}
            color={Theme.colors.primary}
          />
        </Animated.View>
      </TouchableOpacity>

      {expanded && (
        <>
          <Divider style={styles.sectionDivider} />
          <View style={styles.sectionContent}>{children}</View>
        </>
      )}
    </View>
  );
}

// ─── InputField ──────────────────────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  required?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  multiline?: boolean;
}

const InputField = React.memo(function InputField({
  label, value, onChangeText, required = false,
  error, keyboardType = 'default', multiline = false,
}: InputFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      <View style={[
        styles.inputWrapper,
        error ? styles.inputError : null,
        multiline ? styles.multilineWrapper : null,
      ]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={[styles.textInput, multiline ? styles.multilineInput : null]}
          placeholderTextColor="#9AA0A6"
          placeholder={label}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          autoCapitalize="sentences"
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});

// ─── SelectField ─────────────────────────────────────────────────────────────

interface SelectFieldProps {
  label: string;
  value: string;
  onPress: () => void;
  required?: boolean;
  error?: string;
}

const SelectField = React.memo(function SelectField({
  label, value, onPress, required = false, error,
}: SelectFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.selectWrapper, error ? styles.inputError : null]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.textInput, !value ? styles.placeholderText : null]}>
          {value || `Select ${label}`}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color="#9BA0A6" />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

const SECTION1_FIELDS: (keyof FormData)[] = [
  'applicantName', 'whatsappNumber', 'program', 'gender', 'stage', 'subStage',
];
const SECTION2_FIELDS: (keyof FormData)[] = ['state'];
const SECTION3_FIELDS: (keyof FormData)[] = ['channel', 'source'];

export default function AddLeadScreen() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    applicantName: '',
    emailId: '',
    alternateEmailId: '',
    whatsappNumber: '',
    alternateContactNumber: '',
    program: '',
    currentLocation: '',
    ugDegree: '',
    ugSpecialization: '',
    ugUniversity: '',
    ugGraduationYear: '',
    pgYear: '',
    gender: '',
    stage: '',
    subStage: '',
    remarks: '',
    fatherFullName: '',
    fatherMobile: '',
    fatherEmail: '',
    motherFullName: '',
    motherMobile: '',
    motherEmail: '',
    state: '',
    city: '',
    address: '',
    pincode: '',
    channel: '',
    source: '',
    campaign: '',
    medium: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const updateField = useCallback((key: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }, []);

  const openModal = useCallback((name: string) => {
    Keyboard.dismiss();
    setActiveModal(name);
  }, []);

  const closeModal = useCallback(() => setActiveModal(null), []);

  const REQUIRED_FIELDS: (keyof FormData)[] = [
    'applicantName', 'whatsappNumber', 'program', 'gender',
    'stage', 'subStage', 'state', 'channel', 'source',
  ];

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    let valid = true;

    REQUIRED_FIELDS.forEach(key => {
      const val = formData[key];
      const isEmpty = Array.isArray(val) ? val.length === 0 : !val.trim();
      if (isEmpty) {
        newErrors[key] = 'Required';
        valid = false;
      }
    });

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (validate()) {
      router.back();
    }
  };

  const section1HasError = SECTION1_FIELDS.some(k => !!errors[k]);
  const section2HasError = SECTION2_FIELDS.some(k => !!errors[k]);
  const section3HasError = SECTION3_FIELDS.some(k => !!errors[k]);

  // Stable handlers
  const openGender    = useCallback(() => openModal('gender'),    [openModal]);
  const openStage     = useCallback(() => openModal('stage'),     [openModal]);
  const openSubStage  = useCallback(() => openModal('subStage'),  [openModal]);
  const openState     = useCallback(() => openModal('state'),     [openModal]);
  const openChannel   = useCallback(() => openModal('channel'),   [openModal]);
  const openSource    = useCallback(() => openModal('source'),    [openModal]);

  const setApplicantName = useCallback((v: string) => updateField('applicantName', v), [updateField]);
  const setWhatsappNumber = useCallback((v: string) => updateField('whatsappNumber', v), [updateField]);
  const setProgram = useCallback((v: string) => updateField('program', v), [updateField]);
  const setGender = useCallback((v: string) => updateField('gender', v), [updateField]);
  const setStage = useCallback((v: string) => updateField('stage', v), [updateField]);
  const setSubStage = useCallback((v: string) => updateField('subStage', v), [updateField]);
  const setState = useCallback((v: string) => updateField('state', v), [updateField]);
  const setChannel = useCallback((v: string) => updateField('channel', v), [updateField]);
  const setSource = useCallback((v: string) => updateField('source', v), [updateField]);
  const setRemarks = useCallback((v: string) => updateField('remarks', v), [updateField]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => router.back()} color="#000000" />
        <Appbar.Content title="Add Lead" titleStyle={styles.headerTitle} />
        <TouchableOpacity style={styles.headerActionPill} onPress={handleSubmit}>
          <Text style={styles.headerActionText}>Submit</Text>
        </TouchableOpacity>
      </Appbar.Header>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AccordionSection title="Lead / Application Details" hasError={section1HasError}>
            <InputField label="Applicant Name" value={formData.applicantName} onChangeText={setApplicantName} required error={errors.applicantName} />
            <InputField label="WhatsApp Number" value={formData.whatsappNumber} onChangeText={setWhatsappNumber} required error={errors.whatsappNumber} keyboardType="phone-pad" />
            <InputField label="Program" value={formData.program} onChangeText={setProgram} required error={errors.program} />
            <SelectField label="Gender" value={formData.gender} onPress={openGender} required error={errors.gender} />
            <SelectField label="Stage" value={formData.stage} onPress={openStage} required error={errors.stage} />
            <SelectField label="Sub Stage" value={formData.subStage} onPress={openSubStage} required error={errors.subStage} />
            <InputField label="Remarks" value={formData.remarks} onChangeText={setRemarks} multiline />
          </AccordionSection>

          <AccordionSection title="Family & Address Details" defaultExpanded={false} hasError={section2HasError}>
            <SelectField label="State" value={formData.state} onPress={openState} required error={errors.state} />
            <InputField label="City" value={formData.city} onChangeText={(v) => updateField('city', v)} />
          </AccordionSection>

          <AccordionSection title="Source Details" defaultExpanded={false} hasError={section3HasError}>
            <SelectField label="Channel" value={formData.channel} onPress={openChannel} required error={errors.channel} />
            <SelectField label="Source" value={formData.source} onPress={openSource} required error={errors.source} />
          </AccordionSection>
        </ScrollView>
      </KeyboardAvoidingView>

      <SelectModal visible={activeModal === 'gender'} onDismiss={closeModal} title="Select Gender" options={GENDER_OPTIONS} selected={formData.gender} onSelect={setGender} />
      <SelectModal visible={activeModal === 'stage'} onDismiss={closeModal} title="Select Stage" options={STAGE_OPTIONS} selected={formData.stage} onSelect={setStage} />
      <SelectModal visible={activeModal === 'subStage'} onDismiss={closeModal} title="Select Sub Stage" options={SUB_STAGE_OPTIONS} selected={formData.subStage} onSelect={setSubStage} />
      <SelectModal visible={activeModal === 'state'} onDismiss={closeModal} title="Select State" options={INDIAN_STATES} selected={formData.state} onSelect={setState} />
      <SelectModal visible={activeModal === 'channel'} onDismiss={closeModal} title="Select Channel" options={CHANNEL_OPTIONS} selected={formData.channel} onSelect={setChannel} />
      <SelectModal visible={activeModal === 'source'} onDismiss={closeModal} title="Select Source" options={SOURCE_OPTIONS} selected={formData.source} onSelect={setSource} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  appbar: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#000000', letterSpacing: -0.5 },
  headerActionPill: { backgroundColor: '#FEECEB', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  headerActionText: { color: Theme.colors.primary, fontWeight: '800', fontSize: 13 },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 16 },
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1.2, borderColor: '#F1F3F4' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: Theme.colors.primary, textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 1 },
  errorDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Theme.colors.primary },
  sectionDivider: { height: 1.5, backgroundColor: '#F0F0F0' },
  sectionContent: { padding: 16, gap: 4 },
  fieldContainer: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#444444', marginBottom: 6, marginLeft: 2 },
  requiredStar: { color: Theme.colors.primary },
  inputWrapper: { backgroundColor: '#F8F9FA', borderRadius: 12, borderWidth: 1.5, borderColor: '#E8EAED', paddingHorizontal: 14, height: 52, justifyContent: 'center' },
  inputError: { borderColor: Theme.colors.primary, backgroundColor: 'rgba(229,57,53,0.03)' },
  multilineWrapper: { height: 100, alignItems: 'flex-start', paddingVertical: 12 },
  textInput: { fontSize: 15, color: '#111111', flex: 1 },
  multilineInput: { height: 76, textAlignVertical: 'top' },
  selectWrapper: { backgroundColor: '#F8F9FA', borderRadius: 12, borderWidth: 1.5, borderColor: '#E8EAED', paddingHorizontal: 14, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  placeholderText: { color: '#BDBDBD' },
  errorText: { fontSize: 12, color: Theme.colors.primary, marginTop: 4, marginLeft: 4, fontWeight: '500' },
  bottomSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20 },
  dragHandle: { width: 40, height: 4, backgroundColor: '#E8EAED', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '900', color: '#202124', textAlign: 'center', marginBottom: 15 },
  sheetSearchWrap: { paddingVertical: 10 },
  sheetSearchbar: { backgroundColor: '#F4F6F8', borderRadius: 12, elevation: 0, height: 44 },
  sheetSearchInput: { fontSize: 14, minHeight: 0 },
  sheetList: { maxHeight: 340 },
  listItemTitle: { fontSize: 15, color: '#111111', fontWeight: '500' },
  listItemSelected: { backgroundColor: 'rgba(229,57,53,0.05)' },
  noResults: { textAlign: 'center', color: '#9E9E9E', fontSize: 14, paddingVertical: 24 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  checkboxLabel: { fontSize: 15, color: '#111111', fontWeight: '500', marginLeft: 8 },
});
