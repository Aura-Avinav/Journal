import { useStore } from '../hooks/useStore';
import { Moon, Sun, Monitor, ArrowLeft, RotateCcw, LogOut, User, Upload, Download, Database } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Modal } from './ui/Modal';
import { ImportModal } from './ui/ImportModal';
import { useState, useEffect } from 'react';

export function SettingsView({ onBack }: { onBack: () => void }) {
    const { data, setTheme, resetData, exportData } = useStore();
    const storeTheme = data.preferences?.theme || 'dark';

    // Local state for manual save
    const [pendingTheme, setPendingTheme] = useState<'dark' | 'light'>(storeTheme);
    const hasChanges = pendingTheme !== storeTheme;

    // Restore modal state
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Preview effect: Update DOM immediately when pendingTheme changes, but don't save yet
    // logic in useStore also updates DOM, but only when 'data' changes.
    // So this local effect allows "Preview" behavior.
    useEffect(() => {
        if (pendingTheme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
    }, [pendingTheme]);

    // Cleanup: If user navigates away or cancels, ensure we revert to stored theme
    useEffect(() => {
        return () => {
            // Revert visual to stored theme on unmount if not saved?
            // Actually, if we unmount (go back), we should probably discard changes or prompt?
            // Cleanup logic if needed
        };
    }, []);


    // Re-sync DOM on unmount/cancel
    const revertToStore = () => {
        setPendingTheme(storeTheme);
    };

    const handleSave = () => {
        setTheme(pendingTheme);
        // DOM is already correct from preview
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => {
                        revertToStore(); // Discard changes on back
                        onBack();
                    }}
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
                    <div className="bg-surface/30 backdrop-blur-md border border-surfaceHighlight rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-foreground">Theme Mode</h3>
                                <p className="text-sm text-secondary">Toggle between light and dark aesthetics</p>
                            </div>
                            <button
                                onClick={() => setPendingTheme(prev => prev === 'light' ? 'dark' : 'light')}
                                className={cn(
                                    "relative inline-flex h-9 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background",
                                    pendingTheme === 'light' ? "bg-accent" : "bg-surfaceHighlight"
                                )}
                            >
                                <span
                                    className={cn(
                                        "inline-block h-7 w-7 transform rounded-full bg-white shadow-lg transition-transform",
                                        pendingTheme === 'light' ? "translate-x-8" : "translate-x-1"
                                    )}
                                >
                                    {pendingTheme === 'light' ? (
                                        <Sun className="h-4 w-4 m-1.5 text-orange-500" />
                                    ) : (
                                        <Moon className="h-4 w-4 m-1.5 text-slate-700" />
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Account Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <User className="w-5 h-5 text-accent" />
                        Account
                    </h2>
                    <div className="bg-surface/30 backdrop-blur-md border border-surfaceHighlight rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-foreground">Sign Out</h3>
                                <p className="text-sm text-secondary">Log out of your account on this device</p>
                            </div>
                            <button
                                onClick={async () => {
                                    const { error } = await supabase.auth.signOut();
                                    if (error) alert('Error logging out');
                                }}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Log Out
                            </button>
                        </div>
                    </div>
                </section>

                {/* Data Management Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
                        <Database className="w-5 h-5 text-accent" />
                        Data Management
                    </h2>

                    {/* Import / Export Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-surface/30 backdrop-blur-md border border-surfaceHighlight rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                            <div>
                                <h3 className="font-medium text-foreground flex items-center gap-2">
                                    <Upload className="w-4 h-4 text-accent" />
                                    Import Data
                                </h3>
                                <p className="text-sm text-secondary mt-1">Bring in data from Notion or Obsidian.</p>
                            </div>
                            <button
                                onClick={() => setIsImportModalOpen(true)}
                                className="mt-4 px-4 py-2 bg-surfaceHighlight hover:bg-surfaceHighlight/80 text-foreground rounded-lg transition-colors font-medium text-sm w-full"
                            >
                                Import
                            </button>
                        </div>

                        <div className="bg-surface/30 backdrop-blur-md border border-surfaceHighlight rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                            <div>
                                <h3 className="font-medium text-foreground flex items-center gap-2">
                                    <Download className="w-4 h-4 text-accent" />
                                    Export Data
                                </h3>
                                <p className="text-sm text-secondary mt-1">Download a backup of your JSON data.</p>
                            </div>
                            <button
                                onClick={exportData}
                                className="mt-4 px-4 py-2 bg-surfaceHighlight hover:bg-surfaceHighlight/80 text-foreground rounded-lg transition-colors font-medium text-sm w-full"
                            >
                                Export JSON
                            </button>
                        </div>
                    </div>

                    <div className="bg-danger/5 backdrop-blur-md border border-danger/20 rounded-2xl p-6 shadow-lg mt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <RotateCcw className="w-5 h-5 text-danger" />
                                <div>
                                    <h3 className="font-medium text-danger">Reset Application</h3>
                                    <p className="text-sm text-danger/70">Clear all data and return to defaults</p>
                                </div>
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
                        Ituts v1.2
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

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
            />

            {/* Save/Cancel Floating Footer */}
            {hasChanges && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="bg-surface border border-accent/20 rounded-xl shadow-2xl p-4 flex items-center justify-between backdrop-blur-xl">
                        <span className="text-sm font-medium text-foreground pl-2">
                            Unsaved Changes
                        </span>
                        <div className="flex gap-3">
                            <button
                                onClick={revertToStore}
                                className="px-4 py-2 text-sm font-medium text-secondary hover:text-foreground transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-5 py-2 text-sm font-semibold bg-accent text-white rounded-lg shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all hover:scale-105 active:scale-95"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
