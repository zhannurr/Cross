//converter.tsx
import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  Switch,
} from 'react-native';
import { useTranslation } from "react-i18next";
import { changeLanguage, initI18n } from "../../i18n";
import { useTheme } from '../theme/theme';

const unitTypes = {
  length: {
    mm: 0.001,
    cm: 0.01,
    m: 1,
    km: 1000,
    mi: 1609.34,
  },
  weight: {
    mg: 0.001,
    g: 1,
    kg: 1000,
    lb: 453.592,
    oz: 28.3495,
  },
  time: {
    ms: 0.001,
    s: 1,
    min: 60,
    h: 3600,
    d: 86400,
  },
  temperature: {
    C: 1,
    F: 1,
    K: 1,
  },
};

const unitLabels: {
  [key in keyof typeof unitTypes]: { [key: string]: string }
} = {
  length: {
    mm: 'mm',
    cm: 'cm',
    m: 'm',
    km: 'km',
    mi: 'mi',
  },
  weight: {
    mg: 'mg',
    g: 'g',
    kg: 'kg',
    lb: 'lb',
    oz: 'oz',
  },
  time: {
    ms: 'ms',
    s: 's',
    min: 'min',
    h: 'h',
    d: 'd',
  },
  temperature: {
    C: '°C',
    F: '°F',
    K: 'K',
  },
};

const convertTemperature = (value: number, fromUnit: string, toUnit: string) => {
  let celsius;
  switch (fromUnit) {
    case 'F':
      celsius = (value - 32) * 5/9;
      break;
    case 'K':
      celsius = value - 273.15;
      break;
    default:
      celsius = value;
  }

  switch (toUnit) {
    case 'F':
      return (celsius * 9/5) + 32;
    case 'K':
      return celsius + 273.15;
    default:
      return celsius;
  }
};

