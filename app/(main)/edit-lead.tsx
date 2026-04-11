import { Theme } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  UIManager,
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
  List,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
          placeholderTextColor="#BDBDBD"
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
        <MaterialCommunityIcons name="chevron-down" size={20} color="#9E9E9E" />
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

export default function EditLeadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ leadData?: string }>();

  const leadData = useMemo(() => {
    try {
      return params.leadData ? JSON.parse(params.leadData) : null;
    } catch {
      return null;
    }
  }, [params.leadData]);

  const [formData, setFormData] = useState<FormData>({
    applicantName: leadData?.name ?? '',
    emailId: '',
    alternateEmailId: '',
    whatsappNumber: leadData?.mobile ?? '',
    alternateContactNumber: '',
    program: leadData?.program ?? '',
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
        newErrors[key] = 'This field is required';
        valid = false;
      }
    });

    setErrors(newErrors);
    return valid;
  };

  const handleUpdate = () => {
    if (validate()) {
      console.log('Submitting lead update:', formData);
      router.back();
    }
  };

  const section1HasError = SECTION1_FIELDS.some(k => !!errors[k]);
  const section2HasError = SECTION2_FIELDS.some(k => !!errors[k]);
  const section3HasError = SECTION3_FIELDS.some(k => !!errors[k]);

  const mediumDisplay = formData.medium.length > 0
    ? formData.medium.join(', ')
    : '';

  // Stable modal open handlers
  const openGender    = useCallback(() => openModal('gender'),    [openModal]);
  const openStage     = useCallback(() => openModal('stage'),     [openModal]);
  const openSubStage  = useCallback(() => openModal('subStage'),  [openModal]);
  const openState     = useCallback(() => openModal('state'),     [openModal]);
  const openChannel   = useCallback(() => openModal('channel'),   [openModal]);
  const openSource    = useCallback(() => openModal('source'),    [openModal]);
  const openCampaign  = useCallback(() => openModal('campaign'),  [openModal]);
  const openMedium    = useCallback(() => openModal('medium'),    [openModal]);

  // Stable updateField wrappers
  const setApplicantName          = useCallback((v: string) => updateField('applicantName', v),          [updateField]);
  const setEmailId                = useCallback((v: string) => updateField('emailId', v),                [updateField]);
  const setAlternateEmailId       = useCallback((v: string) => updateField('alternateEmailId', v),       [updateField]);
  const setWhatsappNumber         = useCallback((v: string) => updateField('whatsappNumber', v),         [updateField]);
  const setAlternateContactNumber = useCallback((v: string) => updateField('alternateContactNumber', v), [updateField]);
  const setProgram                = useCallback((v: string) => updateField('program', v),                [updateField]);
  const setCurrentLocation        = useCallback((v: string) => updateField('currentLocation', v),        [updateField]);
  const setUgDegree               = useCallback((v: string) => updateField('ugDegree', v),               [updateField]);
  const setUgSpecialization       = useCallback((v: string) => updateField('ugSpecialization', v),       [updateField]);
  const setUgUniversity           = useCallback((v: string) => updateField('ugUniversity', v),           [updateField]);
  const setUgGraduationYear       = useCallback((v: string) => updateField('ugGraduationYear', v),       [updateField]);
  const setPgYear                 = useCallback((v: string) => updateField('pgYear', v),                 [updateField]);
  const setRemarks                = useCallback((v: string) => updateField('remarks', v),                [updateField]);
  const setFatherFullName         = useCallback((v: string) => updateField('fatherFullName', v),         [updateField]);
  const setFatherMobile           = useCallback((v: string) => updateField('fatherMobile', v),           [updateField]);
  const setFatherEmail            = useCallback((v: string) => updateField('fatherEmail', v),            [updateField]);
  const setMotherFullName         = useCallback((v: string) => updateField('motherFullName', v),         [updateField]);
  const setMotherMobile           = useCallback((v: string) => updateField('motherMobile', v),           [updateField]);
  const setMotherEmail            = useCallback((v: string) => updateField('motherEmail', v),            [updateField]);
  const setCity                   = useCallback((v: string) => updateField('city', v),                   [updateField]);
  const setAddress                = useCallback((v: string) => updateField('address', v),                [updateField]);
  const setPincode                = useCallback((v: string) => updateField('pincode', v),                [updateField]);

  const setGender   = useCallback((v: string) => updateField('gender', v),   [updateField]);
  const setStage    = useCallback((v: string) => updateField('stage', v),    [updateField]);
  const setSubStage = useCallback((v: string) => updateField('subStage', v), [updateField]);
  const setState    = useCallback((v: string) => updateField('state', v),    [updateField]);
  const setChannel  = useCallback((v: string) => updateField('channel', v),  [updateField]);
  const setSource   = useCallback((v: string) => updateField('source', v),   [updateField]);
  const setCampaign = useCallback((v: string) => updateField('campaign', v), [updateField]);
  const setMedium   = useCallback((v: string[]) => updateField('medium', v), [updateField]);

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Navigation Bar ── */}
      <Appbar.Header style={styles.appbar} elevated>
        <Appbar.BackAction onPress={() => router.back()} color="#000000" />
        <Appbar.Content title="Edit Lead" titleStyle={styles.appbarTitle} />
        <Pressable
          style={styles.updateBtn}
          onPress={handleUpdate}
          android_ripple={{ color: 'rgba(255,255,255,0.3)', borderless: false }}
        >
          <Text style={styles.updateBtnText}>Update</Text>
        </Pressable>
      </Appbar.Header>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 1 — Lead / Application Stage Details
          ═══════════════════════════════════════════════════════════════ */}
          <AccordionSection
            title="Lead / Application Stage Details"
            defaultExpanded
            hasError={section1HasError}
          >
            <InputField
              label="Applicant Name"
              value={formData.applicantName}
              onChangeText={setApplicantName}
              required
              error={errors.applicantName}
            />
            <InputField
              label="Email ID"
              value={formData.emailId}
              onChangeText={setEmailId}
              keyboardType="email-address"
            />
            <InputField
              label="Alternate Email ID"
              value={formData.alternateEmailId}
              onChangeText={setAlternateEmailId}
              keyboardType="email-address"
            />
            <InputField
              label="WhatsApp Number"
              value={formData.whatsappNumber}
              onChangeText={setWhatsappNumber}
              required
              error={errors.whatsappNumber}
              keyboardType="phone-pad"
            />
            <InputField
              label="Alternate Contact Number"
              value={formData.alternateContactNumber}
              onChangeText={setAlternateContactNumber}
              keyboardType="phone-pad"
            />
            <InputField
              label="Program"
              value={formData.program}
              onChangeText={setProgram}
              required
              error={errors.program}
            />
            <InputField
              label="Current Location"
              value={formData.currentLocation}
              onChangeText={setCurrentLocation}
            />
            <InputField
              label="Under Graduation Degree"
              value={formData.ugDegree}
              onChangeText={setUgDegree}
            />
            <InputField
              label="UG Specialization"
              value={formData.ugSpecialization}
              onChangeText={setUgSpecialization}
            />
            <InputField
              label="UG University / Institute Name"
              value={formData.ugUniversity}
              onChangeText={setUgUniversity}
            />
            <InputField
              label="UG Graduation Year"
              value={formData.ugGraduationYear}
              onChangeText={setUgGraduationYear}
              keyboardType="numeric"
            />
            <InputField
              label="Post Graduation Year"
              value={formData.pgYear}
              onChangeText={setPgYear}
              keyboardType="numeric"
            />
            <SelectField
              label="Gender"
              value={formData.gender}
              onPress={openGender}
              required
              error={errors.gender}
            />
            <SelectField
              label="Stage"
              value={formData.stage}
              onPress={openStage}
              required
              error={errors.stage}
            />
            <SelectField
              label="Sub Stage"
              value={formData.subStage}
              onPress={openSubStage}
              required
              error={errors.subStage}
            />
            <InputField
              label="Remarks"
              value={formData.remarks}
              onChangeText={setRemarks}
              multiline
            />
          </AccordionSection>

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 2 — Family & Address Details
          ═══════════════════════════════════════════════════════════════ */}
          <AccordionSection
            title="Family & Address Details"
            defaultExpanded={false}
            hasError={section2HasError}
          >
            <InputField
              label="Father's Full Name"
              value={formData.fatherFullName}
              onChangeText={setFatherFullName}
            />
            <InputField
              label="Father's Mobile Number"
              value={formData.fatherMobile}
              onChangeText={setFatherMobile}
              keyboardType="phone-pad"
            />
            <InputField
              label="Father's Email ID"
              value={formData.fatherEmail}
              onChangeText={setFatherEmail}
              keyboardType="email-address"
            />
            <InputField
              label="Mother's Full Name"
              value={formData.motherFullName}
              onChangeText={setMotherFullName}
            />
            <InputField
              label="Mother's Mobile Number"
              value={formData.motherMobile}
              onChangeText={setMotherMobile}
              keyboardType="phone-pad"
            />
            <InputField
              label="Mother's Email ID"
              value={formData.motherEmail}
              onChangeText={setMotherEmail}
              keyboardType="email-address"
            />
            <SelectField
              label="State"
              value={formData.state}
              onPress={openState}
              required
              error={errors.state}
            />
            <InputField
              label="City"
              value={formData.city}
              onChangeText={setCity}
            />
            <InputField
              label="Address"
              value={formData.address}
              onChangeText={setAddress}
              multiline
            />
            <InputField
              label="Pincode"
              value={formData.pincode}
              onChangeText={setPincode}
              keyboardType="numeric"
            />
          </AccordionSection>

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 3 — Source Details
          ═══════════════════════════════════════════════════════════════ */}
          <AccordionSection
            title="Source Details"
            defaultExpanded={false}
            hasError={section3HasError}
          >
            <SelectField
              label="Channel"
              value={formData.channel}
              onPress={openChannel}
              required
              error={errors.channel}
            />
            <SelectField
              label="Source"
              value={formData.source}
              onPress={openSource}
              required
              error={errors.source}
            />
            <SelectField
              label="Campaign"
              value={formData.campaign}
              onPress={openCampaign}
            />
            <SelectField
              label="Medium"
              value={mediumDisplay}
              onPress={openMedium}
            />
          </AccordionSection>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Bottom Sheet Modals ── */}
      <SelectModal
        visible={activeModal === 'gender'}
        onDismiss={closeModal}
        title="Select Gender"
        options={GENDER_OPTIONS}
        selected={formData.gender}
        onSelect={setGender}
      />
      <SelectModal
        visible={activeModal === 'stage'}
        onDismiss={closeModal}
        title="Select Stage"
        options={STAGE_OPTIONS}
        selected={formData.stage}
        onSelect={setStage}
      />
      <SelectModal
        visible={activeModal === 'subStage'}
        onDismiss={closeModal}
        title="Select Sub Stage"
        options={SUB_STAGE_OPTIONS}
        selected={formData.subStage}
        onSelect={setSubStage}
      />
      <SelectModal
        visible={activeModal === 'state'}
        onDismiss={closeModal}
        title="Select State"
        options={INDIAN_STATES}
        selected={formData.state}
        onSelect={setState}
      />
      <SelectModal
        visible={activeModal === 'channel'}
        onDismiss={closeModal}
        title="Select Channel"
        options={CHANNEL_OPTIONS}
        selected={formData.channel}
        onSelect={setChannel}
      />
      <SelectModal
        visible={activeModal === 'source'}
        onDismiss={closeModal}
        title="Select Source"
        options={SOURCE_OPTIONS}
        selected={formData.source}
        onSelect={setSource}
      />
      <SelectModal
        visible={activeModal === 'campaign'}
        onDismiss={closeModal}
        title="Select Campaign"
        options={CAMPAIGN_OPTIONS}
        selected={formData.campaign}
        onSelect={setCampaign}
      />
      <MultiSelectModal
        visible={activeModal === 'medium'}
        onDismiss={closeModal}
        title="Select Medium"
        options={MEDIUM_OPTIONS}
        selected={formData.medium}
        onSelect={setMedium}
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  // ── Appbar ──
  appbar: {
    backgroundColor: '#FFFFFF',
    elevation: 4,
  },
  appbarTitle: {
    fontWeight: '800',
    fontSize: 20,
    color: '#000000',
  },
  updateBtn: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 12,
  },
  updateBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // ── Scroll ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },

  // ── Accordion Section Card ──
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  errorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Theme.colors.primary,
  },
  sectionDivider: {
    height: 1.5,
    backgroundColor: '#F0F0F0',
  },
  sectionContent: {
    padding: 16,
    gap: 4,
  },

  // ── Field base ──
  fieldContainer: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 6,
    marginLeft: 2,
  },
  requiredStar: {
    color: Theme.colors.primary,
  },

  // ── Text input ──
  inputWrapper: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8EAED',
    paddingHorizontal: 14,
    height: 52,
    justifyContent: 'center',
  },
  inputError: {
    borderColor: Theme.colors.primary,
    backgroundColor: 'rgba(229,57,53,0.03)',
  },
  multilineWrapper: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 15,
    color: '#111111',
    flex: 1,
  },
  multilineInput: {
    height: 76,
    textAlignVertical: 'top',
  },

  // ── Select field ──
  selectWrapper: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8EAED',
    paddingHorizontal: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholderText: {
    color: '#BDBDBD',
  },
  errorText: {
    fontSize: 12,
    color: Theme.colors.primary,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
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
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 20 },
    }),
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  doneBtn: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  sheetSearchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sheetSearchbar: {
    backgroundColor: '#F4F6F8',
    borderRadius: 12,
    elevation: 0,
    height: 44,
  },
  sheetSearchInput: {
    fontSize: 14,
    minHeight: 0,
  },
  sheetList: {
    maxHeight: 340,
  },
  listItemTitle: {
    fontSize: 15,
    color: '#111111',
    fontWeight: '500',
  },
  listItemSelected: {
    backgroundColor: 'rgba(229,57,53,0.05)',
  },
  noResults: {
    textAlign: 'center',
    color: '#9E9E9E',
    fontSize: 14,
    paddingVertical: 24,
  },

  // ── Multi-select checkbox ──
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#111111',
    fontWeight: '500',
    marginLeft: 8,
  },
});
