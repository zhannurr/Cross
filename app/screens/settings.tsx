import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { initI18n } from "../../i18n";
import { useTheme } from "../theme/theme";
import SettingsPanel from '../components/SettingsPanel_temp';

export default function Settings() {
  const { theme } = useTheme();
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    initI18n().then(() => setCurrentLang(i18n.language));
  }, []);

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <SettingsPanel variant="settings" />
      {/* Тут можно добавить другие панели или настройки, если нужно */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
});
