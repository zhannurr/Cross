import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import en from '../app/locales/en.json';
import ru from '../app/locales/ru.json';
import kk from '../app/locales/kk.json'; 

// Конфигурация i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      kk: { translation: kk },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Экспортируемые функции
export const changeLanguage = async (lng: string) => {
  await AsyncStorage.setItem('appLanguage', lng);
  await i18n.changeLanguage(lng);
};

export const initI18n = async () => {
  const savedLang = await AsyncStorage.getItem('appLanguage');
  const deviceLang = Localization.locale.split('-')[0];

  if (savedLang) {
    await i18n.changeLanguage(savedLang);
  } else if (deviceLang && ['en', 'ru', 'kk'].includes(deviceLang)) {
    await i18n.changeLanguage(deviceLang);
  }
};

export default i18n;
