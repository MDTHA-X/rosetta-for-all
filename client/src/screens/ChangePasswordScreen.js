// client/src/screens/ChangePasswordScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthService } from '../services/authService';
import { Colors, Spacing, Typography } from '../constants/theme';

export default function ChangePasswordScreen({ theme = 'dark', onSuccess, onCancel }) {
  const c = Colors[theme];

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      await AuthService.changePassword(oldPassword, newPassword, confirmPassword);
      setMessage('Password successfully changed!');
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.title, { color: c.textBright }]}>🔑 Change Password</Text>
        <Text style={[styles.subtitle, { color: c.textMuted }]}>
          Update your administrative login credentials
        </Text>

        {error && (
          <View style={[styles.alertBanner, { backgroundColor: c.danger + '22', borderColor: c.danger }]}>
            <Text style={{ color: c.danger }}>✕ {error}</Text>
          </View>
        )}

        {message && (
          <View style={[styles.alertBanner, { backgroundColor: c.success + '22', borderColor: c.success }]}>
            <Text style={{ color: c.success }}>✓ {message}</Text>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: c.textMuted }]}>Current Password *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.surfaceSubtle, color: c.textBright, borderColor: c.border }]}
            placeholder="Enter current password"
            placeholderTextColor={c.textMuted}
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: c.textMuted }]}>New Password *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.surfaceSubtle, color: c.textBright, borderColor: c.border }]}
            placeholder="Enter new password"
            placeholderTextColor={c.textMuted}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: c.textMuted }]}>Confirm New Password *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.surfaceSubtle, color: c.textBright, borderColor: c.border }]}
            placeholder="Re-enter new password"
            placeholderTextColor={c.textMuted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={onCancel} style={[styles.btn, { borderColor: c.border, backgroundColor: c.surfaceSubtle }]}>
            <Text style={{ color: c.text }}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSubmit} disabled={loading} style={[styles.btn, { backgroundColor: c.primary }]}>
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={{ color: '#ffffff', fontWeight: '700' }}>Save Password</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 14,
    borderWidth: 1,
    padding: Spacing.xl,
  },
  title: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
  subtitle: {
    ...Typography.caption,
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  alertBanner: {
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  formGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    ...Typography.bodyRegular,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  btn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
});
