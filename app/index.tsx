import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';

import About from './screens/about';
import Converter from './screens/converter';
import Account from './screens/account';
import Settings from './screens/settings';
import Login from './screens/login';
import OfflinePage from './components/OfflinePage'; // Add this import

import { useTheme } from './theme/theme';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';

const aboutIcon = require('../assets/images/information.png');
const converterIcon = require('../assets/images/math.png');
const accountIcon = require('../assets/images/user.png');
const settingsIcon = require('../assets/images/settings.png');

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: theme.tabBarBackground,
          borderTopColor: theme.card,
        },
        tabBarIcon: ({ color, size }) => {
          let iconSource;
          if (route.name === 'About') iconSource = aboutIcon;
          else if (route.name === 'Converter') iconSource = converterIcon;
          else if (route.name === 'Account') iconSource = accountIcon;
          else if (route.name === 'Settings') iconSource = settingsIcon;

          return (
            <Image source={iconSource} style={{ width: size, height: size, tintColor: color }} />
          );
        },
        tabBarActiveTintColor: theme.tabBarActiveTint,
        tabBarInactiveTintColor: theme.tabBarInactiveTint,
        headerShown: false,
      })}
    >
      <Tab.Screen name="About" component={About} options={{ tabBarLabel: t('about') }} />
      <Tab.Screen name="Converter" component={Converter} options={{ tabBarLabel: t('converter') }} />
      <Tab.Screen name="Account" component={Account} options={{ tabBarLabel: t('account') }} />
      <Tab.Screen name="Settings" component={Settings} options={{ tabBarLabel: t('settings') }} />
    </Tab.Navigator>
  );
}

export default function Index() {
  const { user, isGuest, isOnline } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Show offline page when there's no internet connection */}
      {!isOnline ? (
        <Stack.Screen 
          name="Offline" 
          component={OfflinePage}
          options={{ headerShown: false }}
        />
      ) : !user && !isGuest ? (
        <Stack.Screen 
          name="Login" 
          component={Login}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen 
          name="Main" 
          component={TabNavigator}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}