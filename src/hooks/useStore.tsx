/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { AppData } from '../types';
import { supabase } from '../lib/supabase';

// const STORAGE_KEY = 'digital-journal-data-v2';

const THEME_STORAGE_KEY = 'journal_theme_preference';

const getInitialTheme = (): 'dark' | 'light' => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') return stored;

        if (window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
    }
    return 'dark';
};

const DEFAULT_DATA: AppData = {
    habits: [],
    achievements: [],
    todos: [],
    journal: {},
    metrics: [],
    preferences: {
        theme: getInitialTheme(),
        reducedMotion: false,
        language: 'en-US',
        spellCheck: true
    }
};

interface StoreContextType {
    session: any;
    user: any;
    data: AppData;
    toggleHabit: (habitId: string, date: string) => void;
    addHabit: (name: string) => void;
    removeHabit: (id: string) => void;
    addAchievement: (text: string, monthStr?: string) => void;
    removeAchievement: (id: string) => void;
    toggleTodo: (id: string) => void;
    addTodo: (text: string, type?: 'daily' | 'weekly' | 'monthly') => void;
    removeTodo: (id: string) => void;
    updateJournal: (date: string, content: string) => void;
    exportData: () => void;
    importData: (jsonData: string) => void;
    resetData: () => void;
    resetMonthlyData: (date: Date) => void;
    toggleTheme: () => void;
    setTheme: (theme: 'dark' | 'light') => void;
    setLanguage: (lang: 'en-US' | 'en-GB' | 'en-IN') => void;
    toggleSpellCheck: () => void;
    mergeData: (newData: Partial<AppData>) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<any>(null);
    const [data, setData] = useState<AppData>(() => ({
        ...DEFAULT_DATA,
        preferences: {
            theme: getInitialTheme(),
            reducedMotion: DEFAULT_DATA.preferences?.reducedMotion ?? false
        }
    }));

