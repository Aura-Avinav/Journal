import { Moon, Sun, Monitor, Type, Languages, Calendar, Clock, EyeOff, Zap, Download, Trash2, Globe } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';

export function PreferencesSettings() {
    const {
        data,
        setTheme,
        setLanguage,
        toggleSpellCheck,
        setDateFormat,
        setTimeFormat,
        setStartOfWeek,
        togglePrivacyBlur,
        toggleReducedMotion,
        exportData
    } = useStore();

    // Safely access preferences with defaults
    const preferences = data.preferences || {} as NonNullable<typeof data.preferences>;
    const {
        theme = 'system',
        language = 'en-US',
        spellCheck = true,
        dateFormat = 'MM/DD/YYYY',
        timeFormat = '12',
        startOfWeek = 'sunday',
        privacyBlur = false,
        reducedMotion = false
    } = preferences;

    // Helper for animation
    const spring = {
        type: "spring" as const,
        stiffness: 700,
        damping: 30
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-2xl px-1">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground tracking-tight">Preferences</h2>
                <p className="text-sm text-secondary leading-relaxed">Customize your experience and interface.</p>
            </div>

            {/* Appearance Card */}
            <div className="p-5 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm space-y-6">
                <div className="space-y-1">
                    <h3 className="text-base font-medium text-foreground flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-primary" />
                        Appearance
                    </h3>
                </div>

                <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-secondary">Theme</label>
                        <div className="flex p-1 bg-surfaceHighlight/50 rounded-lg border border-border/10">
                            {(['light', 'system', 'dark'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTheme(t)}
                                    className={`
                                        relative px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-2
                                        ${theme === t ? 'text-primary-foreground' : 'text-secondary hover:text-foreground'}
                                    `}
                                >
                                    {theme === t && (
                                        <motion.div
                                            layoutId="theme-active"
                                            className="absolute inset-0 bg-primary rounded-md shadow-sm"
                                            transition={spring}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-1.5 capitalize">
                                        {t === 'light' && <Sun className="w-3 h-3" />}
                                        {t === 'dark' && <Moon className="w-3 h-3" />}
                                        {t === 'system' && <Monitor className="w-3 h-3" />}
                                        {t}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* General Settings Card */}
            <div className="p-5 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm space-y-6">
                <div className="space-y-1">
                    <h3 className="text-base font-medium text-foreground flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        General
                    </h3>
                </div>

                <div className="grid gap-6">
                    {/* Language & Spellcheck */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                <Languages className="w-3.5 h-3.5" /> Language
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as 'en-US' | 'en-GB' | 'en-IN')}
                                className="w-full p-2.5 bg-surfaceHighlight/30 hover:bg-surfaceHighlight/50 rounded-lg border border-border/10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
                            >
                                <option value="en-US">English (US)</option>
                                <option value="en-GB">English (UK)</option>
                                <option value="en-IN">English (India)</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-surfaceHighlight/10 border border-border/5">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <Type className="w-3.5 h-3.5 text-secondary" /> Spell Check
                                </label>
                                <p className="text-[10px] text-secondary">Highlight spelling errors.</p>
                            </div>
                            <button
                                onClick={toggleSpellCheck}
                                className={`
                                    relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20
                                    ${spellCheck ? 'bg-primary' : 'bg-surfaceHighlight'}
                                `}
                            >
                                <span
                                    className={`
                                        inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm
                                        ${spellCheck ? 'translate-x-4.5' : 'translate-x-1'}
                                    `}
                                />
                            </button>
                        </div>
                    </div>

                    <div className="w-full h-px bg-border/10" />

                    {/* Date & Time */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> Date Format
                            </label>
                            <select
                                value={dateFormat}
                                onChange={(e) => setDateFormat(e.target.value as 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD')}
                                className="w-full p-2.5 bg-surfaceHighlight/30 hover:bg-surfaceHighlight/50 rounded-lg border border-border/10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
                            >
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" /> Time Format
                            </label>
                            <div className="flex p-1 bg-surfaceHighlight/30 rounded-lg border border-border/10">
                                {(['12', '24'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setTimeFormat(f)}
                                        className={`
                                            flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all
                                            ${timeFormat === f ? 'bg-surfaceHighlight text-foreground shadow-sm' : 'text-secondary hover:text-foreground'}
                                        `}
                                    >
                                        {f}-Hour
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-secondary flex items-center gap-2">
                            Start of Week
                        </label>
                        <div className="flex gap-2">
                            {(['sunday', 'monday'] as const).map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setStartOfWeek(d)}
                                    className={`
                                        px-4 py-2 text-xs font-medium rounded-lg border transition-all capitalize
                                        ${startOfWeek === d
                                            ? 'bg-primary/5 border-primary/20 text-primary'
                                            : 'bg-surfaceHighlight/10 border-border/10 text-secondary hover:bg-surfaceHighlight/30'}
                                    `}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy & System Card */}
            <div className="p-5 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm space-y-6">
                <div className="space-y-1">
                    <h3 className="text-base font-medium text-foreground flex items-center gap-2">
                        <EyeOff className="w-4 h-4 text-primary" />
                        Privacy & System
                    </h3>
                </div>

                <div className="grid gap-4">
                    {/* Privacy Blur */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surfaceHighlight/10 border border-border/5">
                        <div className="space-y-0.5">
                            <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                Privacy Blur
                            </label>
                            <p className="text-[10px] text-secondary">Blur content when window loses focus.</p>
                        </div>
                        <button
                            onClick={togglePrivacyBlur}
                            className={`
                                relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20
                                ${privacyBlur ? 'bg-primary' : 'bg-surfaceHighlight'}
                            `}
                        >
                            <span
                                className={`
                                    inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm
                                    ${privacyBlur ? 'translate-x-4.5' : 'translate-x-1'}
                                `}
                            />
                        </button>
                    </div>

                    {/* Reduce Motion */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surfaceHighlight/10 border border-border/5">
                        <div className="space-y-0.5">
                            <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5 text-secondary" /> Reduce Motion
                            </label>
                            <p className="text-[10px] text-secondary">Disable complex animations.</p>
                        </div>
                        <button
                            onClick={toggleReducedMotion}
                            className={`
                                relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20
                                ${reducedMotion ? 'bg-primary' : 'bg-surfaceHighlight'}
                            `}
                        >
                            <span
                                className={`
                                    inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm
                                    ${reducedMotion ? 'translate-x-4.5' : 'translate-x-1'}
                                `}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Management Card */}
            <div className="p-5 rounded-xl border border-destructive/20 bg-destructive/5 backdrop-blur-sm space-y-4">
                <div className="space-y-1">
                    <h3 className="text-base font-medium text-foreground flex items-center gap-2">
                        Data Management
                    </h3>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={exportData}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-card border border-border/10 hover:border-primary/20 hover:bg-surfaceHighlight/30 transition-all group"
                    >
                        <div className="text-left">
                            <div className="text-sm font-medium text-foreground flex items-center gap-2">
                                <Download className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                                Export All Data
                            </div>
                            <p className="text-[10px] text-secondary">Download a JSON backup of your journal.</p>
                        </div>
                    </button>

                    <button
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-card border border-border/10 hover:border-destructive/30 hover:bg-destructive/10 transition-all group"
                        onClick={() => alert("This feature is coming soon!")}
                    >
                        <div className="text-left">
                            <div className="text-sm font-medium text-foreground flex items-center gap-2">
                                <Trash2 className="w-4 h-4 text-destructive group-hover:scale-110 transition-transform" />
                                Clear Data
                            </div>
                            <p className="text-[10px] text-secondary">Permanently remove local data.</p>
                        </div>
                    </button>
                </div>
            </div>

        </div>
    );
}
