import { useStore } from '../hooks/useStore';
import { Moon, Sun, Monitor, ArrowLeft, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { Modal } from './ui/Modal';
import { useState } from 'react';

export function SettingsView({ onBack }: { onBack: () => void }) {
    const { data, toggleTheme, resetData } = useStore();
    const { theme } = data.preferences || { theme: 'dark' }; // fallback

    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 text-secondary hover:text-primary hover:bg-surfaceHighlight rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Settings</h1>
            </div>

            <div className="grid gap-6 max-w-2xl">
                {/* Appearance Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-accent" />
                        Appearance
                    </h2>
                    <div className="bg-surface/30 border border-surfaceHighlight rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-foreground">Theme Mode</h3>
                                <p className="text-sm text-secondary">Toggle between light and dark aesthetics</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={cn(
                                    "relative inline-flex h-9 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background",
                                    theme === 'light' ? "bg-accent" : "bg-surfaceHighlight"
                                )}
                            >
                                <span
                                    className={cn(
                                        "inline-block h-7 w-7 transform rounded-full bg-white shadow-lg transition-transform",
                                        theme === 'light' ? "translate-x-8" : "translate-x-1"
                                    )}
                                >
                                    {theme === 'light' ? (
                                        <Sun className="h-4 w-4 m-1.5 text-orange-500" />
                                    ) : (
                                        <Moon className="h-4 w-4 m-1.5 text-slate-700" />
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Data Management Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-danger">
                        <RotateCcw className="w-5 h-5" />
                        Danger Zone
                    </h2>
                    <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-danger">Reset Application</h3>
                                <p className="text-sm text-danger/70">Clear all data and return to defaults</p>
                            </div>
                            <button
                                onClick={() => setIsResetModalOpen(true)}
                                className="px-4 py-2 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 rounded-lg transition-colors font-medium text-sm"
                            >
                                Reset Data
                            </button>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="pt-8 text-center">
                    <p className="text-sm text-secondary">
                        LifeOS v1.2
                        <br />
                        Designed for focus and clarity.
                    </p>
                </section>
            </div>

            <Modal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                title="Reset All Data?"
            >
                <div className="space-y-4">
                    <p className="text-secondary">
                        This will <span className="text-red-400 font-bold">permanently delete</span> all your habits, todos, and achievements. This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsResetModalOpen(false)}
                            className="px-4 py-2 rounded-lg font-medium bg-surfaceHighlight text-secondary hover:text-foreground hover:bg-surfaceHighlight/80 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                resetData();
                                setIsResetModalOpen(false);
                            }}
                            className="px-4 py-2 rounded-lg font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                        >
                            Reset Everything
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
