// _layout.tsx
import { Stack } from "expo-router";
import React from "react";
import { ThemeProvider, useTheme } from "./theme/theme";

import { AuthProvider } from "../auth/AuthContext"; 

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LayoutWithTheme />
      </ThemeProvider>
    </AuthProvider>
  );
}

// Separate layout using theme
function LayoutWithTheme() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    />
  );
}
