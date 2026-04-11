import { Drawer } from 'expo-router/drawer';
import { CustomDrawerContent } from '@/components/CustomDrawerContent';

export default function MainLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 300,
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Home',
          title: 'ExtraaEdge',
        }}
      />
      <Drawer.Screen
        name="edit-lead"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Edit Lead',
        }}
      />
      <Drawer.Screen
        name="update-stage"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Update Stage',
        }}
      />
    </Drawer>
  );
}
