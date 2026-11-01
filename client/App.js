// client/App.js
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, View, StyleSheet } from 'react-native';
import Header from './src/components/Header';
import TournamentsScreen from './src/screens/TournamentsScreen';
import TournamentDetailScreen from './src/screens/TournamentDetailScreen';
import LoginScreen from './src/screens/LoginScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import AdminsScreen from './src/screens/AdminsScreen';
import NewTournamentScreen from './src/screens/NewTournamentScreen';
import { AuthService } from './src/services/authService';
import { Colors } from './src/constants/theme';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('tournaments');
  const [selectedTournament, setSelectedTournament] = useState(null);

  // Check login session on mount
  useEffect(() => {
    AuthService.getCurrentUser()
      .then((res) => {
        if (res && res.logged_in) {
          setUser({
            id: res.id,
            username: res.username,
            is_super: !!res.is_super,
          });
        }
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setUser(null);
    setCurrentScreen('tournaments');
  };

  const c = Colors[theme];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Global Header */}
      <Header
        theme={theme}
        user={user}
        onToggleTheme={toggleTheme}
        onNavigate={(screen) => setCurrentScreen(screen)}
        onLogout={handleLogout}
      />

      {/* Main Screen Router */}
      <View style={styles.body}>
        {currentScreen === 'tournaments' && (
          <TournamentsScreen
            theme={theme}
            user={user}
            onSelectTournament={(t) => {
              setSelectedTournament(t);
              setCurrentScreen('tournamentDetail');
            }}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        )}

        {currentScreen === 'tournamentDetail' && selectedTournament && (
          <TournamentDetailScreen
            tournament={selectedTournament}
            theme={theme}
            user={user}
            onBack={() => setCurrentScreen('tournaments')}
          />
        )}

        {currentScreen === 'login' && (
          <LoginScreen
            theme={theme}
            onLoginSuccess={(loggedInUser) => {
              setUser(loggedInUser);
              setCurrentScreen('tournaments');
            }}
            onCancel={() => setCurrentScreen('tournaments')}
          />
        )}

        {currentScreen === 'changePassword' && (
          <ChangePasswordScreen
            theme={theme}
            onSuccess={() => setCurrentScreen('tournaments')}
            onCancel={() => setCurrentScreen('tournaments')}
          />
        )}

        {currentScreen === 'admins' && (
          <AdminsScreen
            theme={theme}
            onBack={() => setCurrentScreen('tournaments')}
          />
        )}

        {currentScreen === 'newTournament' && (
          <NewTournamentScreen
            theme={theme}
            onSuccess={(created) => {
              setSelectedTournament(created);
              setCurrentScreen('tournamentDetail');
            }}
            onCancel={() => setCurrentScreen('tournaments')}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
});
