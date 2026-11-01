// client/src/screens/AdminsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthService } from '../services/authService';
import { Colors, Spacing, Typography } from '../constants/theme';

export default function AdminsScreen({ theme = 'dark', onBack }) {
  const c = Colors[theme];
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // New admin form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSuper, setIsSuper] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const data = await AuthService.getAllAdmins();
      setAdmins(data || []);
    } catch (err) {
      console.error('Failed to load admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleCreate = async () => {
    if (!newUsername.trim() || !newPassword) {
      setError('Username and password are required.');
      return;
    }

    try {
      setCreateLoading(true);
      setError(null);
      await AuthService.createAdmin({
        username: newUsername.trim(),
        password: newPassword,
        is_super: isSuper ? 1 : 0,
      });
      setNewUsername('');
      setNewPassword('');
      setIsSuper(false);
      await loadAdmins();
    } catch (err) {
      setError(err.message || 'Failed to create admin');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await AuthService.deleteAdmin(id);
      await loadAdmins();
    } catch (err) {
      alert(err.message || 'Failed to delete admin');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <TouchableOpacity onPress={onBack} style={[styles.backBtn, { borderColor: c.border, backgroundColor: c.surfaceSubtle }]}>
        <Text style={{ color: c.text, fontSize: 13, fontWeight: '600' }}>← Back to Tournaments</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: c.textBright }]}>🛡️ Admin & Arbiter Management</Text>
      <Text style={[styles.subtitle, { color: c.textMuted }]}>
        Super Admin dashboard: Create arbiter accounts and manage delegated access
      </Text>

      {/* Create New Admin Box */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.sectionTitle, { color: c.textBright }]}>+ Create Arbiter Account</Text>

        {error && (
          <View style={[styles.alertBanner, { backgroundColor: c.danger + '22', borderColor: c.danger }]}>
            <Text style={{ color: c.danger }}>✕ {error}</Text>
          </View>
        )}

        <View style={styles.formRow}>
          <View style={{ flex: 1, marginRight: Spacing.sm }}>
            <Text style={[styles.label, { color: c.textMuted }]}>Username *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.surfaceSubtle, color: c.textBright, borderColor: c.border }]}
              placeholder="e.g. arbiter_david"
              placeholderTextColor={c.textMuted}
              value={newUsername}
              onChangeText={setNewUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: c.textMuted }]}>Password *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.surfaceSubtle, color: c.textBright, borderColor: c.border }]}
              placeholder="••••••••"
              placeholderTextColor={c.textMuted}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.checkboxRow}>
          <TouchableOpacity
            onPress={() => setIsSuper(!isSuper)}
            style={[
              styles.checkbox,
              { backgroundColor: isSuper ? c.primary : c.surfaceSubtle, borderColor: isSuper ? c.borderHighlight : c.border },
            ]}
          >
            {isSuper && <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '800' }}>✓</Text>}
          </TouchableOpacity>
          <Text style={[styles.checkboxLabel, { color: c.text }]}>
            Grant Super Admin Privileges (Full system access)
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleCreate}
          disabled={createLoading}
          style={[styles.createBtn, { backgroundColor: c.primary }]}
        >
          {createLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={{ color: '#ffffff', fontWeight: '700' }}>Create Admin</Text>}
        </TouchableOpacity>
      </View>

      {/* Admin List */}
      <Text style={[styles.sectionTitle, { color: c.textBright, marginTop: Spacing.md, marginBottom: Spacing.sm }]}>
        Existing Admins ({admins.length})
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={c.primary} />
      ) : (
        <FlatList
          data={admins}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={[styles.adminItem, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                  <Text style={[styles.adminName, { color: c.textBright }]}>{item.username}</Text>
                  <View
                    style={[
                      styles.roleBadge,
                      {
                        backgroundColor: item.is_super ? c.primary + '22' : c.textMuted + '22',
                        borderColor: item.is_super ? c.primary : c.border,
                      },
                    ]}
                  >
                    <Text style={{ color: item.is_super ? c.primary : c.textMuted, fontSize: 10, fontWeight: '700' }}>
                      {item.is_super ? 'SUPER ADMIN' : 'ARBITER'}
                    </Text>
                  </View>
                </View>

                <Text style={{ ...Typography.caption, color: c.textMuted, marginTop: 4 }}>
                  Assigned Tournaments: {item.tournaments?.length ? item.tournaments.map((t) => t.name).join(', ') : (item.is_super ? 'All' : 'None')}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={[styles.deleteBtn, { borderColor: c.danger }]}
              >
                <Text style={{ color: c.danger, fontSize: 12, fontWeight: '600' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.titleMedium,
    fontWeight: '800',
  },
  subtitle: {
    ...Typography.caption,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  alertBanner: {
    padding: Spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    ...Typography.bodyRegular,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  checkboxLabel: {
    ...Typography.caption,
  },
  createBtn: {
    height: 38,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  adminItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  adminName: {
    ...Typography.bodyMedium,
    fontWeight: '700',
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  deleteBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
});
