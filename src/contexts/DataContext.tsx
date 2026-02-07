/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { AppData, Habit, ToDo, Achievement, MetricData } from '../types';

interface DataContextType {
    habits: Habit[];
    achievements: Achievement[];
    todos: ToDo[];
    journal: Record<string, string>;
    metrics: MetricData[];

    // Actions
    toggleHabit: (habitId: string, date: string) => Promise<void>;
    addHabit: (name: string) => Promise<void>;
    removeHabit: (id: string) => Promise<void>;

    addAchievement: (text: string, monthStr?: string) => Promise<void>;
    removeAchievement: (id: string) => Promise<void>;

    toggleTodo: (id: string) => Promise<void>;
    addTodo: (text: string, type?: 'daily' | 'weekly' | 'monthly') => Promise<void>;
    removeTodo: (id: string) => Promise<void>;

    updateJournal: (date: string, content: string) => Promise<void>;

    // Bulk
    mergeData: (newData: Partial<AppData>) => Promise<void>;
    resetData: () => Promise<void>;
    resetMonthlyData: (date: Date) => Promise<void>;
    exportDataJSON: () => string;
    importDataJSON: (json: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    const [habits, setHabits] = useState<Habit[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [todos, setTodos] = useState<ToDo[]>([]);
    const [journal, setJournal] = useState<Record<string, string>>({});
    const [metrics, setMetrics] = useState<MetricData[]>([]);

    // Load Data
    useEffect(() => {
        if (!user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHabits([]);
            setAchievements([]);
            setTodos([]);
            setJournal({});
            setMetrics([]);
            return;
        }

        const fetchData = async () => {
            const userId = user.id;

            // 1. Habits & Completions
            const { data: dbHabits } = await supabase.from('habits').select('*').eq('user_id', userId);
            const { data: dbCompletions } = await supabase.from('habit_completions').select('*').eq('user_id', userId);

            const habitsFormatted = (dbHabits || []).map((h: any) => ({
                id: h.id,
                name: h.name,
                completedDates: (dbCompletions || [])
                    .filter((c: any) => c.habit_id === h.id)
                    .map((c: any) => c.completed_date)
            }));
            setHabits(habitsFormatted);

            // 2. Achievements
            const { data: dbAch } = await supabase.from('achievements').select('*').eq('user_id', userId);
            setAchievements((dbAch || []).map((a: any) => ({ id: a.id, text: a.text, month: a.month })));

            // 3. Todos
            const { data: dbTodos } = await supabase.from('todos').select('*').eq('user_id', userId);
            setTodos((dbTodos || []).map((t: any) => ({
                id: t.id,
                text: t.text,
                completed: t.completed,
                type: t.type || 'daily',
                createdAt: t.created_at
            })));

            // 4. Journal
            const { data: dbJournal } = await supabase.from('journal_entries').select('*').eq('user_id', userId);
            const journalMap: Record<string, string> = {};
            (dbJournal || []).forEach((e: any) => {
                if (e.content) journalMap[e.date] = e.content;
            });
            setJournal(journalMap);

            // 5. Metrics
            const { data: dbMetrics } = await supabase.from('metrics').select('*').eq('user_id', userId);
            setMetrics((dbMetrics || []).map((m: any) => ({ id: m.id, date: m.date, value: m.value, label: m.label })));
        };

        fetchData();
    }, [user]);

    // --- Actions ---

    const toggleHabit = async (habitId: string, date: string) => {
        setHabits(prev => prev.map(h => {
            if (h.id !== habitId) return h;
            const exists = h.completedDates.includes(date);
            return {
                ...h,
                completedDates: exists ? h.completedDates.filter(d => d !== date) : [...h.completedDates, date]
            };
        }));

        if (!user) return;
        const currentHabit = habits.find(h => h.id === habitId);

        if (currentHabit?.completedDates.includes(date)) {
            await supabase.from('habit_completions').delete().match({ habit_id: habitId, completed_date: date, user_id: user.id });
        } else {
            await supabase.from('habit_completions').insert({ habit_id: habitId, completed_date: date, user_id: user.id });
        }
    };

    const addHabit = async (name: string) => {
        const tempId = crypto.randomUUID();
        setHabits(prev => [...prev, { id: tempId, name, completedDates: [] }]);

        if (!user) return;
        const { data: inserted } = await supabase.from('habits').insert({ name, user_id: user.id }).select().single();
        if (inserted) {
            setHabits(prev => prev.map(h => h.id === tempId ? { ...h, id: inserted.id } : h));
        }
    };

    const removeHabit = async (id: string) => {
        setHabits(prev => prev.filter(h => h.id !== id));
        if (user) await supabase.from('habits').delete().eq('id', id);
    };

    const addAchievement = async (text: string, monthStr?: string) => {
        const month = monthStr || new Date().toISOString().slice(0, 7);
        const tempId = crypto.randomUUID();
        setAchievements(prev => [...prev, { id: tempId, month, text }]);

        if (!user) return;
        const { data: inserted } = await supabase.from('achievements').insert({ text, month, user_id: user.id }).select().single();
        if (inserted) {
            setAchievements(prev => prev.map(a => a.id === tempId ? { ...a, id: inserted.id } : a));
        }
    };

    const removeAchievement = async (id: string) => {
        setAchievements(prev => prev.filter(a => a.id !== id));
        if (user) await supabase.from('achievements').delete().eq('id', id);
    };

    const toggleTodo = async (id: string) => {
        const t = todos.find(todo => todo.id === id);
        if (!t) return;
        const newStatus = !t.completed;

        setTodos(prev => prev.map(todo => todo.id === id ? { ...todo, completed: newStatus } : todo));
        if (user) await supabase.from('todos').update({ completed: newStatus }).eq('id', id);
    };

    const addTodo = async (text: string, type: 'daily' | 'weekly' | 'monthly' = 'daily') => {
        const tempId = crypto.randomUUID();
        const now = new Date().toISOString();
        setTodos(prev => [...prev, { id: tempId, text, completed: false, type, createdAt: now }]);

        if (!user) return;
        const { data: inserted } = await supabase.from('todos').insert({ text, user_id: user.id, completed: false, type }).select().single();
        if (inserted) {
            setTodos(prev => prev.map(t => t.id === tempId ? { ...t, id: inserted.id } : t));
        }
    };

    const removeTodo = async (id: string) => {
        setTodos(prev => prev.filter(t => t.id !== id));
        if (user) await supabase.from('todos').delete().eq('id', id);
    };

    const updateJournal = async (date: string, content: string) => {
        if (!content || !content.trim()) {
            const newJ = { ...journal };
            delete newJ[date];
            setJournal(newJ);
            if (user) await supabase.from('journal_entries').delete().match({ user_id: user.id, date });
            return;
        }

        setJournal(prev => ({ ...prev, [date]: content }));
        if (user) await supabase.from('journal_entries').upsert({ user_id: user.id, date, content }, { onConflict: 'user_id,date' });
    };

    // Bulk & Reset
    const resetData = async () => {
        if (user) {
            const uid = user.id;
            await Promise.all([
                supabase.from('habit_completions').delete().eq('user_id', uid),
                supabase.from('habits').delete().eq('user_id', uid),
                supabase.from('achievements').delete().eq('user_id', uid),
                supabase.from('todos').delete().eq('user_id', uid),
                supabase.from('journal_entries').delete().eq('user_id', uid),
                supabase.from('metrics').delete().eq('user_id', uid)
            ]);
        }
        setHabits([]);
        setAchievements([]);
        setTodos([]);
        setJournal({});
        setMetrics([]);
    };

    const resetMonthlyData = async (date: Date) => {
        const monthStr = date.toISOString().slice(0, 7);
        if (user) {
            const uid = user.id;
            await supabase.from('achievements').delete().eq('user_id', uid).eq('month', monthStr);
            await supabase.from('journal_entries').delete().eq('user_id', uid).like('date', `${monthStr}%`);
            await supabase.from('habit_completions').delete().eq('user_id', uid).gte('completed_date', `${monthStr}-01`).lte('completed_date', `${monthStr}-31`);
        }

        // Optimistic
        setHabits(prev => prev.map(h => ({ ...h, completedDates: h.completedDates.filter(d => !d.startsWith(monthStr)) })));
        setAchievements(prev => prev.filter(a => a.month !== monthStr));
        setJournal(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(k => { if (k.startsWith(monthStr)) delete next[k]; });
            return next;
        });
        setMetrics(prev => prev.filter(m => !m.date.startsWith(monthStr)));
    };

    const exportDataJSON = () => {
        const data = {
            habits,
            achievements,
            todos,
            journal,
            metrics,
            preferences: { theme: 'dark' as const, reducedMotion: false } // Placeholder, preferences are elsewhere
        };
        return JSON.stringify(data, null, 2);
    };

    const importDataJSON = (json: string) => {
        try {
            const parsed = JSON.parse(json);
            // Apply locally only for now
            if (parsed.habits) setHabits(parsed.habits);
            if (parsed.todos) setTodos(parsed.todos);
            if (parsed.journal) setJournal(parsed.journal);
            // ... etc
        } catch (e) {
            console.error("Import failed", e);
        }
    };

    const mergeData = async (newData: Partial<AppData>) => {
        // 1. Journal
        if (newData.journal) {
            setJournal(prev => ({ ...prev, ...newData.journal }));
        }
        // ... etc (Simplified for now)
        if (newData.todos) setTodos(prev => [...prev, ...newData.todos!]);
    };

    const value = {
        habits, achievements, todos, journal, metrics,
        toggleHabit, addHabit, removeHabit,
        addAchievement, removeAchievement,
        toggleTodo, addTodo, removeTodo,
        updateJournal,
        mergeData, resetData, resetMonthlyData,
        exportDataJSON, importDataJSON
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
