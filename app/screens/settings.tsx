import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { changeLanguage, initI18n } from "../../i18n";
import { useTheme } from "../theme/theme";
import { Ionicons } from '@expo/vector-icons';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const { theme, isDark, toggleTheme } = useTheme();

  useEffect(() => {
    initI18n().then(() => setCurrentLang(i18n.language));
  }, []);

  const handleLanguageChange = async (lang: string) => {
    await changeLanguage(lang);
    setCurrentLang(lang);
  };

  const getLanguageName = (code: string) => {
    switch(code) {
      case 'en': return 'English';
      case 'ru': return 'Русский';
      case 'kk': return 'Қазақша';
      default: return code;
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      {/* Theme Section */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="moon" size={24} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('Appearance')}</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={[styles.settingText, { color: theme.text }]}>{t('Dark Mode')}</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.textSecondary, true: theme.primary }}
            thumbColor={isDark ? theme.primary : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Language Section */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="language" size={24} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('Language')}</Text>
        </View>
        <View style={styles.languageOptions}>
          {['en', 'ru', 'kk'].map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.languageButton,
                currentLang === lang && { backgroundColor: theme.primary },
                { borderColor: theme.primary }
              ]}
              onPress={() => handleLanguageChange(lang)}
            >
              <Text style={[
                styles.languageButtonText,
                currentLang === lang ? { color: 'white' } : { color: theme.text }
              ]}>
                {getLanguageName(lang)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingText: {
    fontSize: 16,
  },
  languageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  languageButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});