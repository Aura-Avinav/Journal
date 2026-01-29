import { useState, useEffect } from 'react';
import type { AppData } from '../types';

const STORAGE_KEY = 'digital-journal-data-v1';

const DEFAULT_DATA: AppData = {
    habits: [
        { id: '1', name: 'Wake up early', completedDates: [] },
        { id: '2', name: 'Run', completedDates: [] },
        { id: '3', name: 'Study', completedDates: [] },
        { id: '4', name: 'No Sugar', completedDates: [] },
        { id: '5', name: 'Read Book', completedDates: [] },
    ],
    achievements: [
        { id: '1', month: '2024-01', text: 'Started Digital Journal' }
    ],
    todos: [
        { id: '1', text: 'Plan the week', completed: false, createdAt: new Date().toISOString() }
    ],
    journal: {},
    metrics: [],
};

export function useStore() {
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

    const addAchievement = (text: string) => {
        const month = new Date().toISOString().slice(0, 7); // YYYY-MM
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

    const resetProgress = () => {
        setData(prev => ({
            ...prev,
            habits: prev.habits.map(h => ({ ...h, completedDates: [] }))
        }));
    };

    const exportData = () => {
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lifeos_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const importData = (jsonData: string) => {
        try {
            const parsed = JSON.parse(jsonData);
            // Simple validation could go here
            setData(parsed);
            alert("Data imported successfully!");
        } catch (e) {
            alert("Failed to import data: Invalid JSON");
        }
    };

    return {
        data,
        toggleHabit,
        addHabit,
        addAchievement,
        removeAchievement,
        toggleTodo,
        addTodo,
        removeTodo,
        updateJournal,
        resetProgress,
        exportData,
        importData
    };
}
