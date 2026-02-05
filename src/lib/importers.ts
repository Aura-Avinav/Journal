import type { AppData, ToDo } from '../types';

export async function parseObsidianFiles(files: File[]): Promise<Partial<AppData>> {
    const journal: Record<string, string> = {};
    const todos: ToDo[] = [];

    for (const file of files) {
        if (!file.name.endsWith('.md')) continue;

        const text = await file.text();
        const dateMatch = file.name.match(/^(\d{4}-\d{2}-\d{2})/);

        // 1. Journal Entries (from Daily Notes)
        if (dateMatch) {
            const date = dateMatch[1];
            journal[date] = text;
        }

        // 2. Todos (Parse "- [ ] " anywhere)
        const lines = text.split('\n');
        lines.forEach(line => {
            // Basic regex for unchecked checkboxes: - [ ] or * [ ]
            const todoMatch = line.match(/^(\s*[-*]\s\[\s\]\s)(.+)$/);
            if (todoMatch) {
                todos.push({
                    id: crypto.randomUUID(),
                    text: todoMatch[2].trim(),
                    completed: false,
                    type: 'daily',
                    createdAt: new Date().toISOString()
                });
            }
        });
    }

    return { journal, todos };
}

export async function parseNotionFiles(files: File[]): Promise<Partial<AppData>> {
    // Basic CSV support for now
    // Future: proper markdown parsing similar to Obsidian
    const todos: ToDo[] = [];

    for (const file of files) {
        if (file.name.endsWith('.csv')) {
            const text = await file.text();
            const lines = text.split('\n');
            const headers = lines[0].toLowerCase().split(',');

            // Allow "Name" or "Title" or "Content" column
            const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('title') || h.includes('content') || h.includes('property'));

            if (nameIdx === -1) continue;

            for (let i = 1; i < lines.length; i++) {
                const row = lines[i].split(','); // Very basic CSV split
                if (row.length <= nameIdx) continue;

                const taskName = row[nameIdx].replace(/^"|"$/g, '').trim();
                if (taskName) {
                    todos.push({
                        id: crypto.randomUUID(),
                        text: taskName,
                        completed: false,
                        type: 'daily',
                        createdAt: new Date().toISOString()
                    });
                }
            }
        }
    }

    return { todos };
}
