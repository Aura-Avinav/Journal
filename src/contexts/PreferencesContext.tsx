/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

type Theme = 'dark' | 'light' | 'system';
type Language = 'en-US' | 'en-GB' | 'en-IN';

interface PreferencesState {
    theme: Theme;
    reducedMotion: boolean;
    language: Language;
    spellCheck: boolean;
}

interface PreferencesContextType {
    preferences: PreferencesState;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    setLanguage: (lang: Language) => void;
    toggleSpellCheck: () => void;
}

const THEME_STORAGE_KEY = 'journal_theme_preference';

const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'dark' || stored === 'light' || stored === 'system') return stored as Theme;
    }
    return 'system'; // Default to system
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState<PreferencesState>({
        theme: getInitialTheme(),
        reducedMotion: false,
        language: 'en-US',
        spellCheck: true
    });

    // 1. Sync Theme to DOM (Handle System Theme)
    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = (targetTheme: Theme) => {
            let effectiveTheme = targetTheme;

            if (targetTheme === 'system') {
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                effectiveTheme = systemDark ? 'dark' : 'light';
            }

            if (effectiveTheme === 'light') {
                root.classList.add('light');
                root.classList.remove('dark');
            } else {
                root.classList.add('dark');
                root.classList.remove('light');
            }
        };

        applyTheme(preferences.theme);

        // Listener for System changes
        if (preferences.theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme('system');

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }

    }, [preferences.theme]);

    // 2. Load Preferences from DB on Auth
    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            const { data } = await supabase.from('profiles').select('theme').eq('id', user.id).single();
            if (data?.theme) {
                // DB has priority over local defaults if set
                setPreferences(prev => ({ ...prev, theme: data.theme as Theme }));
            }
        };

        fetchProfile();
    }, [user]);

    // 3. Actions
    const setTheme = async (newTheme: Theme) => {
        setPreferences(prev => ({ ...prev, theme: newTheme }));

        // Persist
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        if (user) {
            await supabase.from('profiles').upsert({ id: user.id, theme: newTheme, updated_at: new Date().toISOString() });
        }
    };

    const toggleTheme = () => {
        // Toggle logic: System -> Dark -> Light -> System? Or just Dark <-> Light?
        // Let's keep it simple: If System, check what it is and flip. 
        // Actually, for a 3-way toggle UI, this function might be less useful, 
        // but for the header button, we might want a cycle.
        // Let's cycle: System -> Dark -> Light -> System
        const cycles: Theme[] = ['system', 'dark', 'light'];
        const next = cycles[(cycles.indexOf(preferences.theme) + 1) % cycles.length];
        setTheme(next);
    };

    const setLanguage = (lang: Language) => {
        setPreferences(prev => ({ ...prev, language: lang }));
        // Note: We'd persist this to DB prop if column existed
    };

    const toggleSpellCheck = () => {
        setPreferences(prev => ({ ...prev, spellCheck: !preferences.spellCheck }));
    };

    const value = {
        preferences,
        setTheme,
        toggleTheme,
        setLanguage,
        toggleSpellCheck
    };

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences() {
    const context = useContext(PreferencesContext);
    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
}
