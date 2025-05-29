import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { useTheme } from '../theme/theme';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

type SettingsPanelProps = {
  variant?: 'default' | 'settings';
};

const languageMap = {
  en: { label: 'English' },
  ru: { label: 'Русский' },
  kk: { label: 'Қазақша' },
};

const SettingsPanel = ({ variant = 'default' }: SettingsPanelProps) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const isSettingsScreen = variant === 'settings';

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      {/* Theme toggle */}
      <View style={styles.item}>
        <Ionicons name="moon" size={20} color={theme.text} />
        <Text style={[styles.text, { color: theme.text }]}>{t('darkMode')}</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          thumbColor={theme.primary}
          trackColor={{ false: theme.textSecondary, true: theme.primary }}
        />
      </View>

      {/* Language selection */}
      <View style={styles.item}>
        <Text style={[styles.text, { color: theme.text, marginBottom: 10 }]}>{t('language')}</Text>

        {isSettingsScreen ? (
          <View style={styles.languageGrid}>
            {Object.entries(languageMap).map(([lang, { label }]) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.langCard,
                  {
                    backgroundColor: currentLang === lang ? theme.primary : theme.surface,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => changeLanguage(lang)}
              >
                <Text
                  style={{
                    color: currentLang === lang ? 'white' : theme.text,
                    fontWeight: '600',
                    fontSize: 14,
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.languageRow}>
            {Object.keys(languageMap).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.langBtn,
                  {
                    borderColor: theme.primary,
                    backgroundColor: currentLang === lang ? theme.primary : 'transparent',
                  },
                ]}
                onPress={() => changeLanguage(lang)}
              >
                <Text style={{ color: currentLang === lang ? 'white' : theme.text }}>
                  {lang.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  item: {
    marginBottom: 25,
  },
  text: {
    fontSize: 16,
    marginTop: 10,
  },
  languageRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  langBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 15,
    marginRight: 8,
  },
  languageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  langCard: {
    width: '30%',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
});

export default SettingsPanel;
