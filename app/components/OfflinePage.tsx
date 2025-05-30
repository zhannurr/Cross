import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image
} from 'react-native';
import { useTheme } from '../theme/theme';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';

// You can add an offline icon to your assets or use a simple text icon
export default function OfflinePage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { syncPendingData } = useAuth();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncPendingData();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Offline Icon - You can replace this with an actual icon */}
        <View style={[styles.iconContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.iconText, { color: theme.text }]}>📡</Text>
        </View>

        {/* Main Message */}
        <Text style={[styles.title, { color: theme.text }]}>
          {t('no_internet_connection') || 'No Internet Connection'}
        </Text>

        <Text style={[styles.message, { color: theme.secondaryText }]}>
          {t('check_connection_message') || 'There is a problem with Internet connection, please check your connection'}
        </Text>

        {/* Sync Button */}
        <TouchableOpacity
          onPress={handleSync}
          style={[
            styles.syncButton,
            { 
              backgroundColor: theme.primary,
              opacity: isSyncing ? 0.7 : 1
            }
          ]}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.buttonText}>
                {t('syncing') || 'Syncing...'}
              </Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>
              {t('sync_now') || 'Sync Now'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Additional Help Text */}
        <Text style={[styles.helpText, { color: theme.secondaryText }]}>
          {t('offline_help') || 'Once your connection is restored, this page will automatically disappear.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  syncButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
    minWidth: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: 8,
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});