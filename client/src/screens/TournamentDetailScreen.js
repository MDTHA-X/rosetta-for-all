// client/src/screens/TournamentDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { RoundService } from '../services/roundService';
import { PlayerService } from '../services/playerService';
import { TournamentService } from '../services/tournamentService';
import StandingsTable from '../components/StandingsTable';
import PairingTable from '../components/PairingTable';
import PlayerModal from '../components/PlayerModal';
import { Colors, Spacing, Typography } from '../constants/theme';

export default function TournamentDetailScreen({ tournament, theme = 'dark', user, onBack }) {
  const c = Colors[theme];
  const [activeTab, setActiveTab] = useState('pairings'); // 'pairings' | 'standings' | 'players'
  const [rounds, setRounds] = useState([]);
  const [standings, setStandings] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedRoundNum, setSelectedRoundNum] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  const canManage = user?.is_super || tournament?.can_manage;

  const loadData = async () => {
    try {
      setLoading(true);
      const [roundsData, playersData] = await Promise.all([
        RoundService.getByTournament(tournament.id, true),
        PlayerService.getByTournament(tournament.id),
      ]);

      const roundList = roundsData.rounds || (Array.isArray(roundsData) ? roundsData : []);
      const standingsList = roundsData.standings || [];

      setRounds(roundList);
      setStandings(standingsList);
      setPlayers(playersData || []);

      if (roundList.length > 0 && selectedRoundNum === 1) {
        setSelectedRoundNum(roundList[roundList.length - 1].number);
      }
    } catch (err) {
      console.error('Failed to load tournament details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tournament.id]);

  const currentRound = rounds.find((r) => r.number === selectedRoundNum) || rounds[0];

  const handleGenerateRound = async () => {
    try {
      await RoundService.generate(tournament.id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to generate pairings');
    }
  };

  const handleCompleteRound = async () => {
    if (!currentRound) return;
    try {
      await RoundService.complete(tournament.id, currentRound.id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to complete round');
    }
  };

  const handleReopenRound = async () => {
    if (!currentRound) return;
    try {
      await RoundService.reopen(tournament.id, currentRound.id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to reopen round');
    }
  };

  const handleDeleteRound = async () => {
    if (!currentRound) return;
    try {
      await RoundService.deleteRound(tournament.id, currentRound.id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete round');
    }
  };

  const handleSetResult = async (pairingId, result) => {
    try {
      await RoundService.setPairingResult(pairingId, result);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to save result');
    }
  };

  const handleSavePlayer = async (playerData) => {
    try {
      if (playerData.id) {
        await PlayerService.update(playerData.id, playerData);
      } else {
        await PlayerService.create({ ...playerData, tournament_id: tournament.id });
      }
      setModalVisible(false);
      setEditingPlayer(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to save player');
    }
  };

  const playersById = {};
  players.forEach((p) => {
    playersById[p.id] = p;
  });

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={[styles.backBtn, { borderColor: c.border, backgroundColor: c.surfaceSubtle }]}>
          <Text style={[styles.backText, { color: c.text }]}>← Back to Tournaments</Text>
        </TouchableOpacity>

        <View style={styles.titleArea}>
          <Text style={[styles.tournamentTitle, { color: c.textBright }]}>{tournament.name}</Text>
          <Text style={[styles.tournamentMeta, { color: c.textMuted }]}>
            {tournament.time_control} • {tournament.rounds_count} Rounds • Status: {tournament.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={[styles.tabsRow, { borderBottomColor: c.border }]}>
        {[
          { key: 'pairings', label: '⚔️ Pairings & Results' },
          { key: 'standings', label: '📊 Standings & Tiebreaks' },
          { key: 'players', label: `👥 Players (${players.length})` },
        ].map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tabBtn,
                isSelected && [styles.tabBtnActive, { borderBottomColor: c.primary }],
              ]}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: isSelected ? c.primary : c.textMuted, fontWeight: isSelected ? '700' : '500' },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={c.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.content}>
          {/* TAB 1: PAIRINGS & RESULTS */}
          {activeTab === 'pairings' && (
            <View>
              {/* Round Navigation Bar */}
              <View style={[styles.roundsBar, { backgroundColor: c.surface, borderColor: c.border }]}>
                <Text style={[styles.barLabel, { color: c.textMuted }]}>Round:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                  <View style={styles.roundButtonsRow}>
                    {rounds.map((r) => {
                      const isSelected = r.number === selectedRoundNum;
                      return (
                        <TouchableOpacity
                          key={r.id}
                          onPress={() => setSelectedRoundNum(r.number)}
                          style={[
                            styles.roundPill,
                            {
                              backgroundColor: isSelected ? c.primary : c.surfaceSubtle,
                              borderColor: isSelected ? c.borderHighlight : c.border,
                            },
                          ]}
                        >
                          <Text style={[styles.roundPillText, { color: isSelected ? '#ffffff' : c.text }]}>
                            Rd {r.number}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                {canManage && (
                  <TouchableOpacity
                    onPress={handleGenerateRound}
                    style={[styles.actionBtn, { backgroundColor: c.primary }]}
                  >
                    <Text style={styles.actionBtnText}>+ Next Round</Text>
                  </TouchableOpacity>
                )}
              </View>

              {currentRound ? (
                <View>
                  <View style={styles.roundHeaderRow}>
                    <Text style={[styles.sectionTitle, { color: c.textBright }]}>
                      Round {currentRound.number} Pairings
                    </Text>
                    <View
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor: currentRound.status === 'completed' ? c.success + '22' : c.warning + '22',
                          borderColor: currentRound.status === 'completed' ? c.success : c.warning,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: currentRound.status === 'completed' ? c.success : c.warning,
                          fontSize: 11,
                          fontWeight: '700',
                        }}
                      >
                        {currentRound.status === 'completed' ? '✓ COMPLETED' : '📝 DRAFT'}
                      </Text>
                    </View>
                  </View>

                  <PairingTable
                    pairings={currentRound.pairings}
                    playersById={playersById}
                    canManage={canManage}
                    isCompleted={currentRound.status === 'completed'}
                    onSetResult={handleSetResult}
                    theme={theme}
                  />

                  {/* Arbiter Action Controls */}
                  {canManage && (
                    <View style={styles.arbiterControls}>
                      {currentRound.status === 'draft' ? (
                        <>
                          <TouchableOpacity
                            onPress={handleCompleteRound}
                            style={[styles.actionBtn, { backgroundColor: c.success }]}
                          >
                            <Text style={styles.actionBtnText}>✓ Complete Round</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={handleDeleteRound}
                            style={[styles.outlineBtn, { borderColor: c.danger }]}
                          >
                            <Text style={[styles.outlineBtnText, { color: c.danger }]}>🗑️ Undo Pairings</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity
                          onPress={handleReopenRound}
                          style={[styles.outlineBtn, { borderColor: c.warning }]}
                        >
                          <Text style={[styles.outlineBtnText, { color: c.warning }]}>
                            🔓 Reopen Round to Edit Results
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              ) : (
                <View style={[styles.emptyBox, { borderColor: c.border, backgroundColor: c.surface }]}>
                  <Text style={[styles.emptyText, { color: c.textMuted }]}>
                    No rounds have been generated yet.
                  </Text>
                  {canManage && (
                    <TouchableOpacity
                      onPress={handleGenerateRound}
                      style={[styles.actionBtn, { backgroundColor: c.primary, marginTop: Spacing.sm }]}
                    >
                      <Text style={styles.actionBtnText}>Generate Round 1</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}

          {/* TAB 2: STANDINGS & TIEBREAKS */}
          {activeTab === 'standings' && (
            <View>
              <Text style={[styles.sectionTitle, { color: c.textBright }]}>Official FIDE Standings</Text>
              <StandingsTable standings={standings} theme={theme} />
            </View>
          )}

          {/* TAB 3: PLAYERS ROSTER */}
          {activeTab === 'players' && (
            <View>
              <View style={styles.playersHeader}>
                <Text style={[styles.sectionTitle, { color: c.textBright }]}>Registered Players</Text>
                {canManage && (
                  <TouchableOpacity
                    onPress={() => {
                      setEditingPlayer(null);
                      setModalVisible(true);
                    }}
                    style={[styles.actionBtn, { backgroundColor: c.primary }]}
                  >
                    <Text style={styles.actionBtnText}>+ Register Player</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={[styles.playersList, { backgroundColor: c.surface, borderColor: c.border }]}>
                {players.map((p, idx) => (
                  <View
                    key={p.id}
                    style={[
                      styles.playerRow,
                      { borderBottomColor: c.border },
                      idx % 2 === 1 ? { backgroundColor: c.surfaceSubtle + '33' } : null,
                    ]}
                  >
                    <View style={styles.playerInfo}>
                      <Text style={[styles.playerName, { color: c.textBright }]}>
                        {p.title ? `${p.title} ` : ''}{p.name}
                      </Text>
                      <Text style={[styles.playerSub, { color: c.textMuted }]}>
                        Rating: {p.rating} • Sex: {p.sex || '-'} • Batch: {p.batch || '-'}
                      </Text>
                    </View>

                    {canManage && (
                      <TouchableOpacity
                        onPress={() => {
                          setEditingPlayer(p);
                          setModalVisible(true);
                        }}
                        style={[styles.iconBtn, { borderColor: c.border, backgroundColor: c.surfaceSubtle }]}
                      >
                        <Text style={{ color: c.text, fontSize: 12 }}>Edit</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Add / Edit Player Modal */}
      <PlayerModal
        visible={modalVisible}
        player={editingPlayer}
        theme={theme}
        onClose={() => setModalVisible(false)}
        onSave={handleSavePlayer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d33',
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  backText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  titleArea: {
    marginTop: 2,
  },
  tournamentTitle: {
    ...Typography.titleMedium,
    fontWeight: '800',
  },
  tournamentMeta: {
    ...Typography.caption,
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  tabBtn: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.sm,
  },
  tabBtnActive: {
    borderBottomWidth: 2,
  },
  tabBtnText: {
    ...Typography.bodyMedium,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  roundsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  barLabel: {
    ...Typography.caption,
    fontWeight: '700',
    marginRight: Spacing.sm,
  },
  roundButtonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  roundPill: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  roundPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 3,
    borderRadius: 6,
    alignSelf: 'center',
  },
  actionBtnText: {
    ...Typography.button,
    color: '#ffffff',
  },
  roundHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  statusChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  arbiterControls: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  outlineBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  outlineBtnText: {
    ...Typography.button,
  },
  playersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  playersList: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    ...Typography.bodyMedium,
    fontWeight: '700',
  },
  playerSub: {
    ...Typography.caption,
    marginTop: 2,
  },
  iconBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  emptyBox: {
    padding: Spacing.xl,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.bodyRegular,
  },
});

