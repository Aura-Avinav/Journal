import { Moon, Sun, Monitor, Type, Languages, Calendar, Clock, EyeOff, Download, Trash2, Globe, Check } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '../../../lib/utils';

export function PreferencesSettings() {
    const {
        data,
        updatePreferences,
        resetData,
        exportData
    } = useStore();

    // Safely access global preferences with defaults
    const globalPreferences = data.preferences || {} as NonNullable<typeof data.preferences>;

    // Memoize global preferences to avoid unstable reference issues from useStore
    const stableGlobalPreferences = useMemo(() => globalPreferences, [JSON.stringify(globalPreferences)]);

    // Local Draft State
    const [draft, setDraft] = useState(stableGlobalPreferences);
    const [isDirty, setIsDirty] = useState(false);

    // Sync draft with global state only when global state *values* change significantly
    useEffect(() => {
        // Only reset if we aren't dirty, OR if the values are desynced in a way that matters?
        // Actually, if we are editing, we probably don't want to get overwritten. 
        // But for initial load, we need this.
        if (!isDirty) {
            setDraft(stableGlobalPreferences);
        }
    }, [stableGlobalPreferences, isDirty]);

    const handleChange = (key: keyof typeof draft, value: any) => {
        setDraft(prev => {
            const next = { ...prev, [key]: value };

            // Compare with stable global preferences
            const keysToCheck = [
                'theme', 'language', 'spellCheck', 'dateFormat',
                'timeFormat', 'startOfWeek', 'privacyBlur', 'reducedMotion'
            ] as const;

            const hasChanges = keysToCheck.some(k => next[k] !== stableGlobalPreferences[k]);

            setIsDirty(hasChanges);
            return next;
        });
    };

    const handleSave = () => {
        updatePreferences(draft);
        setIsDirty(false); // Optimistically set dirty to false
    };

    const handleCancel = () => {
        setDraft(stableGlobalPreferences);
        setIsDirty(false);
    };

    // Helper for animation
    const spring = {
        type: "spring" as const,
        stiffness: 700,
        damping: 30
    };

    const themes = [
        { id: 'light', icon: Sun, label: 'Light' },
        { id: 'dark', icon: Moon, label: 'Dark' },
        { id: 'system', icon: Monitor, label: 'System' }
    ] as const;

    return (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl px-1 pb-24 relative">
            {/* Header */}
            <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground tracking-tight">Preferences</h2>
                <p className="text-sm text-secondary leading-relaxed">Customize your experience to fit your workflow.</p>
            </div>

            <div className="grid gap-6">

                {/* Appearance Card */}
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500">
                                <Monitor className="w-4 h-4" />
                            </div>
                            Appearance
                        </h3>
                        <p className="text-xs text-secondary pl-9">Choose how the app looks.</p>
                    </div>

                    <div className="p-1 rounded-xl inline-flex relative w-full sm:w-auto">
                        <AnimatePresence>
                            {/* Active Background Pill */}
                            <motion.div
                                layoutId="theme-active"
                                className="absolute inset-y-1 rounded-lg bg-surfaceHighlight/50 shadow-sm"
                                style={{
                                    left: `calc(${themes.findIndex(t => t.id === draft.theme) * 33.333}% + 0.25rem)`,
                                    width: `calc(33.333% - 0.5rem)`
                                }}
                                transition={spring}
                            />
                        </AnimatePresence>

                        {themes.map((t) => {
                            const Icon = t.icon;
                            const isActive = draft.theme === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => handleChange('theme', t.id)}
                                    className={cn(
                                        "relative z-10 flex-1 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium transition-colors duration-200 rounded-lg select-none",
                                        isActive ? "text-foreground" : "text-secondary hover:text-foreground/80"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4", isActive && "fill-current text-purple-500")} />
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* General Settings */}
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                                <Globe className="w-4 h-4" />
                            </div>
                            General
                        </h3>
                        <p className="text-xs text-secondary pl-9">Language, date, and time settings.</p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Language */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                <Languages className="w-3.5 h-3.5" /> Language
                            </label>
                            <div className="relative">
                                <select
                                    value={draft.language || 'en-US'}
                                    onChange={(e) => handleChange('language', e.target.value)}
                                    className="w-full p-2.5 bg-transparent hover:bg-surfaceHighlight/30 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer appearance-none pl-3"
                                >
                                    <option value="en-US">English (US)</option>
                                    <option value="en-GB">English (UK)</option>
                                    <option value="en-IN">English (India)</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Spell Check */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                <Type className="w-3.5 h-3.5" /> Spell Check
                            </label>
                            <button
                                onClick={() => handleChange('spellCheck', !draft.spellCheck)}
                                className={cn(
                                    "w-full p-2.5 rounded-lg text-sm text-left flex items-center justify-between transition-all",
                                    draft.spellCheck
                                        ? "bg-blue-500/5 text-blue-600 dark:text-blue-400"
                                        : "bg-transparent text-secondary hover:bg-surfaceHighlight/30"
                                )}
                            >
                                {draft.spellCheck ? 'Enabled' : 'Disabled'}
                                <div className={cn("w-4 h-4 rounded-full flex items-center justify-center transition-colors", draft.spellCheck ? "bg-blue-500 text-white" : "bg-border/20")}>
                                    {draft.spellCheck && <Check className="w-2.5 h-2.5" />}
                                </div>
                            </button>
                        </div>

                        {/* Date Format */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> Date Format
                            </label>
                            <div className="relative">
                                <select
                                    value={draft.dateFormat || 'MM/DD/YYYY'}
                                    onChange={(e) => handleChange('dateFormat', e.target.value)}
                                    className="w-full p-2.5 bg-transparent hover:bg-surfaceHighlight/30 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer appearance-none pl-3"
                                >
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Time Format */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" /> Time Format
                            </label>
                            <div className="flex gap-2">
                                {[
                                    { value: '12', label: '12-Hour' },
                                    { value: '24', label: '24-Hour' }
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleChange('timeFormat', opt.value)}
                                        className={cn(
                                            "flex-1 p-2.5 text-sm font-medium rounded-lg transition-all",
                                            draft.timeFormat === opt.value
                                                ? "bg-blue-500/5 text-blue-600 dark:text-blue-400"
                                                : "bg-transparent text-secondary hover:bg-surfaceHighlight/30"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Start of Week */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                Start of Week
                            </label>
                            <div className="flex gap-2">
                                {[
                                    { value: 'sunday', label: 'Sunday' },
                                    { value: 'monday', label: 'Monday' }
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleChange('startOfWeek', opt.value)}
                                        className={cn(
                                            "flex-1 p-2.5 text-sm font-medium rounded-lg transition-all capitalize",
                                            draft.startOfWeek === opt.value
                                                ? "bg-blue-500/5 text-blue-600 dark:text-blue-400"
                                                : "bg-transparent text-secondary hover:bg-surfaceHighlight/30"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>


                {/* Privacy & Data */}
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-green-500/10 text-green-500">
                                <EyeOff className="w-4 h-4" />
                            </div>
                            Privacy & System
                        </h3>
                        <p className="text-xs text-secondary pl-9">Manage privacy and performance.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Privacy Blur */}
                        <button
                            onClick={() => handleChange('privacyBlur', !draft.privacyBlur)}
                            className={cn(
                                "p-4 rounded-xl transition-all text-left space-y-2 group hover:bg-surfaceHighlight/10",
                                draft.privacyBlur
                                    ? "bg-green-500/5"
                                    : "bg-transparent"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span className={cn("text-sm font-medium", draft.privacyBlur ? "text-green-600 dark:text-green-400" : "text-foreground")}>Privacy Blur</span>
                                <div className={cn("w-8 h-5 rounded-full relative transition-colors", draft.privacyBlur ? "bg-green-500" : "bg-border/40")}>
                                    <div className={cn("absolute top-1 bottom-1 w-3 h-3 bg-white rounded-full transition-all", draft.privacyBlur ? "left-4" : "left-1")} />
                                </div>
                            </div>
                            <p className="text-xs text-secondary leading-relaxed">
                                Blur content when swiching apps.
                            </p>
                        </button>

                        {/* Reduce Motion */}
                        <button
                            onClick={() => handleChange('reducedMotion', !draft.reducedMotion)}
                            className={cn(
                                "p-4 rounded-xl transition-all text-left space-y-2 group hover:bg-surfaceHighlight/10",
                                draft.reducedMotion
                                    ? "bg-green-500/5"
                                    : "bg-transparent"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span className={cn("text-sm font-medium", draft.reducedMotion ? "text-green-600 dark:text-green-400" : "text-foreground")}>Reduce Motion</span>
                                <div className={cn("w-8 h-5 rounded-full relative transition-colors", draft.reducedMotion ? "bg-green-500" : "bg-border/40")}>
                                    <div className={cn("absolute top-1 bottom-1 w-3 h-3 bg-white rounded-full transition-all", draft.reducedMotion ? "left-4" : "left-1")} />
                                </div>
                            </div>
                            <p className="text-xs text-secondary leading-relaxed">
                                Minimize UI animations.
                            </p>
                        </button>
                    </div>
                </div>

                {/* Data Management */}
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-red-500/10 text-red-500">
                                <Download className="w-4 h-4" />
                            </div>
                            Data Management
                        </h3>
                        <p className="text-xs text-secondary pl-9">Export your data or reset everything.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => exportData()}
                            className="flex-1 p-4 rounded-xl border border-border/20 bg-background/50 hover:bg-surfaceHighlight/30 transition-all text-left space-y-2 group"
                        >
                            <div className="flex items-center gap-2 font-medium text-sm text-foreground">
                                <Download className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" /> Export Data
                            </div>
                            <p className="text-xs text-secondary">Download a JSON backup.</p>
                        </button>

                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
                                    resetData();
                                }
                            }}
                            className="flex-1 p-4 rounded-xl hover:bg-red-500/10 transition-all text-left space-y-2 group"
                        >
                            <div className="flex items-center gap-2 font-medium text-sm text-red-500">
                                <Trash2 className="w-4 h-4" /> Reset Everything
                            </div>
                            <p className="text-xs text-secondary">Permanently delete local data.</p>
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Save Action Bar */}
            <AnimatePresence>
                {isDirty && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="fixed bottom-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 flex items-center justify-between md:justify-start gap-2 p-1.5 pr-2 bg-card/95 backdrop-blur-xl text-foreground rounded-full shadow-2xl border border-primary/20 ring-1 ring-black/5 dark:ring-white/10"
                    >
                        <div className="pl-4 pr-2 text-sm font-medium whitespace-nowrap flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            Unsaved Changes
                        </div>
                        <div className="h-6 w-px bg-border mx-1" />
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-surfaceHighlight rounded-full transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-5 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-transform active:scale-95 shadow-sm"
                        >
                            Save Changes
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
