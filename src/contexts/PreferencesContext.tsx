/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

type Theme = 'dark' | 'light' | 'system';
type Language = 'en-US' | 'en-GB' | 'en-IN';
type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
type TimeFormat = '12' | '24';
type StartOfWeek = 'monday' | 'sunday';

interface PreferencesState {
    theme: Theme;
    reducedMotion: boolean;
    language: Language;
    spellCheck: boolean;
    dateFormat: DateFormat;
    timeFormat: TimeFormat;
    startOfWeek: StartOfWeek;
    privacyBlur: boolean;
}

interface PreferencesContextType {
    preferences: PreferencesState;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    setLanguage: (lang: Language) => void;
    toggleSpellCheck: () => void;
    setDateFormat: (format: DateFormat) => void;
    setTimeFormat: (format: TimeFormat) => void;
    setStartOfWeek: (start: StartOfWeek) => void;
    togglePrivacyBlur: () => void;
    toggleReducedMotion: () => void;
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
        spellCheck: true,
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12',
        startOfWeek: 'sunday',
        privacyBlur: false
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

    // 2. Privacy Blur Effect
    useEffect(() => {
        if (!preferences.privacyBlur) {
            document.body.style.filter = 'none';
            return;
        }

        const handleBlur = () => {
            document.body.style.filter = 'blur(10px) grayscale(100%)';
            document.body.style.transition = 'filter 0.3s ease';
        };

        const handleFocus = () => {
            document.body.style.filter = 'none';
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.body.style.filter = 'none';
        };
    }, [preferences.privacyBlur]);


    // 3. Load Preferences from DB on Auth
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

    // 4. Actions
    const setTheme = async (newTheme: Theme) => {
        setPreferences(prev => ({ ...prev, theme: newTheme }));

        // Persist
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        if (user) {
            await supabase.from('profiles').upsert({ id: user.id, theme: newTheme, updated_at: new Date().toISOString() });
        }
    };

    const toggleTheme = () => {
        const cycles: Theme[] = ['system', 'dark', 'light'];
        const next = cycles[(cycles.indexOf(preferences.theme) + 1) % cycles.length];
        setTheme(next);
    };

    const setLanguage = (lang: Language) => {
        setPreferences(prev => ({ ...prev, language: lang }));
    };

    const toggleSpellCheck = () => {
        setPreferences(prev => ({ ...prev, spellCheck: !preferences.spellCheck }));
    };

    const setDateFormat = (format: DateFormat) => {
        setPreferences(prev => ({ ...prev, dateFormat: format }));
    };

    const setTimeFormat = (format: TimeFormat) => {
        setPreferences(prev => ({ ...prev, timeFormat: format }));
    };

    const setStartOfWeek = (start: StartOfWeek) => {
        setPreferences(prev => ({ ...prev, startOfWeek: start }));
    };

    const togglePrivacyBlur = () => {
        setPreferences(prev => ({ ...prev, privacyBlur: !preferences.privacyBlur }));
    };

    const toggleReducedMotion = () => {
        setPreferences(prev => ({ ...prev, reducedMotion: !preferences.reducedMotion }));
    };

    const value = {
        preferences,
        setTheme,
        toggleTheme,
        setLanguage,
        toggleSpellCheck,
        setDateFormat,
        setTimeFormat,
        setStartOfWeek,
        togglePrivacyBlur,
        toggleReducedMotion
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
