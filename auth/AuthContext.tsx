import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'en' | 'ru' | 'kk';
}

const defaultPrefs: UserPreferences = {
  theme: 'light',
  language: 'en'
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  isOnline: boolean;
  lastSync: Date | null;
  preferences: UserPreferences | null;
  register: (email: string, password: string, name: string, surname: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  syncPendingData: () => Promise<void>;
  saveOfflineData: (path: string, data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  // Save data offline when connection is lost
  const saveOfflineData = async (path: string, data: any) => {
    const pendingWrites = await getOfflineData('pending_writes') || {};
    pendingWrites[path] = data;
    await AsyncStorage.setItem('@pending_writes', JSON.stringify(pendingWrites));
  };

  // Get offline data
  const getOfflineData = async (key: string) => {
    const data = await AsyncStorage.getItem(`@${key}`);
    return data ? JSON.parse(data) : null;
  };

  // Sync pending data with Firebase
  const syncPendingData = async () => {
    const pending = await getOfflineData('pending_writes');
    if (!pending) return;

    try {
      await Promise.all(
        Object.entries(pending).map(([path, data]) => 
          set(ref(db, path), data)
      ))
      await AsyncStorage.removeItem('@pending_writes');
      setLastSync(new Date());
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  // Check and persist auth state
  const checkPersistedAuth = async () => {
    const data = await AsyncStorage.getItem('@auth_state');
    return data ? JSON.parse(data) : null;
  };

  const persistAuth = async (user: User) => {
    await AsyncStorage.setItem('@auth_state', JSON.stringify({
      uid: user.uid,
      lastLogin: Date.now()
    }));
  };

  const clearPersistedAuth = async () => {
    await AsyncStorage.removeItem('@auth_state');
  };

  useEffect(() => {
    // Network status listener
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
      if (state.isConnected) syncPendingData();
    });

    // Auth state listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await persistAuth(user);
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          setPreferences({
            theme: data.preferences?.theme || 'light',
            language: data.preferences?.language || 'en'
          });
        } else {
          await saveOfflineData(`users/${user.uid}`, {
            email: user.email,
            preferences: defaultPrefs
          });
          setPreferences(defaultPrefs);
        }
      } else {
        const persisted = await checkPersistedAuth();
        if (!persisted) {
          setPreferences(null);
        }
      }

      setUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeNetInfo();
    };
  }, []);

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    if (!user) return;

    const newPrefs = {
      ...preferences,
      ...prefs
    } as UserPreferences;

    try {
      const userRef = ref(db, `users/${user.uid}/preferences`);
      await update(userRef, newPrefs);
      setPreferences(newPrefs);
    } catch (error) {
      await saveOfflineData(`users/${user.uid}/preferences`, newPrefs);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, surname: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userRef = `users/${userCredential.user.uid}`;
      
      if (isOnline) {
        await set(ref(db, userRef), {
          email,
          name,
          surname,
          preferences: defaultPrefs
        });
      } else {
        await saveOfflineData(userRef, {
          email,
          name,
          surname,
          preferences: defaultPrefs
        });
      }
      
      await persistAuth(userCredential.user);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await persistAuth(userCredential.user);
      await syncPendingData();
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      await clearPersistedAuth();
      await AsyncStorage.removeItem('@pending_writes');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const enterGuestMode = () => {
    setIsGuest(true);
    setUser(null);
  };

  const exitGuestMode = () => {
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isGuest,
      isOnline,
      lastSync,
      preferences,
      register,
      login,
      logout,
      enterGuestMode,
      exitGuestMode,
      updatePreferences,
      syncPendingData,
      saveOfflineData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);