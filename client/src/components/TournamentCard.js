// client/src/components/TournamentCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';

export default function TournamentCard({ tournament, theme = 'dark', onSelect, onEdit, onDelete, isSuper }) {
  const c = Colors[theme];
  const isActive = tournament.status === 'active';

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: c.textBright }]}>{tournament.name}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isActive ? c.success + '22' : c.textMuted + '22', borderColor: isActive ? c.success : c.border },
          ]}
        >
          <Text style={[styles.statusText, { color: isActive ? c.success : c.textMuted }]}>
            {isActive ? 'ACTIVE' : 'COMPLETED'}
          </Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <Text style={[styles.metaText, { color: c.textMuted }]}>
          ⏱️ {tournament.time_control || '10+5'}  •  🔄 {tournament.rounds_count} Rounds  •  🏷️ {tournament.type || 'Open'}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => onSelect(tournament)}
          style={[styles.primaryBtn, { backgroundColor: c.primary }]}
        >
          <Text style={styles.btnText}>View Tournament →</Text>
        </TouchableOpacity>

        {isSuper && (
          <View style={styles.superBtns}>
            {onEdit && (
              <TouchableOpacity
                onPress={() => onEdit(tournament)}
                style={[styles.iconBtn, { borderColor: c.border, backgroundColor: c.surfaceSubtle }]}
              >
                <Text style={{ color: c.text, fontSize: 13 }}>Edit</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={() => onDelete(tournament.id)}
                style={[styles.iconBtn, { borderColor: c.danger, backgroundColor: c.surfaceSubtle }]}
              >
                <Text style={{ color: c.danger, fontSize: 13 }}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.titleSmall,
    fontWeight: '700',
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  detailsRow: {
    marginBottom: Spacing.md,
  },
  metaText: {
    ...Typography.caption,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 2,
    borderRadius: 8,
  },
  btnText: {
    ...Typography.button,
    color: '#ffffff',
  },
  superBtns: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
    borderWidth: 1,
  },
});

