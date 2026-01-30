export interface Habit {
    id: string;
    name: string;
    category?: string; // e.g. "Health", "Study"
    completedDates: string[]; // ISO Date strings "YYYY-MM-DD"
}

export interface Achievement {
    id: string;
    month: string; // "YYYY-MM"
    text: string;
}

export interface ToDo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string; // ISO string
}

export interface JournalEntry {
    date: string; // "YYYY-MM-DD"
    content: string;
}

export interface MetricData {
    date: string; // "YYYY-MM-DD"
    value: number; // e.g. 1-10
}

export interface AppData {
    habits: Habit[];
    achievements: Achievement[];
    todos: ToDo[];
    journal: Record<string, string>; // date -> content mapping for O(1) access
    metrics: MetricData[];
    preferences?: {
        theme: 'dark' | 'light';
        reducedMotion: boolean;
    };
}
