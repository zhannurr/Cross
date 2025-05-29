import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { ref, set, get, update, child } from 'firebase/database'; // 🔄 Realtime DB

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
  preferences: UserPreferences | null;
  register: (email: string, password: string, name: string, surname: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          setPreferences({
            theme: data.preferences?.theme || 'light',
            language: data.preferences?.language || 'en'
          });
        } else {
          await set(userRef, {
            email: user.email,
            preferences: defaultPrefs
          });
          setPreferences(defaultPrefs);
        }
      } else {
        setPreferences(null);
      }

      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
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
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, surname: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userRef = ref(db, `users/${userCredential.user.uid}`);
      await set(userRef, {
        email,
        name,
        surname,
        preferences: defaultPrefs
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message);
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
      preferences,
      register,
      login,
      logout,
      enterGuestMode,
      exitGuestMode,
      updatePreferences
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
