import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/theme';
import { syncPendingOperations } from '../../firebase/offline';

export default function SyncButton() {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const { theme } = useTheme();

  const handleSync = async () => {
    setIsSyncing(true);
    await syncPendingOperations();
    setIsSyncing(false);
  };

  return (
    <TouchableOpacity
      onPress={handleSync}
      style={{
        padding: 10,
        backgroundColor: theme.primary,
        borderRadius: 5
      }}
      disabled={isSyncing}
    >
      {isSyncing ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={{ color: 'white' }}>Sync Now</Text>
      )}
    </TouchableOpacity>
  );
}