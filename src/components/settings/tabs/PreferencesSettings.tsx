import { Moon, Sun, Monitor } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { cn } from '../../../lib/utils';

export function PreferencesSettings() {
    const { data, setTheme, setLanguage, toggleSpellCheck } = useStore();
    const currentTheme = data.preferences?.theme || 'dark';

    return (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-2xl">
            <div>
                <h2 className="text-lg font-medium text-foreground mb-1">My Settings</h2>
                <p className="text-sm text-secondary">Customize your experience.</p>
            </div>

            <section className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-border/10">
                    <div>
                        <div className="font-medium text-foreground">Theme</div>
                        <p className="text-sm text-secondary">Choose how Ituts looks to you.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTheme('light')}
                            className={cn(
                                "p-2 rounded-md transition-colors border",
                                currentTheme === 'light'
                                    ? "bg-surfaceHighlight border-accent/20 text-accent"
                                    : "border-transparent text-secondary hover:text-foreground"
                            )}
                        >
                            <Sun className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={cn(
                                "p-2 rounded-md transition-colors border",
                                currentTheme === 'dark'
                                    ? "bg-surfaceHighlight border-accent/20 text-accent"
                                    : "border-transparent text-secondary hover:text-foreground"
                            )}
                        >
                            <Moon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-border/10">
                    <div>
                        <div className="font-medium text-foreground">Language</div>
                        <p className="text-sm text-secondary">The language used in the interface.</p>
                    </div>
                    <select className="bg-surfaceHighlight/30 text-sm text-foreground rounded-md p-2 border border-border/10 focus:outline-none cursor-not-allowed opacity-50" disabled>
                        <option>English</option>
                    </select>
                </div>
            </section>
        </div>
    );
}
