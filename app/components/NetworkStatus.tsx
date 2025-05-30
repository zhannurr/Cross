import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

interface NetworkContextType {
  isConnected: boolean;
  isOffline: boolean;
  connectionType: string | null;
  checkConnection: () => Promise<boolean>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  const checkConnection = async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    return state.isConnected || false;
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected || false;
      
      // Show reconnection message if coming back online
      if (!isConnected && connected && wasOffline) {
        Alert.alert(
          'Back Online',
          'Internet connection restored. Would you like to sync your data?',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Sync Now', onPress: () => {
              // This will be handled by components that need sync
              // We'll emit a custom event or use a callback
            }}
          ]
        );
      }

      setIsConnected(connected);
      setConnectionType(state.type);
      
      if (!connected) {
        setWasOffline(true);
      }
    });

    return () => unsubscribe();
  }, [isConnected, wasOffline]);

  const value: NetworkContextType = {
    isConnected,
    isOffline: !isConnected,
    connectionType,
    checkConnection,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};