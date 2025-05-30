import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebase/config';

export const persistAuthState = async (user: any) => {
  await AsyncStorage.setItem('@auth_persistence', JSON.stringify({
    uid: user.uid,
    lastLogin: Date.now()
  }));
};

export const checkPersistedAuth = async () => {
  const data = await AsyncStorage.getItem('@auth_persistence');
  return data ? JSON.parse(data) : null;
};

export const clearPersistedAuth = async () => {
  await AsyncStorage.removeItem('@auth_persistence');
};