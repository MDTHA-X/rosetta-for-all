// client/src/screens/TournamentsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { TournamentService } from '../services/tournamentService';
import TournamentCard from '../components/TournamentCard';
import { Colors, Spacing, Typography } from '../constants/theme';

export default function TournamentsScreen({ theme = 'dark', user, onSelectTournament, onNavigate }) {
  const c = Colors[theme];
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const data = await TournamentService.getAll();
      setTournaments(data || []);
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const handleDelete = async (id) => {
    try {
      await TournamentService.delete(id);
      loadTournaments();
    } catch (err) {
      alert(err.message || 'Failed to delete tournament');
    }
  };

  const filtered = tournaments.filter((t) =>
    (t.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: c.textBright }]}>Tournaments</Text>
          <Text style={[styles.subtitle, { color: c.textMuted }]}>
            Active and archived Swiss tournaments
          </Text>
        </View>

        {user && user.is_super && (
          <TouchableOpacity
            onPress={() => onNavigate('newTournament')}
            style={[styles.addBtn, { backgroundColor: c.primary }]}
          >
            <Text style={styles.addBtnText}>+ New Tournament</Text>
          </TouchableOpacity>
        )}
      </View>

      <TextInput
        style={[styles.searchBar, { backgroundColor: c.surface, color: c.textBright, borderColor: c.border }]}
        placeholder="🔍 Search tournaments..."
        placeholderTextColor={c.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color={c.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TournamentCard
              tournament={item}
              theme={theme}
              isSuper={user?.is_super}
              onSelect={() => onSelectTournament(item)}
              onDelete={handleDelete}
            />
          )}
          ListEmptyComponent={
            <View style={[styles.emptyBox, { borderColor: c.border, backgroundColor: c.surface }]}>
              <Text style={[styles.emptyText, { color: c.textMuted }]}>
                No tournaments found. Create one to begin!
              </Text>
            </View>
          }
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.titleLarge,
  },
  subtitle: {
    ...Typography.caption,
    marginTop: 2,
  },
  addBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  addBtnText: {
    ...Typography.button,
    color: '#ffffff',
  },
  searchBar: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    ...Typography.bodyRegular,
  },
  emptyBox: {
    padding: Spacing.xl,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  emptyText: {
    ...Typography.bodyRegular,
  },
});

