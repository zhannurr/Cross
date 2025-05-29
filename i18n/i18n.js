import * as Localization from 'expo-localization';
import I18n from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import ru from './locales/ru.json';
import kk from './locales/kk.json'; 

I18n.fallbacks = true;
I18n.translations = { en, ru, kk }; 

const setLocale = async (locale) => {
  await AsyncStorage.setItem('userLocale', locale);
  I18n.locale = locale;
};

const getLocale = async () => {
  const savedLocale = await AsyncStorage.getItem('userLocale');
  const deviceLocale = Localization.locale.split('-')[0];
  return savedLocale || (['en', 'ru', 'kk'].includes(deviceLocale) ? deviceLocale : 'en');
};

const initI18n = async () => {
  const locale = await getLocale();
  I18n.locale = locale;
};

export { I18n, setLocale, getLocale, initI18n };
