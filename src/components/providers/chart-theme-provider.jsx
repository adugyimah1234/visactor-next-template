"use client";
import { useTheme } from "next-themes";
import { createContext, useContext, useEffect, useState } from "react";
import { ThemeManager } from "@visactor/vchart";
import { customDarkTheme, customLightTheme } from "@/config/chart-theme";
export const ChartThemeContext = createContext({
    theme: undefined,
});
export function ChartThemeProvider({ children, }) {
    const { theme: modeTheme } = useTheme();
    const [theme, setTheme] = useState("system");
    useEffect(() => {
        registerTheme();
    }, []);
    useEffect(() => {
        const updateTheme = () => {
            if (modeTheme === "light" || modeTheme === "dark") {
                setTheme(modeTheme);
                ThemeManager.setCurrentTheme(modeTheme);
            }
            else if (modeTheme === "system") {
                const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                    .matches
                    ? "dark"
                    : "light";
                setTheme("system");
                ThemeManager.setCurrentTheme(systemTheme);
            }
        };
        updateTheme();
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (modeTheme === "system") {
                updateTheme();
            }
        };
        mediaQuery.addEventListener("change", handleChange);
        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, [modeTheme]);
    return (<ChartThemeContext.Provider value={{ theme }}>
      {children}
    </ChartThemeContext.Provider>);
}
export function useChartTheme() {
    const context = useContext(ChartThemeContext);
    if (!context) {
        throw new Error("useChartTheme must be used within a ChartThemeProvider");
    }
    return context;
}
const registerTheme = () => {
    // Temporary solution to get the font from the body
    // issue: https://github.com/VisActor/VChart/issues/3145
    const font = window
        .getComputedStyle(document.body)
        .getPropertyValue("--font-gabarito")
        .trim();
    const lightTheme = Object.assign(Object.assign({}, customLightTheme), { fontFamily: font });
    const darkTheme = Object.assign(Object.assign({}, customDarkTheme), { fontFamily: font });
    ThemeManager.registerTheme("light", lightTheme);
    ThemeManager.registerTheme("dark", darkTheme);
};
