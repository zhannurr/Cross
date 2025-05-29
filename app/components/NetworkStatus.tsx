import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../theme/theme';
import NetInfo from '@react-native-community/netinfo';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(true);
  const { theme } = useTheme();

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  if (isOnline) return null;

  return (
    <View style={{
      position: 'absolute',
      top: 10,
      right: 10,
      padding: 8,
      backgroundColor: theme.error,
      borderRadius: 20
    }}>
      <Text style={{ color: 'white' }}>Offline</Text>
    </View>
  );
}