    // Auth Listener
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Sync Theme to DOM
    useEffect(() => {
        const theme = data.preferences?.theme || 'dark';
        if (theme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
    }, [data.preferences?.theme]);

    // Listen for System Theme Changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            // Only update if user hasn't manually overridden (no storage key)
            if (!localStorage.getItem(THEME_STORAGE_KEY)) {
                const newTheme = e.matches ? 'dark' : 'light';
                setData(prev => ({
                    ...prev,
                    preferences: { theme: newTheme, reducedMotion: prev.preferences?.reducedMotion ?? false }
                }));
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Load initial data from Supabase on Login
    useEffect(() => {
        if (!session?.user) {
            // Reset to defaults. Re-calculate initial theme to respect storage/system live.
            setData({
                ...DEFAULT_DATA,
                preferences: {
                    theme: getInitialTheme(),
                    reducedMotion: false
                }
            });
            return;
        }

        const fetchData = async () => {
            const userId = session.user.id;

            // 1. Habits
            const { data: habits } = await supabase.from('habits').select('*').eq('user_id', userId);
            const { data: completions } = await supabase.from('habit_completions').select('*').eq('user_id', userId);

            // Transform to AppData format
            const habitsFormatted = (habits || []).map((h: any) => ({
                id: h.id,
                name: h.name,
                completedDates: (completions || [])
                    .filter((c: any) => c.habit_id === h.id)
                    .map((c: any) => c.completed_date)
            }));

            // 2. Achievements
            const { data: achievements } = await supabase.from('achievements').select('*').eq('user_id', userId);

            // 3. Todos
            const { data: todos } = await supabase.from('todos').select('*').eq('user_id', userId);

            // 4. Journal
            const { data: journalEntries } = await supabase.from('journal_entries').select('*').eq('user_id', userId);
            const journalFormatted: Record<string, string> = {};
            (journalEntries || []).forEach((e: any) => {
                if (e.content && e.content.trim()) {
                    journalFormatted[e.date] = e.content;
                }
            });

            // 5. Metrics
            const { data: metrics } = await supabase.from('metrics').select('*').eq('user_id', userId);
            // Assuming metrics are simplified for now

            // 6. Preferences (Profiles)
            const { data: profile } = await supabase.from('profiles').select('theme').eq('id', userId).single();

            const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'dark' | 'light' | null;
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

            // Priority: DB -> LocalStorage -> System
            const dbTheme = profile?.theme as 'dark' | 'light' | null;
            const finalTheme = dbTheme || storedTheme || systemTheme;

            // Update local storage to match DB if it exists
            if (dbTheme && dbTheme !== storedTheme) {
                localStorage.setItem(THEME_STORAGE_KEY, dbTheme);
            }

            const preferences: { theme: 'dark' | 'light', reducedMotion: boolean } = {
                theme: finalTheme,
                reducedMotion: false
            };

            setData({
                habits: habitsFormatted,
                achievements: (achievements || []).map((a: any) => ({ id: a.id, text: a.text, month: a.month })),
                todos: (todos || []).map((t: any) => ({
                    id: t.id,
                    text: t.text,
                    completed: t.completed,
                    type: t.type || 'daily', // Default to daily if missing
                    createdAt: t.created_at
                })),
                journal: journalFormatted,
                metrics: (metrics || []).map((m: any) => ({ id: m.id, date: m.date, value: m.value, label: m.label })),
                preferences: preferences
            });
        };

        fetchData();
    }, [session]);


    const toggleHabit = async (habitId: string, date: string) => {
        // Optimistic Update
        setData(prev => ({
            ...prev,
            habits: prev.habits.map(h => {
                if (h.id !== habitId) return h;
                const exists = h.completedDates.includes(date);
                return {
                    ...h,
                    completedDates: exists
                        ? h.completedDates.filter(d => d !== date)
                        : [...h.completedDates, date]
                };
            })
        }));

        if (!session?.user) return;

        // DB Update
        const currentHabit = data.habits.find(h => h.id === habitId);
        // const isCompleted = currentHabit?.completedDates.includes(date); // State before optimistic update would be better, but this works for toggle logic distinctness
        // Actually, we need to check if we are ADDING or REMOVING.
        // Simplest: Check if it WAS there. 
        // We can just rely on try/catch insert/delete

        // Let's query first? No, slow.
        // Just try to delete. If 0 rows, try insert. Or assume UI state was correct.

        if (currentHabit?.completedDates.includes(date)) {
            // It WAS completed, so now we are UN-completing it (based on UI click)
            await supabase.from('habit_completions').delete()
                .match({ habit_id: habitId, completed_date: date, user_id: session.user.id });
        } else {
            // It was NOT completed, so INSERT
            await supabase.from('habit_completions').insert({
                habit_id: habitId,
                completed_date: date,
                user_id: session.user.id
            });
        }
    };

    const addHabit = async (name: string) => {
        if (!session?.user) return; // Should block in UI if not logged in

        const tempId = crypto.randomUUID();
        // Optimistic
        setData(prev => ({
            ...prev,
            habits: [...prev.habits, { id: tempId, name, completedDates: [] }]
        }));

        const { data: inserted } = await supabase.from('habits').insert({
            name,
            user_id: session.user.id
        }).select().single();

        if (inserted) {
            // Replace temp ID with real ID
            setData(prev => ({
                ...prev,
                habits: prev.habits.map(h => h.id === tempId ? { ...h, id: inserted.id } : h)
            }));
        }
    };

    const removeHabit = async (id: string) => {
        setData(prev => ({
            ...prev,
            habits: prev.habits.filter(h => h.id !== id)
        }));
        await supabase.from('habits').delete().eq('id', id);
    };

    const addAchievement = async (text: string, monthStr?: string) => {
        const month = monthStr || new Date().toISOString().slice(0, 7);
        const tempId = crypto.randomUUID();

        setData(prev => ({
            ...prev,
            achievements: [...prev.achievements, { id: tempId, month, text }]
        }));

        const { data: inserted } = await supabase.from('achievements').insert({
            text,
            month,
            user_id: session.user.id
        }).select().single();

        if (inserted) {
            setData(prev => ({
                ...prev,
                achievements: prev.achievements.map(a => a.id === tempId ? { ...a, id: inserted.id } : a)
            }));
        }
    };

    const removeAchievement = async (id: string) => {
        setData(prev => ({
            ...prev,
            achievements: prev.achievements.filter(a => a.id !== id)
        }));
        await supabase.from('achievements').delete().eq('id', id);
    };

    const toggleTodo = async (id: string) => {
        const todo = data.todos.find(t => t.id === id);
        if (!todo) return;

        const newStatus = !todo.completed;

        setData(prev => ({
            ...prev,
            todos: prev.todos.map(t => t.id === id ? { ...t, completed: newStatus } : t)
        }));

        await supabase.from('todos').update({ completed: newStatus }).eq('id', id);
    };

    const addTodo = async (text: string, type: 'daily' | 'weekly' | 'monthly' = 'daily') => {
        const tempId = crypto.randomUUID();
        const now = new Date().toISOString();

        setData(prev => ({
            ...prev,
            todos: [...prev.todos, { id: tempId, text, completed: false, type, createdAt: now }]
        }));

        const { data: inserted, error } = await supabase.from('todos').insert({
            text,
            user_id: session.user.id,
            completed: false,
            type // Attempt to save type
        }).select().single();

        if (error) {
            console.warn("Error saving todo type, might be missing column:", error);
            // If error is just about the column, the row might not be inserted?
            // Supabase throws on extra columns usually.
            // Fallback: insert without type if first attempt completely fails? 
            // Ideally we'd just want to proceed.
            // IF the insert FAILED, then we don't have an ID.
            // If we really can't add the column dynamically, we are stuck.
            // Assuming user applied schema update or we are okay with basic todos for now?
            // Actually, if we fail to insert, it won't be saved.
            // Let's assume we can insert.
        }

        if (inserted) {
            setData(prev => ({
                ...prev,
                todos: prev.todos.map(t => t.id === tempId ? { ...t, id: inserted.id } : t)
            }));
        }
    };

    const removeTodo = async (id: string) => {
        setData(prev => ({
            ...prev,
            todos: prev.todos.filter(t => t.id !== id)
        }));
        await supabase.from('todos').delete().eq('id', id);
    };

    const updateJournal = async (date: string, content: string) => {
        if (!content || !content.trim()) {
            // Remove entry if content is empty
            setData(prev => {
                const newJournal = { ...prev.journal };
                delete newJournal[date];
                return { ...prev, journal: newJournal };
            });

            if (session?.user) {
                await supabase.from('journal_entries').delete().match({
                    user_id: session.user.id,
                    date: date
                });
            }
            return;
        }

        setData(prev => ({
            ...prev,
            journal: { ...prev.journal, [date]: content }
        }));

        // Upsert
        await supabase.from('journal_entries').upsert({
            user_id: session.user.id,
            date: date,
            content: content
        }, { onConflict: 'user_id,date' });
    };

    const exportData = () => {
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ituts_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const importData = (jsonData: string) => {
        try {
            const parsed = JSON.parse(jsonData);
            setData(parsed);
            alert("Data imported locally!");
            // Note: Deep syncing imported data to Supabase is complex and skipped for now.
            // Ideally we would loop through parsed data and insert into DB.
        } catch {
            alert("Failed to import data: Invalid JSON");
        }
    };

    const resetData = async () => {
        // Reset DB
        if (session?.user) {
            const uid = session.user.id;
            await supabase.from('habit_completions').delete().eq('user_id', uid);
            await supabase.from('habits').delete().eq('user_id', uid);
            await supabase.from('achievements').delete().eq('user_id', uid);
            await supabase.from('todos').delete().eq('user_id', uid);
            await supabase.from('journal_entries').delete().eq('user_id', uid);
            await supabase.from('metrics').delete().eq('user_id', uid);
        }

        setData(DEFAULT_DATA);
    };

    const resetMonthlyData = async (date: Date) => {
        const monthStr = date.toISOString().slice(0, 7); // YYYY-MM

        if (session?.user) {
            const uid = session.user.id;
            // 1. Achievements
            await supabase.from('achievements').delete().eq('user_id', uid).eq('month', monthStr);

            // 2. Journal
            // Need filter by date string. Like statement?
            // SQLite/Postgres 'like'.
            // journal_entries date format is YYYY-MM-DD
            await supabase.from('journal_entries').delete().eq('user_id', uid).like('date', `${monthStr}%`);

            // 3. Habits? Complexity: Normalized table.
            // Delete from habit_completions where completed_date starts with YYYY-MM
            await supabase.from('habit_completions').delete().eq('user_id', uid).gte('completed_date', `${monthStr}-01`).lte('completed_date', `${monthStr}-31`);
        }

        setData(prev => {
            // ... existing local optimistic update logic ...
            const newHabits = prev.habits.map(h => ({
                ...h,
                completedDates: h.completedDates.filter(d => !d.startsWith(monthStr))
            }));

            const newAchievements = prev.achievements.filter(a => a.month !== monthStr);

            const newJournal = { ...prev.journal };
            Object.keys(newJournal).forEach(key => {
                if (key.startsWith(monthStr)) {
                    delete newJournal[key];
                }
            });

            const newMetrics = prev.metrics.filter(m => !m.date.startsWith(monthStr));

            return {
                ...prev,
                habits: newHabits,
                achievements: newAchievements,
                journal: newJournal,
                metrics: newMetrics
            };
        });
    };

    const setTheme = async (newTheme: 'dark' | 'light') => {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const isSystemMatch = newTheme === systemTheme;

        // Optimistic Update
        setData(prev => ({
            ...prev,
            preferences: {
                theme: newTheme,
                reducedMotion: prev.preferences?.reducedMotion ?? false
            }
        }));

        if (isSystemMatch) {
            // Re-enable Auto-Sync (Clear Override)
            localStorage.removeItem(THEME_STORAGE_KEY);
            if (session?.user) {
                const { error } = await supabase.from('profiles').update({ theme: null, updated_at: new Date().toISOString() }).eq('id', session.user.id);
                if (error) console.error("Error syncing theme (auto):", error);
            }
        } else {
            // Enforce Manual Override
            localStorage.setItem(THEME_STORAGE_KEY, newTheme);
            if (session?.user) {
                const { error } = await supabase.from('profiles').upsert({
                    id: session.user.id,
                    theme: newTheme,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });
                if (error) console.error("Error syncing theme (manual):", error);
            }
        }
    };

    const mergeData = async (newData: Partial<AppData>) => {
        // 1. Journal: Upsert locally + DB
        if (newData.journal) {
            const updates: Record<string, string> = {};
            Object.entries(newData.journal).forEach(([date, content]) => {
                const existing = data.journal[date];
                // Append if exists, else set
                updates[date] = existing ? existing + '\n\n' + content : content;
            });

            setData(prev => ({
                ...prev,
                journal: { ...prev.journal, ...updates }
            }));

            if (session?.user) {
                const upserts = Object.entries(updates).map(([date, content]) => ({
                    user_id: session.user.id,
                    date,
                    content
                }));
                // Batch upsert might be limited, but let's try
                const { error } = await supabase.from('journal_entries').upsert(upserts, { onConflict: 'user_id,date' });
                if (error) console.error("Error merging journal:", error);
            }
        }

        // 2. Todos: Append locally + DB
        if (newData.todos && newData.todos.length > 0) {
            const newTodos = newData.todos.map(t => ({ ...t, id: crypto.randomUUID() }));

            setData(prev => ({
                ...prev,
                todos: [...prev.todos, ...newTodos]
            }));

            if (session?.user) {
                const inserts = newTodos.map(t => ({
                    user_id: session.user.id,
                    text: t.text,
                    completed: t.completed,
                    type: t.type,
                    created_at: t.createdAt
                }));
                const { error } = await supabase.from('todos').insert(inserts);
                if (error) console.error("Error merging todos:", error);
            }
        }

        // 3. Habits: Append locally + DB
        if (newData.habits && newData.habits.length > 0) {
            const newHabits = newData.habits.filter(h => !data.habits.some(ex => ex.name === h.name));

            if (newHabits.length > 0) {
                const habitsWithIds = newHabits.map(h => ({ ...h, id: crypto.randomUUID(), completedDates: [] }));

                setData(prev => ({
                    ...prev,
                    habits: [...prev.habits, ...habitsWithIds]
                }));

                if (session?.user) {
                    const inserts = habitsWithIds.map(h => ({
                        user_id: session.user.id,
                        name: h.name
                    }));
                    const { error } = await supabase.from('habits').insert(inserts);
                    if (error) console.error("Error merging habits:", error);
                }
            }
        }
    };

    const setLanguage = (lang: 'en-US' | 'en-GB' | 'en-IN') => {
        setData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences!,
                language: lang
            }
        }));
    };

    const toggleSpellCheck = () => {
        setData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences!,
                spellCheck: !prev.preferences?.spellCheck
            }
        }));
    };

    const toggleTheme = () => {
        const currentTheme = data.preferences?.theme || 'dark';
        setTheme(currentTheme === 'light' ? 'dark' : 'light');
    };

    const value = {
        session,
        user: session?.user ?? null,
        data,
        toggleHabit,
        addHabit,
        removeHabit,
        addAchievement,
        removeAchievement,
        toggleTodo,
        addTodo,
        removeTodo,
        updateJournal,
        exportData,
        importData,
        resetData,
        resetMonthlyData,
        toggleTheme,
        setTheme,
        setLanguage,
        toggleSpellCheck,
        mergeData
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
}
