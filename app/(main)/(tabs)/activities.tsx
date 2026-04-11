import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export default function ActivitiesScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Activities</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
