// client/src/components/PlayerModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';

export default function PlayerModal({ visible, player, onClose, onSave, theme = 'dark' }) {
  const c = Colors[theme];

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [rating, setRating] = useState('1200');
  const [batch, setBatch] = useState('');
  const [sex, setSex] = useState('M');
  const [active, setActive] = useState(1);

  useEffect(() => {
    if (player) {
      setName(player.name || '');
      setTitle(player.title || '');
      setRating(String(player.rating || '1200'));
      setBatch(player.batch || '');
      setSex(player.sex || 'M');
      setActive(player.active !== undefined ? player.active : 1);
    } else {
      setName('');
      setTitle('');
      setRating('1200');
      setBatch('');
      setSex('M');
      setActive(1);
    }
  }, [player, visible]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      ...(player ? { id: player.id } : {}),
      name: name.trim(),
      title: title.trim(),
      rating: parseInt(rating, 10) || 1200,
      batch: batch.trim(),
      sex,
      active: Number(active),
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalBox, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.modalTitle, { color: c.textBright }]}>
            {player ? 'Edit Player' : 'Register New Player'}
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: c.textMuted }]}>Player Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.surfaceSubtle, color: c.textBright, borderColor: c.border }]}
              placeholder="e.g. Magnus Carlsen"
              placeholderTextColor={c.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: Spacing.sm }]}>
              <Text style={[styles.label, { color: c.textMuted }]}>Title</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.surfaceSubtle, color: c.textBright, borderColor: c.border }]}
                placeholder="GM, IM, FM..."
                placeholderTextColor={c.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: c.textMuted }]}>Rating *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.surfaceSubtle, color: c.textBright, borderColor: c.border }]}
                placeholder="1200"
                placeholderTextColor={c.textMuted}
                keyboardType="numeric"
                value={rating}
                onChangeText={setRating}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: Spacing.sm }]}>
              <Text style={[styles.label, { color: c.textMuted }]}>Batch / Club</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.surfaceSubtle, color: c.textBright, borderColor: c.border }]}
                placeholder="e.g. 2026"
                placeholderTextColor={c.textMuted}
                value={batch}
                onChangeText={setBatch}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: c.textMuted }]}>Sex</Text>
              <View style={styles.sexRow}>
                {['M', 'F'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSex(s)}
                    style={[
                      styles.sexBtn,
                      {
                        backgroundColor: sex === s ? c.primary : c.surfaceSubtle,
                        borderColor: sex === s ? c.borderHighlight : c.border,
                      },
                    ]}
                  >
                    <Text style={{ color: sex === s ? '#ffffff' : c.text, fontWeight: '700' }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {player && (
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: c.textMuted }]}>Status</Text>
              <TouchableOpacity
                onPress={() => setActive(active === 1 ? 0 : 1)}
                style={[
                  styles.toggleBtn,
                  { backgroundColor: active === 1 ? c.success + '22' : c.danger + '22', borderColor: active === 1 ? c.success : c.danger },
                ]}
              >
                <Text style={{ color: active === 1 ? c.success : c.danger, fontWeight: '700' }}>
                  {active === 1 ? '✓ Active in Tournament' : '✕ Inactive (Skipped in Pairings)'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={[styles.btn, { borderColor: c.border, backgroundColor: c.surfaceSubtle }]}>
              <Text style={[styles.btnText, { color: c.text }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSubmit} style={[styles.btn, { backgroundColor: c.primary }]}>
              <Text style={[styles.btnText, { color: '#ffffff' }]}>Save Player</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalBox: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  modalTitle: {
    ...Typography.titleSmall,
    fontWeight: '800',
    marginBottom: Spacing.md,
  },
  formGroup: {
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
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
  sexRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    height: 40,
  },
  sexBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1,
  },
  toggleBtn: {
    padding: Spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  btn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
  },
  btnText: {
    ...Typography.button,
  },
});
