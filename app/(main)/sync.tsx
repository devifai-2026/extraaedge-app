import { Theme } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  LayoutAnimation,
  UIManager,
  Dimensions,
  Pressable,
} from 'react-native';
import {
  Appbar,
  Text,
  Badge,
  Divider,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Constants ──────────────────────────────────────────────────────────────

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 150,
  mass: 1,
};

// ─── Component: SyncCard ────────────────────────────────────────────────────

interface SyncCardProps {
  label: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon: string;
}

const SyncCard = ({ label, count, isOpen, onToggle, children, icon }: SyncCardProps) => {
  const rotateAnim = useSharedValue(isOpen ? 1 : 0);
  const scaleAnim = useSharedValue(1);

  React.useEffect(() => {
    rotateAnim.value = withSpring(isOpen ? 1 : 0, SPRING_CONFIG);
  }, [isOpen]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(rotateAnim.value, [0, 1], [0, 180])}deg` }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const onPressIn = () => (scaleAnim.value = withSpring(0.97));
  const onPressOut = () => (scaleAnim.value = withSpring(1));

  return (
    <Animated.View style={[styles.card, isOpen && styles.cardExpanded, cardStyle]}>
      <Pressable 
        style={styles.cardHeader} 
        onPress={onToggle}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.iconCircle, { backgroundColor: isOpen ? Theme.colors.primary : '#F5F5F5' }]}>
            <MaterialCommunityIcons 
              name={icon as any} 
              size={22} 
              color={isOpen ? '#FFFFFF' : Theme.colors.primary} 
            />
          </View>
          <View style={styles.cardLabelGroup}>
            <Text style={styles.cardLabel} numberOfLines={1}>{label}</Text>
            <Text style={styles.cardSublabel}>{isOpen ? 'Section Expanded' : 'Tap to expand'}</Text>
          </View>
        </View>
        
        <View style={styles.cardHeaderRight}>
          <View style={[styles.badgeContainer, count === 0 && styles.badgeEmptyContainer]}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
          <Animated.View style={chevronStyle}>
            <MaterialCommunityIcons name="chevron-down" size={24} color="#9BA0A6" />
          </Animated.View>
        </View>
      </Pressable>
      
      {isOpen && (
        <View style={styles.cardContent}>
          <Divider style={styles.cardDivider} />
          {children}
        </View>
      )}
    </Animated.View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SyncScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [sectionLoading, setSectionLoading] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ visible: false, msg: '' });

  const toggleSection = (section: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === section ? null : section);
  };

  const showToast = (msg: string) => {
    setSnackbar({ visible: true, msg });
  };

  const handleSyncAll = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSyncingAll(true);
    setTimeout(() => {
      setIsSyncingAll(false);
      showToast('All data synced successfully');
    }, 2000);
  };

  const handleSectionSync = (sectionName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSectionLoading(sectionName);
    setTimeout(() => {
      setSectionLoading(null);
      showToast(`${sectionName} synced to cloud`);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => router.back()} color="#000000" />
        <Appbar.Content title="Sync Data" titleStyle={styles.appTitle} />
        <View style={styles.headerRight}>
          {isSyncingAll ? (
            <ActivityIndicator size={18} color={Theme.colors.primary} />
          ) : (
            <TouchableOpacity onPress={handleSyncAll} style={styles.syncAllBtn}>
              <Text style={styles.syncAllLabel}>Sync All</Text>
            </TouchableOpacity>
          )}
        </View>
      </Appbar.Header>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <SyncCard 
          label="Sync Offline Leads" 
          count={0} 
          icon="account-multiple-outline"
          isOpen={expandedSection === 'leads'}
          onToggle={() => toggleSection('leads')}
        >
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="cloud-off-outline" size={60} color="#F1F3F4" />
            <Text style={styles.emptyTitle}>No Leads Found</Text>
            <Text style={styles.emptyDesc}>Offline leads will appear here before sync.</Text>
          </View>
        </SyncCard>

        <SyncCard 
          label="Sync Offline Followups" 
          count={3} 
          icon="calendar-clock-outline"
          isOpen={expandedSection === 'followups'}
          onToggle={() => toggleSection('followups')}
        >
          <View style={styles.listWrap}>
            {['Rahul Sharma', 'Amit Roy', 'Sneha Kapoor'].map((name, idx) => (
              <View key={idx}>
                <View style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <View style={styles.listIcon}>
                      <MaterialCommunityIcons name="phone-outgoing" size={20} color={Theme.colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.itemName}>{name}</Text>
                      <Text style={styles.itemMeta}>Pending • 13 Apr 2026</Text>
                    </View>
                  </View>
                </View>
                {idx < 2 && <Divider />}
              </View>
            ))}
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => handleSectionSync('Followups')}
              disabled={!!sectionLoading}
            >
              {sectionLoading === 'Followups' ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionBtnText}>Sync Followups</Text>}
            </TouchableOpacity>
          </View>
        </SyncCard>

        <SyncCard 
          label="Sync Offline Recordings" 
          count={4} 
          icon="music-box-multiple-outline"
          isOpen={expandedSection === 'recordings'}
          onToggle={() => toggleSection('recordings')}
        >
          <View style={styles.listWrap}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i}>
                <View style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <View style={[styles.listIcon, { backgroundColor: '#F5F5F5' }]}>
                      <MaterialCommunityIcons name="microphone" size={20} color="#607D8B" />
                    </View>
                    <View>
                      <Text style={styles.itemName}>Recording_{i}.mp3</Text>
                      <Text style={styles.itemMeta}>12 Apr • 2.4 MB</Text>
                    </View>
                  </View>
                </View>
                {i < 4 && <Divider />}
              </View>
            ))}
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => handleSectionSync('Recordings')}
              disabled={!!sectionLoading}
            >
              {sectionLoading === 'Recordings' ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionBtnText}>Sync Recordings</Text>}
            </TouchableOpacity>
          </View>
        </SyncCard>

        <View style={styles.configHeader}>
          <Text style={styles.sectionTitleText}>Update Configuration</Text>
        </View>

        <View style={styles.configContainer}>
          <TouchableOpacity style={styles.configRow} onPress={() => handleSectionSync('Settings')}>
            <View style={styles.configLabelWrap}>
              <View style={[styles.cIcon, { backgroundColor: '#F3E5F5' }]}><MaterialCommunityIcons name="cog" size={20} color="#7B1FA2" /></View>
              <Text style={styles.cLabel}>Update Settings</Text>
            </View>
            <Text style={styles.updateLink}>Update</Text>
          </TouchableOpacity>
          <Divider style={{ marginHorizontal: 16 }} />
          <TouchableOpacity style={styles.configRow} onPress={() => handleSectionSync('Masters')}>
            <View style={styles.configLabelWrap}>
              <View style={[styles.cIcon, { backgroundColor: '#E1F5FE' }]}><MaterialCommunityIcons name="layers" size={20} color="#0288D1" /></View>
              <Text style={styles.cLabel}>Update Masters</Text>
            </View>
            <Text style={styles.updateLink}>Update</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Snackbar 
        visible={snackbar.visible} 
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })} 
        style={styles.snackbar}
      >
        {snackbar.msg}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  appbar: { 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0' 
  },
  appTitle: { fontSize: 20, fontWeight: '900', color: '#000000', letterSpacing: -0.5 },
  headerRight: { marginRight: 12 },
  syncAllBtn: { 
    backgroundColor: '#FEECEB', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20 
  },
  syncAllLabel: { color: Theme.colors.primary, fontWeight: '700', fontSize: 13 },
  scrollContent: { padding: 16, gap: 16 },
  card: { 
    borderRadius: 16, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1.2,
    borderColor: '#F1F3F4',
    overflow: 'hidden' 
  },
  cardExpanded: { borderColor: '#FEECEB', borderWidth: 1.5 },
  cardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    height: 80, 
    backgroundColor: '#FFFFFF' 
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  cardLabelGroup: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: '800', color: '#212121' },
  cardSublabel: { fontSize: 12, color: '#888', marginTop: 2 },
  cardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badgeContainer: { 
    backgroundColor: Theme.colors.primary, 
    minWidth: 26, 
    height: 26, 
    borderRadius: 13, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  badgeEmptyContainer: { backgroundColor: '#E0E0E0' },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  cardContent: { backgroundColor: '#FAFAFB' },
  cardDivider: { backgroundColor: '#F1F3F4' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#212121', marginTop: 12 },
  emptyDesc: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 4 },
  listWrap: { padding: 12 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 8 },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  listIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF2F1', justifyContent: 'center', alignItems: 'center' },
  itemName: { fontSize: 15, fontWeight: '700', color: '#212121' },
  itemMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  actionBtn: { 
    backgroundColor: Theme.colors.primary, 
    borderRadius: 12, 
    paddingVertical: 14, 
    alignItems: 'center', 
    marginTop: 16, 
    marginBottom: 4 
  },
  actionBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  configHeader: { marginTop: 8, paddingLeft: 4 },
  sectionTitleText: { fontSize: 13, fontWeight: '800', color: '#888', textTransform: 'uppercase', letterSpacing: 1 },
  configContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.2, borderColor: '#F1F3F4' },
  configRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  configLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cLabel: { fontSize: 15, fontWeight: '700', color: '#212121' },
  updateLink: { color: Theme.colors.primary, fontWeight: '800', fontSize: 13 },
  snackbar: { backgroundColor: '#323232', borderRadius: 12 },
});
