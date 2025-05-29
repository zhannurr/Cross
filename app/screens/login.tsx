import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import { useTheme } from '../theme/theme';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

interface LoginProps {
  onLogin?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { enterGuestMode } = useAuth(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [secureEntry, setSecureEntry] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, register } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

const validateForm = () => {
  const newErrors: Record<string, string> = {};
  
  if (!email) {
    newErrors.email = t('emailRequired');
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    newErrors.email = t('invalidEmail');
  }
  
  if (!password) {
    newErrors.password = t('passwordRequired');
  } else if (password.length < 6) {
    newErrors.password = t('passwordTooShort');
  }
  
  if (!isLogin) {
    if (!name) {
      newErrors.name = t('nameRequired');
    }
    if (!surname) {
      newErrors.surname = t('surnameRequired');
    }
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    if (isLogin) {
      await login(email, password);
      Toast.show({
        type: 'success',
        text1: t('loginSuccess'),
        text2: t('welcomeBack'),
      });
      if (onLogin) onLogin();
      navigation.navigate('Account');
    } else {
      await register(email, password, name, surname);
      Toast.show({
        type: 'success',
        text1: t('registrationSuccess'),
        text2: t('accountCreated'),
      });
      await login(email, password);
      if (onLogin) onLogin();
      navigation.navigate('Account');
    }
  } catch (error: any) {
    if (error.code === 'auth/wrong-password') {
      setErrors({
        ...errors,
        password: t('wrongPassword'),
      });
      Toast.show({
        type: 'error',
        text1: t('loginFailed'),
        text2: t('wrongPassword'),
      });
    } else if (error.code === 'auth/user-not-found') {
      setErrors({
        ...errors,
        email: t('userNotFound'),
      });
      Toast.show({
        type: 'error',
        text1: t('loginFailed'),
        text2: t('userNotFound'),
      });
    } else {
      Toast.show({
        type: 'error',
        text1: isLogin ? t('loginFailed') : t('registrationFailed'),
        text2: error.message || t('somethingWentWrong'),
      });
    }
  }
};

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setSurname('');
    setErrors({});
    setIsLogin(!isLogin);
  };

  const getInputStyle = (field: string) => {
    return [
      styles.input, 
      {
        backgroundColor: theme.card,
        color: theme.text,
        borderColor: errors[field] ? theme.error : 'transparent',
        borderWidth: errors[field] ? 1 : 0,
      }
    ];
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.innerContainer}>
        <View style={styles.logoContainer}>
          <Ionicons name="lock-closed" size={60} color={theme.primary} />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>
          {isLogin ? t('Welcome!') : t('Create Account')}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {isLogin ? t('loginToContinue') : t('register now')}
        </Text>

        {/* Name and Surname Inputs (only visible in registration mode) */}
        {!isLogin && (
          <>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={getInputStyle('name')}
                placeholder={t('name')}
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) setErrors({...errors, name: ''});
                }}
                autoCapitalize="words"
              />
            </View>
            {errors.name && <Text style={[styles.errorText, {color: theme.error}]}>{errors.name}</Text>}

            <View style={styles.inputContainer}>
              <Ionicons name="people-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={getInputStyle('surname')}
                placeholder={t('surname')}
                placeholderTextColor={theme.textSecondary}
                value={surname}
                onChangeText={(text) => {
                  setSurname(text);
                  if (errors.surname) setErrors({...errors, surname: ''});
                }}
                autoCapitalize="words"
              />
            </View>
            {errors.surname && <Text style={[styles.errorText, {color: theme.error}]}>{errors.surname}</Text>}
          </>
        )}

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={getInputStyle('email')}
            placeholder={t('email')}
            placeholderTextColor={theme.textSecondary}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({...errors, email: ''});
            }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        {errors.email && <Text style={[styles.errorText, {color: theme.error}]}>{errors.email}</Text>}

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="key-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={getInputStyle('password')}
            placeholder={t('password')}
            placeholderTextColor={theme.textSecondary}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({...errors, password: ''});
            }}
            secureTextEntry={secureEntry}
          />
          <TouchableOpacity 
            onPress={() => setSecureEntry(!secureEntry)} 
            style={styles.eyeIcon}
          >
            <Ionicons name={secureEntry ? 'eye-off' : 'eye'} size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={[styles.errorText, {color: theme.error}]}>{errors.password}</Text>}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {isLogin ? t('login') : t('register')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
        style={[styles.guestButton, { backgroundColor: theme.secondary }]}
        onPress={() => {
          enterGuestMode();
          if (onLogin) onLogin();
          navigation.navigate('Account');
        }}
      >
        <Text style={styles.buttonText}>{t('continueAsGuest')}</Text>
      </TouchableOpacity>

        {/* Switch between Login/Register */}
        <View style={styles.switchContainer}>
          <Text style={{ color: theme.textSecondary }}>
            {isLogin ? t('no account?') : t('haveAnAccount')}
          </Text>
          <TouchableOpacity onPress={resetForm}>
            <Text style={[styles.switchText, { color: theme.primary }]}>
              {isLogin ? t('register') : t('login')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 45,
    fontSize: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 5,
  },
  switchText: {
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 15,
  },
   guestButton: {
    backgroundColor: 'blue',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
});

export default Login;