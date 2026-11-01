// client/src/components/StandingsTable.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';

export default function StandingsTable({ standings = [], theme = 'dark' }) {
  const c = Colors[theme];

  if (!standings || standings.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.emptyText, { color: c.textMuted }]}>
          No completed round results yet. Standings will be computed as games conclude.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.scroll}>
      <View style={[styles.table, { borderColor: c.border, backgroundColor: c.surface }]}>
        {/* Table Header */}
        <View style={[styles.row, styles.headerRow, { backgroundColor: c.surfaceSubtle, borderBottomColor: c.border }]}>
          <Text style={[styles.cell, styles.colRank, styles.headerText, { color: c.textMuted }]}>#</Text>
          <Text style={[styles.cell, styles.colName, styles.headerText, { color: c.textMuted }]}>Player</Text>
          <Text style={[styles.cell, styles.colRating, styles.headerText, { color: c.textMuted }]}>Rtg</Text>
          <Text style={[styles.cell, styles.colPts, styles.headerText, { color: c.primary }]}>PTS</Text>
          <Text style={[styles.cell, styles.colMetric, styles.headerText, { color: c.textMuted }]}>BH</Text>
          <Text style={[styles.cell, styles.colMetric, styles.headerText, { color: c.textMuted }]}>BH-1</Text>
          <Text style={[styles.cell, styles.colMetric, styles.headerText, { color: c.textMuted }]}>SB</Text>
          <Text style={[styles.cell, styles.colMetric, styles.headerText, { color: c.textMuted }]}>Koya</Text>
          <Text style={[styles.cell, styles.colMetric, styles.headerText, { color: c.textMuted }]}>TPR</Text>
        </View>

        {/* Table Rows */}
        {standings.map((s, idx) => {
          const isTop3 = idx < 3;
          return (
            <View
              key={s.playerId || idx}
              style={[
                styles.row,
                { borderBottomColor: c.border },
                idx % 2 === 1 ? { backgroundColor: c.surfaceSubtle + '44' } : null,
              ]}
            >
              <Text style={[styles.cell, styles.colRank, { color: isTop3 ? c.warning : c.text, fontWeight: isTop3 ? '800' : '500' }]}>
                {s.rank}
              </Text>

              <View style={[styles.cell, styles.colName, styles.nameContainer]}>
                {s.title ? (
                  <View style={[styles.titleBadge, { backgroundColor: c.primary + '22' }]}>
                    <Text style={[styles.titleText, { color: c.primary }]}>{s.title}</Text>
                  </View>
                ) : null}
                <Text style={[styles.playerName, { color: c.textBright }]} numberOfLines={1}>
                  {s.name}
                </Text>
              </View>

              <Text style={[styles.cell, styles.colRating, { color: c.textMuted }]}>{s.rating}</Text>
              <Text style={[styles.cell, styles.colPts, { color: c.primary, fontWeight: '800' }]}>
                {s.score.toFixed(1)}
              </Text>
              <Text style={[styles.cell, styles.colMetric, { color: c.text }]}>{s.buchholz}</Text>
              <Text style={[styles.cell, styles.colMetric, { color: c.text }]}>{s.medianBuchholz}</Text>
              <Text style={[styles.cell, styles.colMetric, { color: c.text }]}>{s.sonnebornBerger}</Text>
              <Text style={[styles.cell, styles.colMetric, { color: c.text }]}>{s.koya}</Text>
              <Text style={[styles.cell, styles.colMetric, { color: c.textMuted }]}>{s.tpr || '-'}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginVertical: Spacing.sm,
  },
  table: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    minWidth: 700,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  headerRow: {
    paddingVertical: Spacing.xs + 2,
  },
  headerText: {
    ...Typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cell: {
    paddingHorizontal: Spacing.sm,
    ...Typography.bodyRegular,
    textAlign: 'center',
  },
  colRank: { width: 45 },
  colName: { width: 220, textAlign: 'left' },
  colRating: { width: 65 },
  colPts: { width: 65 },
  colMetric: { width: 65 },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  titleBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginRight: 6,
  },
  titleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  playerName: {
    ...Typography.bodyMedium,
  },
  emptyContainer: {
    padding: Spacing.xl,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  emptyText: {
    ...Typography.bodyRegular,
    textAlign: 'center',
  },
});

