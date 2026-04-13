import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Appbar, 
  Card, 
  Switch, 
  List, 
  Badge, 
  Text, 
  Avatar,
  useTheme,
  Divider
} from 'react-native-paper';
import { Theme } from '@/constants/theme';
import { useNavigation, DrawerActions } from '@react-navigation/native';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [isClickToCallEnabled, setIsClickToCallEnabled] = useState(true);
  const [isWhatsAppEnabled, setIsWhatsAppEnabled] = useState(false);
  const [leadsExpanded, setLeadsExpanded] = useState(true);
  const [followupsExpanded, setFollowupsExpanded] = useState(false);

  const leads = [
    { id: '1', name: 'Rahul Sharma', time: '10:30 AM', source: 'Website', type: 'High Priority' },
    { id: '2', name: 'Priya Verma', time: '11:15 AM', source: 'Facebook', type: 'Organic' },
    { id: '3', name: 'Amit Kumar', time: '12:00 PM', source: 'Google Ads', type: 'Waitlist' },
  ];

  const followups = [
    { id: '1', name: 'Suresh Raina', time: '02:00 PM', type: 'Cold Call' },
    { id: '2', name: 'Anjali Gupta', time: '03:30 PM', type: 'Followup Email' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation Bar */}
      <Appbar.Header style={styles.header}>
        <Appbar.Action 
            icon="menu" 
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} 
        />
        <Appbar.Content 
          title="Dashboard" 
          titleStyle={styles.headerTitle} 
        />
        <Appbar.Action icon="phone-outline" onPress={() => {}} />
        <Appbar.Action icon="bell-outline" onPress={() => {}} />
      </Appbar.Header>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Click To Call Enable */}
        <Card style={styles.card} mode="elevated">
          <List.Item
            title="Click To Call Enable"
            titleStyle={styles.cardLabel}
            right={() => (
              <Switch 
                value={isClickToCallEnabled} 
                onValueChange={setIsClickToCallEnabled} 
                color={Theme.colors.primary}
              />
            )}
          />
        </Card>

        {/* Section 2: Today's New Leads */}
        <Card style={styles.card} mode="elevated">
          <List.Accordion
            title="Today's New Leads"
            titleStyle={styles.accordionTitle}
            expanded={leadsExpanded}
            onPress={() => setLeadsExpanded(!leadsExpanded)}
            left={props => <List.Icon {...props} icon="account-group-outline" />}
            right={props => (
              <View style={styles.accordionRight}>
                <Badge size={24} style={styles.badge}>{leads.length}</Badge>
                <List.Icon {...props} icon={leadsExpanded ? 'chevron-up' : 'chevron-down'} />
              </View>
            )}
          >
            {leads.map((lead) => (
              <React.Fragment key={lead.id}>
                <Divider />
                <List.Item
                  title={lead.name}
                  description={`${lead.time} • Source: ${lead.source}`}
                  titleStyle={styles.leadName}
                  descriptionStyle={styles.leadSub}
                  left={props => <Avatar.Icon {...props} size={40} icon="account" style={styles.avatar} />}
                />
              </React.Fragment>
            ))}
          </List.Accordion>
        </Card>

        {/* Section 3: All Followups for Today */}
        <Card style={styles.card} mode="elevated">
          <List.Accordion
            title="All Followups for Today"
            titleStyle={styles.accordionTitle}
            expanded={followupsExpanded}
            onPress={() => setFollowupsExpanded(!followupsExpanded)}
            left={props => <List.Icon {...props} icon="calendar-check-outline" />}
            right={props => (
              <View style={styles.accordionRight}>
                <Badge size={24} style={styles.badgeSecondary}>{followups.length}</Badge>
                <List.Icon {...props} icon={followupsExpanded ? 'chevron-up' : 'chevron-down'} />
              </View>
            )}
          >
            {followups.map((followup) => (
              <React.Fragment key={followup.id}>
                <Divider />
                <List.Item
                  title={followup.name}
                  description={`${followup.time} • ${followup.type}`}
                  titleStyle={styles.leadName}
                  descriptionStyle={styles.leadSub}
                  left={props => <Avatar.Icon {...props} size={40} icon="phone-outgoing" style={[styles.avatar, { backgroundColor: '#FFEDEC' }]} color={Theme.colors.primary} />}
                />
              </React.Fragment>
            ))}
          </List.Accordion>
        </Card>

        {/* Section 4: WhatsApp Chat Enable */}
        <Card style={styles.card} mode="elevated">
          <List.Item
            title="Enable WhatsApp Chat"
            titleStyle={styles.cardLabel}
            right={() => (
              <Switch 
                value={isWhatsAppEnabled} 
                onValueChange={setIsWhatsAppEnabled} 
                color={Theme.colors.primary}
              />
            )}
          />
        </Card>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontWeight: '800',
    fontSize: 22,
    color: Theme.colors.secondary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radius.lg,
  },
  cardLabel: {
    fontWeight: '600',
    fontSize: 16,
    color: Theme.colors.secondary,
  },
  accordionTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: Theme.colors.secondary,
  },
  accordionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: Theme.colors.primary,
    fontWeight: 'bold',
  },
  badgeSecondary: {
    backgroundColor: '#666666',
    fontWeight: 'bold',
  },
  leadName: {
    fontWeight: '600',
    fontSize: 15,
  },
  leadSub: {
    fontSize: 13,
  },
  avatar: {
    backgroundColor: '#F5F5F5',
  },
  spacer: {
    height: 40,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Theme.colors.primary,
    borderRadius: 30,
    elevation: 6,
  },
});
