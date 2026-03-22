"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import { useMantineColorScheme } from '@mantine/core';

type Theme = "light" | "dark";

type ThemeContextType = {
    theme: Theme;
    toggleTheme: () => void;
    getCurrentTheme: () => Theme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { setColorScheme } = useMantineColorScheme();
    const [theme, setTheme] = useState<Theme>("light");
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // This code will only run on the client side
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        const initialTheme = savedTheme || "light";

        setTheme(initialTheme);
        setColorScheme(initialTheme);
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("theme", theme);
            if (typeof document !== 'undefined') {
                if (theme === "dark") {
                    document.documentElement.classList.add("dark");
                } else {
                    document.documentElement.classList.remove("dark");
                }
            }
        }
    }, [theme, isInitialized]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';

        setColorScheme(newTheme);
        setTheme(newTheme);
    };

    const getCurrentTheme = () => theme;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, getCurrentTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};