import { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { cn } from '../lib/utils';
import { ChevronRight, Calendar, Save } from 'lucide-react';

export function JournalEditor() {
    const { data, updateJournal } = useStore();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [content, setContent] = useState('');

    // Load content when date changes
    useEffect(() => {
        setContent(data.journal[selectedDate] || '');
    }, [selectedDate, data.journal]);

    const handleSave = () => {
        updateJournal(selectedDate, content);
    };

    // Autosave after delay
    useEffect(() => {
        const timer = setTimeout(() => {
            if (content !== (data.journal[selectedDate] || '')) {
                updateJournal(selectedDate, content);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [content, selectedDate]);

    return (
        <div className="flex flex-col md:flex-row h-[80vh] gap-6 animate-in fade-in duration-500">
            {/* Sidebar: Date Picker / List */}
            <div className="w-full md:w-64 bg-surface/30 border border-surfaceHighlight rounded-xl flex flex-col p-4 shrink-0">
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-accent" />
                    Entries
                </h3>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-surfaceHighlight/50 border border-surfaceHighlight text-white text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5 mb-4"
                />

                <div className="flex-1 overflow-y-auto space-y-1">
                    {Object.keys(data.journal).sort().reverse().map(date => (
                        <button
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group",
                                date === selectedDate ? "bg-accent/20 text-accent" : "text-secondary hover:bg-surfaceHighlight"
                            )}
                        >
                            <span>{date}</span>
                            <ChevronRight className={cn("w-4 h-4 opacity-0 transition-opacity", date === selectedDate ? "opacity-100" : "group-hover:opacity-50")} />
                        </button>
                    ))}
                    {Object.keys(data.journal).length === 0 && <span className="text-secondary/50 text-xs text-center block mt-10">No entries yet</span>}
                </div>
            </div>

            {/* Main Editor */}
            <div className="flex-1 bg-surface/30 border border-surfaceHighlight rounded-xl flex flex-col relative overflow-hidden focus-within:ring-1 focus-within:ring-accent/50 transition-all">
                <div className="p-4 border-b border-surfaceHighlight flex items-center justify-between bg-surface/50">
                    <span className="text-secondary font-mono text-sm">
                        Journaling - <span className="text-primary font-bold">{selectedDate}</span>
                    </span>
                    <div className="flex items-center gap-2 text-xs text-secondary">
                        {content !== (data.journal[selectedDate] || '') ? 'Saving...' : 'Saved'}
                        <button onClick={handleSave} aria-label="Save" className="p-1 rounded hover:bg-surfaceHighlight/10">
                            <Save className="w-4 h-4 opacity-50" />
                        </button>
                    </div>
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your thoughts..."
                    className="flex-1 w-full bg-transparent p-6 resize-none focus:outline-none text-foreground leading-relaxed text-lg"
                />
            </div>
        </div>
    );
}
