import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ref, set } from 'firebase/database';
import { db } from './config';

// Check network status
export const checkNetworkStatus = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected;
};

// Save data offline
export const saveOfflineData = async (key: string, data: any) => {
  try {
    await AsyncStorage.setItem(`@offline_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save offline data', e);
  }
};

// Get offline data
export const getOfflineData = async (key: string) => {
  try {
    const data = await AsyncStorage.getItem(`@offline_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to load offline data', e);
    return null;
  }
};

// In firebase/offline.ts
export const syncPendingOperations = async () => {
  const pending = await getOfflineData('pending_writes');
  if (!pending) return;

  try {
    await Promise.all(
      Object.entries(pending).map(([path, data]) => 
        set(ref(db, path), data)
      )
    );
    await AsyncStorage.removeItem('@pending_writes');
  } catch (error) {
    console.log('Sync failed', error);
  }
};