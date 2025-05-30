"use client";

import { Provider as JotaiProvider } from "jotai";
import { ChartThemeProvider } from "@/components/providers/chart-theme-provider";
import { ModeThemeProvider } from "@/components/providers/mode-theme-provider";
// import { ClassProvider } from "@/contexts/ClassContext";
import { AuthProvider } from "@/contexts/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <ModeThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
            <ChartThemeProvider>{children}</ChartThemeProvider>
        </AuthProvider>
      </ModeThemeProvider>
    </JotaiProvider>
  );
}
