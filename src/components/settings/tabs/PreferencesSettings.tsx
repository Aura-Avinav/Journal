import { Moon, Sun, Laptop, Languages, Check, type LucideIcon } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';

type ThemeOption = 'light' | 'dark' | 'system';

export function PreferencesSettings() {
    const { data, setTheme, setLanguage, toggleSpellCheck } = useStore();
    const currentTheme = data.preferences?.theme || 'system';

    const themes: { id: ThemeOption; label: string; icon: LucideIcon }[] = [
        { id: 'light', label: 'Light', icon: Sun },
        { id: 'dark', label: 'Dark', icon: Moon },
        { id: 'system', label: 'System', icon: Laptop },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-2xl px-1">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground tracking-tight">Appearance & Language</h2>
                <p className="text-sm text-secondary leading-relaxed">Customize how Ituts looks and feels to match your preferences.</p>
            </div>

            <section className="space-y-6">

                {/* Theme Card */}
                <div className="p-5 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-base font-medium text-foreground flex items-center gap-2">
                            Theme
                        </h3>
                        <p className="text-xs text-secondary">Select your preferred interface theme.</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 p-1 bg-surfaceHighlight/30 rounded-lg border border-border/10">
                        {themes.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => setTheme(theme.id)}
                                className={cn(
                                    "relative flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                                    currentTheme === theme.id
                                        ? "text-primary shadow-sm"
                                        : "text-secondary hover:text-foreground hover:bg-surfaceHighlight/50"
                                )}
                            >
                                {currentTheme === theme.id && (
                                    <motion.div
                                        layoutId="activeTheme"
                                        className="absolute inset-0 bg-surface rounded-md border border-border/10 shadow-sm"
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
                </div>

                {/* Language & spellcheck Card */}
                <div className="p-5 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm space-y-6">

                    {/* Language Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="text-base font-medium text-foreground flex items-center gap-2">
                                <Languages className="w-4 h-4 text-secondary" />
                                Language
                            </div>
                            <p className="text-xs text-secondary">Choose your preferred language for the UI.</p>
                        </div>
                        <div className="relative">
                            <select
                                value={data.preferences?.language || 'en-US'}
                                onChange={(e) => setLanguage(e.target.value as 'en-US' | 'en-GB' | 'en-IN')}
                                className="appearance-none bg-surface/50 hover:bg-surface text-sm text-foreground rounded-lg py-2 pl-3 pr-10 border border-border/40 focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer transition-colors min-w-[140px]"
                            >
                                <option value="en-US">English (US)</option>
                                <option value="en-GB">English (UK)</option>
                                <option value="en-IN">English (India)</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-border/20 w-full" />

                    {/* Spellcheck Section */}
                    <div className="flex items-center justify-between group cursor-pointer" onClick={toggleSpellCheck}>
                        <div className="space-y-1">
                            <div className="text-base font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                                <Check className="w-4 h-4 text-secondary" />
                                Spellchecker
                            </div>
                            <p className="text-xs text-secondary">Highlight spelling errors/grammar mistakes in text areas.</p>
                        </div>
                        <button
                            type="button"
                            className={cn(
                                "w-11 h-6 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/50 border border-transparent",
                                data.preferences?.spellCheck ? "bg-accent" : "bg-surfaceHighlight border-border/20"
                            )}
                        >
                            <motion.div
                                className="absolute top-0.5 left-0.5 w-[1.15rem] h-[1.15rem] bg-white rounded-full shadow-md"
                                animate={{ x: data.preferences?.spellCheck ? 20 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                    </div>
                </div>

            </section>
        </div>
    );
}
