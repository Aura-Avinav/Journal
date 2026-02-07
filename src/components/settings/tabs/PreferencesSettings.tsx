import { Moon, Sun, Monitor, Type, Languages, Calendar, Clock, EyeOff, Zap, Download, Trash2, Globe, Save, X } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export function PreferencesSettings() {
    const {
        data,
        updatePreferences,
        resetData,
        exportData
    } = useStore();

    // Safely access global preferences with defaults
    const globalPreferences = data.preferences || {} as NonNullable<typeof data.preferences>;

    // Local Draft State
    // We initialize it lazily or via useEffect to ensure it catches up if data loads late
    const [draft, setDraft] = useState(globalPreferences);
    const [isDirty, setIsDirty] = useState(false);

    // Sync draft with global state on mount or when global changes (only if not dirty? or always?)
    // Standard pattern: Reset draft when global source changes externally, BUT here global only changes if WE save.
    // So we just init it. If we want to support external updates, we'd need more complex logic.
    // For now, let's just sync on mount and when we explicitly save/cancel.
    useEffect(() => {
        setDraft(globalPreferences);
        setIsDirty(false);
    }, [globalPreferences]); // This might reset if we switch tabs and come back, which is good.

    const handleChange = (key: keyof typeof draft, value: any) => {
        setDraft(prev => {
            const next = { ...prev, [key]: value };
            // Check if actually different from global
            // We compare specific fields to avoid issues with extra properties
            const keysToCheck = [
                'theme', 'language', 'spellCheck', 'dateFormat',
                'timeFormat', 'startOfWeek', 'privacyBlur', 'reducedMotion'
            ] as const;

            const hasChanges = keysToCheck.some(k => next[k] !== globalPreferences[k]);

            setIsDirty(hasChanges);
            return next;
        });
    };

    const handleSave = () => {
        updatePreferences(draft);
        // isDirty will be set to false by the useEffect when globalPreferences updates prop
    };

    const handleCancel = () => {
        setDraft(globalPreferences);
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
        <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl px-1">
            {/* Header with Actions */}
            <div className="flex items-center justify-between sticky top-16 md:top-0 bg-background/95 backdrop-blur-md z-30 py-4 -my-4 px-1 border-b border-border/5">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-foreground tracking-tight">Preferences</h2>
                    <p className="text-sm text-secondary leading-relaxed">Customize your experience.</p>
                </div>

                <div className="flex items-center gap-2">
                    {isDirty ? (
                        <>
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-secondary hover:text-foreground hover:bg-surfaceHighlight/50 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <X className="w-4 h-4" /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
                            >
                                <Save className="w-4 h-4" /> Save Changes
                            </button>
                        </>
                    ) : (
                        <div className="text-xs font-medium text-secondary/40 px-3 py-1.5 border border-border/5 rounded-full bg-surfaceHighlight/5">
                            All changes saved
                        </div>
                    )}
                </div>
            </div>

            <div className="grid gap-6">
                {/* Appearance Card */}
                <div className="p-6 rounded-2xl bg-surfaceHighlight/5 space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-base font-medium text-foreground flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-accent" /> Appearance
                        </h3>
                        <p className="text-xs text-secondary">Choose how the app looks.</p>
                    </div>

                    <div className="p-1.5 bg-surfaceHighlight/20 rounded-xl inline-flex relative w-full sm:w-auto">
                        <AnimatePresence>
                            {/* Active Background Pill */}
                            <motion.div
                                layoutId="theme-active"
                                className="absolute inset-y-1.5 rounded-lg bg-background shadow-sm"
                                style={{
                                    left: `calc(${themes.findIndex(t => t.id === draft.theme) * 33.333}% + 0.375rem)`,
                                    width: `calc(33.333% - 0.75rem)`
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
                                    className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium transition-colors duration-200 rounded-lg select-none
                                        ${isActive ? 'text-foreground' : 'text-secondary hover:text-foreground/80'}`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'fill-current' : ''}`} />
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* General Settings */}
                <div className="p-6 rounded-2xl bg-surfaceHighlight/5 space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-base font-medium text-foreground flex items-center gap-2">
                            <Globe className="w-4 h-4 text-accent" /> General
                        </h3>
                        <p className="text-xs text-secondary">Language, date, and time settings.</p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Language */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                <Languages className="w-3.5 h-3.5" /> Language
                            </label>
                            <select
                                value={draft.language || 'en-US'}
                                onChange={(e) => handleChange('language', e.target.value)}
                                className="w-full p-2.5 bg-transparent hover:bg-surfaceHighlight/30 rounded-lg border border-border/20 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
                            >
                                <option value="en-US">English (US)</option>
                                <option value="en-GB">English (UK)</option>
                                <option value="en-IN">English (India)</option>
                            </select>
                        </div>

                        {/* Spell Check */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                <Type className="w-3.5 h-3.5" /> Spell Check
                            </label>
                            <button
                                onClick={() => handleChange('spellCheck', !draft.spellCheck)}
                                className={`w-full p-2.5 rounded-lg border text-sm text-left flex items-center justify-between transition-all
                                    ${draft.spellCheck
                                        ? 'bg-primary/5 border-primary/20 text-primary'
                                        : 'bg-transparent border-border/20 text-secondary hover:bg-surfaceHighlight/30'
                                    }`}
                            >
                                {draft.spellCheck ? 'Enabled' : 'Disabled'}
                                <div className={`w-2 h-2 rounded-full ${draft.spellCheck ? 'bg-primary' : 'bg-secondary/30'}`} />
                            </button>
                        </div>

                        {/* Date Format */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> Date Format
                            </label>
                            <select
                                value={draft.dateFormat || 'MM/DD/YYYY'}
                                onChange={(e) => handleChange('dateFormat', e.target.value)}
                                className="w-full p-2.5 bg-transparent hover:bg-surfaceHighlight/30 rounded-lg border border-border/20 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
                            >
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
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
                                        className={`flex-1 p-2.5 text-sm font-medium rounded-lg transition-all border
                                            ${draft.timeFormat === opt.value
                                                ? 'bg-primary/5 border-primary/20 text-primary'
                                                : 'bg-transparent border-border/20 text-secondary hover:bg-surfaceHighlight/30'
                                            }`}
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
                                        className={`flex-1 p-2.5 text-sm font-medium rounded-lg transition-all border capitalize
                                            ${draft.startOfWeek === opt.value
                                                ? 'bg-primary/5 border-primary/20 text-primary'
                                                : 'bg-transparent border-border/20 text-secondary hover:bg-surfaceHighlight/30'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>


                {/* Privacy & Data */}
                <div className="p-6 rounded-2xl bg-surfaceHighlight/5 space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-base font-medium text-foreground flex items-center gap-2">
                            <EyeOff className="w-4 h-4 text-accent" /> Privacy & System
                        </h3>
                        <p className="text-xs text-secondary">Manage privacy and performance.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Privacy Blur */}
                        <button
                            onClick={() => handleChange('privacyBlur', !draft.privacyBlur)}
                            className={`p-4 rounded-xl border transition-all text-left space-y-2 group
                                ${draft.privacyBlur
                                    ? 'bg-primary/5 border-primary/20'
                                    : 'bg-transparent border-border/20 hover:bg-surfaceHighlight/30'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${draft.privacyBlur ? 'text-primary' : 'text-foreground'}`}>Privacy Blur</span>
                                <EyeOff className={`w-4 h-4 ${draft.privacyBlur ? 'text-primary' : 'text-secondary'}`} />
                            </div>
                            <p className="text-xs text-secondary leading-relaxed">
                                Blur content when you switch windows to prevent prying eyes.
                            </p>
                        </button>

                        {/* Reduce Motion */}
                        <button
                            onClick={() => handleChange('reducedMotion', !draft.reducedMotion)}
                            className={`p-4 rounded-xl border transition-all text-left space-y-2 group
                                ${draft.reducedMotion
                                    ? 'bg-primary/5 border-primary/20'
                                    : 'bg-transparent border-border/20 hover:bg-surfaceHighlight/30'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${draft.reducedMotion ? 'text-primary' : 'text-foreground'}`}>Reduce Motion</span>
                                <Zap className={`w-4 h-4 ${draft.reducedMotion ? 'text-primary' : 'text-secondary'}`} />
                            </div>
                            <p className="text-xs text-secondary leading-relaxed">
                                minimize animations for a simpler, faster experience.
                            </p>
                        </button>
                    </div>
                </div>

                {/* Data Management */}
                <div className="p-6 rounded-2xl bg-surfaceHighlight/5 space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-base font-medium text-foreground flex items-center gap-2">
                            <Download className="w-4 h-4 text-accent" /> Data Management
                        </h3>
                        <p className="text-xs text-secondary">Export your data or reset everything.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => exportData()}
                            className="flex-1 p-4 rounded-xl border border-border/20 hover:bg-surfaceHighlight/30 transition-all text-left space-y-2 group"
                        >
                            <div className="flex items-center gap-2 font-medium text-sm text-foreground">
                                <Download className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" /> Export Data
                            </div>
                            <p className="text-xs text-secondary">Download a JSON backup of all your journal entries and habits.</p>
                        </button>

                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
                                    resetData();
                                }
                            }}
                            className="flex-1 p-4 rounded-xl border border-red-500/10 hover:bg-red-500/5 transition-all text-left space-y-2 group"
                        >
                            <div className="flex items-center gap-2 font-medium text-sm text-red-500">
                                <Trash2 className="w-4 h-4" /> Reset Everything
                            </div>
                            <p className="text-xs text-secondary">Permanently delete all local data and reset the application.</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
