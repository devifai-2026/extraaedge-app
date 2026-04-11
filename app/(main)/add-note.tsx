import { Theme } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TextInputContentSizeChangeEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import { Appbar, Text } from 'react-native-paper';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_CHARS = 1000;
const MIN_TEXTAREA_HEIGHT = 160;

// ─── AddNoteScreen ────────────────────────────────────────────────────────────

export default function AddNoteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const lead = useMemo(() => {
    try { return params.leadData ? JSON.parse(params.leadData as string) : null; }
    catch { return null; }
  }, [params.leadData]);

  const [remarks, setRemarks] = useState('');
  const [hasError, setHasError] = useState(false);
  const [textAreaHeight, setTextAreaHeight] = useState(MIN_TEXTAREA_HEIGHT);
  const inputRef = useRef<TextInput>(null);

  const handleContentSizeChange = (
    e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
  ) => {
    const newHeight = Math.max(MIN_TEXTAREA_HEIGHT, e.nativeEvent.contentSize.height + 28);
    setTextAreaHeight(newHeight);
  };

  const handleChange = (text: string) => {
    setRemarks(text);
    if (hasError && text.trim()) setHasError(false);
  };

  const handleSave = () => {
    if (!remarks.trim()) {
      setHasError(true);
      inputRef.current?.focus();
      return;
    }
    console.log('Add Note Payload:', { leadId: lead?.id, remarks });
    router.back();
  };

  const charsLeft = MAX_CHARS - remarks.length;
  const isNearLimit = charsLeft <= 100;

  return (
    <SafeAreaView style={styles.container}>

      {/* ─── Header ─── */}
      <Appbar.Header style={styles.header} elevated>
        <Appbar.BackAction
          onPress={() => router.back()}
          color={Theme.colors.secondary}
        />
        <Appbar.Content title="Add Note" titleStyle={styles.headerTitle} />
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.82}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </Appbar.Header>

      {/* ─── Lead name bar ─── */}
      {lead?.name && (
        <View style={styles.leadBar}>
          <View style={styles.leadAvatar}>
            <Text style={styles.leadAvatarText}>
              {lead.name.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.leadName} numberOfLines={1}>{lead.name}</Text>
            {lead.program && (
              <Text style={styles.leadSub} numberOfLines={1}>{lead.program}</Text>
            )}
          </View>
          <View style={styles.noteBadge}>
            <MaterialCommunityIcons
              name="note-text-outline"
              size={12}
              color={Theme.colors.primary}
            />
            <Text style={styles.noteBadgeText}>Note</Text>
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

          {/* ─── Section: Closure Remarks ─── */}
          <View style={styles.sectionCard}>

            {/* Section header */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionLabel}>Closure Remarks</Text>
              <View style={styles.sectionIconWrap}>
                <MaterialCommunityIcons
                  name="note-edit-outline"
                  size={16}
                  color={Theme.colors.primary}
                />
              </View>
            </View>

            {/* Field label */}
            <Text style={styles.fieldLabel}>
              Closure Remarks <Text style={styles.required}>*</Text>
            </Text>

            {/* Textarea */}
            <View style={[styles.textAreaWrap, hasError && styles.textAreaWrapError]}>
              <TextInput
                ref={inputRef}
                style={[styles.textArea, { height: textAreaHeight }]}
                value={remarks}
                onChangeText={handleChange}
                onContentSizeChange={handleContentSizeChange}
                placeholder="Enter closure remarks here..."
                placeholderTextColor="#BDBDBD"
                multiline
                scrollEnabled={false}
                textAlignVertical="top"
                maxLength={MAX_CHARS}
                autoCorrect
                autoCapitalize="sentences"
              />

              {/* Bottom bar: error hint + char counter */}
              <View style={styles.textAreaFooter}>
                {hasError ? (
                  <View style={styles.errorRow}>
                    <MaterialCommunityIcons
                      name="alert-circle-outline"
                      size={13}
                      color={Theme.colors.primary}
                    />
                    <Text style={styles.errorText}>Closure remarks are required</Text>
                  </View>
                ) : (
                  <View />
                )}
                <Text
                  style={[
                    styles.charCounter,
                    isNearLimit && styles.charCounterWarn,
                    remarks.length >= MAX_CHARS && styles.charCounterMax,
                  ]}
                >
                  {remarks.length}/{MAX_CHARS}
                </Text>
              </View>
            </View>

          </View>

          {/* ─── Tips card ─── */}
          <View style={styles.tipsCard}>
            <MaterialCommunityIcons
              name="lightbulb-outline"
              size={16}
              color="#F59E0B"
              style={{ marginTop: 1 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.tipsTitle}>Note tips</Text>
              <Text style={styles.tipsBody}>
                Include key discussion points, objections raised, follow-up commitments, or any context that helps the next counselor pick up seamlessly.
              </Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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

  // ── Lead Bar ──
  leadBar: {
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
  leadName: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.secondary,
    letterSpacing: -0.2,
  },
  leadSub: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '500',
    marginTop: 2,
  },
  noteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229,57,53,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  noteBadgeText: {
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
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#9E9E9E',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(229,57,53,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Field ──
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

  // ── Textarea ──
  textAreaWrap: {
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    overflow: 'hidden',
  },
  textAreaWrapError: {
    borderColor: Theme.colors.primary,
    backgroundColor: 'rgba(229,57,53,0.035)',
  },
  textArea: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    fontSize: 15,
    color: '#111111',
    lineHeight: 23,
    minHeight: MIN_TEXTAREA_HEIGHT,
  },
  textAreaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  errorText: {
    fontSize: 12,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  charCounter: {
    fontSize: 11,
    fontWeight: '600',
    color: '#BDBDBD',
    marginLeft: 'auto',
  },
  charCounterWarn: {
    color: '#F59E0B',
  },
  charCounterMax: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },

  // ── Tips Card ──
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    padding: 14,
    gap: 10,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  tipsBody: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 18,
    fontWeight: '500',
  },
});
