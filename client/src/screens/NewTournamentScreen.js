// client/src/screens/NewTournamentScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { TournamentService } from '../services/tournamentService';
import { Colors, Spacing, Typography } from '../constants/theme';

export default function NewTournamentScreen({ theme = 'dark', onSuccess, onCancel }) {
  const c = Colors[theme];

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [timeControl, setTimeControl] = useState('15+10');
  const [roundsCount, setRoundsCount] = useState('5');
  const [type, setType] = useState('open');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNameChange = (val) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) {
      setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim()) {
      setError('Tournament name and URL slug are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await TournamentService.create({
        name: name.trim(),
        slug: slug.trim(),
        time_control: timeControl.trim(),
        rounds_count: parseInt(roundsCount, 10) || 5,
        type,
      });
      if (res && res.id) {
        onSuccess(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.title, { color: c.textBright }]}>+ Create New Tournament</Text>
        <Text style={[styles.subtitle, { color: c.textMuted }]}>
          Configure your Swiss tournament format, time control, and rounds
        </Text>

        {error && (
          <View style={[styles.alertBanner, { backgroundColor: c.danger + '22', borderColor: c.danger }]}>
            <Text style={{ color: c.danger }}>✕ {error}</Text>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: c.textMuted }]}>Tournament Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.surfaceSubtle, color: c.textBright, borderColor: c.border }]}
            placeholder="e.g. Rosetta Spring Blitz 2026"
            placeholderTextColor={c.textMuted}
            value={name}
            onChangeText={handleNameChange}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: c.textMuted }]}>URL Slug *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.surfaceSubtle, color: c.textBright, borderColor: c.border }]}
            placeholder="e.g. rosetta-spring-2026"
            placeholderTextColor={c.textMuted}
            value={slug}
            onChangeText={setSlug}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: Spacing.sm }]}>
            <Text style={[styles.label, { color: c.textMuted }]}>Time Control</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.surfaceSubtle, color: c.textBright, borderColor: c.border }]}
              placeholder="e.g. 10+5 or 90+30"
              placeholderTextColor={c.textMuted}
              value={timeControl}
              onChangeText={setTimeControl}
            />
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: c.textMuted }]}>Total Rounds</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.surfaceSubtle, color: c.textBright, borderColor: c.border }]}
              placeholder="5"
              placeholderTextColor={c.textMuted}
              keyboardType="numeric"
              value={roundsCount}
              onChangeText={setRoundsCount}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={onCancel} style={[styles.btn, { borderColor: c.border, backgroundColor: c.surfaceSubtle }]}>
            <Text style={{ color: c.text }}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCreate} disabled={loading} style={[styles.btn, { backgroundColor: c.primary }]}>
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={{ color: '#ffffff', fontWeight: '700' }}>Create Tournament</Text>}
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
    maxWidth: 480,
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
  row: {
    flexDirection: 'row',
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

