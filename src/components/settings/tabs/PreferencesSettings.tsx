import { Moon, Sun, Laptop } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';

type ThemeOption = 'light' | 'dark' | 'system';

export function PreferencesSettings() {
    const { data, setTheme, setLanguage, toggleSpellCheck } = useStore();
    const currentTheme = data.preferences?.theme || 'system';

    const themes: { id: ThemeOption; label: string; icon: typeof Sun }[] = [
        { id: 'light', label: 'Light', icon: Sun },
        { id: 'dark', label: 'Dark', icon: Moon },
        { id: 'system', label: 'System', icon: Laptop },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-2xl px-1">
            <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Appearance</h2>
                <p className="text-sm text-secondary">Customize how Ituts looks and feels.</p>
            </div>

            <section className="space-y-6">

                {/* Theme Section */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Theme</label>
                    <div className="grid grid-cols-3 gap-3 p-1 bg-surfaceHighlight/30 rounded-xl border border-border/10">
                        {themes.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => setTheme(theme.id)}
                                className={cn(
                                    "relative flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent",
                                    currentTheme === theme.id
                                        ? "text-primary shadow-sm"
                                        : "text-secondary hover:text-foreground hover:bg-surfaceHighlight/50"
                                )}
                            >
                                {currentTheme === theme.id && (
                                    <motion.div
                                        layoutId="activeTheme"
                                        className="absolute inset-0 bg-surface rounded-lg border border-border/10 shadow-sm"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <theme.icon className="w-4 h-4" />
                                    {theme.label}
                                </span>
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-secondary px-1">
                        Select your preferred theme or sync with your system settings.
                    </p>
                </div>

                <div className="h-px bg-border/10 w-full" />

                {/* Language Section */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <div className="text-sm font-medium text-foreground">Language</div>
                        <p className="text-xs text-secondary">Used for UI and spellcheck.</p>
                    </div>
                    <select
                        value={data.preferences?.language || 'en-US'}
                        onChange={(e) => setLanguage(e.target.value as 'en-US' | 'en-GB' | 'en-IN')}
                        className="bg-surfaceHighlight/50 hover:bg-surfaceHighlight text-sm text-foreground rounded-lg py-2 pl-3 pr-8 border border-border/10 focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer transition-colors"
                    >
                        <option value="en-US">English (US)</option>
                        <option value="en-GB">English (UK)</option>
                        <option value="en-IN">English (India)</option>
                    </select>
                </div>

                <div className="h-px bg-border/10 w-full" />

                {/* Spellcheck Section */}
                <div className="flex items-center justify-between group">
                    <div className="space-y-0.5">
                        <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Spellchecker</div>
                        <p className="text-xs text-secondary">Highlight spelling errors.</p>
                    </div>
                    <button
                        onClick={toggleSpellCheck}
                        className={cn(
                            "w-11 h-6 rounded-full relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent",
                            data.preferences?.spellCheck ? "bg-accent" : "bg-surfaceHighlight"
                        )}
                    >
                        <motion.div
                            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
                            animate={{ x: data.preferences?.spellCheck ? 20 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    </button>
                </div>

            </section>
        </div>
    );
}
