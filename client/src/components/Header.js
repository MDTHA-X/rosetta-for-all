// client/src/components/Header.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';

export default function Header({ theme = 'dark', user, onToggleTheme, onNavigate, onLogout }) {
  const c = Colors[theme];

  return (
    <View style={[styles.container, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
      <TouchableOpacity onPress={() => onNavigate('tournaments')} style={styles.brandRow}>
        <Text style={[styles.brandText, { color: c.textBright }]}>♔ Rosetta For All</Text>
      </TouchableOpacity>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={onToggleTheme}
          style={[styles.themeBtn, { borderColor: c.border, backgroundColor: c.surfaceSubtle }]}
        >
          <Text style={{ fontSize: 16 }}>{theme === 'dark' ? '🌙' : '☀️'}</Text>
        </TouchableOpacity>

        {user ? (
          <>
            {user.is_super && (
              <TouchableOpacity
                onPress={() => onNavigate('admins')}
                style={[styles.navBtn, { borderColor: c.border, backgroundColor: c.surfaceSubtle }]}
              >
                <Text style={[styles.navBtnText, { color: c.text }]}>Admins</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => onNavigate('changePassword')}
              style={[styles.navBtn, { borderColor: c.border, backgroundColor: c.surfaceSubtle }]}
            >
              <Text style={[styles.navBtnText, { color: c.text }]}>🔑 Password</Text>
            </TouchableOpacity>

            <View style={[styles.badge, { backgroundColor: c.badgeBg, borderColor: c.borderHighlight }]}>
              <Text style={[styles.badgeText, { color: c.primary }]}>{user.username}</Text>
            </View>

            <TouchableOpacity
              onPress={onLogout}
              style={[styles.navBtn, { borderColor: c.danger, backgroundColor: c.surfaceSubtle }]}
            >
              <Text style={[styles.navBtnText, { color: c.danger }]}>Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={() => onNavigate('login')}
            style={[styles.loginBtn, { backgroundColor: c.primary }]}
          >
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    ...Typography.titleSmall,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  themeBtn: {
    padding: Spacing.xs + 2,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtn: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  navBtnText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  loginBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 6,
  },
  loginBtnText: {
    ...Typography.button,
    color: '#ffffff',
  },
});

