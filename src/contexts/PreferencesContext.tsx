import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

type Theme = 'dark' | 'light';
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
        if (stored === 'dark' || stored === 'light') return stored;
        if (window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
    }
    return 'dark';
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

    // 1. Sync Theme to DOM
    useEffect(() => {
        const root = document.documentElement;
        if (preferences.theme === 'light') {
            root.classList.add('light');
        } else {
            root.classList.remove('light');
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
        setTheme(preferences.theme === 'dark' ? 'light' : 'dark');
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