const SimpleSelect = ({ 
  value, 
  items, 
  onValueChange, 
  label 
}: { 
  value: string, 
  items: { label: string, value: string }[], 
  onValueChange: (value: string) => void,
  label: string
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  const selectedLabel = items.find(item => item.value === value)?.label || '';
  
  return (
    <View style={[styles.selectContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <Text style={[styles.label, { backgroundColor: theme.card, color: theme.text }]}>{t(label)}</Text>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.selectText, { color: theme.text }]}>{t(selectedLabel)}</Text>
        <Text style={[styles.dropdownArrow, { color: theme.text }]}>▼</Text>
      </TouchableOpacity>
      
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        animationType="fade"
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item.value === value && styles.selectedItem,
                    { backgroundColor: theme.card }
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    { color: theme.text },
                    item.value === value && styles.selectedItemText
                  ]}>{t(item.label)}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const Converter: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [outputValue, setOutputValue] = useState('');
  const [currentUnitType, setCurrentUnitType] = useState<keyof typeof unitTypes>('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('cm');
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const { theme, isDark, toggleTheme } = useTheme();
  const [lastTapTime, setLastTapTime] = useState<number | null>(null); 

  const handleUnitTypeDoubleTap = (unitType: keyof typeof unitTypes, label: string) => {
    const now = Date.now();
    if (lastTapTime && now - lastTapTime < 300) {
      setCurrentUnitType(unitType);
      setLastTapTime(null);
      Toast.show({
        type: 'success',
        text1: t('unitChanged'),
        text2: t(label), // Use the passed label here
      });
    } else {
      setLastTapTime(now);
    }
  };

  useEffect(() => {
    initI18n().then(() => setCurrentLang(i18n.language));
  }, []);

  const handleLanguageChange = async (lang: string) => {
    await changeLanguage(lang);
    setCurrentLang(lang);
  };

  const currentUnits = unitTypes[currentUnitType];
  const currentLabels = unitLabels[currentUnitType];

  const unitTypeItems = Object.keys(unitTypes).map(key => ({
    label: key,
    value: key
  }));

  const unitItems = Object.keys(currentUnits).map(key => ({
    label: currentLabels[key],
    value: key
  }));

  useEffect(() => {
    const units = Object.keys(currentUnits);
    setFromUnit(units[0]);
    setToUnit(units[1]);
    setOutputValue('');
  }, [currentUnitType]);

  useEffect(() => {
    if (inputValue) {
      convert();
    }
  }, [inputValue, fromUnit, toUnit, currentUnitType]);

  const convert = () => {
    const inputNumber = parseFloat(inputValue);
    if (isNaN(inputNumber)) {
      setOutputValue('');
      return;
    }
  
    if (currentUnitType === 'temperature') {
      const convertedValue = convertTemperature(inputNumber, fromUnit, toUnit);
      setOutputValue(convertedValue.toFixed(2));
    } else {
      const units = unitTypes[currentUnitType] as { [key: string]: number };
      const baseValue = inputNumber * units[fromUnit];
      const convertedValue = baseValue / units[toUnit];
      setOutputValue(convertedValue.toFixed(2));
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
      {/*
        <View style={styles.themeToggleContainer}>
          <Text style={[styles.themeText, { color: theme.text }]}>
            {isDark ? t('Dark Mode') : t('Light Mode')}
          </Text>
          <Switch 
            value={isDark} 
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: theme.primary }}
            thumbColor={isDark ? "#FF6347" : "#f4f3f4"}
          />
        </View>
        */}
        {/*
        <View style={styles.topRight}>
          <TouchableOpacity
                  onPress={() => {
                    const nextLang = currentLang === 'en' ? 'ru' : currentLang === 'ru' ? 'kk' : 'en';
                    handleLanguageChange(nextLang);
                  }}
                >
                  <Image source={require('../../assets/images/language.png')} style={styles.langIcon} />
                </TouchableOpacity>
        </View>
        */}
        <Text style={[styles.title, { color: theme.text }]}>{t('unitConverter')}</Text>

        <View style={styles.unitTypeContainer}>
            {unitTypeItems.map((item) => (
              <TouchableOpacity
              key={item.value}
              style={[
                styles.unitTypeButton,
                currentUnitType === item.value && styles.selectedUnitTypeButton,
                { backgroundColor: theme.card },
              ]}
              onPress={() => handleUnitTypeDoubleTap(item.value as keyof typeof unitTypes, item.label)}
            >
              <Text
                style={[
                  styles.unitTypeText,
                  { color: currentUnitType === item.value ? '#007AFF' : theme.text },
                ]}
              >
                {t(item.label)}
              </Text>
            </TouchableOpacity>
            ))}
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.inputField,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder={t('enterValue')}
              placeholderTextColor={theme.text}
              keyboardType="numeric"
              value={inputValue}
              onChangeText={setInputValue}
            />

            <TouchableOpacity
              onLongPress={() => setInputValue('')}
              style={styles.resetButton}
            >
              <Text style={styles.resetButtonText}>⟲</Text>
            </TouchableOpacity>
          </View>




        <View style={styles.pickerRow}>
          <SimpleSelect
            value={fromUnit}
            items={unitItems}
            onValueChange={(value) => setFromUnit(value)}
            label="from"
          />
          
          <SimpleSelect
            value={toUnit}
            items={unitItems}
            onValueChange={(value) => setToUnit(value)}
            label="to"
          />
        </View>

        <View style={styles.resultContainer}>
          {outputValue !== '' && (
            <Text style={[styles.output, { color: theme.text }]}>
              {t('result')}: {outputValue} {t(currentLabels[toUnit])}
            </Text>
          )}
          <View style={styles.imageContainer}>
            <Image
              source={require('../../assets/images/length.png')}
              style={{ width: 200, height: 200 }}
              resizeMode="contain"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,         
    paddingBottom: 20, 
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  unitTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  unitTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  selectedUnitTypeButton: {
    backgroundColor: 'tomato',
  },
  unitTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedUnitTypeText: {
    color: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  
  inputField: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  
  pickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    width: '100%',
  },
  resultContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  imageContainer: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    padding: 8,
    textAlign: 'center',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  selectText: {
    fontSize: 16,
  },
  dropdownArrow: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '50%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
  },
  selectedItem: {
    backgroundColor: '#e3efff',
  },
  modalItemText: {
    fontSize: 16,
  },
  selectedItemText: {
    fontWeight: '600',
  },
  output: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  topRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop:30,
    marginBottom: 20,
    paddingHorizontal: 16,
    width: '100%',
  },
  themeText: {
    marginRight: 10,
    fontSize: 16,
  },
  langIcon: {
    width: 30,
    height: 30,
  },
  resetButton: {
    marginLeft: 10,
    backgroundColor: '#FF4500',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  
});

export default Converter;