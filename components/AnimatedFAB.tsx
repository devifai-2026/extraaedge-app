import { Theme } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AnimatedFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Animation values
  const animation = useSharedValue(0);

  const toggleMenu = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    animation.value = withSpring(nextState ? 1 : 0, {
      damping: 18,
      stiffness: 150,
      mass: 0.8,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const closeMenu = () => {
    if (isOpen) {
      setIsOpen(false);
      animation.value = withSpring(0, { damping: 20 });
    }
  };

  // Main FAB rotation and scale
  const fabStyle = useAnimatedStyle(() => {
    const rotation = interpolate(animation.value, [0, 1], [0, 45]);
    const scale = interpolate(animation.value, [0, 1], [1, 0.9]);
    return {
      transform: [{ rotate: `${rotation}deg` }, { scale }],
    };
  });

  // Action Button 1 (Quick Lead) - Lower stagger
  const action1Style = useAnimatedStyle(() => {
    const translateY = interpolate(animation.value, [0, 1], [30, 0]);
    const opacity = interpolate(animation.value, [0, 0.3, 1], [0, 0, 1]);
    const scale = interpolate(animation.value, [0, 1], [0.6, 1]);

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  // Action Button 2 (Add Lead) - Slightly higher stagger
  const action2Style = useAnimatedStyle(() => {
    const translateY = interpolate(animation.value, [0, 1], [50, 0]);
    const opacity = interpolate(animation.value, [0, 0.5, 1], [0, 0, 1]);
    const scale = interpolate(animation.value, [0, 1], [0.6, 1]);

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  // Backdrop animation
  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animation.value, [0, 1], [0, 1]);
    return {
      opacity,
    };
  });

  const handleQuickLead = () => {
    closeMenu();
    // In a real app, this would open the bottom sheet
    console.log('Quick Lead tapped');
  };

  const handleAddLead = () => {
    closeMenu();
    router.push('/(main)/add-lead');
  };

  // Adjust positioning to be above the Tab Bar (approx 60-80px tall)
  const FAB_BOTTOM_SHELF = Math.max(insets.bottom, 20) + 76;
  const FAB_RIGHT_OFFSET = 20;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop - blurred dim effect */}
      <AnimatedPressable
        onLongPress={closeMenu}
        onPress={closeMenu}
        style={[styles.backdrop, backdropStyle]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      />

      <View 
        style={[
          styles.container, 
          { bottom: FAB_BOTTOM_SHELF, right: FAB_RIGHT_OFFSET }
        ]} 
        pointerEvents="box-none"
      >
        {/* Action Buttons Staggered */}
        <Animated.View style={[styles.actionWrapper, action2Style]}>
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Add Lead</Text>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddLead}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="account-plus" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.actionWrapper, action1Style]}>
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Quick Lead</Text>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleQuickLead}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="flash" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Main Center FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={toggleMenu}
          activeOpacity={0.9}
        >
          <Animated.View style={[styles.fabIconInner, fabStyle]}>
            <MaterialCommunityIcons name="plus" size={34} color="white" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'flex-end', // Crucial: align everything to the right edge
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  fabIconInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'flex-end', // Labels on left, button on right
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6, // Align button to FAB center line (since FAB is 60 and this is 48)
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  labelContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  labelText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
});
