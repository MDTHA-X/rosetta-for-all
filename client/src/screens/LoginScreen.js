// client/src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthService } from '../services/authService';
import { Colors, Spacing, Typography } from '../constants/theme';

export default function LoginScreen({ theme = 'dark', onLoginSuccess, onCancel }) {
  const c = Colors[theme];

  const [username, setUsername] = useState('mdtha');
  const [password, setPassword] = useState('mdtha');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setRateLimitInfo(null);
      const res = await AuthService.login(username.trim(), password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      if (err.isRateLimited) {
        setRateLimitInfo({
          message: err.message || 'Too many authentication attempts.',
          retryAfter: err.retryAfter || 180,
        });
      } else {
        setError(err.message || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <View style={styles.header}>
          <Text style={[styles.logo, { color: c.textBright }]}>♔ Rosetta For All</Text>
          <Text style={[styles.title, { color: c.textBright }]}>Arbiter Login</Text>
          <Text style={[styles.subtitle, { color: c.textMuted }]}>
            Sign in to manage pairings, enter scores, and configure tournaments
          </Text>
        </View>

        {/* Rate Limiting Alert Banner */}
        {rateLimitInfo && (
          <View style={[styles.alertBanner, { backgroundColor: c.warning + '22', borderColor: c.warning }]}>
            <Text style={[styles.alertTitle, { color: c.warning }]}>⚠️ Rate Limit Active</Text>
            <Text style={[styles.alertText, { color: c.text }]}>
              {rateLimitInfo.message} (Security limit: 10 requests / 3 minutes).
            </Text>
          </View>
        )}

        {/* Standard Error Banner */}
        {error && (
          <View style={[styles.alertBanner, { backgroundColor: c.danger + '22', borderColor: c.danger }]}>
            <Text style={[styles.alertText, { color: c.danger }]}>✕ {error}</Text>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: c.textMuted }]}>Username</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.surfaceSubtle, color: c.textBright, borderColor: c.border }]}
            placeholder="Username"
            placeholderTextColor={c.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: c.textMuted }]}>Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.surfaceSubtle, color: c.textBright, borderColor: c.border }]}
            placeholder="••••••••"
            placeholderTextColor={c.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={[styles.submitBtn, { backgroundColor: c.primary }]}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {onCancel && (
          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: c.textMuted }]}>Cancel & Return to Dashboard</Text>
          </TouchableOpacity>
        )}

        <View style={[styles.hintBox, { borderColor: c.border }]}>
          <Text style={[styles.hintTitle, { color: c.textMuted }]}>Default Credentials:</Text>
          <Text style={[styles.hintText, { color: c.textMuted }]}>
            Super Admin: <Text style={{ color: c.primary }}>mdtha</Text> / <Text style={{ color: c.primary }}>mdtha</Text>
          </Text>
          <Text style={[styles.hintText, { color: c.textMuted }]}>
            Admin: <Text style={{ color: c.primary }}>admin</Text> / <Text style={{ color: c.primary }}>admin</Text>
          </Text>
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
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  title: {
    ...Typography.titleMedium,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: 4,
  },
  alertBanner: {
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  alertTitle: {
    ...Typography.bodyMedium,
    fontWeight: '800',
    marginBottom: 2,
  },
  alertText: {
    ...Typography.bodyRegular,
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
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    ...Typography.bodyRegular,
  },
  submitBtn: {
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  submitBtnText: {
    ...Typography.button,
    color: '#ffffff',
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  cancelText: {
    ...Typography.caption,
  },
  hintBox: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  hintTitle: {
    ...Typography.caption,
    fontWeight: '700',
    marginBottom: 2,
  },
  hintText: {
    ...Typography.caption,
  },
});
