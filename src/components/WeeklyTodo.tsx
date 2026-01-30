import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { CheckCircle2, Circle, Plus, Trash2, CalendarDays } from 'lucide-react';
import { cn } from '../lib/utils';
import { Modal, Button } from './ui/Modal';

export function WeeklyTodo() {
    const { data, toggleTodo, addTodo, removeTodo } = useStore();

    // In a real app, we'd filter by week. For now, showing all "active" todos.
    const todos = data.todos;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTodo, setNewTodo] = useState("");

    const handleAdd = () => {
        if (newTodo.trim()) {
            addTodo(newTodo);
            setNewTodo("");
            setIsAddModalOpen(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <CalendarDays className="w-5 h-5 text-pink-500" />
                    Weekly To-Do
                </h3>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="p-1.5 hover:bg-surfaceHighlight rounded-md transition-colors text-secondary hover:text-primary"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 bg-surface/30 border border-surfaceHighlight rounded-xl p-4 overflow-y-auto min-h-[300px]">
                {todos.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-secondary/50">
                        <CheckCircle2 className="w-12 h-12 mb-2 opacity-20" />
                        <p className="text-sm">All caught up!</p>
                        <button onClick={() => setIsAddModalOpen(true)} className="mt-4 text-pink-500 text-sm hover:underline">Add a task</button>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {todos.map(todo => (
                            <li key={todo.id} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-surfaceHighlight/30 transition-all">
                                <button
                                    onClick={() => toggleTodo(todo.id)}
                                    className={cn(
                                        "flex-shrink-0 transition-colors",
                                        todo.completed ? "text-pink-500" : "text-secondary hover:text-pink-400"
                                    )}
                                >
                                    {todo.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                </button>
                                <span className={cn(
                                    "flex-1 text-sm transition-all decoration-secondary/50",
                                    todo.completed ? "text-secondary line-through" : "text-foreground"
                                )}>
                                    {todo.text}
                                </span>
                                <button
                                    onClick={() => removeTodo(todo.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-danger/70 hover:text-danger transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Task"
            >
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="What do you need to do?"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        className="w-full bg-background border border-surfaceHighlight rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-accent"
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAdd} disabled={!newTodo.trim()}>Add Task</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
