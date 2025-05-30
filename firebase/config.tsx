import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const firebaseConfig = {
  apiKey: "AIzaSyA9PQDoiFu95qMoRx8qtYSVLLW67sAf4Q4",
  authDomain: "unitsconverter-feb0e.firebaseapp.com",
  projectId: "unitsconverter-feb0e",
  storageBucket: "unitsconverter-feb0e.appspot.com",
  messagingSenderId: "1060375850448",
  appId: "1:1060375850448:web:c77da9d0aa1c54ecd29dd5",
  measurementId: "G-VJRNZT6BTH"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

// Enhanced write operation with offline support
const writeWithOfflineFallback = async (path: string, data: any) => {
  const isOnline = await NetInfo.fetch().then(state => state.isConnected);

  if (isOnline) {
    try {
      await db.ref(path).set(data);
      // Remove from offline storage if write succeeds
      await AsyncStorage.removeItem(`@offline_${path}`);
    } catch (error) {
      // Save to offline storage if write fails
      await AsyncStorage.setItem(`@offline_${path}`, JSON.stringify({
        path,
        data,
        timestamp: Date.now()
      }));
      throw error;
    }
  } else {
    // Save to offline storage when offline
    await AsyncStorage.setItem(`@offline_${path}`, JSON.stringify({
      path,
      data,
      timestamp: Date.now()
    }));
  }
};

// Sync all pending offline data
const syncPendingData = async () => {
  const allKeys = await AsyncStorage.getAllKeys();
  const offlineKeys = allKeys.filter(key => key.startsWith('@offline_'));

  for (const key of offlineKeys) {
    try {
      const item = await AsyncStorage.getItem(key);
      if (item) {
        const { path, data } = JSON.parse(item);
        await db.ref(path).set(data);
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Failed to sync ${key}:`, error);
    }
  }
};

// Set up network listener for automatic sync
NetInfo.addEventListener(networkState => {
  if (networkState.isConnected) {
    syncPendingData();
  }
});

export { 
  auth, 
  db,
  writeWithOfflineFallback,
  syncPendingData
};