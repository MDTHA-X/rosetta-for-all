// client/src/components/PairingTable.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';

export default function PairingTable({ pairings = [], playersById = {}, canManage, onSetResult, theme = 'dark', isCompleted }) {
  const c = Colors[theme];

  if (!pairings || pairings.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.emptyText, { color: c.textMuted }]}>
          No pairings generated for this round yet.
        </Text>
      </View>
    );
  }

  const resultOptions = ['1-0', '1/2', '0-1'];

  return (
    <View style={[styles.container, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={[styles.headerRow, { backgroundColor: c.surfaceSubtle, borderBottomColor: c.border }]}>
        <Text style={[styles.cell, styles.colBoard, { color: c.textMuted }]}>Bd</Text>
        <Text style={[styles.cell, styles.colPlayer, { color: c.textMuted, textAlign: 'right' }]}>White</Text>
        <Text style={[styles.cell, styles.colResult, { color: c.textMuted }]}>Result</Text>
        <Text style={[styles.cell, styles.colPlayer, { color: c.textMuted, textAlign: 'left' }]}>Black</Text>
      </View>

      {pairings.map((p, idx) => {
        if (p.is_bye) {
          const byePlayer = playersById[p.bye_for_id]?.name || `Player #${p.bye_for_id}`;
          return (
            <View key={p.id || idx} style={[styles.row, { borderBottomColor: c.border, backgroundColor: c.badgeBg }]}>
              <Text style={[styles.cell, styles.colBoard, { color: c.textMuted }]}>{p.board}</Text>
              <Text style={[styles.byeText, { color: c.primary }]}>
                🎯 {byePlayer} — Awarded 1/2-pt Bye
              </Text>
            </View>
          );
        }

        const whiteName = playersById[p.white_id]?.name || `Player #${p.white_id}`;
        const blackName = playersById[p.black_id]?.name || `Player #${p.black_id}`;

        return (
          <View
            key={p.id || idx}
            style={[
              styles.row,
              { borderBottomColor: c.border },
              idx % 2 === 1 ? { backgroundColor: c.surfaceSubtle + '33' } : null,
            ]}
          >
            <Text style={[styles.cell, styles.colBoard, { color: c.textMuted, fontWeight: '700' }]}>
              {p.board}
            </Text>

            <Text style={[styles.cell, styles.colPlayer, { color: c.textBright, textAlign: 'right', fontWeight: '500' }]} numberOfLines={1}>
              {whiteName}
            </Text>

            <View style={[styles.cell, styles.colResult, styles.resultContainer]}>
              {canManage && !isCompleted ? (
                <View style={styles.selectorRow}>
                  {resultOptions.map((opt) => {
                    const isSelected = p.result === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => onSetResult(p.id, opt)}
                        style={[
                          styles.optionBtn,
                          {
                            backgroundColor: isSelected ? c.primary : c.surfaceSubtle,
                            borderColor: isSelected ? c.borderHighlight : c.border,
                          },
                        ]}
                      >
                        <Text style={[styles.optionText, { color: isSelected ? '#ffffff' : c.text }]}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={[styles.resultDisplay, { color: p.result ? c.primary : c.textMuted }]}>
                  {p.result || '-'}
                </Text>
              )}
            </View>

            <Text style={[styles.cell, styles.colPlayer, { color: c.textBright, textAlign: 'left', fontWeight: '500' }]} numberOfLines={1}>
              {blackName}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  cell: {
    paddingHorizontal: Spacing.xs,
    ...Typography.bodyRegular,
    textAlign: 'center',
  },
  colBoard: { width: 45 },
  colPlayer: { flex: 1 },
  colResult: { width: 140, alignItems: 'center' },
  resultContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 4,
  },
  optionBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  resultDisplay: {
    ...Typography.bodyMedium,
    fontWeight: '800',
  },
  byeText: {
    flex: 1,
    ...Typography.bodyMedium,
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: Spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  emptyText: {
    ...Typography.bodyRegular,
  },
});
