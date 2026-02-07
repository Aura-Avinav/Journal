/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { PreferencesProvider, usePreferences } from '../contexts/PreferencesContext';
import { DataProvider, useData } from '../contexts/DataContext';
import { AppData } from '../types';

export function StoreProvider({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <PreferencesProvider>
                <DataProvider>
                    {children}
                </DataProvider>
            </PreferencesProvider>
        </AuthProvider>
    );
}

// Legacy hook that combines everything
export function useStore() {
    const { session, user, signOut } = useAuth();
    const { preferences, setTheme, toggleTheme, setLanguage, toggleSpellCheck } = usePreferences();
    const {
        habits, achievements, todos, journal, metrics,
        toggleHabit, addHabit, removeHabit,
        addAchievement, removeAchievement,
        toggleTodo, addTodo, removeTodo,
        updateJournal,
        mergeData, resetData, resetMonthlyData,
        exportDataJSON, importDataJSON
    } = useData();

    // Construct the legacy 'data' object on the fly
    const data: AppData = {
        habits,
        achievements,
        todos,
        journal,
        metrics,
        preferences: {
            theme: preferences.theme,
            reducedMotion: preferences.reducedMotion,
            language: preferences.language,
            spellCheck: preferences.spellCheck
        }
    };

    return {
        session,
        user,
        signOut,
        data,

        // Preferences
        setTheme,
        toggleTheme,
        setLanguage,
        toggleSpellCheck,

        // Data Actions
        toggleHabit,
        addHabit,
        removeHabit,
        addAchievement,
        removeAchievement,
        toggleTodo,
        addTodo,
        removeTodo,
        updateJournal,
        mergeData,
        resetData,
        resetMonthlyData,

        // Import/Export
        exportData: () => {
            const json = exportDataJSON();
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ituts_backup_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        importData: importDataJSON
    };
}
