import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Switch, TextInput } from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import { useTheme } from '../theme/theme';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { ref, set, update } from 'firebase/database';
import { db } from '../../firebase/config';
import SettingsPanel from '../components/SettingsPanel_temp';



const AccountScreen = () => {
  const { user, isGuest, logout, exitGuestMode, preferences, updatePreferences } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      // Load name from Realtime DB if available
      // if (preferences?.name) {
      //   setName(preferences.name);
      // }
    }
    if (preferences) {
      setCurrentLanguage(preferences.language);
    }
  }, [user, preferences]);

  const handleToggleTheme = async () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    toggleTheme(); // Update local theme
    if (user) {
      await updatePreferences({ theme: newTheme }); // Update in Realtime DB
    }
  };

  const changeLanguage = async (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
    if (user) {
      await updatePreferences({ language: lang as 'en' | 'ru' | 'kk' });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      Toast.show({
        type: 'success',
        text1: t('logoutSuccess'),
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('logoutFailed'),
        text2: t('somethingWentWrong'),
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      // Update user data in Realtime DB
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, { name });
      
      Toast.show({
        type: 'success',
        text1: t('changesSaved'),
      });
      setIsEditing(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('saveFailed'),
        text2: t('somethingWentWrong'),
      });
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {isGuest ? (
        <View style={styles.guestContent}>
          <View style={styles.header}>
            <View style={[styles.avatarContainer, { backgroundColor: theme.secondary }]}>
              <Ionicons name="person-outline" size={60} color="white" />
            </View>
            <Text style={[styles.username, { color: theme.text }]}>{t('guest')}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={exitGuestMode}
            >
              <Text style={styles.buttonText}>{t('exitGuestMode')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <View style={[styles.avatarContainer, { backgroundColor: theme.primary }]}>
              <Ionicons name="person" size={60} color="white" />
            </View>
            <Text style={[styles.username, { color: theme.text }]}>{email}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle" size={24} color={theme.primary} />
              <Text style={[styles.cardTitle, { color: theme.text }]}>{t('personalInfo')}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('name')}</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.infoValue, { color: theme.text }]}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('enterName')}
                  placeholderTextColor={theme.textSecondary}
                />
              ) : (
                <Text style={[styles.infoValue, { color: theme.text }]}>{name || t('notSpecified')}</Text>
              )}
            </View>

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('email')}</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{email}</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="settings" size={24} color={theme.primary} />
              <Text style={[styles.cardTitle, { color: theme.text }]}>{t('settings')}</Text>
            </View>
            <SettingsPanel />
          </View>


          <View style={styles.buttonsContainer}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.primary }]}
                  onPress={handleSave}
                >
                  <Text style={styles.buttonText}>{t('save')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.error }]}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={styles.buttonText}>{t('cancel')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.buttonText}>{t('editProfile')}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.error }]}
              onPress={handleLogout}
            >
              <Text style={styles.buttonText}>{t('logout')}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 10,
  },
  languageButtons: {
    flexDirection: 'row',
  },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    marginLeft: 8,
  },
  langButtonText: {
    fontSize: 14,
  },
  buttonsContainer: {
    marginTop: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
    guestContent: {
    paddingTop: 20,
  },
  guestText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
});


export default AccountScreen;