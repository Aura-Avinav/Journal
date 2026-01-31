import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { AppData } from '../types';

const STORAGE_KEY = 'digital-journal-data-v2';

const DEFAULT_DATA: AppData = {
    habits: [],
    achievements: [],
    todos: [],
    journal: {},
    metrics: [],
    preferences: {
        theme: 'dark',
        reducedMotion: false
    }
};

interface StoreContextType {
    data: AppData;
    toggleHabit: (habitId: string, date: string) => void;
    addHabit: (name: string) => void;
    removeHabit: (id: string) => void;
    addAchievement: (text: string, monthStr?: string) => void;
    removeAchievement: (id: string) => void;
    toggleTodo: (id: string) => void;
    addTodo: (text: string) => void;
    removeTodo: (id: string) => void;
    updateJournal: (date: string, content: string) => void;
    exportData: () => void;
    importData: (jsonData: string) => void;
    resetData: () => void;
    toggleTheme: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<AppData>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : DEFAULT_DATA;
        } catch (e) {
            console.error("Failed to load data", e);
            return DEFAULT_DATA;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

            // Apply theme
            if (data.preferences?.theme === 'light') {
                document.documentElement.classList.add('light');
            } else {
                document.documentElement.classList.remove('light');
            }
        } catch (e) {
            console.error("Failed to save data", e);
        }
    }, [data]);

    const toggleHabit = (habitId: string, date: string) => {
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
    };

    const addHabit = (name: string) => {
        setData(prev => ({
            ...prev,
            habits: [...prev.habits, { id: crypto.randomUUID(), name, completedDates: [] }]
        }));
    };

    const removeHabit = (id: string) => {
        setData(prev => ({
            ...prev,
            habits: prev.habits.filter(h => h.id !== id)
        }));
    };

    const addAchievement = (text: string, monthStr?: string) => {
        const month = monthStr || new Date().toISOString().slice(0, 7); // YYYY-MM
        setData(prev => ({
            ...prev,
            achievements: [...prev.achievements, { id: crypto.randomUUID(), month, text }]
        }));
    };

    const removeAchievement = (id: string) => {
        setData(prev => ({
            ...prev,
            achievements: prev.achievements.filter(a => a.id !== id)
        }));
    };

    const toggleTodo = (id: string) => {
        setData(prev => ({
            ...prev,
            todos: prev.todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
        }));
    };

    const addTodo = (text: string) => {
        setData(prev => ({
            ...prev,
            todos: [...prev.todos, { id: crypto.randomUUID(), text, completed: false, createdAt: new Date().toISOString() }]
        }));
    };

    const removeTodo = (id: string) => {
        setData(prev => ({
            ...prev,
            todos: prev.todos.filter(t => t.id !== id)
        }));
    };

    const updateJournal = (date: string, content: string) => {
        setData(prev => ({
            ...prev,
            journal: { ...prev.journal, [date]: content }
        }));
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
            alert("Data imported successfully!");
        } catch (e) {
            alert("Failed to import data: Invalid JSON");
        }
    };

    const resetData = () => {
        const emptyData: AppData = {
            habits: [],
            achievements: [],
            todos: [],
            journal: {},
            metrics: [],
            preferences: {
                theme: 'dark',
                reducedMotion: false
            }
        };
        setData(emptyData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyData));
        window.location.reload();
    };

    const toggleTheme = () => {
        setData(prev => ({
            ...prev,
            preferences: {
                theme: prev.preferences?.theme === 'light' ? 'dark' : 'light',
                reducedMotion: prev.preferences?.reducedMotion ?? false
            }
        }));
    };

    const value = {
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
        toggleTheme
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
}
